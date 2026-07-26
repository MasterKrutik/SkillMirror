/**
 * SkillMirror Elo Adaptive Difficulty Algorithm
 */

function expectedScore(candidateRating, questionRating) {
  return 1 / (1 + Math.pow(10, (questionRating - candidateRating) / 400));
}

function updateRatings(candidateRating, questionRating, actualScoreRatio, k = 32) {
  const exp = expectedScore(candidateRating, questionRating);
  const delta = k * (actualScoreRatio - exp);
  const newCandidate = Math.round(candidateRating + delta);
  const newQuestion = Math.round(questionRating - delta);

  console.log(`[ELO MATH CALIBRATION] Candidate Rating: ${candidateRating} | Question Rating: ${questionRating} | Actual Score Ratio: ${actualScoreRatio.toFixed(2)} | Expected: ${exp.toFixed(2)} | Delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} -> New Candidate Rating: ${newCandidate}`);

  return { newCandidateRating: newCandidate, newQuestionRating: newQuestion };
}

module.exports = { expectedScore, updateRatings };
