/**
 * SkillMirror Fatigue / Latent State Tracker
 * Deterministic word-count based hesitation density calculation
 */

const FILLER_WORDS = [
  "um", "uh", "like", "i think", "maybe", "sort of", "kind of", "probably",
  "i guess", "basically", "you know", "actually", "honestly", "literally",
  "supposedly", "somewhat", "perhaps"
];

function calculateHesitationScore(text) {
  if (!text || typeof text !== 'string') return 0;
  const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
  if (words.length === 0) return 0;

  let fillerCount = 0;
  const lowerText = text.toLowerCase();
  FILLER_WORDS.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = (lowerText.match(regex) || []).length;
    fillerCount += matches;
  });

  const density = fillerCount / words.length;
  // Standardize 0.0 to 1.0 scale (density >= 0.08 represents high hesitation)
  return Math.min(1.0, parseFloat((density / 0.08).toFixed(2)));
}

function updateFatigueState(prevFatigue = 0, text, responseTimeSec = 30, expectedTimeSec = 45, wordCount = 100, avgWordCount = 120) {
  const hesitationScore = calculateHesitationScore(text);
  const latencyRatio = responseTimeSec / (expectedTimeSec || 1);
  const lengthRatio = wordCount / (avgWordCount || 1);

  // Instantaneous stress signal (-1 to +1)
  const stressSignal = (hesitationScore * 0.5) + (Math.max(0, latencyRatio - 1) * 0.3) - (Math.min(1, lengthRatio) * 0.2);

  // Exponential moving average with decay 0.6
  const newFatigue = Math.max(-1.0, Math.min(1.0, 0.6 * prevFatigue + 0.4 * stressSignal));

  let label = 'stable';
  if (newFatigue > 0.4) {
    label = 'elevated load';
  } else if (newFatigue < -0.3) {
    label = 'settled/recovering';
  }

  // Scaffolding adjustment: drop question difficulty by ~150 points if elevated load
  const difficultyAdjustment = newFatigue > 0.4 ? -150 : 0;

  return {
    fatigueState: parseFloat(newFatigue.toFixed(2)),
    hesitationScore: parseFloat(hesitationScore.toFixed(2)),
    label,
    difficultyAdjustment
  };
}

module.exports = { calculateHesitationScore, updateFatigueState, FILLER_WORDS };
