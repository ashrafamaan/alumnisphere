import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, title, assignedRole, dueDate } = body;

    if (!goalId || !title) {
      return NextResponse.json({ error: "goalId and title required" }, { status: 400 });
    }

    const item = await prisma.actionItem.create({
      data: {
        goalId,
        title,
        assignedRole: assignedRole || "STUDENT",
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: false,
      },
      include: {
        goal: true,
      },
    });

    // Touch interaction date
    await prisma.mentorshipRelationship.update({
      where: { id: item.goal.relationshipId },
      data: {
        lastInteractionDate: new Date(),
        decayRiskStatus: "HEALTHY",
      },
    });

    return NextResponse.json({ actionItem: item });
  } catch (error) {
    console.error("Create action item error:", error);
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { actionItemId, isCompleted } = body;

    if (!actionItemId) {
      return NextResponse.json({ error: "actionItemId required" }, { status: 400 });
    }

    const updated = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        goal: {
          include: {
            actionItems: true,
          },
        },
      },
    });

    // Recalculate goal progress percent
    const allItems = updated.goal.actionItems;
    if (allItems.length > 0) {
      const completedCount = allItems.filter(i => i.isCompleted).length;
      const progressPercent = Math.round((completedCount / allItems.length) * 100);
      const newStatus = progressPercent === 100 ? "ACHIEVED" : "IN_PROGRESS";
      
      await prisma.mentorshipGoal.update({
        where: { id: updated.goalId },
        data: {
          progressPercent,
          status: newStatus,
        },
      });
    }

    // Touch relationship
    await prisma.mentorshipRelationship.update({
      where: { id: updated.goal.relationshipId },
      data: {
        lastInteractionDate: new Date(),
        decayRiskStatus: "HEALTHY",
      },
    });

    return NextResponse.json({ actionItem: updated });
  } catch (error) {
    console.error("Update action item error:", error);
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 });
  }
}
