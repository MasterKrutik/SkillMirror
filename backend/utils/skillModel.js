/**
 * SkillMirror Bayesian Skill Model (Beta Distribution)
 */

function createInitialTopicDistribution() {
  return { alpha: 2, beta: 2 };
}

function updateTopicDistribution(dist = { alpha: 2, beta: 2 }, contentScore = 50) {
  const success = Math.max(0, Math.min(1, contentScore / 100));
  const newAlpha = dist.alpha + (success * 2);
  const newBeta = dist.beta + ((1 - success) * 2);
  return { alpha: newAlpha, beta: newBeta };
}

function getTopicMetrics(dist = { alpha: 2, beta: 2 }) {
  const { alpha, beta } = dist;
  const total = alpha + beta;
  const mean = alpha / total;
  const variance = (alpha * beta) / (Math.pow(total, 2) * (total + 1));
  const stdDev = Math.sqrt(variance);
  
  const ciLow = Math.max(0, mean - 1.96 * stdDev);
  const ciHigh = Math.min(1, mean + 1.96 * stdDev);

  return {
    mean: parseFloat((mean * 100).toFixed(1)),
    variance: parseFloat(variance.toFixed(4)),
    stdDev: parseFloat((stdDev * 100).toFixed(1)),
    ciLow: parseFloat((ciLow * 100).toFixed(1)),
    ciHigh: parseFloat((ciHigh * 100).toFixed(1))
  };
}

module.exports = {
  createInitialTopicDistribution,
  updateTopicDistribution,
  getTopicMetrics
};
