import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const whereClause = role === "ALUMNI" 
      ? { alumniId: userId }
      : { studentId: userId };

    const requests = await prisma.mentorshipRequest.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            studentProfile: true,
          },
        },
        alumni: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            alumniProfile: true,
          },
        },
        relationship: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, alumniId, message, preferredTrack } = body;

    if (!studentId || !alumniId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if mentor is accepting mentees and under capacity
    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: { userId: alumniId },
    });

    const activeCount = await prisma.mentorshipRelationship.count({
      where: { alumniId, status: "ACTIVE" },
    });

    if (alumniProfile && activeCount >= alumniProfile.maxMenteesCapacity) {
      return NextResponse.json({
        error: `Mentor has reached their maximum capacity limit (${alumniProfile.maxMenteesCapacity} mentees).`,
      }, { status: 400 });
    }

    // Check if mentee is already actively paired with this mentor
    const existingRelationship = await prisma.mentorshipRelationship.findFirst({
      where: {
        studentId,
        alumniId,
        status: "ACTIVE",
      },
    });

    if (existingRelationship) {
      return NextResponse.json({ error: "You are already actively paired with this mentor." }, { status: 400 });
    }

    // Check existing pending request
    const existing = await prisma.mentorshipRequest.findFirst({
      where: {
        studentId,
        alumniId,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already have a pending request with this mentor." }, { status: 400 });
    }

    const newRequest = await prisma.mentorshipRequest.create({
      data: {
        studentId,
        alumniId,
        message,
        preferredTrack: preferredTrack || "Career Guidance",
        status: "PENDING",
      },
      include: {
        student: true,
        alumni: true,
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: "REQUEST_SUBMITTED",
        actorName: newRequest.student.name,
        targetName: newRequest.alumni.name,
        description: `Mentorship request sent for track: ${preferredTrack || "Career Guidance"}`,
        severity: "INFO",
      },
    });

    return NextResponse.json({ request: newRequest });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, responseNote } = body;

    if (!requestId || !["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or requestId" }, { status: 400 });
    }

    const existingReq = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: { student: true, alumni: true },
    });

    if (!existingReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status,
        responseNote: responseNote || (status === "ACCEPTED" ? "Request accepted! Welcome to the mentorship cycle." : "Declined due to current schedule constraints."),
      },
    });

    let relationship = null;
    if (status === "ACCEPTED") {
      // Create new relationship
      relationship = await prisma.mentorshipRelationship.create({
        data: {
          requestId: updated.id,
          studentId: existingReq.studentId,
          alumniId: existingReq.alumniId,
          status: "ACTIVE",
          startDate: new Date(),
          lastInteractionDate: new Date(),
          decayRiskStatus: "HEALTHY",
          healthScore: 100,
          notes: "Mentorship officially kicked off.",
        },
      });

      // Initialize default kickoff goal with action items
      const goal = await prisma.mentorshipGoal.create({
        data: {
          relationshipId: relationship.id,
          title: "Initial Alignment & 60-Day Milestone Definition",
          description: "Establish concrete technical objectives, review portfolio/resume, and schedule first 1-on-1.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          progressPercent: 25,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.actionItem.createMany({
        data: [
          {
            goalId: goal.id,
            title: "Schedule 30-min onboarding session",
            assignedRole: "STUDENT",
            isCompleted: false,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            goalId: goal.id,
            title: "Upload latest resume and target job descriptions",
            assignedRole: "STUDENT",
            isCompleted: false,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          {
            goalId: goal.id,
            title: "Review student background and suggest introductory materials",
            assignedRole: "ALUMNI",
            isCompleted: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      await prisma.institutionalAuditLog.create({
        data: {
          eventType: "PAIRING_CREATED",
          actorName: existingReq.alumni.name,
          targetName: existingReq.student.name,
          description: `Mentorship accepted and active pairing created with anti-decay monitoring.`,
          severity: "SUCCESS",
        },
      });
    }

    return NextResponse.json({ request: updated, relationship });
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
