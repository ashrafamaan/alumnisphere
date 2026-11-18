import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateRelationshipDecay } from "@/lib/anti-decay";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const relationship = await prisma.mentorshipRelationship.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            department: true,
            studentProfile: true,
          },
        },
        alumni: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
            alumniProfile: true,
          },
        },
        sessions: {
          include: {
            feedbacks: {
              include: {
                giver: { select: { id: true, name: true, role: true } },
              },
            },
          },
          orderBy: { scheduledDate: "desc" },
        },
        goals: {
          include: {
            actionItems: {
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
    }

    const decayDiagnostics = evaluateRelationshipDecay(relationship.lastInteractionDate);

    return NextResponse.json({
      relationship: {
        ...relationship,
        decayDiagnostics,
      },
    });
  } catch (error) {
    console.error("Fetch relationship error:", error);
    return NextResponse.json({ error: "Failed to fetch relationship" }, { status: 500 });
  }
}
