/**
 * SkillMirror Explainable Attribution Waterfall
 */

function generateAttributionWaterfall(domainScore = 50, specificityScore = 50, ownershipScore = 50, hesitationScore = 0) {
  const base = 50;
  let running = base;
  const waterfall = [];

  waterfall.push({ label: 'Base Benchmark', delta: 50, running_total: 50 });

  // Domain Content contribution
  const contentDelta = Math.round((domainScore - 50) * 0.5);
  running += contentDelta;
  waterfall.push({ label: 'Domain Content Correctness', delta: contentDelta, running_total: running });

  // Specificity contribution
  const specDelta = Math.round((specificityScore - 50) * 0.25);
  running += specDelta;
  waterfall.push({ label: 'STAR Specificity & Detail', delta: specDelta, running_total: running });

  // Ownership contribution
  const ownDelta = Math.round((ownershipScore - 50) * 0.15);
  running += ownDelta;
  waterfall.push({ label: 'Ownership & Action Verbs', delta: ownDelta, running_total: running });

  // Hesitation Penalty
  const hesitationPenalty = -Math.round(hesitationScore * 20);
  running += hesitationPenalty;
  waterfall.push({ label: 'Filler & Hedging Penalty', delta: hesitationPenalty, running_total: running });

  const finalCompositeScore = Math.max(0, Math.min(100, running));

  return {
    finalCompositeScore,
    waterfall
  };
}

module.exports = { generateAttributionWaterfall };
