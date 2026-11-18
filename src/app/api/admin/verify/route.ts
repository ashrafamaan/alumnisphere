import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alumniProfileId, action, notes, adminName } = body;

    if (!alumniProfileId || !["VERIFY", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action or alumniProfileId" }, { status: 400 });
    }

    const newStatus = action === "VERIFY" ? "VERIFIED" : "REJECTED";

    const profile = await prisma.alumniProfile.update({
      where: { id: alumniProfileId },
      data: {
        verificationStatus: newStatus,
        verifiedAt: newStatus === "VERIFIED" ? new Date() : null,
        verificationNotes: notes || (newStatus === "VERIFIED" ? "Verified credentials by institutional registrar." : "Verification rejected."),
      },
      include: {
        user: true,
      },
    });

    await prisma.institutionalAuditLog.create({
      data: {
        eventType: newStatus === "VERIFIED" ? "ALUMNI_VERIFIED" : "ALUMNI_REJECTED",
        actorName: adminName || "Dean Sarah Jenkins (Registrar)",
        targetName: `${profile.user.name} (${profile.currentCompany})`,
        description: `Alumni verification status updated to ${newStatus}. ${notes ? `Notes: ${notes}` : ""}`,
        severity: newStatus === "VERIFIED" ? "SUCCESS" : "WARNING",
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
  }
}
