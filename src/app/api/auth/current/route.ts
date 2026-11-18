import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, createSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // Fetch all users for quick switching
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        department: true,
        alumniProfile: {
          select: {
            currentCompany: true,
            currentRole: true,
            verificationStatus: true,
          },
        },
        studentProfile: {
          select: {
            degree: true,
            graduationYear: true,
          },
        },
      },
    });

    let currentUser = null;

    if (userIdParam) {
      // Switching to a specific user -> create database session & set cookie
      const targetUser = await prisma.user.findUnique({
        where: { id: userIdParam },
        include: {
          alumniProfile: true,
          studentProfile: true,
        },
      });

      if (targetUser) {
        await createSession(targetUser.id);
        const { passwordHash: _, ...sanitized } = targetUser;
        currentUser = sanitized;
      }
    } else {
      // Check active server-side session from httpOnly cookie
      currentUser = await getCurrentUser();
    }

    return NextResponse.json({
      currentUser,
      availableUsers: allUsers,
    });
  } catch (error) {
    console.error("Auth current user error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
