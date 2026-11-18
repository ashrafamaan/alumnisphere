import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    const body = await request.json();

    const targetUserId = body.userId || sessionUser?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized or missing userId" }, { status: 401 });
    }

    const {
      name,
      avatarUrl,
      department,
      role,
      // Student specific
      careerGoals,
      targetRoles,
      targetIndustries,
      skillsToDevelop,
      studentBio,
      degree,
      graduationYear,
      // Alumni specific
      headline,
      currentCompany,
      currentRole,
      industry,
      yearsOfExperience,
      alumniBio,
      skills,
      mentoringTopics,
      maxMenteesCapacity,
      availableHoursPerWeek,
      protectContactDetails,
    } = body;

    // 1. Update Core User Details
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(name ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(department !== undefined ? { department } : {}),
      },
    });

    const userRole = role || sessionUser?.role || updatedUser.role;

    // 2. Update Student Profile if applicable
    if (userRole === "STUDENT") {
      await prisma.studentProfile.upsert({
        where: { userId: targetUserId },
        update: {
          ...(careerGoals !== undefined ? { careerGoals } : {}),
          ...(degree ? { degree } : {}),
          ...(graduationYear ? { graduationYear: Number(graduationYear) } : {}),
          ...(targetRoles !== undefined
            ? { targetRoles: Array.isArray(targetRoles) ? JSON.stringify(targetRoles) : targetRoles }
            : {}),
          ...(targetIndustries !== undefined
            ? { targetIndustries: Array.isArray(targetIndustries) ? JSON.stringify(targetIndustries) : targetIndustries }
            : {}),
          ...(skillsToDevelop !== undefined
            ? { skillsToDevelop: Array.isArray(skillsToDevelop) ? JSON.stringify(skillsToDevelop) : skillsToDevelop }
            : {}),
          ...(studentBio !== undefined ? { bio: studentBio } : {}),
        },
        create: {
          userId: targetUserId,
          degree: degree || "B.Tech Computer Science",
          graduationYear: Number(graduationYear) || 2026,
          studentIdNumber: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          careerGoals: careerGoals || "Backend Systems & Cloud Engineering",
          targetIndustries: Array.isArray(targetIndustries) ? JSON.stringify(targetIndustries) : "[]",
          targetRoles: Array.isArray(targetRoles) ? JSON.stringify(targetRoles) : "[]",
          skillsToDevelop: Array.isArray(skillsToDevelop) ? JSON.stringify(skillsToDevelop) : "[]",
          bio: studentBio || "",
        },
      });
    }

    // 3. Update Alumni Profile if applicable
    if (userRole === "ALUMNI") {
      await prisma.alumniProfile.upsert({
        where: { userId: targetUserId },
        update: {
          ...(headline ? { headline } : {}),
          ...(currentCompany ? { currentCompany } : {}),
          ...(currentRole ? { currentRole } : {}),
          ...(industry ? { industry } : {}),
          ...(yearsOfExperience ? { yearsOfExperience: Number(yearsOfExperience) } : {}),
          ...(alumniBio !== undefined ? { bio: alumniBio } : {}),
          ...(skills !== undefined
            ? { skills: Array.isArray(skills) ? JSON.stringify(skills) : skills }
            : {}),
          ...(mentoringTopics !== undefined
            ? { mentoringTopics: Array.isArray(mentoringTopics) ? JSON.stringify(mentoringTopics) : mentoringTopics }
            : {}),
          ...(maxMenteesCapacity ? { maxMenteesCapacity: Number(maxMenteesCapacity) } : {}),
          ...(availableHoursPerWeek ? { availableHoursPerWeek: Number(availableHoursPerWeek) } : {}),
          ...(protectContactDetails !== undefined ? { protectContactDetails: Boolean(protectContactDetails) } : {}),
        },
        create: {
          userId: targetUserId,
          headline: headline || `${currentRole || "Staff Engineer"} @ ${currentCompany || "Tech"}`,
          currentCompany: currentCompany || "Tech Company",
          currentRole: currentRole || "Engineer",
          industry: industry || "Technology",
          yearsOfExperience: Number(yearsOfExperience) || 3,
          graduationYear: 2020,
          degree: "B.Tech",
          bio: alumniBio || "Mentoring the next generation of engineers.",
          skills: Array.isArray(skills) ? JSON.stringify(skills) : "[]",
          mentoringTopics: Array.isArray(mentoringTopics) ? JSON.stringify(mentoringTopics) : "[]",
          maxMenteesCapacity: Number(maxMenteesCapacity) || 3,
          availableHoursPerWeek: Number(availableHoursPerWeek) || 2.0,
          preferredTimeSlots: JSON.stringify(["Flexible"]),
          protectContactDetails: protectContactDetails !== undefined ? Boolean(protectContactDetails) : true,
        },
      });
    }

    // Fetch refreshed complete user
    const finalUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        alumniProfile: true,
        studentProfile: true,
      },
    });

    if (finalUser) {
      const { passwordHash: _, ...sanitized } = finalUser;
      return NextResponse.json({ success: true, user: sanitized });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
