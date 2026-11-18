import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMentorshipMatch } from "@/lib/matching";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentUserId = searchParams.get("studentUserId");
    const industryFilter = searchParams.get("industry");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const searchQuery = searchParams.get("query")?.toLowerCase();

    // Fetch all alumni with profiles
    const mentors = await prisma.user.findMany({
      where: {
        role: "ALUMNI",
        alumniProfile: { isNot: null },
      },
      include: {
        alumniProfile: true,
        alumniRelationships: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
        receivedFeedbacks: {
          select: { rating: true },
        },
      },
    });

    // Check if student profile exists for matching
    let studentPrefs = {
      careerGoals: "",
      targetIndustries: [] as string[],
      targetRoles: [] as string[],
      skillsToDevelop: [] as string[],
    };

    let studentActiveMentorIds = new Set<string>();
    let studentPendingMentorIds = new Set<string>();

    if (studentUserId) {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: studentUserId },
      });
      if (student) {
        studentPrefs = {
          careerGoals: student.careerGoals,
          targetIndustries: JSON.parse(student.targetIndustries || "[]"),
          targetRoles: JSON.parse(student.targetRoles || "[]"),
          skillsToDevelop: JSON.parse(student.skillsToDevelop || "[]"),
        };
      }

      // Check active pairings
      const activeRels = await prisma.mentorshipRelationship.findMany({
        where: { studentId: studentUserId, status: "ACTIVE" },
        select: { alumniId: true },
      });
      studentActiveMentorIds = new Set(activeRels.map(r => r.alumniId));

      // Check pending requests
      const pendingReqs = await prisma.mentorshipRequest.findMany({
        where: { studentId: studentUserId, status: "PENDING" },
        select: { alumniId: true },
      });
      studentPendingMentorIds = new Set(pendingReqs.map(r => r.alumniId));
    }

    // Format mentors and compute matches
    const mapped = mentors.map((m) => {
      const p = m.alumniProfile!;
      const parsedSkills: string[] = JSON.parse(p.skills || "[]");
      const parsedTopics: string[] = JSON.parse(p.mentoringTopics || "[]");
      const parsedSlots: string[] = JSON.parse(p.preferredTimeSlots || "[]");
      const activeCount = m.alumniRelationships.length;

      // Calculate feedback average
      const ratings = m.receivedFeedbacks.map(f => f.rating);
      const avgRating = ratings.length > 0 
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 5.0;

      const matchAnalysis = calculateMentorshipMatch(studentPrefs, {
        industry: p.industry,
        currentRole: p.currentRole,
        skills: parsedSkills,
        mentoringTopics: parsedTopics,
        maxMenteesCapacity: p.maxMenteesCapacity,
        currentActiveMentees: activeCount,
        acceptingNewMentees: p.acceptingNewMentees,
        yearsOfExperience: p.yearsOfExperience,
      });

      return {
        id: m.id,
        name: m.name,
        department: m.department,
        avatarUrl: m.avatarUrl,
        headline: p.headline,
        currentCompany: p.currentCompany,
        currentRole: p.currentRole,
        industry: p.industry,
        yearsOfExperience: p.yearsOfExperience,
        graduationYear: p.graduationYear,
        degree: p.degree,
        verificationStatus: p.verificationStatus,
        verifiedAt: p.verifiedAt,
        bio: p.bio,
        skills: parsedSkills,
        mentoringTopics: parsedTopics,
        maxMenteesCapacity: p.maxMenteesCapacity,
        activeMenteesCount: activeCount,
        availableHoursPerWeek: p.availableHoursPerWeek,
        preferredTimeSlots: parsedSlots,
        acceptingNewMentees: p.acceptingNewMentees && activeCount < p.maxMenteesCapacity,
        
        // Privacy Protected Fields
        protectContactDetails: p.protectContactDetails,
        proxyEmail: p.proxyEmail,
        directPhoneMasked: p.directPhoneMasked,
        
        // Mentorship Pairing State with Current Student
        isAlreadyMentor: studentActiveMentorIds.has(m.id),
        hasPendingRequest: studentPendingMentorIds.has(m.id),
        
        // Calculated Metrics
        avgRating,
        totalReviews: ratings.length,
        matchAnalysis,
      };
    });

    // Apply filtering
    let filtered = mapped;
    if (verifiedOnly) {
      filtered = filtered.filter(m => m.verificationStatus === "VERIFIED");
    }
    if (industryFilter && industryFilter !== "ALL") {
      filtered = filtered.filter(m => m.industry.toLowerCase().includes(industryFilter.toLowerCase()));
    }
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery) ||
        m.currentCompany.toLowerCase().includes(searchQuery) ||
        m.currentRole.toLowerCase().includes(searchQuery) ||
        m.skills.some(s => s.toLowerCase().includes(searchQuery))
      );
    }

    // Sort by Match Score descending
    filtered.sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);

    return NextResponse.json({ mentors: filtered });
  } catch (error) {
    console.error("Fetch mentors error:", error);
    return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }
}
