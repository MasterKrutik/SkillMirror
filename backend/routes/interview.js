const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { dbRun, dbGet, dbAll } = require('../utils/database');

const { scoreAnswerMultiAgent, isGibberishOrNoise } = require('./interview-panel');
const { updateRatings } = require('../utils/elo');
const { updateFatigueState } = require('../utils/fatigueModel');
const { updateTopicDistribution, getTopicMetrics } = require('../utils/skillModel');
const { calculateDeliveryConfidence, classifyQuadrant } = require('../utils/quadrant');
const { generateAttributionWaterfall } = require('../utils/attribution');
const { buildSessionMemoryGraph } = require('../utils/memoryGraph');
const { getCandidatePercentiles } = require('../utils/calibration');
const { runWhatIfReplay } = require('../utils/whatif');
const { seedDemoSession } = require('../utils/seedDemoSession');
const { getRoleProfile } = require('../utils/roleProfiles');

const router = express.Router();

// Auth Middleware with Guest Fallback
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    req.userId = 9999;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillmirror_super_secret_jwt_key_2026');
    req.userId = decoded.id;
    next();
  } catch (error) {
    req.userId = 9999;
    next();
  }
};

/**
 * Zero-Repeat Question Selection Logic:
 * Filters out all question IDs / texts already used in the current session./**
 * SkillMirror Adaptive Elo Question Selector
 * Shuffles tied/close candidate questions and deprioritizes user's last ~10 answered questions across sessions.
 */
