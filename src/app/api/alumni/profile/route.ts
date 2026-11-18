import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      headline,
      currentCompany,
      currentRole,
      industry,
      yearsOfExperience,
      graduationYear,
      degree,
      studentIdNumber,
      linkedInUrl,
      workEmail,
      bio,
      skills,
      mentoringTopics,
      maxMenteesCapacity,
      availableHoursPerWeek,
      preferredTimeSlots,
      acceptingNewMentees,
      protectContactDetails,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const updated = await prisma.alumniProfile.upsert({
      where: { userId },
      update: {
        headline,
        currentCompany,
        currentRole,
        industry,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        graduationYear: Number(graduationYear) || 2020,
        degree,
        studentIdNumber,
        linkedInUrl,
        workEmail,
        bio,
        skills: Array.isArray(skills) ? JSON.stringify(skills) : skills,
        mentoringTopics: Array.isArray(mentoringTopics) ? JSON.stringify(mentoringTopics) : mentoringTopics,
        maxMenteesCapacity: Number(maxMenteesCapacity) || 3,
        availableHoursPerWeek: Number(availableHoursPerWeek) || 2.0,
        preferredTimeSlots: Array.isArray(preferredTimeSlots) ? JSON.stringify(preferredTimeSlots) : preferredTimeSlots,
        acceptingNewMentees: acceptingNewMentees !== false,
        protectContactDetails: protectContactDetails !== false,
        verificationStatus: "PENDING", // Resubmit triggers verification review
      },
      create: {
        userId,
        headline: headline || "Alumni Mentor",
        currentCompany: currentCompany || "Company",
        currentRole: currentRole || "Engineer",
        industry: industry || "Technology",
        yearsOfExperience: Number(yearsOfExperience) || 1,
        graduationYear: Number(graduationYear) || 2020,
        degree: degree || "B.Tech",
        studentIdNumber,
        linkedInUrl,
        workEmail,
        bio: bio || "",
        skills: Array.isArray(skills) ? JSON.stringify(skills) : (skills || "[]"),
        mentoringTopics: Array.isArray(mentoringTopics) ? JSON.stringify(mentoringTopics) : (mentoringTopics || "[]"),
        maxMenteesCapacity: Number(maxMenteesCapacity) || 3,
        availableHoursPerWeek: Number(availableHoursPerWeek) || 2.0,
        preferredTimeSlots: Array.isArray(preferredTimeSlots) ? JSON.stringify(preferredTimeSlots) : (preferredTimeSlots || "[]"),
        acceptingNewMentees: true,
        protectContactDetails: true,
        verificationStatus: "PENDING",
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: "ALUMNI_PROFILE_UPDATED",
        actorName: "Alumni User",
        targetName: currentCompany || "Self",
        description: `Profile credentials and mentoring preferences updated. Submitted for registrar verification review.`,
        severity: "INFO",
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Update alumni profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
