import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { relationshipId, studentId, alumniId, title, description, scheduledDate, durationMinutes, agenda } = body;

    if (!relationshipId || !studentId || !alumniId || !title || !scheduledDate) {
      return NextResponse.json({ error: "Missing required session fields" }, { status: 400 });
    }

    const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;

    const session = await prisma.mentorshipSession.create({
      data: {
        relationshipId,
        studentId,
        alumniId,
        title,
        description: description || "",
        scheduledDate: new Date(scheduledDate),
        durationMinutes: Number(durationMinutes) || 45,
        status: "SCHEDULED",
        virtualMeetingUrl: `/rooms/${roomId}`,
        agenda: agenda || "1. Progress check-in\n2. Technical/Career discussion\n3. Action items & next steps",
      },
      include: {
        student: { select: { name: true } },
        alumni: { select: { name: true } },
      },
    });

    // Touch relationship interaction date
    await prisma.mentorshipRelationship.update({
      where: { id: relationshipId },
      data: {
        lastInteractionDate: new Date(),
        decayRiskStatus: "HEALTHY",
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: "SESSION_SCHEDULED",
        actorName: session.student.name,
        targetName: session.alumni.name,
        description: `Session scheduled: "${title}" for ${new Date(scheduledDate).toLocaleDateString()}`,
        severity: "INFO",
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Failed to schedule session" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, status, meetingSummary, alumniNotes, studentNotes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: {
        ...(status && { status }),
        ...(meetingSummary !== undefined && { meetingSummary }),
        ...(alumniNotes !== undefined && { alumniPrivateNotes: alumniNotes }),
        ...(studentNotes !== undefined && { studentPrivateNotes: studentNotes }),
      },
      include: {
        relationship: true,
        student: true,
        alumni: true,
      },
    });

    if (status === "COMPLETED") {
      await prisma.mentorshipRelationship.update({
        where: { id: session.relationshipId },
        data: {
          lastInteractionDate: new Date(),
          decayRiskStatus: "HEALTHY",
          healthScore: 100,
        },
      });

      await prisma.institutionalAuditLog.create({
        data: {
          eventType: "SESSION_COMPLETED",
          actorName: session.alumni.name,
          targetName: session.student.name,
          description: `Mentorship session "${session.title}" completed. Outcome summary logged.`,
          severity: "SUCCESS",
        },
      });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
