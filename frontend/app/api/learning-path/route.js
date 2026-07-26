/**
 * Learning Path API Route — v2
 *
 * Uses computeRoadmap() from lib/roadmapEngine.js v2.
 * New behaviour vs v1:
 *   - Milestones carry status:'already_mastered'|'required' and adjustedWeeks
 *   - formatWeeksToMonths() is computed by the engine (no hardcoded strings)
 *   - Gemini attempted first; on quota/error falls back to deterministic engine instantly
 *   - Interview performance flags applied AFTER engine computation, not before
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { computeRoadmap, runVerificationTests, formatWeeksToMonths } from '@/lib/roadmapEngine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Run verification once on server cold start
let _booted = false;
function maybeRunVerification() {
  if (!_booted) {
    _booted = true;
    console.log('\n[learning-path/route.js] CHANGED: v2 engine with prerequisiteSkills+partialOverlapSkills permutation logic');
    runVerificationTests();
  }
}

function safeParseJSON(text) {
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('No valid JSON found in Gemini response');
}

/**
 * Overlay interviewPerformanceData flags onto computed roadmap milestones.
 * Marks milestones with score<75 as interview-flagged.
 */
function applyInterviewFlags(roadmap, performanceData) {
  if (!performanceData || Object.keys(performanceData).length === 0) return roadmap;

  const weakTopics = Object.entries(performanceData)
    .filter(([, score]) => score < 75)
    .map(([topic]) => topic.toLowerCase());

  const phases = roadmap.phases.map(phase => ({
    ...phase,
    milestones: phase.milestones.map(ms => {
      if (ms.status === 'already_mastered') return ms; // don't flag mastered milestones
      const titleLower = ms.title.toLowerCase();
      const matchedTopic = weakTopics.find(t => titleLower.includes(t));
      if (matchedTopic) {
        const originalKey = Object.keys(performanceData).find(k => k.toLowerCase() === matchedTopic);
        return {
          ...ms,
          isInterviewFlagged: true,
          flagReason: `Measured ${performanceData[originalKey]}% in your recent mock interview session`
        };
      }
      return ms;
    })
  }));

  return { ...roadmap, phases, hasInterviewData: true };
}

export async function POST(req) {
  maybeRunVerification();

  try {
    const body = await req.json().catch(() => ({}));
    const {
      selectedRole = 'Frontend Developer',
      currentSkills = [],
      interviewPerformanceData = null
    } = body;

    if (!selectedRole || !currentSkills || currentSkills.length === 0) {
      return Response.json(
        { success: false, error: 'Target role and at least one mastered skill are required.' },
        { status: 400 }
      );
    }

    console.log(`\n[learning-path/route.js] POST → role="${selectedRole}", skills=[${currentSkills.join(', ')}]`);

    // ── Try Gemini first ───────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let performanceContext = '';
    if (interviewPerformanceData && Object.keys(interviewPerformanceData).length > 0) {
      performanceContext = `\nCandidate Interview Weakness Scores (< 75 = weak): ${JSON.stringify(interviewPerformanceData)}.`;
    }

    const prompt = `You are a principal career architect. Generate a 3-phase personalized learning timeline for role="${selectedRole}". Mastered skills: [${currentSkills.join(', ')}].${performanceContext}

CRITICAL RULES:
- Skip milestones the candidate already masters (all prerequisite skills present)
- Only include role-appropriate milestones (no DOM/React for Data Scientist, no CI/CD as phase 1 for Frontend)
- Each milestone must have at least 1 real YouTube video or playlist URL
- Recalculate estimatedDuration based only on remaining skill gaps

Return ONLY valid JSON matching this exact schema:
{
  "role": "${selectedRole}",
  "estimatedDuration": "<computed>",
  "totalWeeks": <number>,
  "hasInterviewData": ${Boolean(interviewPerformanceData && Object.keys(interviewPerformanceData).length > 0)},
  "phases": [
    {
      "phaseId": 1,
      "name": "<Phase Name>",
      "accent": "amber",
      "duration": "<N weeks>",
      "milestones": [
        {
          "id": "m1",
          "title": "<milestone>",
          "status": "required",
          "weeks": <number>,
          "adjustedWeeks": <number>,
          "timeInvestment": "<N weeks>",
          "isInterviewFlagged": false,
          "flagReason": null,
          "prerequisiteSkills": [],
          "partialOverlapSkills": [],
          "resources": [
            { "label": "<label>", "url": "<real URL>", "type": "doc|video|playlist|interactive", "isExternal": true }
          ]
        }
      ]
    }
  ]
}`;

    try {
      const result = await model.generateContent(prompt);
      const parsed = safeParseJSON(result.response.text());
      console.log('[learning-path/route.js] ✅ Gemini response used for role:', selectedRole);
      // Ensure all milestones have required fields
      parsed.phases?.forEach(phase => {
        phase.milestones?.forEach(ms => {
          if (!ms.status) ms.status = 'required';
          if (!ms.timeInvestment) ms.timeInvestment = ms.weeks ? `${ms.weeks} week${ms.weeks !== 1 ? 's' : ''}` : '2 weeks';
        });
      });
      return Response.json({ success: true, ...parsed });
    } catch (geminiErr) {
      const isQuota = geminiErr.message && (geminiErr.message.includes('PerDay') || geminiErr.message.includes('429') || geminiErr.message.includes('quota'));
      console.log(`[learning-path/route.js] Gemini ${isQuota ? 'quota' : 'error'} — using deterministic engine:`, geminiErr.message?.slice(0, 80));
    }

    // ── Deterministic gap-logic engine ─────────────────────────────────────
    const baseRoadmap = computeRoadmap(selectedRole, currentSkills);

    if (!baseRoadmap) {
      return Response.json(
        { success: false, error: `Role "${selectedRole}" not found in roadmap matrix.` },
        { status: 400 }
      );
    }

    const roadmap = applyInterviewFlags(
      {
        ...baseRoadmap,
        hasInterviewData: Boolean(interviewPerformanceData && Object.keys(interviewPerformanceData).length > 0)
      },
      interviewPerformanceData
    );

    const allMilestones = roadmap.phases.flatMap(p => p.milestones);
    const requiredCount = allMilestones.filter(m => m.status === 'required').length;
    const masteredCount = allMilestones.filter(m => m.status === 'already_mastered').length;

    console.log(`[learning-path/route.js] ✅ Engine roadmap → role="${selectedRole}", totalWeeks=${roadmap.totalWeeks}, duration="${roadmap.estimatedDuration}", required=${requiredCount}, already_mastered=${masteredCount}`);

    return Response.json({ success: true, ...roadmap });

  } catch (error) {
    console.error('[learning-path/route.js] Route failure:', error);
    return Response.json(
      { success: false, error: 'Failed to generate learning timeline: ' + error.message },
      { status: 500 }
    );
  }
}
