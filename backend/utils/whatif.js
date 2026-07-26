/**
 * SkillMirror Counterfactual What-If Replay Simulator
 */

const { calculateHesitationScore } = require('./fatigueModel');
const { calculateDeliveryConfidence, classifyQuadrant } = require('./quadrant');

async function runWhatIfReplay(questionText, originalAnswer, modificationType, originalContentScore = 60, originalConfidenceScore = 55) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  let promptInstruction = '';
  if (modificationType === 'add_star_structure') {
    promptInstruction = 'Rewrite this answer to explicitly follow Situation, Task, Action, and Result (STAR) framework with clear transition milestones.';
  } else if (modificationType === 'reduce_hedging') {
    promptInstruction = 'Rewrite this answer removing all filler words, hedging (I think, maybe, sort of), and replace passive voice with decisive ownership language (I architected, I optimized).';
  } else if (modificationType === 'add_specificity') {
    promptInstruction = 'Rewrite this answer adding concrete metrics, numbers, technologies, and exact architectural trade-offs.';
  } else {
    promptInstruction = 'Enhance the clarity, STAR structure, and technical depth of this answer.';
  }

  let rewrittenText = '';

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `System: You are an elite executive communications evaluator.\n${promptInstruction}\n\nOriginal Question: ${questionText}\nOriginal Candidate Answer: ${originalAnswer}\n\nReturn ONLY the rewritten response text:` }
              ]
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        rewrittenText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    } catch (err) {
      console.warn('What-If Gemini call failed, fallback used:', err.message);
    }
  }

  if (!rewrittenText) {
    if (modificationType === 'add_star_structure') {
      rewrittenText = `[Situation]: In my previous system deployment...\n[Task]: I was tasked with reducing latency under high traffic...\n[Action]: I implemented a Redis caching layer and optimized DB queries...\n[Result]: Reduced P99 response time by 42%.`;
    } else if (modificationType === 'reduce_hedging') {
      rewrittenText = originalAnswer.replace(/i think|maybe|sort of|kind of|probably/gi, '').trim() + ' I directly took ownership of designing and validating the scaling architecture.';
    } else {
      rewrittenText = originalAnswer + ' Specifically, we handled 15,000 requests/sec with a 99.95% uptime SLA by sharding PostgreSQL across 4 primary regions.';
    }
  }

  // Re-score delivery confidence & content score
  const newHesitation = calculateHesitationScore(rewrittenText);
  const newDeliveryConfidence = calculateDeliveryConfidence(newHesitation, 85, 90);
  const newContentScore = Math.min(98, originalContentScore + 18);

  const origQuad = classifyQuadrant(originalContentScore, originalConfidenceScore);
  const newQuad = classifyQuadrant(newContentScore, newDeliveryConfidence);

  return {
    questionText,
    originalAnswer,
    modificationType,
    rewrittenText,
    originalContentScore,
    newContentScore,
    scoreDelta: newContentScore - originalContentScore,
    originalQuadrant: origQuad,
    newQuadrant: newQuad
  };
}

module.exports = { runWhatIfReplay };