async function selectNextQuestion(sessionId, roleFocus, candidateElo = 1400, userId = null) {
  const profile = getRoleProfile(roleFocus);
  const questions = profile.questionBank || [];

  // 1. Get answered questions within current session
  const sessionAnsweredRows = await dbAll(
    db,
    `SELECT question_id, question_text FROM interview_answers WHERE session_id = ?`,
    [sessionId]
  );
  const sessionUsedIds = new Set(sessionAnsweredRows.map(r => r.question_id));
  const sessionUsedTexts = new Set(sessionAnsweredRows.map(r => (r.question_text || '').toLowerCase().trim()));

  // 2. Get recently shown questions for this user across previous sessions (last ~10)
  let userRecentIds = new Set();
  if (userId) {
    const recentAnswerRows = await dbAll(
      db,
      `SELECT DISTINCT question_id FROM interview_answers 
       WHERE session_id IN (SELECT id FROM interview_sessions WHERE user_id = ?) 
       ORDER BY id DESC LIMIT 10`,
      [userId]
    );
    recentAnswerRows.forEach(r => { if (r.question_id) userRecentIds.add(r.question_id); });
  }

  // Filter out questions already used in current session
  let unused = questions.filter(q => !sessionUsedIds.has(q.id) && !sessionUsedTexts.has((q.text || q.question || '').toLowerCase().trim()));
  if (unused.length === 0) {
    unused = questions;
  }

  // Prefer unused questions that haven't been shown to this user recently
  const nonRecentUnused = unused.filter(q => !userRecentIds.has(q.id));
  const candidatePool = nonRecentUnused.length > 0 ? nonRecentUnused : unused;

  // Filter pool for questions within ±150 of candidate Elo
  let closeCandidates = candidatePool.filter(q => {
    const r = q.difficulty_rating || q.difficultyRating || 1400;
    return Math.abs(r - candidateElo) <= 150;
  });

  if (closeCandidates.length === 0) {
    closeCandidates = candidatePool;
  }

  // Fisher-Yates shuffle close candidates to guarantee random rotation
  const shuffled = [...closeCandidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled[0] || questions[0];
  const qText = selected?.question || selected?.text || '';
  const qDiff = selected?.difficulty_rating || selected?.difficultyRating || 1400;

  return {
    ...selected,
    text: qText,
    question: qText,
    difficultyRating: qDiff,
    difficulty_rating: qDiff
  };
}

/**
 * Generate 1-2 sentence per-question delivery notes based on real telemetry scores.
 */
function generateDeliveryNotes(hesitationScore = 0, specificityScore = 50, ownershipScore = 50, answerText = '') {
  const notes = [];

  const fillerMatch = (answerText || '').match(/\b(um|uh|like|sort of|kind of|i think|maybe|probably|i guess|basically|you know|actually|honestly|literally)\b/gi) || [];
  if (fillerMatch.length > 0) {
    const uniqueFillers = Array.from(new Set(fillerMatch.map(w => `'${w.toLowerCase()}'`)));
    notes.push(`Your answer included ${fillerMatch.length} hedge phrase${fillerMatch.length > 1 ? 's' : ''} (${uniqueFillers.slice(0, 3).join(', ')}) which reduced confidence scoring.`);
  } else if (hesitationScore > 0.3) {
    notes.push(`Hesitation markers and pauses reduced your delivery fluidness score.`);
  } else {
    notes.push(`Delivered with clear, unhedged communication tone.`);
  }

  if (specificityScore < 35) {
    notes.push(`Your response lacked concrete technical details, metrics, or named architecture parameters.`);
  } else if (specificityScore >= 75) {
    notes.push(`Strong technical specificity with explicit parameters and architectural details.`);
  }

  if (ownershipScore < 35) {
    notes.push(`Framing was passive ('it was done') rather than active first-person ownership.`);
  } else if (ownershipScore >= 75) {
    notes.push(`Exemplary active ownership ('I architected', 'I implemented') demonstrating engineering leadership.`);
  }

  return notes.join(' ') || 'Delivery was balanced and structured.';
}

/**
 * Dynamic Structured Executive AI Evaluation Synthesis Generator
 */
async function generateExecutiveSynthesis(roleFocus, avgContent, avgDelivery, finalElo, percentiles, finalQuadrant, trajectory, answers = []) {
  const qCount = answers.length || trajectory.length || 1;
  const lowestQ = answers.length > 0 ? [...answers].sort((a, b) => a.content_score - b.content_score)[0] : null;
  const highestQ = answers.length > 0 ? [...answers].sort((a, b) => b.content_score - a.content_score)[0] : null;

  const fallback = {
    overall_assessment: `Candidate completed ${qCount} questions in ${roleFocus} (Content Score: ${avgContent}%, Delivery Confidence: ${avgDelivery}%, Final Elo: ${finalElo}). Overall classified as ${finalQuadrant.name}.`,
    biggest_strength: highestQ
      ? `Demonstrated clear technical domain understanding on "${highestQ.question_text?.slice(0, 50)}..." (Content Score: ${highestQ.content_score}%).`
      : `Demonstrated solid technical grounding across the evaluation session.`,
    improvement_area: lowestQ
      ? `Needs greater specificity and reduced hedging on weaker topics like "${lowestQ.question_text?.slice(0, 50)}..." (Content Score: ${lowestQ.content_score}%).`
      : `Needs to reduce hesitation markers and add concrete metrics to technical responses.`,
    next_step: `Practice target focus sessions in ${roleFocus} to strengthen identified weak topics and build confident delivery.`
  };

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const transcriptSummary = answers.map((ans, i) => `
Question ${i+1}: ${ans.question_text}
Candidate Answer: "${ans.answer_text}"
Content Score: ${ans.content_score}%, Delivery Confidence: ${ans.delivery_confidence_score}%, Quadrant: ${ans.quadrant}
Model Answer Reference: "${ans.model_answer}"
`).join('\n');

  const systemPrompt = `You are an expert technical interview coach. Given this complete interview session transcript and multi-agent scoring data for a candidate applying for ${roleFocus}, write a deeply personalized evaluation.

TRANSCRIPT & SCORES:
${transcriptSummary}

SUMMARY METRICS:
- Role Focus: ${roleFocus}
- Average Content Score: ${avgContent}%
- Average Delivery Confidence: ${avgDelivery}%
- Final Elo: ${finalElo} (Percentile: ${percentiles.eloPercentile}%)
- Final Quadrant: ${finalQuadrant.name}

You must write:
(1) overall_assessment: a 2-sentence summary referencing SPECIFIC topics and scores from this session.
(2) biggest_strength: single biggest strength with a CONCRETE example quoting or referencing an actual answer from this session.
(3) improvement_area: single biggest growth edge with a CONCRETE example quoting or referencing an actual answer from this session.
(4) next_step: one specific, highly actionable next step recommendation (e.g., "Practice System Design rate limiting and caching").

Return ONLY valid JSON matching this schema with NO markdown code fences:
{
  "overall_assessment": string,
  "biggest_strength": string,
  "improvement_area": string,
  "next_step": string
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
    });
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const target = (parsed.overall_assessment && typeof parsed.overall_assessment === 'object') ? parsed.overall_assessment : parsed;
      if (target.overall_assessment && target.biggest_strength && target.improvement_area && target.next_step) {
        return {
          overall_assessment: typeof target.overall_assessment === 'object' ? JSON.stringify(target.overall_assessment) : String(target.overall_assessment),
          biggest_strength: typeof target.biggest_strength === 'object' ? JSON.stringify(target.biggest_strength) : String(target.biggest_strength),
          improvement_area: typeof target.improvement_area === 'object' ? JSON.stringify(target.improvement_area) : String(target.improvement_area),
          next_step: typeof target.next_step === 'object' ? JSON.stringify(target.next_step) : String(target.next_step)
        };
      }
    }
  } catch (err) {
    console.warn('Structured Executive synthesis LLM call failed, using fallback:', err.message);
  }

  return fallback;
}

// Preview Questions Endpoint
router.post('/preview-questions', async (req, res) => {
  try {
    const { roleFocus = 'Software Engineer', questionsTotal = 5 } = req.body || {};
    const profile = getRoleProfile(roleFocus);
    const questions = profile.questionBank || [];
    const countToReturn = Math.min(2, questions.length);
    const rawPreview = questions.slice(0, countToReturn);

    const previewQuestions = rawPreview.map(q => {
      const qText = q.question || q.text || '';
      const qDiff = q.difficulty_rating || q.difficultyRating || 1400;
      return { ...q, text: qText, question: qText, difficultyRating: qDiff, difficulty_rating: qDiff };
    });

    res.json({
      success: true,
      roleFocus,
      profile: {
        label: profile.label,
        focusAreas: profile.focusAreas,
        defaultTopics: profile.defaultTopics
      },
      previewQuestions
    });
  } catch (error) {
    console.error('Error previewing questions:', error);
    res.status(500).json({ message: 'Failed to preview questions' });
  }
});

// In-Session Question Refresh Endpoint
router.post('/refresh-question', verifyToken, async (req, res) => {
  try {
    const { sessionId, currentQuestionId, roleFocus = 'Software Engineer' } = req.body || {};
    const newQuestion = await selectNextQuestion(sessionId, roleFocus, 1400, req.userId);

    res.json({
      success: true,
      newQuestion
    });
  } catch (error) {
    console.error('Error refreshing question:', error);
    res.status(500).json({ message: 'Failed to refresh question' });
  }
});

// 1. Start Session
router.post('/start', verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: true, code: 'UNAUTHORIZED', message: 'User authorization required to start a session' });
    }

    const { roleFocus = 'Software Engineer', questionsTotal = 5, evaluationStyle = 'Adaptive Technical & Behavioral', previewedQuestion, targetGap } = req.body || {};

    const result = await dbRun(
      db,
      `INSERT INTO interview_sessions (user_id, role_focus, questions_total) VALUES (?, ?, ?)`,
      [req.userId, roleFocus, questionsTotal]
    );

    const sessionId = result.lastID;
    
    // Dynamically select rotated initial question using Elo proximity and user history deprioritization
    let firstQuestion = previewedQuestion;
    if (!firstQuestion) {
      firstQuestion = await selectNextQuestion(sessionId, roleFocus, 1400, req.userId);
    } else {
      const qText = firstQuestion.question || firstQuestion.text || '';
      const qDiff = firstQuestion.difficulty_rating || firstQuestion.difficultyRating || 1400;
      firstQuestion = { ...firstQuestion, text: qText, question: qText, difficultyRating: qDiff, difficulty_rating: qDiff };
    }

    if (targetGap && !previewedQuestion) {
      const probeText = `[Resume Diagnostic Gap Probe - ${targetGap}] ${firstQuestion.text}`;
      firstQuestion.text = probeText;
      firstQuestion.question = probeText;
      firstQuestion.topic = 'resume_gap_probe';
    }

    res.status(201).json({
      success: true,
      sessionId,
      roleFocus,
      questionsTotal,
      evaluationStyle,
      currentQuestionIndex: 1,
      question: firstQuestion,
      candidateElo: 1400,
      fatigueState: 0.0,
      fatigueLabel: 'stable'
    });
  } catch (error) {
    console.error('[BACKEND ERROR] Failed to start interview session:', error);
    res.status(500).json({ error: true, code: 'SESSION_INIT_FAILED', message: error.message || 'Failed to start interview session' });
  }
});

// 2. Submit Answer & Multi-Agent Telemetry
router.post('/submit-answer', verifyToken, async (req, res) => {
  try {
    const {
      sessionId,
      questionId,
      questionText,
      answerText,
      responseTimeSeconds = 35,
      candidateElo = 1400,
      prevFatigueState = 0.0,
      roleFocus = 'Software Engineer',
      evaluationStyle = 'Adaptive Elo + STAR + Follow-ups'
    } = req.body;

    if (!sessionId || !answerText) {
      return res.status(400).json({ message: 'Session ID and answer text required' });
    }

    // Retrieve question object from profile if available
    const profile = getRoleProfile(roleFocus);
    const currentQuestionObj = (profile.questionBank || []).find(q => q.id === questionId || q.question === questionText) || null;

    // 1. Run Parallel Multi-Agent Scoring Panel with Curated Rubric
    const scoringResult = await scoreAnswerMultiAgent(questionText, answerText, roleFocus, currentQuestionObj);
    
    const rawContentScore = scoringResult.domain.content_score ?? 0;
    const specScore = scoringResult.behavioral.specificity_score ?? 0;
    const ownScore = scoringResult.behavioral.ownership_score ?? 0;

    let contentScore = rawContentScore;

    // Section 4: Evaluation Style Weighting Formulas
    if (evaluationStyle.includes('Technical Depth Focus')) {
      contentScore = Math.round((0.85 * rawContentScore) + (0.075 * specScore) + (0.075 * ownScore));
    } else if (evaluationStyle.includes('Behavioral/STAR Focus')) {
      contentScore = Math.round((0.50 * rawContentScore) + (0.30 * specScore) + (0.20 * ownScore));
    } else {
      // Default (Adaptive Elo + STAR + Follow-ups & Adversarial Follow-up Focus): 70% content + 15% specificity + 15% ownership
      contentScore = Math.round((0.70 * rawContentScore) + (0.15 * specScore) + (0.15 * ownScore));
    }

    contentScore = Math.min(100, Math.max(0, contentScore));

    // 2. Compute Hesitation & Delivery Confidence
    let fatigue = updateFatigueState(prevFatigueState, answerText, responseTimeSeconds, 45);
    
    if (evaluationStyle.includes('Rapid-Fire Stress Test')) {
      fatigue.fatigueState = Math.min(1.0, parseFloat((fatigue.fatigueState * 2.2).toFixed(2)));
      if (fatigue.fatigueState > 0.4) fatigue.label = 'fatigued';
      else if (fatigue.fatigueState > 0.2) fatigue.label = 'strained';
    }

    let deliveryConfidenceScore = calculateDeliveryConfidence(
      fatigue.hesitationScore,
      scoringResult.behavioral.specificity_score,
      scoringResult.behavioral.ownership_score
    );

    if (isGibberishOrNoise(answerText)) {
      deliveryConfidenceScore = 0;
    } else if (evaluationStyle.includes('Behavioral/STAR Focus')) {
      deliveryConfidenceScore = Math.min(100, Math.round(deliveryConfidenceScore * 1.15));
    }

    // 3. Classify 2x2 Quadrant
    const quadrant = classifyQuadrant(contentScore, deliveryConfidenceScore);

    // 4. Update Elo Rating (Authentic Elo K=32 calibration)
    const questionRating = currentQuestionObj?.difficulty_rating || 1400;
    const { newCandidateRating } = updateRatings(candidateElo, questionRating, contentScore / 100);

    // Model Answer, Coverage Arrays & Delivery Notes
    const modelAnswerText = scoringResult.domain.model_answer || currentQuestionObj?.model_answer || '';
    const whatCovered = scoringResult.domain.what_covered || [];
    const whatMissed = scoringResult.domain.missing_points || [];
    const deliveryNotesText = generateDeliveryNotes(fatigue.hesitationScore, specScore, ownScore, answerText);

    // 5. Store Answer in Database
    await dbRun(
      db,
      `INSERT INTO interview_answers 
      (session_id, question_id, question_text, answer_text, content_score, delivery_confidence_score, quadrant, elo_before, elo_after, fatigue_state, response_time_seconds, model_answer, what_covered, what_missed, specificity_score, ownership_score, delivery_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        questionId || 1,
        questionText,
        answerText,
        contentScore,
        deliveryConfidenceScore,
        quadrant.name,
        candidateElo,
        newCandidateRating,
        fatigue.fatigueState,
        responseTimeSeconds,
        modelAnswerText,
        JSON.stringify(whatCovered),
        JSON.stringify(whatMissed),
        specScore,
        ownScore,
        deliveryNotesText
      ]
    );

    // 6. Zero-Repeat Next Question Selection
    const currentAnsCount = await dbGet(db, `SELECT COUNT(*) as count FROM interview_answers WHERE session_id = ?`, [sessionId]);
    const answeredCount = currentAnsCount?.count || 1;
    const session = await dbGet(db, `SELECT questions_total FROM interview_sessions WHERE id = ?`, [sessionId]);
    const totalQuestions = session?.questions_total || 5;

    let nextQuestion = null;
    if (answeredCount < totalQuestions) {
      nextQuestion = await selectNextQuestion(sessionId, roleFocus, newCandidateRating, req.userId);
    }

    res.json({
      success: true,
      answeredCount,
      contentScore,
      deliveryConfidenceScore,
      quadrant,
      eloBefore: candidateElo,
      eloAfter: newCandidateRating,
      fatigue,
      agents: scoringResult,
      modelAnswer: modelAnswerText,
      whatCovered,
      whatMissed,
      nextQuestion
    });
  } catch (error) {
    console.error('Error processing answer telemetry:', error);
    res.status(500).json({ message: error.message || 'Failed to process answer telemetry' });
  }
});

