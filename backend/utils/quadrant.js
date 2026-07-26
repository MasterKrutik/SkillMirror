/**
 * SkillMirror 2x2 Confidence-Competence Quadrant Classifier
 */

function calculateDeliveryConfidence(hesitationScore = 0, specificityScore = 50, ownershipScore = 50) {
  const normHesitation = Math.max(0, Math.min(1, hesitationScore));
  const normSpec = Math.max(0, Math.min(100, specificityScore)) / 100;
  const normOwn = Math.max(0, Math.min(100, ownershipScore)) / 100;

  // Formula: 40% non-hesitation + 30% specificity + 30% first-person ownership
  const score = 100 * (0.40 * (1 - normHesitation) + 0.30 * normSpec + 0.30 * normOwn);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function classifyQuadrant(contentScore = 50, deliveryConfidenceScore = 50) {
  const isHighContent = contentScore >= 50;
  const isHighDelivery = deliveryConfidenceScore >= 50;

  if (isHighContent && isHighDelivery) {
    return {
      id: 'interview_ready',
      name: 'Interview-Ready',
      accent: 'sage',
      colorHex: '#8BA888',
      diagnosis: 'Strong technical mastery paired with structured, confident execution.'
    };
  } else if (isHighContent && !isHighDelivery) {
    return {
      id: 'articulation_gap',
      name: 'Articulation Gap',
      accent: 'amber',
      colorHex: '#D9A441',
      diagnosis: 'Deep subject knowledge, but delivery lacks STAR structure or hedging obscures confidence.'
    };
  } else if (!isHighContent && isHighDelivery) {
    return {
      id: 'false_confidence',
      name: 'False-Confidence Risk',
      accent: 'rose',
      colorHex: '#C97B84',
      diagnosis: 'Polished delivery and high ownership, but missing essential technical points.'
    };
  } else {
    return {
      id: 'foundational_gap',
      name: 'Foundational Gap',
      accent: 'plum',
      colorHex: '#6B5876',
      diagnosis: 'Requires strengthening fundamental concepts and structured delivery practice.'
    };
  }
}

module.exports = {
  calculateDeliveryConfidence,
  classifyQuadrant
};
