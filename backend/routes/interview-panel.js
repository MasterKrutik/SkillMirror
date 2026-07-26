/**
 * SkillMirror Multi-Agent Parallel Scoring Panel
 * Fully calibrated with lightweight dictionary pre-filtering, curated key_points rubric grading,
 * strict 0-5 score tiering for gibberish, and zero static fallbacks.
 */

const MODEL_FALLBACK_CHAIN = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash-lite'
];

// Top 200 common English words dictionary set for fast pre-filter verification
const COMMON_ENGLISH_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'data', 'code', 'system',
  'using', 'user', 'service', 'database', 'table', 'query', 'api', 'server', 'request', 'response',
  'cache', 'index', 'function', 'class', 'method', 'key', 'value', 'type', 'process', 'memory',
  'design', 'build', 'create', 'update', 'delete', 'store', 'stream', 'queue', 'network', 'thread'
]);

/**
 * Robust heuristic pre-filter for gibberish, random key mashing, non-words, or noise.
 * Examples: "u3egdwdgwhshhjwdgwdhgxdhyg3ywdhdgqjhsgjhdghqjdqjghgjwdqjqgjqdjqdjhqwdgjqhdjwdgqwdhqgdjwg", "asdfghjkl"
 */
function isGibberishOrNoise(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 5) return true;

  // Split into tokens (alphanumeric words)
  const tokens = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  // Single word > 12 chars with no spaces
  if (tokens.length === 1 && trimmed.length > 12) {
    // Check if token matches common technical terms or dictionary words
    const isKnownWord = COMMON_ENGLISH_WORDS.has(tokens[0]);
    if (!isKnownWord) {
      const vowels = (tokens[0].match(/[aeiouy]/g) || []).length;
      if (vowels / tokens[0].length < 0.20) return true; // Low vowel ratio (e.g. wgdydhdsgh)
    }
  }

  // Count valid English / tech words in tokens
  let validWordCount = 0;
  for (const token of tokens) {
    if (COMMON_ENGLISH_WORDS.has(token) || token.length <= 3) {
      validWordCount++;
    } else {
      // Check vowel ratio of individual token
      const vowels = (token.match(/[aeiouy]/g) || []).length;
      if (vowels > 0 && vowels / token.length >= 0.20) {
        validWordCount++;
      }
    }
  }

  // If less than 35% of tokens are valid recognizable words, flag as gibberish
  const validRatio = validWordCount / tokens.length;
  if (validRatio < 0.35) return true;

  // Check for repeated character mashing like "aaaaa" or "qwerqwerqwer"
  if (/(.)\1{4,}/.test(trimmed)) return true;

  return false;
}