// 3. Fetch Full Session Report Dashboard
router.get('/report/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await dbGet(db, `SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?`, [sessionId, req.userId]);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const answers = await dbAll(
      db,
      `SELECT * FROM interview_answers WHERE session_id = ? ORDER BY id ASC`,
      [sessionId]
    );

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: 'No answer telemetry found for session' });
    }

    // Trajectory data
    const trajectory = answers.map((ans, idx) => ({
      questionIndex: idx + 1,
      questionText: ans.question_text,
      contentScore: ans.content_score,
      deliveryConfidenceScore: ans.delivery_confidence_score,
      eloRating: ans.elo_after,
      fatigueState: ans.fatigue_state,
      quadrant: ans.quadrant
    }));

    // Calculate averages & overall metrics
    const avgContent = Math.round(answers.reduce((acc, a) => acc + a.content_score, 0) / answers.length);
    const avgDelivery = Math.round(answers.reduce((acc, a) => acc + a.delivery_confidence_score, 0) / answers.length);
    const finalElo = answers[answers.length - 1].elo_after;
    const finalQuadrant = classifyQuadrant(avgContent, avgDelivery);

    // Topic Skill Distributions
    let topicDist = { alpha: 2, beta: 2 };
    answers.forEach(a => {
      topicDist = updateTopicDistribution(topicDist, a.content_score);
    });
    const betaMetrics = getTopicMetrics(topicDist);

    // Helper to resolve topic ID for each answer
    function resolveTopicId(ans, roleFocus) {
      if (ans.topic) return ans.topic;
      const profile = getRoleProfile(roleFocus);
      const qObj = profile?.questionBank?.find(q => q.id === ans.question_id || q.text === ans.question_text);
      if (qObj?.topic) return qObj.topic;

      const text = (ans.question_text || '').toLowerCase();
      if (text.includes('dns') || text.includes('http') || text.includes('tcp') || text.includes('socket') || text.includes('network')) return 'networking';
      if (text.includes('database') || text.includes('sql') || text.includes('acid') || text.includes('index') || text.includes('btree')) return 'databases';
      if (text.includes('rate limit') || text.includes('design') || text.includes('scale') || text.includes('microservice')) return 'system_design';
      if (text.includes('trie') || text.includes('tree') || text.includes('stack') || text.includes('queue') || text.includes('array')) return 'data_structures';
      if (text.includes('sort') || text.includes('binary search') || text.includes('algorithm') || text.includes('dp')) return 'algorithms';
      if (text.includes('star') || text.includes('conflict') || text.includes('team') || text.includes('leadership')) return 'behavioral';
      return 'core_concepts';
    }

    // Build real session topic skills
    const sessionTopicMap = {};
    answers.forEach(a => {
      const tId = resolveTopicId(a, session.role_focus);
      if (!sessionTopicMap[tId]) {
        sessionTopicMap[tId] = { scores: [], deliveryScores: [] };
      }
      sessionTopicMap[tId].scores.push(a.content_score);
      sessionTopicMap[tId].deliveryScores.push(a.delivery_confidence_score);
    });

    const topicSkills = Object.keys(sessionTopicMap).map(top => {
      const avg = Math.round(sessionTopicMap[top].scores.reduce((acc, s) => acc + s, 0) / sessionTopicMap[top].scores.length);
      return {
        topic: top.replace(/_/g, ' ').toUpperCase(),
        mean: avg,
        ciLow: Math.max(0, avg - 12),
        ciHigh: Math.min(100, avg + 10)
      };
    });

    // Attribution Waterfall for lowest scoring answer
    const lowestAns = [...answers].sort((a, b) => a.content_score - b.content_score)[0];
    const specScore = lowestAns.specificity_score != null ? lowestAns.specificity_score : 50;
    const ownScore = lowestAns.ownership_score != null ? lowestAns.ownership_score : 50;
    const hesitationScore = lowestAns.fatigue_state || 0;

    const attribution = generateAttributionWaterfall(lowestAns.content_score, specScore, ownScore, hesitationScore);
    attribution.questionText = lowestAns.question_text;

    // Percentile benchmarks
    const percentiles = getCandidatePercentiles(session.role_focus, avgContent, avgDelivery);

    // Topic Memory Graph
    const memoryGraph = buildSessionMemoryGraph(sessionTopicMap);

    // Dynamic Executive AI Evaluation Synthesis
    const coachingSummary = await generateExecutiveSynthesis(
      session.role_focus,
      avgContent,
      avgDelivery,
      finalElo,
      percentiles,
      finalQuadrant,
      trajectory,
      answers
    );

    // Format rawAnswers array to include resolved topic and parsed JSON arrays
    const formattedAnswers = answers.map(a => {
      let parsedCovered = [];
      let parsedMissed = [];
      try { parsedCovered = typeof a.what_covered === 'string' ? JSON.parse(a.what_covered) : (a.what_covered || []); } catch (e) { parsedCovered = []; }
      try { parsedMissed = typeof a.what_missed === 'string' ? JSON.parse(a.what_missed) : (a.what_missed || []); } catch (e) { parsedMissed = []; }

      const topicId = resolveTopicId(a, session.role_focus);
      const deliveryNotes = a.delivery_notes || generateDeliveryNotes(a.fatigue_state || 0, a.specificity_score || 50, a.ownership_score || 50, a.answer_text);

      return {
        ...a,
        topic: topicId,
        topicLabel: topicId.replace(/_/g, ' ').toUpperCase(),
        what_covered: parsedCovered,
        what_missed: parsedMissed,
        delivery_notes: deliveryNotes
      };
    });

    res.json({
      session,
      summary: {
        avgContentScore: avgContent,
        avgDeliveryConfidenceScore: avgDelivery,
        finalElo,
        finalQuadrant,
        percentiles
      },
      trajectory,
      topicSkills,
      attribution,
      memoryGraph,
      coachingSummary,
      rawAnswers: formattedAnswers
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// 4. Counterfactual What-If Replay Simulator
router.post('/what-if', verifyToken, async (req, res) => {
  try {
    const {
      questionText,
      originalAnswer,
      modificationType = 'add_star_structure',
      originalContentScore = 60,
      originalConfidenceScore = 55
    } = req.body;

    if (!originalAnswer) {
      return res.status(400).json({ message: 'Original answer text required' });
    }

    const replayResult = await runWhatIfReplay(
      questionText || 'Describe a complex technical problem you solved.',
      originalAnswer,
      modificationType,
      originalContentScore,
      originalConfidenceScore
    );

    res.json(replayResult);
  } catch (error) {
    console.error('Error running What-If replay:', error);
    res.status(500).json({ message: 'Failed to execute What-If simulation' });
  }
});

// 5. Fetch Candidate Dashboard Sessions Summary
router.get('/user-sessions', verifyToken, async (req, res) => {
  try {
    let sessions = await dbAll(
      db,
      `SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC`,
      [req.userId]
    );

    const sessionsCompleted = sessions ? sessions.length : 0;

    // Fetch all answers for these sessions to aggregate topicSkills and eloHistory
    let answers = [];
    if (sessionsCompleted > 0) {
      const sessionIds = sessions.map(s => s.id);
      const placeholders = sessionIds.map(() => '?').join(',');
      answers = await dbAll(
        db,
        `SELECT * FROM interview_answers WHERE session_id IN (${placeholders}) ORDER BY created_at ASC`,
        sessionIds
      );
    }

    // Build Elo History
    let currentElo = 1400;
    const eloHistory = [];
    answers.forEach(a => {
      if (a.elo_after) {
        currentElo = a.elo_after;
        eloHistory.push({
          date: a.created_at ? a.created_at.slice(0, 10) : 'Recent',
          elo: a.elo_after
        });
      }
    });

    if (eloHistory.length === 0 && sessionsCompleted > 0) {
      eloHistory.push({ date: 'Initial', elo: 1400 });
    }

    // Aggregate topicSkills from answers
    const topicMap = {};
    answers.forEach(a => {
      const qText = (a.question_text || '').toLowerCase();
      let topic = 'General';
      if (qText.includes('lru') || qText.includes('tree') || qText.includes('array') || qText.includes('list') || qText.includes('algorithm') || qText.includes('complexity')) {
        topic = 'Algorithms';
      } else if (qText.includes('redis') || qText.includes('sql') || qText.includes('database') || qText.includes('acid') || qText.includes('index')) {
        topic = 'Databases';
      } else if (qText.includes('rate limit') || qText.includes('system') || qText.includes('microservice') || qText.includes('architecture') || qText.includes('load balan')) {
        topic = 'System Design';
      } else if (qText.includes('disagreement') || qText.includes('team') || qText.includes('conflict') || qText.includes('star') || qText.includes('behavioral')) {
        topic = 'Behavioral';
      }

      if (!topicMap[topic]) {
        topicMap[topic] = {
          topic,
          correctCount: 0,
          totalCount: 0,
          totalContentScore: 0,
          totalConfidenceScore: 0,
          lastAttemptedAt: a.created_at || null
        };
      }

      topicMap[topic].totalCount += 1;
      const cScore = a.content_score || 50;
      const dScore = a.delivery_confidence_score || cScore;
      if (cScore >= 70) topicMap[topic].correctCount += 1;
      topicMap[topic].totalContentScore += cScore;
      topicMap[topic].totalConfidenceScore += dScore;
      topicMap[topic].lastAttemptedAt = a.created_at || topicMap[topic].lastAttemptedAt;
    });

    const topicSkills = Object.values(topicMap).map(t => {
      const mean = Math.round(t.totalContentScore / t.totalCount);
      const avgConfidenceScore = Math.round(t.totalConfidenceScore / t.totalCount);
      return {
        topic: t.topic,
        correctCount: t.correctCount,
        totalCount: t.totalCount,
        avgConfidenceScore,
        mean,
        score: mean,
        ciLow: Math.max(0, mean - 8),
        ciHigh: Math.min(100, mean + 8),
        lastAttemptedAt: t.lastAttemptedAt
      };
    });

    // Format recentSessions
    const recentSessions = sessions.slice(0, 5).map(s => ({
      id: s.id,
      roleFocus: s.role_focus,
      date: s.created_at ? s.created_at.slice(0, 10) : 'Recent',
      questionsTotal: s.questions_total || 5,
      isDemo: Boolean(s.is_demo)
    }));

    // Tool usage stats
    const toolUsageStats = {
      resumeOnFile: true,
      milestonesCompleted: '1 of 3',
      snippetsExplained: 4,
      conceptsSimplified: 3,
      communityDiscussions: 8
    };

    console.log(`[backend/routes/interview.js] CHANGED — /user-sessions returning sessionsCompleted=${sessionsCompleted}, latestElo=${currentElo}, topicSkillsCount=${topicSkills.length}`);

    res.json({
      success: true,
      sessionsCompleted,
      latestElo: currentElo,
      eloHistory,
      topicSkills,
      recentSessions,
      toolUsageStats,
      sessions
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Failed to fetch user sessions' });
  }
});

module.exports = router;
