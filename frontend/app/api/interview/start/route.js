import { getQuestionsForRole } from '@/lib/questionBanks';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      roleFocus = 'Software Engineer',
      questionsTotal = 5,
      evaluationStyle = 'Adaptive Elo + STAR + Follow-ups',
      previewedQuestion,
      targetGap
    } = body;

    const questions = getQuestionsForRole(roleFocus);

    let firstQuestion = previewedQuestion;
    if (!firstQuestion || !firstQuestion.question) {
      const q = questions[0] || {
        id: 'default-01',
        topic: 'system_design',
        difficulty_rating: 1300,
        question: 'How would you design a rate limiter for a high-throughput public REST API?',
        model_answer: 'A strong answer outlines Token Bucket or Sliding Window Counter algorithms using Redis cache.',
        key_points: ['Token bucket algorithm', 'Redis cache', 'HTTP 429 status']
      };
      firstQuestion = {
        ...q,
        text: q.question || q.text,
        difficultyRating: q.difficulty_rating || 1400
      };
    }

    if (targetGap && !previewedQuestion) {
      const probeText = `[Resume Diagnostic Gap Probe - ${targetGap}] ${firstQuestion.text || firstQuestion.question}`;
      firstQuestion.text = probeText;
      firstQuestion.question = probeText;
      firstQuestion.topic = 'resume_gap_probe';
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return Response.json({
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
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js interview start route error:', error);
    return Response.json({
      success: false,
      error: true,
      message: error.message || 'Failed to start interview session'
    }, { status: 500 });
  }
}
