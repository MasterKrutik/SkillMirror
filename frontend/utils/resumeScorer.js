import { createWorker } from 'tesseract.js';

/**
 * Runs local Tesseract.js OCR engine on image buffers
 */
export async function runLocalOCR(imageBuffer) {
  if (!imageBuffer || imageBuffer.length === 0) return '';
  try {
    console.log('[Tesseract.js OCR] Initializing local OCR worker...');
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageBuffer);
    await worker.terminate();
    const text = ret.data?.text || '';
    console.log(`[Tesseract.js OCR] Extracted ${text.length} characters cleanly via local OCR`);
    return text.trim();
  } catch (err) {
    console.warn('[Tesseract.js OCR Warning]:', err.message);
    return '';
  }
}

// Comprehensive Lists for Deterministic Checks
const STRONG_ACTION_VERBS = [

  'spearheaded', 'architected', 'optimized', 'engineered', 'scaled', 'implemented',
  'designed', 'led', 'built', 'drove', 'reduced', 'accelerated', 'created',
  'developed', 'automated', 'launched', 'orchestrated', 'overhauled', 'crafted',
  'formulated', 'deployed', 'directed', 'transformed', 'pioneered', 'expanded',
  'executed', 'established', 'championed', 'revamped', 'consolidated', 'streamlined'
];

const WEAK_PASSIVE_OPENERS = [
  'responsible for', 'helped', 'worked on', 'assisted with', 'handled',
  'involved in', 'tasked with', 'did', 'duties included', 'worked with',
  'helped to', 'maintained', 'supported', 'part of'
];

const CORE_SECTION_HEADERS = [
  /experience|employment|work history|professional background/i,
  /education|academic|qualifications|training/i,
  /skills|technologies|proficiencies|technical stack/i,
  /projects|key achievements|accomplishments/i,
  /summary|profile|about me|objective/i
];

const INDUSTRY_KEYWORDS = [
  'system design', 'microservices', 'rest api', 'sql', 'react', 'node.js', 'python',
  'java', 'cloud', 'aws', 'agile', 'unit testing', 'ci/cd', 'architecture', 'git',
  'docker', 'kubernetes', 'security', 'performance', 'scalability', 'postgresql',
  'mongodb', 'data pipelines', 'full-stack', 'devops', 'leadership', 'analytics'
];

/**
 * Helper to extract PDF text streams if pdf-parse encounters compressed structures
 */
function extractPdfStreamText(buffer) {
  try {
    const raw = buffer.toString('binary');
    const matches = [];
    const parenRegex = /\(([^()\\]|\\[\s\S])*\)/g;
    let match;
    while ((match = parenRegex.exec(raw)) !== null) {
      let str = match[0].slice(1, -1);
      str = str.replace(/\\([()\\])/g, '$1').replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, ' ');
      if (/[a-zA-Z0-9\s.,;:\-@()/]/.test(str) && str.trim().length > 1) {
        matches.push(str.trim());
      }
    }
    if (matches.length > 5) {
      return matches.join(' ');
    }
  } catch (e) {
    console.warn('PDF stream extraction fallback error:', e);
  }
  return '';
}

/**
 * Robust async text extractor for PDF, DOCX, TXT, and Markdown files
 */
export async function extractTextFromBufferAsync(buffer, fileName = '', mimeType = '') {
  if (!buffer || buffer.length === 0) return '';
  const fn = fileName.toLowerCase();

  // 1. PDF Documents
  if (fn.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      let pdfParse = require('pdf-parse');
      if (typeof pdfParse !== 'function' && pdfParse.default) {
        pdfParse = pdfParse.default;
      }
      if (typeof pdfParse === 'function') {
        const data = await pdfParse(buffer);
        if (data && data.text && data.text.trim().length > 20) {
          console.log(`[pdf-parse success] Extracted ${data.text.trim().length} chars cleanly from ${fileName}`);
          return data.text.trim();
        }
      }
    } catch (err) {
      console.warn("[pdf-parse warning] Fallback to stream regex parser:", err.message);
    }
    const streamText = extractPdfStreamText(buffer);
    if (streamText && streamText.length > 20) return streamText;
  }

  // 2. DOCX Documents
  if (fn.endsWith('.docx') || fn.endsWith('.doc') || mimeType.includes('word')) {
    try {
      let mammoth = require('mammoth');
      if (mammoth.default) mammoth = mammoth.default;
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 10) {
        console.log(`[mammoth success] Extracted ${result.value.trim().length} chars cleanly from ${fileName}`);
        return result.value.trim();
      }
    } catch (e) {
      console.warn('[mammoth warning] DOCX extraction error:', e.message);
    }
  }


  // 3. Text/Markdown Documents
  try {
    const text = buffer.toString('utf-8');
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  } catch (e) {
    console.warn('Buffer string conversion error:', e);
  }
  return '';
}

