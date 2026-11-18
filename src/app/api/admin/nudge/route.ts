import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { relationshipId, adminName } = body;

    if (!relationshipId) {
      return NextResponse.json({ error: "relationshipId required" }, { status: 400 });
    }

    const relationship = await prisma.mentorshipRelationship.findUnique({
      where: { id: relationshipId },
      include: {
        student: true,
        alumni: true,
      },
    });

    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    // Insert an automated platform re-engagement prompt message
    await prisma.directMessage.create({
      data: {
        relationshipId: relationship.id,
        senderId: relationship.alumniId, // posted as system nudge
        receiverId: relationship.studentId,
        content: `[Automated Anti-Decay Check-in from Institutional Career Services]: It looks like you haven't connected recently! Dean Sarah's office recommends booking a quick 15-minute sync or reviewing pending goals to keep momentum going.`,
      },
    });

    // Touch relationship
    await prisma.mentorshipRelationship.update({
      where: { id: relationshipId },
      data: {
        decayRiskStatus: "NEEDS_CHECKIN",
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: "DECAY_WARNING_DISPATCHED",
        actorName: adminName || "Institutional Anti-Decay Monitor",
        targetName: `${relationship.student.name} & ${relationship.alumni.name}`,
        description: `Automated re-engagement nudge dispatched to pairing to prevent relationship stagnation.`,
        severity: "INFO",
      },
    });

    return NextResponse.json({ success: true, message: "Decay prevention nudge dispatched successfully." });
  } catch (error) {
    console.error("Admin nudge error:", error);
    return NextResponse.json({ error: "Failed to dispatch nudge" }, { status: 500 });
  }
}
