import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateRelationshipDecay } from "@/lib/anti-decay";


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

    const relationships = await prisma.mentorshipRelationship.findMany({
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
            email: true,
            avatarUrl: true,
            alumniProfile: true,
          },
        },
        sessions: {
          orderBy: { scheduledDate: "desc" },
        },
        goals: {
          include: {
            actionItems: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Compute anti-decay diagnostics for each relationship
    const evaluated = relationships.map((rel) => {
      const decay = evaluateRelationshipDecay(rel.lastInteractionDate);
      return {
        ...rel,
        decayDiagnostics: decay,
      };
    });

    return NextResponse.json({ relationships: evaluated });
  } catch (error) {
    console.error("Fetch relationships error:", error);
    return NextResponse.json({ error: "Failed to fetch relationships" }, { status: 500 });
  }
}
