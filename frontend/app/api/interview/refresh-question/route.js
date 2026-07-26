import { getQuestionsForRole } from '@/lib/questionBanks';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { roleFocus = 'Software Engineer', currentQuestionId } = body;

    const questions = getQuestionsForRole(roleFocus);
    const available = questions.filter(q => q.id !== currentQuestionId);
    const selected = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : questions[0];

    const newQuestion = {
      ...selected,
      text: selected.question || selected.text,
      difficultyRating: selected.difficulty_rating || 1400
    };

    return Response.json({
      success: true,
      newQuestion
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js refresh question route error:', error);
    return Response.json({
      success: false,
      message: 'Failed to refresh question'
    }, { status: 500 });
  }
}
