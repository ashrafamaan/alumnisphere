import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      degree,
      graduationYear,
      studentIdNumber,
      careerGoals,
      targetIndustries,
      targetRoles,
      skillsToDevelop,
      bio,
      githubUrl,
      linkedInUrl,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const updated = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        degree,
        graduationYear: Number(graduationYear) || 2026,
        studentIdNumber,
        careerGoals,
        targetIndustries: Array.isArray(targetIndustries) ? JSON.stringify(targetIndustries) : targetIndustries,
        targetRoles: Array.isArray(targetRoles) ? JSON.stringify(targetRoles) : targetRoles,
        skillsToDevelop: Array.isArray(skillsToDevelop) ? JSON.stringify(skillsToDevelop) : skillsToDevelop,
        bio,
        githubUrl,
        linkedInUrl,
      },
      create: {
        userId,
        degree: degree || "B.Tech Computer Science",
        graduationYear: Number(graduationYear) || 2026,
        studentIdNumber: studentIdNumber || "STUDENT-01",
        careerGoals: careerGoals || "Explore career options",
        targetIndustries: Array.isArray(targetIndustries) ? JSON.stringify(targetIndustries) : "[]",
        targetRoles: Array.isArray(targetRoles) ? JSON.stringify(targetRoles) : "[]",
        skillsToDevelop: Array.isArray(skillsToDevelop) ? JSON.stringify(skillsToDevelop) : "[]",
        bio: bio || "",
        githubUrl,
        linkedInUrl,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Update student profile error:", error);
    return NextResponse.json({ error: "Failed to update student profile" }, { status: 500 });
  }
}
