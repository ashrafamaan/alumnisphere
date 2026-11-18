export interface DecayEvaluation {
  daysInactive: number;
  status: "HEALTHY" | "NEEDS_CHECKIN" | "STALLED";
  healthScore: number;
  nudgeMessage: string;
  recommendedAction: string;
}

export function evaluateRelationshipDecay(lastInteractionDate: Date): DecayEvaluation {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(lastInteractionDate).getTime());
  const daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysInactive <= 7) {
    const healthScore = Math.max(90, 100 - daysInactive * 2);
    return {
      daysInactive,
      status: "HEALTHY",
      healthScore,
      nudgeMessage: "Engagement is active and on track! Keep up the momentum.",
      recommendedAction: "Review pending action items or prepare agenda for next milestone.",
    };
  }

  if (daysInactive <= 14) {
    const healthScore = Math.max(65, 85 - (daysInactive - 7) * 3);
    return {
      daysInactive,
      status: "NEEDS_CHECKIN",
      healthScore,
      nudgeMessage: `No interaction logged for ${daysInactive} days. Relationships flourish with periodic touchpoints!`,
      recommendedAction: "Send a quick 5-minute async update or propose a 15-minute quick sync.",
    };
  }

  // > 14 days
  const healthScore = Math.max(30, 60 - Math.min((daysInactive - 14) * 2, 30));
  return {
    daysInactive,
    status: "STALLED",
    healthScore,
    nudgeMessage: `Relationship at high risk of decay! Inactive for ${daysInactive} days.`,
    recommendedAction: "Platform Auto-Nudge: Request a reset session or review outstanding goals.",
  };
}
