import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { relationshipId, title, description, targetDate, priority } = body;

    if (!relationshipId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const goal = await prisma.mentorshipGoal.create({
      data: {
        relationshipId,
        title,
        description: description || "",
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || "MEDIUM",
        status: "IN_PROGRESS",
        progressPercent: 0,
      },
    });

    // Touch interaction date to combat decay!
    await prisma.mentorshipRelationship.update({
      where: { id: relationshipId },
      data: {
        lastInteractionDate: new Date(),
        decayRiskStatus: "HEALTHY",
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { goalId, status, progressPercent } = body;

    if (!goalId) {
      return NextResponse.json({ error: "goalId required" }, { status: 400 });
    }

    const updated = await prisma.mentorshipGoal.update({
      where: { id: goalId },
      data: {
        ...(status && { status }),
        ...(progressPercent !== undefined && { progressPercent: Number(progressPercent) }),
      },
    });

    return NextResponse.json({ goal: updated });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}
