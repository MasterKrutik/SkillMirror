export type TopicScore = {
  topic: string; // "Algorithms" | "Databases" | "System Design" | "Behavioral" | etc.
  correctCount: number;
  totalCount: number;
  avgConfidenceScore: number; // 0-100, from Bayesian Beta distribution mean
  lastAttemptedAt: string | null;
  mean?: number;
  score?: number;
  total?: number;
};

export type UserSkillProfile = {
  topics: TopicScore[];
  sessionsCompleted: number;
  latestElo?: number;
  eloHistory?: Array<{ date: string; elo: number }>;
};

export type ScoredTopic = TopicScore & {
  compositeScore: number;
};

export type ComputedSkillAnalysis = {
  strongest: ScoredTopic | null;
  weakest: ScoredTopic | null;
  hasData: boolean;
};

export function computeStrongestAndWeakest(profile: UserSkillProfile): ComputedSkillAnalysis {
  if (
    !profile ||
    typeof profile.sessionsCompleted !== 'number' ||
    profile.sessionsCompleted === 0 ||
    !Array.isArray(profile.topics) ||
    profile.topics.length === 0
  ) {
    return { strongest: null, weakest: null, hasData: false };
  }

  // Filter out topics with no attempts
  const attempted = profile.topics.filter(t => {
    const total = t.totalCount !== undefined ? t.totalCount : (t.total || 0);
    const scoreVal = t.mean !== undefined ? t.mean : (t.score || 0);
    return total > 0 || scoreVal > 0;
  });

  if (attempted.length === 0) {
    return { strongest: null, weakest: null, hasData: false };
  }

  const scored: ScoredTopic[] = attempted.map(t => {
    const totalCount = t.totalCount !== undefined ? t.totalCount : 10;
    const meanScore = t.mean !== undefined ? t.mean : (t.score !== undefined ? t.score : 70);
    const correctCount = t.correctCount !== undefined
      ? t.correctCount
      : Math.round((meanScore / 100) * totalCount);
    const avgConfidenceScore = t.avgConfidenceScore !== undefined
      ? t.avgConfidenceScore
      : meanScore;

    const accuracyRatio = totalCount > 0 ? correctCount / totalCount : meanScore / 100;
    const confidenceRatio = avgConfidenceScore / 100;
    const compositeScore = accuracyRatio * 0.7 + confidenceRatio * 0.3;

    return {
      ...t,
      topic: t.topic || 'General',
      correctCount,
      totalCount,
      avgConfidenceScore,
      compositeScore
    };
  });

  const strongest = scored.reduce(
    (max, t) => (t.compositeScore > max.compositeScore ? t : max),
    scored[0]
  );
  const weakest = scored.reduce(
    (min, t) => (t.compositeScore < min.compositeScore ? t : min),
    scored[0]
  );

  return { strongest, weakest, hasData: true };
}
