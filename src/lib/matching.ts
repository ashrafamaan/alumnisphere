export interface MatchResult {
  score: number;
  matchTier: "EXCELLENT" | "HIGH" | "GOOD" | "MODERATE";
  breakdown: {
    roleScore: number;
    industryScore: number;
    skillScore: number;
    topicsScore: number;
    capacityScore: number;
  };
  matchedHighlights: string[];
}

interface StudentPreferences {
  careerGoals?: string;
  targetIndustries: string[];
  targetRoles: string[];
  skillsToDevelop: string[];
}

interface MentorProfileData {
  industry: string;
  currentRole: string;
  skills: string[];
  mentoringTopics: string[];
  maxMenteesCapacity: number;
  currentActiveMentees: number;
  acceptingNewMentees: boolean;
  yearsOfExperience: number;
}

export function calculateMentorshipMatch(
  student: StudentPreferences,
  mentor: MentorProfileData
): MatchResult {
  if (!mentor.acceptingNewMentees || mentor.currentActiveMentees >= mentor.maxMenteesCapacity) {
    // Still give score but highlight limited capacity
  }

  const matchedHighlights: string[] = [];

  // 1. Role Match (30 pts)
  let roleScore = 0;
  const mentorRoleLower = mentor.currentRole.toLowerCase();
  const matchedRole = student.targetRoles.find(r => 
    mentorRoleLower.includes(r.toLowerCase()) || r.toLowerCase().includes(mentorRoleLower)
  );
  if (matchedRole) {
    roleScore = 30;
    matchedHighlights.push(`Role Match: ${mentor.currentRole}`);
  } else if (
    student.targetRoles.some(r => {
      const words = r.toLowerCase().split(" ");
      return words.some(w => w.length > 3 && mentorRoleLower.includes(w));
    })
  ) {
    roleScore = 20;
    matchedHighlights.push(`Related Field: ${mentor.currentRole}`);
  } else {
    roleScore = 10;
  }

  // 2. Industry Match (25 pts)
  let industryScore = 0;
  const mentorIndLower = mentor.industry.toLowerCase();
  const matchedInd = student.targetIndustries.find(ind =>
    mentorIndLower.includes(ind.toLowerCase()) || ind.toLowerCase().includes(mentorIndLower)
  );
  if (matchedInd) {
    industryScore = 25;
    matchedHighlights.push(`Industry: ${mentor.industry}`);
  } else {
    industryScore = 8;
  }

  // 3. Skills Overlap (25 pts)
  let skillScore = 0;
  const mentorSkillsLower = mentor.skills.map(s => s.toLowerCase());
  const overlappingSkills = student.skillsToDevelop.filter(s =>
    mentorSkillsLower.some(ms => ms.includes(s.toLowerCase()) || s.toLowerCase().includes(ms))
  );

  if (overlappingSkills.length > 0) {
    const ratio = Math.min(overlappingSkills.length / Math.max(student.skillsToDevelop.length, 1), 1);
    skillScore = Math.round(15 + ratio * 10);
    matchedHighlights.push(`Skills: ${overlappingSkills.slice(0, 3).join(", ")}`);
  } else {
    skillScore = 5;
  }

  // 4. Mentoring Topics / Experience (10 pts)
  let topicsScore = 10;
  if (mentor.yearsOfExperience >= 5) {
    topicsScore += 5;
    matchedHighlights.push(`${mentor.yearsOfExperience}+ Years Industry Exp`);
  }

  // 5. Capacity Availability (10 pts)
  let capacityScore = 0;
  if (mentor.acceptingNewMentees && mentor.currentActiveMentees < mentor.maxMenteesCapacity) {
    const slotsLeft = mentor.maxMenteesCapacity - mentor.currentActiveMentees;
    capacityScore = slotsLeft >= 2 ? 10 : 7;
    matchedHighlights.push(`${slotsLeft} open slot${slotsLeft > 1 ? 's' : ''}`);
  } else {
    capacityScore = 2;
  }

  const rawTotal = roleScore + industryScore + skillScore + topicsScore + capacityScore;
  const finalScore = Math.min(Math.max(rawTotal, 45), 99);

  let matchTier: "EXCELLENT" | "HIGH" | "GOOD" | "MODERATE" = "MODERATE";
  if (finalScore >= 88) matchTier = "EXCELLENT";
  else if (finalScore >= 75) matchTier = "HIGH";
  else if (finalScore >= 60) matchTier = "GOOD";

  return {
    score: finalScore,
    matchTier,
    breakdown: {
      roleScore,
      industryScore,
      skillScore,
      topicsScore,
      capacityScore,
    },
    matchedHighlights,
  };
}
