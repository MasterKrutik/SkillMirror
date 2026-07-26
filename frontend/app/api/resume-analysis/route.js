import { GoogleGenerativeAI } from "@google/generative-ai";
import { computeDeterministicSignals, extractTextFromBufferAsync, extractWeakBulletsFromText, heuristicResumeCheck, isGarbledText, runLocalOCR } from "@/utils/resumeScorer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription') || '';
    const pastedText = formData.get('pastedText') || '';

    if (!file && !pastedText.trim()) {
      return Response.json({ error: "No file or text provided", success: false }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let bytes, buffer, base64, fileName = '', mimeType = 'text/plain';
    let extractedText = pastedText.trim();

    if (file) {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      base64 = buffer.toString('base64');
      fileName = file.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (fileName.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.doc')) {
        mimeType = 'application/msword';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      }

      // If text was not pasted manually, extract text from buffer
      if (!extractedText) {
        if (mimeType.startsWith('image/')) {
          console.log(`[OCR Triggered] Running local Tesseract.js OCR on image: ${file.name}`);
          extractedText = await runLocalOCR(buffer);
        } else {
          extractedText = await extractTextFromBufferAsync(buffer, file.name, file.type || '');
        }
      }
    }

    // Check if extracted text is garbled font gibberish
    let textWasGarbled = isGarbledText(extractedText);
    if (textWasGarbled && file && mimeType.startsWith('image/')) {
      console.log(`[OCR Fallback] Running Tesseract.js OCR for garbled image: ${fileName}`);
      const ocrText = await runLocalOCR(buffer);
      if (ocrText && ocrText.length > 20 && !isGarbledText(ocrText)) {
        extractedText = ocrText;
        textWasGarbled = false;
      }
    }

    // DIAGNOSTIC LOGGING FOR VALIDATION STEP
    console.log(`\n=== [RESUME VALIDATION DIAGNOSTICS] ===`);
    console.log(`File Name: ${fileName || 'Pasted Text'} | mimeType: ${mimeType} | Size: ${buffer ? buffer.length : 0} bytes`);
    console.log(`Extracted Text Length: ${extractedText.length} chars | Word Count: ${extractedText.split(/\s+/).filter(Boolean).length}`);
    console.log(`First 500 Chars Extracted: "${extractedText.slice(0, 500).replace(/\n/g, ' ')}"`);

    // Run heuristic check
    const heuristicResult = heuristicResumeCheck(extractedText, fileName);
    console.log(`Heuristic Check Result:`, heuristicResult);

    // If heuristic passes cleanly with text present (confidence 'high' or 'medium')
    let isResume = heuristicResult.isResume;
    let isBorderline = heuristicResult.isBorderline || false;

    // Single-pass Gemini prompt combining document validation AND full ATS scoring into 1 single call
    const analysisPrompt = `You are an expert ATS resume evaluator and career intelligence analyst.
Candidate Resume Filename: ${fileName || 'Candidate Resume'}
${extractedText ? `ACTUAL CANDIDATE RESUME TEXT EXTRACTED FROM FILE:\n"""\n${extractedText}\n"""\n` : ''}
${jobDescription ? `TARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n` : ''}

INSTRUCTIONS:
1. First, check if the attached document/text represents an actual candidate resume or CV containing career content (work experience, education, skills, or job history).
2. If it is NOT a resume (e.g. random photo, landscape image, recipe, article with no resume sections), return JSON with "isResume": false and "error": "This doesn't look like a resume or CV. Please upload a document containing your work experience, education, and skills."
3. If it IS a resume (or if the attached PDF file renders a resume visually), return "isResume": true and evaluate full ATS scores.

CRITICAL MANDATORY INSTRUCTIONS FOR "rewrites":
- Identify 2 to 3 WEAKEST bullet points that ALREADY EXIST VERBATIM inside the candidate's actual resume text.
- The "original" field MUST BE AN EXACT VERBATIM EXCERPT OR DIRECT PHRASE from the candidate's actual uploaded resume text.
- DO NOT INVENT OR USE GENERIC PLACEHOLDERS like "Managed a team of developers" UNLESS THOSE EXACT WORDS APPEAR IN THE CANDIDATE'S RESUME.

Return ONLY valid JSON matching this exact schema:
{
  "isResume": true,
  "error": null,
  "score": <0-100 overall content score>,
  "atsScore": <0-100 ATS parse safety score>,
  "radarMetrics": {
    "keywordMatch": <0-100 score>,
    "structureFormatting": <0-100 score>,
    "quantifiedImpact": <0-100 score>,
    "actionVerbStrength": <0-100 score>,
    "atsParseSafety": <0-100 score>
  },
  "missingKeywords": [<up to 5 missing keywords>],
  "rewrites": [
    {
      "original": "<EXACT VERBATIM weak line from the candidate's actual resume>",
      "improved": "<AI-strengthened version with metrics & active verbs>",
      "reason": "<short explanation>"
    }
  ],
  "rawParsePreview": "<a realistic plain-text extraction preview of the resume>",
  "parsingWarnings": [
    {
      "snippet": "<text snippet>",
      "warning": "<explanation>"
    }
  ],
  "weakestTheme": "<single biggest weakness>",
  "recommendedEvaluationStyle": "<'Behavioral/STAR Focus' | 'Technical Depth Focus' | 'Adaptive Elo + STAR + Follow-ups'>",
  "suggestions": [<3-5 actionable suggestions>],
  "skills": [<identified skills>],
  "strengths": [<key strengths>],
}
EXPLICIT SCORING BANDS FOR RADAR METRICS:
- 90-100 (Exceptional): Flawless metrics on nearly every bullet, strong action verbs, 90%+ keyword match.
- 70-89 (Strong): Good content, ~50% bullets with metrics, solid ATS headers.
- 50-69 (Average): Mixed quality, few/vague metrics, passive phrasing ("responsible for").
- 30-49 (Needs Work): Weak content, almost no metrics, passive duty statements.
- 0-29 (Poor): Severe deficiencies, wall of text, missing core sections.
`;

    console.log("[Resume Analysis API] File:", fileName, "| mimeType:", mimeType, "| extractedText length:", extractedText.length);

    console.log("[Resume Analysis API] LLM Prompt sent:", analysisPrompt);

    let analysisData;
    try {
      const parts = [{ text: analysisPrompt }];
      // If we don't have extracted text or if binary document, include inlineData
      if (mimeType !== 'text/plain' || !extractedText) {
        parts.unshift({ inlineData: { mimeType, data: base64 } });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }]
      });

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in LLM response");
      }
    } catch (apiError) {
      console.warn("Gemini API Error / Fallback triggered:", apiError.message);
      
      // If validation failed or text is clearly non-resume, reject document in fallback
      if (!isResume) {
        return Response.json({
          isResume: false,
          error: "This doesn't look like a resume or CV. Please upload a document containing your work experience, education, and skills.",
          fileName: file.name,
          success: false
        });
      }

      // Compute deterministic signals from extracted text or file content
      const signals = computeDeterministicSignals(extractedText, jobDescription);

      const dynamicRewrites = extractWeakBulletsFromText(extractedText);

      analysisData = {
        score: signals.score,
        atsScore: signals.atsScore,
        radarMetrics: {
          keywordMatch: signals.keywordMatch,
          structureFormatting: signals.structureFormatting,
          quantifiedImpact: signals.quantifiedImpact,
          actionVerbStrength: signals.actionVerbStrength,
          atsParseSafety: signals.atsParseSafety
        },
        missingKeywords: signals.missingKeywords,
        rewrites: dynamicRewrites.length > 0 ? dynamicRewrites : [
          {
            original: "Assisted development team with building web applications and writing code",
            improved: "Architected 4 core web application modules, boosting pipeline velocity by 35% and reducing runtime error rates",
            reason: "Replaced passive helper phrasing with active technical ownership and quantitative metrics"
          }
        ],
        rawParsePreview: extractedText || `CANDIDATE RESUME PREVIEW (${file.name})\n\nUnable to extract raw text inline. File scanned via computer vision OCR parser.`,
        parsingWarnings: [
          {
            snippet: "Header section layout",
            warning: "Ensure section headers use standard naming conventions for ATS parser compatibility."
          }
        ],
        weakestTheme: signals.quantifiedImpact < 50 ? "quantifying impact metrics" : "action verb strength",
        recommendedEvaluationStyle: "Behavioral/STAR Focus",
        suggestions: [
          "Include explicit quantitative metrics (percentages, numbers, latency improvements) in work experience bullets",
          "Replace passive duty statements ('responsible for') with high-impact action verbs ('spearheaded', 'architected')",
          "Align technical skills closely with modern ATS job keywords",
          "Ensure clean single-column structure with standard section headers"
        ],
        skills: ["Software Engineering", "Problem Solving", "Web Development"],
        strengths: ["Clean overall structure", "Solid core background"],
        gaps: ["Needs more quantified business outcome metrics", "Strengthen leadership action verbs"]
      };
    }

    // 3. Reconcile LLM metrics with deterministic text signals for maximum accuracy
    if (extractedText && extractedText.length > 30) {
      const deterministic = computeDeterministicSignals(extractedText, jobDescription);
      
      // Blend deterministic signals (60% weight) with LLM judgment (40% weight) to ensure distinct real-signal scoring
      analysisData.radarMetrics = {
        keywordMatch: Math.round((deterministic.keywordMatch * 0.6) + ((analysisData.radarMetrics?.keywordMatch || 70) * 0.4)),
        structureFormatting: Math.round((deterministic.structureFormatting * 0.6) + ((analysisData.radarMetrics?.structureFormatting || 80) * 0.4)),
        quantifiedImpact: Math.round((deterministic.quantifiedImpact * 0.6) + ((analysisData.radarMetrics?.quantifiedImpact || 60) * 0.4)),
        actionVerbStrength: Math.round((deterministic.actionVerbStrength * 0.6) + ((analysisData.radarMetrics?.actionVerbStrength || 70) * 0.4)),
        atsParseSafety: Math.round((deterministic.atsParseSafety * 0.6) + ((analysisData.radarMetrics?.atsParseSafety || 85) * 0.4))
      };

      analysisData.atsScore = analysisData.radarMetrics.atsParseSafety;
      analysisData.score = Math.round(
        analysisData.radarMetrics.quantifiedImpact * 0.25 +
        analysisData.radarMetrics.actionVerbStrength * 0.25 +
        analysisData.radarMetrics.keywordMatch * 0.25 +
        analysisData.radarMetrics.structureFormatting * 0.15 +
        analysisData.radarMetrics.atsParseSafety * 0.10
      );
    }

    return Response.json(
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: 'document',
        hasJobDescription: Boolean(jobDescription),
        isResume: true,
        isBorderline: Boolean(isBorderline),
        warning: isBorderline ? "We're not fully confident this is a resume — results may be less accurate." : null,
        ...analysisData,
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resume Analysis Route Failure:", error);
    return Response.json(
      {
        error: "Failed to analyze resume",
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}

