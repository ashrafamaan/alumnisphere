import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relationshipId = searchParams.get("relationshipId");

    if (!relationshipId) {
      return NextResponse.json({ error: "relationshipId required" }, { status: 400 });
    }

    const messages = await prisma.directMessage.findMany({
      where: { relationshipId },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { relationshipId, senderId, receiverId, content } = body;

    if (!relationshipId || !senderId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await prisma.directMessage.create({
      data: {
        relationshipId,
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    // Touch relationship interaction date to reset decay risk!
    await prisma.mentorshipRelationship.update({
      where: { id: relationshipId },
      data: {
        lastInteractionDate: new Date(),
        decayRiskStatus: "HEALTHY",
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
