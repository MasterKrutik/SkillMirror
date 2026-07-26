import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Analysis criteria for coding problems
const analysisCriteria = {
  correctness: 'Does the solution correctly solve the problem?',
  efficiency: 'What is the time and space complexity? Can it be optimized?',
  codeQuality: 'Is the code clean, readable, and well-structured?',
  bestPractices: 'Does it follow industry best practices and conventions?',
  edgeCases: 'Are edge cases and error handling considered?',
  comments: 'Is the code well-documented with helpful comments?'
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      code = '', 
      problemTitle = '', 
      problemDescription = '',
      language = 'javascript',
      difficulty = 'medium'
    } = body;

    if (!code || !problemTitle) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Code and problem title are required',
        score: 0,
        analysis: {
          correctness: 'Please provide code to analyze',
          efficiency: 'N/A',
          codeQuality: 'N/A',
          edgeCases: 'N/A'
        }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create a comprehensive analysis prompt
    const analysisPrompt = `You are an expert code reviewer and mentor for technical interviews. Your task is to analyze and provide constructive feedback on the submitted solution.

PROBLEM: "${problemTitle}"
DESCRIPTION: "${problemDescription || 'No additional description provided'}"
LANGUAGE: ${language}
DIFFICULTY: ${difficulty}

SUBMITTED CODE:
\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON):
{
  "score": <number 0-100>,
  "verdict": "<PASS|PARTIAL|NEEDS_WORK>",
  "summary": "<Brief 1-2 sentence summary>",
  "correctness": {
    "status": "<CORRECT|MOSTLY_CORRECT|INCORRECT>",
    "feedback": "<detailed feedback>",
    "issuesFound": [<list of specific issues if any>]
  },
  "efficiency": {
    "timeComplexity": "<e.g., O(n), O(n²)>",
    "spaceComplexity": "<e.g., O(1), O(n)>",
    "isOptimal": <boolean>,
    "suggestions": "<optimization suggestions if applicable>"
  },
  "codeQuality": {
    "readability": "<EXCELLENT|GOOD|FAIR|POOR>",
    "structure": "<well-organized|organized|could be better|disorganized>",
    "naming": "<clear variable/function names or suggestions>",
    "issues": [<list of specific code quality issues>]
  },
  "bestPractices": {
    "follows": [<list of best practices followed>],
    "missing": [<list of best practices not followed>],
    "suggestions": "<specific suggestions>"
  },
  "edgeCases": {
    "handled": [<edge cases properly handled>],
    "missing": [<edge cases not handled>],
    "recommendation": "<what should be added>"
  },
  "learningPoints": [
    "<important concept they should learn>",
    "<another important concept>"
  ],
  "improvements": [
    {
      "title": "<Improvement title>",
      "current": "<current code snippet>",
      "suggested": "<improved code snippet>",
      "explanation": "<why this is better>"
    }
  ],
  "nextSteps": [
    "<specific action to improve>",
    "<another action>"
  ],
  "encouragement": "<motivational message>"
}

IMPORTANT GUIDELINES:
1. Be constructive and encouraging - this is a learning opportunity
2. Identify what's done well first before pointing out issues
3. Provide specific code examples when suggesting improvements
4. Include practical tips they can use in interviews
5. Suggest resources or concepts to study further
6. Make it engaging and motivational
7. Ensure JSON is valid and can be parsed`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();

    // Try to extract JSON from the response
    let analysis;
    try {
      // Look for JSON pattern in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      analysis = {
        score: 50,
        verdict: 'NEEDS_WORK',
        summary: 'Analysis could not be fully parsed. Review feedback below.',
        rawFeedback: responseText,
        correctness: { status: 'UNKNOWN', feedback: responseText },
        efficiency: { timeComplexity: 'Unknown', spaceComplexity: 'Unknown' },
        codeQuality: { readability: 'FAIR' },
        bestPractices: { suggestions: 'See raw feedback above' },
        edgeCases: { missing: ['Please review code for edge cases'] },
        learningPoints: [],
        improvements: [],
        nextSteps: ['Review the analysis above carefully'],
        encouragement: 'Keep practicing! Every submission is a learning opportunity.'
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Code analysis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to analyze code',
      score: 0
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
