/**
 * SkillMirror Session Telemetry & User Skill Profile Data Contract
 *
 * TopicScore = {
 *   topic: string,              // e.g. "Algorithms", "Databases", "System Design", "Behavioral"
 *   correctCount: number,       // number of answers scoring >= 70
 *   totalCount: number,         // total answers attempted for this topic
 *   avgConfidenceScore: number, // 0-100 confidence/delivery score
 *   lastAttemptedAt: string | null
 * }
 *
 * UserSkillProfile = {
 *   topics: TopicScore[],
 *   sessionsCompleted: number,
 *   latestElo?: number,
 *   eloHistory?: Array<{ date: string, elo: number }>
 * }
 */

/**
 * Computes the strongest topic and focus area using a composite score
 * compositeScore = (accuracyRatio * 0.7) + (confidenceRatio * 0.3)
 */
export function computeStrongestAndWeakest(profile) {
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

  const scored = attempted.map(t => {
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

/**
 * MANDATORY VERIFICATION RUNNER — Tests 3 scenarios (a, b, c) and logs outputs to console
 */
export function runSessionAnalyticsVerification() {
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('DASHBOARD TELEMETRY ENGINE — 3-Scenario Verification');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Scenario (a): sessionsCompleted = 0
  const scenarioA = { sessionsCompleted: 0, topics: [] };
  const resA = computeStrongestAndWeakest(scenarioA);
  console.log('▶ Scenario (a): profile.sessionsCompleted = 0');
  console.log('  Result:', resA);
  console.log(`  Strongest displayed: "${resA.strongest ? resA.strongest.topic : '—'}"`);
  console.log(`  Focus displayed:     "${resA.weakest ? resA.weakest.topic : '—'}"`);
  console.log(`  Empty state active:   ${resA.hasData === false} (expected: true, NO hardcoded topic names)\n`);

  // Scenario (b): Algorithms strong (8/10, conf 85), Databases weak (3/10, conf 40), System Design mid (6/10, conf 60)
  const scenarioB = {
    sessionsCompleted: 2,
    topics: [
      { topic: 'Algorithms', correctCount: 8, totalCount: 10, avgConfidenceScore: 85 },
      { topic: 'Databases', correctCount: 3, totalCount: 10, avgConfidenceScore: 40 },
      { topic: 'System Design', correctCount: 6, totalCount: 10, avgConfidenceScore: 60 }
    ]
  };
  const resB = computeStrongestAndWeakest(scenarioB);
  console.log('▶ Scenario (b): Algorithms (8/10), Databases (3/10), System Design (6/10)');
  console.log(`  Strongest: ${resB.strongest?.topic} (${Math.round(resB.strongest?.compositeScore * 100)}% mastery · ${resB.strongest?.correctCount}/${resB.strongest?.totalCount} correct)`);
  console.log(`  Focus:     ${resB.weakest?.topic} (${Math.round(resB.weakest?.compositeScore * 100)}% mastery · Prime opportunity)\n`);

  // Scenario (c): Algorithms weak (2/10, conf 30), Behavioral strong (9/10, conf 90)
  const scenarioC = {
    sessionsCompleted: 3,
    topics: [
      { topic: 'Algorithms', correctCount: 2, totalCount: 10, avgConfidenceScore: 30 },
      { topic: 'Behavioral', correctCount: 9, totalCount: 10, avgConfidenceScore: 90 }
    ]
  };
  const resC = computeStrongestAndWeakest(scenarioC);
  console.log('▶ Scenario (c): Algorithms (2/10), Behavioral (9/10)');
  console.log(`  Strongest: ${resC.strongest?.topic} (${Math.round(resC.strongest?.compositeScore * 100)}% mastery · ${resC.strongest?.correctCount}/${resC.strongest?.totalCount} correct)`);
  console.log(`  Focus:     ${resC.weakest?.topic} (${Math.round(resC.weakest?.compositeScore * 100)}% mastery · Prime opportunity)`);
  console.log(`  Proves non-hardcoded: Strongest is "${resC.strongest?.topic}" (NOT Algorithms!)\n`);

  console.log('══ STRUCTURAL VERIFICATION CHECK ══');
  console.log(`Scenario (a) empty state: ${resA.hasData === false ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Scenario (b) Strongest=Algorithms, Focus=Databases: ${resB.strongest?.topic === 'Algorithms' && resB.weakest?.topic === 'Databases' ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Scenario (c) Strongest=Behavioral, Focus=Algorithms: ${resC.strongest?.topic === 'Behavioral' && resC.weakest?.topic === 'Algorithms' ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  return { resA, resB, resC };
}
