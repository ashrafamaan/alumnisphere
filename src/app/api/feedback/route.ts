import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, giverId, receiverId, rating, comments, keyTakeaways, followUpRequired } = body;

    if (!sessionId || !giverId || !receiverId || !rating || !comments) {
      return NextResponse.json({ error: "Missing required feedback fields" }, { status: 400 });
    }

    const feedback = await prisma.sessionFeedback.create({
      data: {
        sessionId,
        giverId,
        receiverId,
        rating: Math.min(Math.max(Number(rating), 1), 5),
        comments,
        keyTakeaways: keyTakeaways || "",
        followUpRequired: Boolean(followUpRequired),
      },
      include: {
        giver: { select: { name: true, role: true } },
        receiver: { select: { name: true, role: true } },
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: "FEEDBACK_SUBMITTED",
        actorName: feedback.giver.name,
        targetName: feedback.receiver.name,
        description: `Feedback submitted: ${rating}/5 Stars. Comments: "${comments.slice(0, 80)}..."`,
        severity: "INFO",
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