/**
 * Synchronous text extractor for plain text files
 */
export function extractTextFromBuffer(buffer, fileName = '', mimeType = '') {
  if (!buffer) return '';
  try {
    const fn = fileName.toLowerCase();
    if (fn.endsWith('.pdf')) {
      return extractPdfStreamText(buffer);
    }
    return buffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  } catch (err) {
    console.warn('Text extraction error:', err);
  }
  return '';
}

/**
 * Detects if extracted text is garbled/encoded gibberish due to subsetted/custom PDF fonts lacking ToUnicode CMaps
 */
export function isGarbledText(text = '') {
  if (!text || text.trim().length === 0) return true;
  const clean = text.trim();

  // Count printable ASCII/basic punctuation letters
  const readableCount = (clean.match(/[a-zA-Z0-9\s.,;:\-@()/•\*\–\—'"]/g) || []).length;
  const totalCount = clean.length;
  const readableRatio = readableCount / totalCount;

  // Count garbled symbols (high-density non-ASCII characters like Ë, Û, Æ, ê, î, þ, ð, etc.)
  const garbledSymbols = (clean.match(/[^\x00-\x7F]/g) || []).length;
  const garbledRatio = garbledSymbols / totalCount;

  // Count valid English words (tokens length >= 2 consisting of printable Latin letters)
  const totalWords = clean.split(/\s+/).filter(Boolean).length;
  const validWords = clean.split(/\s+/).filter(w => /^[a-zA-Z]{2,}$/.test(w));
  const validWordRatio = totalWords > 0 ? validWords.length / totalWords : 0;

  // If readable ASCII ratio is < 65% OR garbled symbol ratio > 12% OR valid English word ratio < 35%
  if (readableRatio < 0.65 || garbledRatio > 0.12 || (totalWords > 10 && validWordRatio < 0.35)) {
    return true;
  }

  return false;
}

/**
 * Broadened Heuristic Pre-Check for Resume Content Validation
 */
export function heuristicResumeCheck(text = '', fileName = '') {
  const clean = (text || '').trim();
  
  // First check if extracted text is garbled font gibberish
  if (isGarbledText(clean)) {
    return {
      isResume: false,
      isGarbled: true,
      confidence: 'low',
      reason: "We had trouble reading the text in this PDF (this can happen with certain PDF export settings or custom embedded fonts). Try re-exporting your resume as a standard PDF, or paste your resume text directly.",
      wordCount: 0
    };
  }

  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const lower = clean.toLowerCase();


  // Expanded Resume Section & Indicator Keywords
  const RESUME_INDICATORS = [
    /experience|employment|work history|career|job history|positions held|internship|projects|leadership/i,
    /education|academic|university|college|qualification|degree|bachelor|master|phd|gpa|diploma|coursework|school|b\.e\.|b\.tech|b\.s\.|m\.s\.|m\.tech/i,
    /skills|technologies|proficiencies|technical stack|languages|competencies|frameworks|expertise|tools/i,
    /projects|accomplishments|achievements|certifications|publications|honors/i,
    /summary|profile|objective|resume|curriculum vitae|\bcv\b|about me|contact/i
  ];

  let indicatorMatches = 0;
  RESUME_INDICATORS.forEach(regex => {
    if (regex.test(lower)) indicatorMatches++;
  });

  // Contact & Date Range Indicators
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean);
  const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(clean);
  const hasDateRange = /\b(20\d\d|19\d\d)\s*[-–—to]+\s*(20\d\d|19\d\d|present|current)\b/i.test(clean);
  const hasProfileUrl = /linkedin\.com|github\.com|portfolio/i.test(lower);

  let structuralPoints = 0;
  if (hasEmail) structuralPoints++;
  if (hasPhone) structuralPoints++;
  if (hasDateRange) structuralPoints++;
  if (hasProfileUrl) structuralPoints++;

  // FAIL OPEN PHILOSOPHY: Any extracted document with 25+ readable words is ALLOWED through to scoring.
  if (wordCount < 25) {
    return {
      isResume: false,
      isGarbled: false,
      confidence: 'low',
      reason: "We could not extract sufficient readable text from this file (fewer than 25 words found).",
      wordCount,
      indicatorMatches,
      structuralPoints
    };
  }

  // 1. STANDARD RESUME (High Confidence)
  if (indicatorMatches >= 1 || structuralPoints >= 1 || fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
    return {
      isResume: true,
      isBorderline: false,
      confidence: 'high',
      wordCount,
      indicatorMatches,
      structuralPoints
    };
  }

  // 2. NON-RESUME TEXT DOCUMENT (Soft Warning, Fail-Open to Scoring)
  return {
    isResume: true,
    isBorderline: true,
    confidence: 'medium',
    warning: "This doesn't look like a typical resume — ATS scoring results may be less accurate.",
    wordCount,
    indicatorMatches,
    structuralPoints
  };
}




/**
 * Computes 5 distinct radar axis metrics and headline scores from actual resume text
 */
export function computeDeterministicSignals(resumeText, jobDescription = '') {
  const text = (resumeText || '').trim();
  const lowerText = text.toLowerCase();
  
  if (!text) {
    return {
      keywordMatch: 50,
      structureFormatting: 50,
      quantifiedImpact: 35,
      actionVerbStrength: 45,
      atsParseSafety: 60,
      atsScore: 55,
      score: 52,
      missingKeywords: jobDescription ? ["Kubernetes", "GraphQL", "CI/CD", "System Architecture"] : ["System Design", "CI/CD", "Agile Leadership"]
    };
  }

  // 1. KEYWORD MATCH SIGNAL
  let keywordMatchScore = 70;
  let missingKeywords = [];
  
  if (jobDescription && jobDescription.trim().length > 10) {
    // Extract unique words length >= 4 from Job Description
    const jdWords = Array.from(new Set(
      jobDescription.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !['with', 'that', 'from', 'this', 'have', 'will', 'your', 'about', 'team', 'work', 'must', 'should', 'more'].includes(w))
    )).slice(0, 25);

    let matchCount = 0;
    jdWords.forEach(kw => {
      if (lowerText.includes(kw)) {
        matchCount++;
      } else if (missingKeywords.length < 5 && kw.length >= 5) {
        missingKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    const ratio = jdWords.length > 0 ? matchCount / jdWords.length : 0.7;
    keywordMatchScore = Math.min(96, Math.max(25, Math.round(ratio * 100)));
  } else {
    // Check against standard industry tech keywords
    let matchCount = 0;
    INDUSTRY_KEYWORDS.forEach(kw => {
      if (lowerText.includes(kw)) {
        matchCount++;
      } else if (missingKeywords.length < 4) {
        missingKeywords.push(kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    });
    const ratio = matchCount / INDUSTRY_KEYWORDS.length;
    keywordMatchScore = Math.min(95, Math.max(30, Math.round(ratio * 140)));
  }

  // 2. STRUCTURE & FORMATTING SIGNAL
  let sectionScore = 0;
  CORE_SECTION_HEADERS.forEach(regex => {
    if (regex.test(text)) sectionScore += 16;
  });
  
  // Date pattern presence (e.g. 2021, Jan 2023, 2019-2023, Present)
  const dateMatches = (text.match(/\b(20\d\d|19\d\d|present|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi) || []).length;
  const dateScore = Math.min(20, dateMatches * 4);

  // Bullet structure check (lines starting with bullets or short breaks)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const bulletLines = lines.filter(l => /^[•\-\*\d\.\>]/.test(l));
  const bulletRatio = lines.length > 0 ? bulletLines.length / lines.length : 0.5;
  const bulletScore = Math.min(20, Math.round(bulletRatio * 35));

  const structureFormatting = Math.min(98, Math.max(20, sectionScore + dateScore + bulletScore));

  // 3. QUANTIFIED IMPACT SIGNAL (Count bullets with metrics/numbers vs total bullets)
  const metricBullets = lines.filter(l => {
    return /\b(\d+%\b|\$\d+|\d+x\b|\d+\s*(users|clients|team|projects|latency|ms|sec|hours|reduction|increase|growth|boost|million|k|gb|tb|fps|percent))\b/i.test(l);
  });
  
  const totalSubstantialLines = Math.max(1, lines.filter(l => l.length > 20).length);
  const metricRatio = metricBullets.length / totalSubstantialLines;

  let quantifiedImpact = 25;
  if (metricRatio >= 0.6) quantifiedImpact = Math.min(98, Math.round(85 + metricRatio * 15));
  else if (metricRatio >= 0.4) quantifiedImpact = Math.round(70 + (metricRatio - 0.4) * 75);
  else if (metricRatio >= 0.2) quantifiedImpact = Math.round(45 + (metricRatio - 0.2) * 125);
  else quantifiedImpact = Math.max(15, Math.round(metricRatio * 225));

  // 4. ACTION VERB STRENGTH SIGNAL
  let strongCount = 0;
  let weakCount = 0;

  lines.forEach(line => {
    const l = line.toLowerCase();
    STRONG_ACTION_VERBS.forEach(v => {
      if (l.includes(v)) strongCount++;
    });
    WEAK_PASSIVE_OPENERS.forEach(w => {
      if (l.includes(w)) weakCount++;
    });
  });

  let actionVerbStrength = 70;
  if (strongCount > 0 || weakCount > 0) {
    const actionRatio = strongCount / (strongCount + weakCount);
    actionVerbStrength = Math.min(96, Math.max(20, Math.round(actionRatio * 90 + Math.min(strongCount * 3, 10))));
  } else {
    actionVerbStrength = 55;
  }

  // 5. ATS PARSE SAFETY SIGNAL
  let atsSafetyDeductions = 0;
  // Non-ASCII garbled text check
  const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
  if (nonAsciiCount > 25) atsSafetyDeductions += 15;

  // Table pipe separators / garbled columns
  const tablePipes = (text.match(/\|/g) || []).length;
  if (tablePipes > 6) atsSafetyDeductions += 10;

  // Contact info parseability check (Email & Phone)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text);
  if (!hasEmail) atsSafetyDeductions += 15;
  if (!hasPhone) atsSafetyDeductions += 10;

  // Missing essential work experience header
  if (!/experience|work|employment/i.test(text)) atsSafetyDeductions += 20;

  const atsParseSafety = Math.min(98, Math.max(15, 100 - atsSafetyDeductions));

  // HEADLINE SCORES COMPUTATION
  const atsScore = atsParseSafety;
  const score = Math.round(
    quantifiedImpact * 0.25 +
    actionVerbStrength * 0.25 +
    keywordMatchScore * 0.25 +
    structureFormatting * 0.15 +
    atsParseSafety * 0.10
  );

  return {
    keywordMatch: keywordMatchScore,
    structureFormatting,
    quantifiedImpact,
    actionVerbStrength,
    atsParseSafety,
    atsScore,
    score,
    missingKeywords: missingKeywords.slice(0, 5)
  };
}

/**
 * Extracts candidate's actual weak lines for fallback rewrites if LLM fails
 */
export function extractWeakBulletsFromText(text) {
  if (!text) return [];
  
  // Filter out contact lines, header banners, skill lists, and section headers
  const candidates = text.split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (l.length < 15 || l.endsWith(':')) return false;
      if (/@|phone|email|linkedin|github|skills|education|summary|profile|alex smith|john doe/i.test(l)) return false;
      if (l.includes('|') && l.length < 80) return false;
      if (CORE_SECTION_HEADERS.some(r => r.test(l))) return false;
      return true;
    });

  // Prefer lines starting with bullet symbols or containing weak/passive verbs
  const explicitBullets = candidates.filter(l => /^[•\-\*\d\.\>]/.test(l));
  const pool = explicitBullets.length >= 2 ? explicitBullets : candidates;

  const weakLines = pool.filter(l => {
    const isPassive = WEAK_PASSIVE_OPENERS.some(w => l.toLowerCase().includes(w));
    const noNumbers = !/\d/.test(l);
    return isPassive || noNumbers;
  });

  const selected = weakLines.length >= 2 ? weakLines.slice(0, 2) : pool.slice(0, 2);

  return selected.map(orig => {
    const cleanOrig = orig.replace(/^[•\-\*\d\.\>]\s*/, '');
    let improved = cleanOrig;
    
    if (cleanOrig.toLowerCase().includes('managed') || cleanOrig.toLowerCase().includes('led')) {
      improved = `Spearheaded ${cleanOrig}, driving a 30% increase in operational efficiency and sprint velocity`;
    } else if (cleanOrig.toLowerCase().includes('sql') || cleanOrig.toLowerCase().includes('database') || cleanOrig.toLowerCase().includes('code')) {
      improved = `Optimized ${cleanOrig}, cutting query response latency by 42% across production database clusters`;
    } else {
      improved = `Architected and deployed ${cleanOrig}, boosting system pipeline throughput by 35% and reducing error rates`;
    }

    return {
      original: cleanOrig,
      improved: improved,
      reason: "Replaced passive duty statement with strong action verbs and quantified impact metrics"
    };
  });
}

