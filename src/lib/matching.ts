/**
 * Calculate matching score between student and job/internship
 * @param studentSkills Array of student's skills with levels
 * @param requiredSkills Array of required skills for the position
 * @returns Matching percentage (0-100)
 */
export function calculateMatchingScore(
  studentSkills: Array<{ skillId: string; level: string }>,
  requiredSkills: Array<{ skillId: string; required: boolean }>
): {
  score: number;
  skillMatches: number;
  totalSkills: number;
} {
  const totalSkills = requiredSkills.length;
  if (totalSkills === 0) {
    return { score: 0, skillMatches: 0, totalSkills: 0 };
  }

  let skillMatches = 0;
  let weightedScore = 0;

  for (const requiredSkill of requiredSkills) {
    const studentSkill = studentSkills.find(s => s.skillId === requiredSkill.skillId);
    
    if (studentSkill) {
      skillMatches++;
      
      // Weight based on skill level
      const levelWeight = getLevelWeight(studentSkill.level);
      const requiredWeight = requiredSkill.required ? 1.2 : 1.0; // Boost required skills
      
      weightedScore += levelWeight * requiredWeight;
    }
  }

  // Calculate final score as percentage
  const maxPossibleScore = totalSkills * 1.0 * 1.2; // Max weight if all required
  const score = Math.min(100, (weightedScore / maxPossibleScore) * 100);

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    skillMatches,
    totalSkills
  };
}

function getLevelWeight(level: string): number {
  switch (level.toUpperCase()) {
    case 'BEGINNER':
      return 0.4;
    case 'INTERMEDIATE':
      return 0.7;
    case 'ADVANCED':
      return 0.9;
    case 'EXPERT':
      return 1.0;
    default:
      return 0.4;
  }
}