async function callGeminiAPI(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }

  console.log('--------------------------------------------------');
  console.log('[SCORING PANEL LLM RAW REQUEST PAYLOAD]');
  console.log(`System Prompt:\n${systemPrompt}`);
  console.log(`User Prompt (Answer Interpolated):\n${userPrompt}`);
  console.log('--------------------------------------------------');

  let lastError = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nCandidate Submission:\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[MODEL SCORING WARN] Model ${modelName} returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleanedText);
      console.log(`[MODEL SCORING SUCCESS] Successfully scored answer using ${modelName}`);
      return parsed;
    } catch (err) {
      console.warn(`[MODEL SCORING ERR] Model ${modelName} failed: ${err.message}`);
      lastError = err;
    }
  }

  // NO SILENT HARDCODED FALLBACK! Raise explicit error if all models fail
  throw new Error(`All Gemini scoring models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// 1. Domain Examiner Agent
async function runDomainExaminer(questionText, answerText, roleFocus, questionObj = null) {
  const modelAnswerRef = questionObj?.model_answer || 'A strong answer clearly addresses the core domain architecture, key technical trade-offs, step-by-step logic, and failure recovery.';
  const keyPointsRef = questionObj?.key_points || ['Core domain architecture', 'Technical trade-offs', 'Failure recovery'];

  // FAST PRE-CHECK: Skip LLM entirely for gibberish key mashing
  if (isGibberishOrNoise(answerText)) {
    console.log('[GIBBERISH PRE-FILTER DETECTED] Immediately returning content_score: 0');
    return {
      content_score: 0,
      missing_points: [
        'Answer does not contain recognizable technical content or real words.',
        ...keyPointsRef.map(kp => `Missed key point: ${kp}`)
      ],
      what_covered: [],
      strengths: [],
      model_answer: modelAnswerRef
    };
  }

  const systemPrompt = `You are a strict technical examiner scoring candidate responses for ${roleFocus}.
Evaluate the candidate's answer strictly for technical correctness, depth, and coverage against these expected key points:
EXPECTED KEY POINTS RUBRIC:
${keyPointsRef.map((kp, i) => `${i+1}. ${kp}`).join('\n')}

MODEL BENCHMARK ANSWER REFERENCE:
"${modelAnswerRef}"

STRICT SCORING RULES:
- If the answer contains no coherent words, is gibberish, random characters, or key mashing, you MUST score content_score strictly 0-5.
- If the answer is coherent English but does not address the question's actual topic, score content_score 5-20.
- If the answer addresses the topic but is vague, incomplete, or missing key concepts, score content_score 20-60 depending on completeness.
- Only score content_score above 70 if the answer demonstrates clear, correct, relevant technical understanding of the SPECIFIC question asked.
- Provide "what_covered": bullet list of key points the candidate successfully addressed.
- Provide "missing_points": bullet list of key points the candidate missed or answered incorrectly.

Return ONLY valid JSON matching schema:
{
  "content_score": number (0-100),
  "what_covered": [string],
  "missing_points": [string],
  "strengths": [string],
  "model_answer": string
}`;

  const userPrompt = `Question: ${questionText}\nCandidate Answer: ${answerText}`;

  const result = await callGeminiAPI(systemPrompt, userPrompt);
  result.model_answer = result.model_answer || modelAnswerRef;
  return result;
}

// 2. Behavioral STAR Assessor Agent
async function runBehavioralAssessor(questionText, answerText) {
  if (isGibberishOrNoise(answerText)) {
    return {
      star_components_present: [],
      specificity_score: 0,
      ownership_score: 0
    };
  }

  const systemPrompt = `You are a Behavioral Assessor scoring delivery structure, specificity, and ownership language in technical interview answers.

STRICT SCORING ANCHOR BANDS:

1. SPECIFICITY SCORE (specificity_score 0-100):
- 0-25: Generic answer with no concrete examples, numbers, or named technologies/situations.
- 25-55: At least one concrete example or detail mentioned.
- 55-85: Multiple specific, named details (technologies, metrics, timeframes, parameters).
- 85-100: Exceptionally detailed, highly quantified answer with explicit architecture and metrics.

2. OWNERSHIP SCORE (ownership_score 0-100):
- 0-25: Vague, passive framing ("it was done", "the team decided", "one would do this", or gibberish).
- 25-55: Mix of passive and first-person statements.
- 55-85: Clear active first-person ownership ("I architected", "I implemented", "I optimized", "My decision").
- 85-100: Strong leadership/ownership with specific personal contributions, trade-off choices, and co-owned outcomes.

CRITICAL MANDATE: Do NOT default to a middle-range score (e.g. 50-60). Commit decisively to the specific band that accurately matches what is actually present in the text.

Return ONLY valid JSON matching schema:
{
  "star_components_present": ["Situation"|"Task"|"Action"|"Result"],
  "specificity_score": number (0-100),
  "ownership_score": number (0-100)
}`;

  const userPrompt = `Question: ${questionText}\nCandidate Answer: ${answerText}`;

  return await callGeminiAPI(systemPrompt, userPrompt);
}

// 3. Adversarial Cross-Examiner Agent
async function runAdversarialExaminer(questionText, answerText) {
  if (isGibberishOrNoise(answerText)) {
    return {
      weak_point: 'Complete absence of structured answer content or technical reasoning',
      followup_question: 'Could you re-state your approach clearly using specific technical terms and architectural steps?'
    };
  }

  const systemPrompt = `You are a sharp Adversarial Technical Interviewer. Identify the single weakest assumption or missing trade-off in the candidate's answer and formulate ONE pointed follow-up challenge.

Return ONLY valid JSON matching schema:
{
  "weak_point": string,
  "followup_question": string
}`;

  const userPrompt = `Question: ${questionText}\nCandidate Answer: ${answerText}`;

  return await callGeminiAPI(systemPrompt, userPrompt);
}

// Parallel Multi-Agent Execution Panel
async function scoreAnswerMultiAgent(questionText, answerText, roleFocus = 'Software Engineer', questionObj = null) {
  const [domainRes, behavioralRes, adversarialRes] = await Promise.all([
    runDomainExaminer(questionText, answerText, roleFocus, questionObj),
    runBehavioralAssessor(questionText, answerText),
    runAdversarialExaminer(questionText, answerText)
  ]);

  const contentScore = domainRes.content_score ?? 0;
  const specScore = behavioralRes.specificity_score ?? 0;
  const ownScore = behavioralRes.ownership_score ?? 0;

  return {
    contentScore,
    domain: domainRes,
    behavioral: behavioralRes,
    adversarial: adversarialRes
  };
}

module.exports = {
  scoreAnswerMultiAgent,
  runDomainExaminer,
  runBehavioralAssessor,
  runAdversarialExaminer,
  isGibberishOrNoise
};
