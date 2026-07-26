import { GoogleGenerativeAI } from '@google/generative-ai';
import { getQuestionsForRole } from '@/lib/questionBanks';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

function classifyQuadrant(contentScore, deliveryConfidence) {
  if (contentScore >= 70 && deliveryConfidence >= 70) {
    return { name: 'Q1: High Technical / High Delivery', diagnosis: 'Polished engineering presentation with solid technical accuracy.' };
  } else if (contentScore >= 70) {
    return { name: 'Q2: High Technical / Low Delivery', diagnosis: 'Strong technical accuracy, but answer contained hesitation or passive phrasing.' };
  } else if (deliveryConfidence >= 70) {
    return { name: 'Q3: Low Technical / High Delivery', diagnosis: 'Confident delivery style, but response missed core technical key points.' };
  } else {
    return { name: 'Q4: Low Technical / Low Delivery', diagnosis: 'Needs work on both technical correctness and structured delivery.' };
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionId = 'sess_default',
      questionId = 1,
      questionText = '',
      answerText = '',
      responseTimeSeconds = 35,
      candidateElo = 1400,
      prevFatigueState = 0.0,
      roleFocus = 'Software Engineer',
      evaluationStyle = 'Adaptive Elo + STAR + Follow-ups'
    } = body;

    if (!answerText.trim()) {
      return Response.json({ message: 'Answer text is required' }, { status: 400 });
    }

    const questions = getQuestionsForRole(roleFocus);
    const qObj = questions.find(q => q.id === questionId || q.question === questionText) || questions[0];

    const modelAnswerText = qObj?.model_answer || 'A strong answer clearly addresses the core domain architecture, key technical trade-offs, step-by-step logic, and failure recovery.';

    let contentScore = 75;
    let specScore = 70;
    let ownScore = 70;
    let whatCovered = ['Core technical concept mentioned', 'Clear problem-solving approach'];
    let whatMissed = ['Specific quantitative impact metrics', 'Edge case error handling'];

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `You are a strict technical interviewer scoring a candidate answer for the role: ${roleFocus}.

Question asked: "${questionText || qObj.question}"
Candidate Answer: "${answerText}"

EXPECTED BENCHMARK MODEL ANSWER:
"${modelAnswerText}"

Evaluate candidate response for:
1. content_score (0-100): technical correctness & coverage vs model answer. (0 if gibberish or key mashing)
2. specificity_score (0-100): concrete names, metrics, named technical parameters used.
3. ownership_score (0-100): active first-person ownership language ("I architected", "I implemented").
4. what_covered: array of 2-3 key points covered.
5. what_missed: array of 2-3 key points missed.

Return ONLY valid JSON:
{
  "content_score": number,
  "specificity_score": number,
  "ownership_score": number,
  "what_covered": [string],
  "what_missed": [string]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (typeof parsed.content_score === 'number') contentScore = Math.min(100, Math.max(0, parsed.content_score));
      if (typeof parsed.specificity_score === 'number') specScore = Math.min(100, Math.max(0, parsed.specificity_score));
      if (typeof parsed.ownership_score === 'number') ownScore = Math.min(100, Math.max(0, parsed.ownership_score));
      if (Array.isArray(parsed.what_covered)) whatCovered = parsed.what_covered;
      if (Array.isArray(parsed.what_missed)) whatMissed = parsed.what_missed;
    } catch (llmErr) {
      console.warn('Gemini scoring fallback in submit-answer API route:', llmErr.message);
      const words = answerText.trim().split(/\s+/).length;
      contentScore = Math.min(92, Math.max(45, words * 3));
    }

    const deliveryConfidenceScore = Math.round((specScore * 0.5) + (ownScore * 0.5));
    const quadrant = classifyQuadrant(contentScore, deliveryConfidenceScore);

    // Simple Elo adjustment
    const scoreDiff = (contentScore - 60) * 0.3;
    const eloAfter = Math.round(candidateElo + scoreDiff);

    const fatigue = {
      fatigueState: Math.min(0.8, prevFatigueState + 0.05),
      label: prevFatigueState > 0.4 ? 'fatigued' : 'stable',
      hesitationScore: 0.1
    };

    const nextIndex = (typeof questionId === 'number' ? questionId : 1);
    const nextQuestionObj = questions[nextIndex % questions.length] || null;
    const nextQuestion = nextQuestionObj ? {
      ...nextQuestionObj,
      text: nextQuestionObj.question || nextQuestionObj.text,
      difficultyRating: nextQuestionObj.difficulty_rating || 1400
    } : null;

    return Response.json({
      success: true,
      answeredCount: 1,
      contentScore,
      deliveryConfidenceScore,
      quadrant,
      eloBefore: candidateElo,
      eloAfter,
      fatigue,
      modelAnswer: modelAnswerText,
      whatCovered,
      whatMissed,
      nextQuestion,
      agents: {
        domain: { content_score: contentScore, model_answer: modelAnswerText, what_covered: whatCovered, missing_points: whatMissed },
        behavioral: { specificity_score: specScore, ownership_score: ownScore },
        adversarial: { weak_point: 'Edge case validation', followup_question: 'How would your design handle sudden traffic spikes?' }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js submit-answer API error:', error);
    return Response.json({
      success: false,
      message: error.message || 'Failed to evaluate answer'
    }, { status: 500 });
  }
}
