import { getQuestionsForRole } from '@/lib/questionBanks';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { roleFocus = 'Software Engineer', questionsTotal = 5 } = body;

    const questions = getQuestionsForRole(roleFocus);
    const countToReturn = Math.min(2, questions.length);
    const previewQuestions = questions.slice(0, countToReturn).map(q => ({
      ...q,
      text: q.question || q.text,
      difficultyRating: q.difficulty_rating || 1400
    }));

    return Response.json({
      success: true,
      roleFocus,
      profile: {
        label: roleFocus,
        focusAreas: ['System Architecture', 'Core Logic', 'Best Practices'],
        defaultTopics: ['System Design', 'Algorithms']
      },
      previewQuestions
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js preview questions route error:', error);
    return Response.json({
      success: false,
      message: 'Failed to preview questions'
    }, { status: 500 });
  }
}
