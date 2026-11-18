import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateRelationshipDecay } from "@/lib/anti-decay";


export async function GET() {
  try {
    // 1. Alumni Stats
    const totalAlumni = await prisma.alumniProfile.count();
    const verifiedAlumni = await prisma.alumniProfile.count({
      where: { verificationStatus: "VERIFIED" },
    });
    const pendingVerification = await prisma.alumniProfile.count({
      where: { verificationStatus: "PENDING" },
    });

    // 2. Student Stats
    const totalStudents = await prisma.studentProfile.count();

    // 3. Relationships & Anti-Decay Health
    const relationships = await prisma.mentorshipRelationship.findMany({
      include: {
        student: { select: { id: true, name: true, avatarUrl: true } },
        alumni: { select: { id: true, name: true, avatarUrl: true, alumniProfile: true } },
        goals: { select: { status: true, progressPercent: true } },
        sessions: { select: { id: true, status: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    let healthyCount = 0;
    let needsCheckinCount = 0;
    let stalledCount = 0;

    const evaluatedRelationships = relationships.map((rel) => {
      const decay = evaluateRelationshipDecay(rel.lastInteractionDate);
      if (decay.status === "HEALTHY") healthyCount++;
      else if (decay.status === "NEEDS_CHECKIN") needsCheckinCount++;
      else stalledCount++;

      return {
        ...rel,
        decayDiagnostics: decay,
      };
    });

    // 4. Sessions
    const totalSessions = await prisma.mentorshipSession.count();
    const completedSessions = await prisma.mentorshipSession.count({
      where: { status: "COMPLETED" },
    });

    // 5. Goals & Action Items
    const totalGoals = await prisma.mentorshipGoal.count();
    const achievedGoals = await prisma.mentorshipGoal.count({
      where: { status: "ACHIEVED" },
    });
    const goalCompletionRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

    // 6. Satisfaction Rating
    const feedbacks = await prisma.sessionFeedback.findMany({
      select: { rating: true },
    });
    const avgSatisfaction = feedbacks.length > 0
      ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1))
      : 5.0;

    // 7. Pending Verifications Queue
    const pendingAlumni = await prisma.alumniProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        user: true,
      },
    });

    // 8. Recent Audit Logs
    const auditLogs = await prisma.institutionalAuditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      metrics: {
        totalAlumni,
        verifiedAlumni,
        pendingVerification,
        totalStudents,
        activePairings: relationships.length,
        healthyCount,
        needsCheckinCount,
        stalledCount,
        decayRiskRate: relationships.length > 0 ? Math.round(((needsCheckinCount + stalledCount) / relationships.length) * 100) : 0,
        totalSessions,
        completedSessions,
        totalGoals,
        achievedGoals,
        goalCompletionRate,
        avgSatisfaction,
        totalFeedbackReviews: feedbacks.length,
      },
      pendingAlumni,
      relationships: evaluatedRelationships,
      auditLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
