export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Forward to resume-analysis API for AI processing
    const analysisFormData = new FormData();
    analysisFormData.append('resume', file);

    // Call the resume-analysis API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const analysisResponse = await fetch(`${baseUrl}/api/resume-analysis`, {
      method: 'POST',
      body: analysisFormData
    });

    const analysisData = await analysisResponse.json();

    if (!analysisData.success) {
      throw new Error(analysisData.error || 'Analysis failed');
    }

    // Return the AI-analyzed data
    return Response.json(
      {
        fileName: analysisData.fileName,
        fileSize: analysisData.fileSize,
        atsScore: analysisData.atsScore || analysisData.score || 75,
        skills: analysisData.skills || [],
        summary: analysisData.summary || analysisData.detailedFeedback || 'Resume analyzed successfully',
        gaps: analysisData.gaps || [],
        suggestions: analysisData.suggestions || [],
        strengths: analysisData.strengths || [],
        score: analysisData.score || 75,
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload Resume Error:', error);

    return Response.json(
      {
        error: 'Failed to process resume',
        details: error.message,
        atsScore: 70,
        skills: ['Resume Processing'],
        summary: 'Error processing resume. Please try again.',
        gaps: ['Unable to analyze'],
        success: false
      },
      { status: 500 }
    );
  }
}
