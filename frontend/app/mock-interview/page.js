'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

// Expanded Option Configurations
const ROLE_OPTIONS = [
  { isHeader: true, label: 'ENGINEERING' },
  { value: 'Software Engineer', label: 'Software Engineer', description: 'Systems & Algorithms' },
  { value: 'Frontend Engineer', label: 'Frontend Engineer', description: 'UI Architecture & Performance' },
  { value: 'Backend Engineer', label: 'Backend Engineer', description: 'APIs, Databases & Scalability' },
  { value: 'Full-Stack Engineer', label: 'Full-Stack Engineer', description: 'End-to-End Product Delivery' },
  { value: 'DevOps / SRE', label: 'DevOps / SRE', description: 'Infrastructure & Reliability' },
  { value: 'Mobile Engineer', label: 'Mobile Engineer', description: 'iOS/Android Fundamentals' },
  { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer', description: 'Models & Pipelines' },

  { isHeader: true, label: 'DATA & ANALYTICS' },
  { value: 'Data Analyst', label: 'Data Analyst', description: 'SQL, Statistics & Dashboards' },
  { value: 'Data Scientist', label: 'Data Scientist', description: 'Modeling & Experimentation' },
  { value: 'Data Engineer', label: 'Data Engineer', description: 'Pipelines & Warehousing' },

  { isHeader: true, label: 'PRODUCT & DESIGN' },
  { value: 'Product Manager', label: 'Product Manager', description: 'Metrics, Roadmaps & Tradeoffs' },
  { value: 'UX/UI Designer', label: 'UX/UI Designer', description: 'Research & Interaction Design' },

  { isHeader: true, label: 'BUSINESS & GENERAL' },
  { value: 'Business Analyst', label: 'Business Analyst', description: 'Process & Requirements' },
  { value: 'Consulting / Case Interview', label: 'Consulting / Case Interview', description: 'Structured Problem-Solving' },
  { value: 'General Behavioral', label: 'General Behavioral', description: 'Role-Agnostic Soft Skills' }
];

const LENGTH_OPTIONS = [
  { value: 3, label: '3 Questions', description: 'Quick Sprint (~5 min)' },
  { value: 5, label: '5 Questions', description: 'Standard Benchmark (~10 min)' },
  { value: 8, label: '8 Questions', description: 'Deep Elo Calibration (~15 min)' },
  { value: 12, label: '12 Questions', description: 'Full Mock Interview (~25 min)' },
  { value: 15, label: '15 Questions', description: 'Extended Practice Marathon (~35 min)' }
];

const STYLE_OPTIONS = [
  { value: 'Adaptive Elo + STAR + Follow-ups', label: 'Adaptive Elo + STAR + Follow-ups', description: 'Balanced scoring across all signals' },
  { value: 'Adversarial Follow-up Focus', label: 'Adversarial Follow-up Focus', description: 'Heavier weight on cross-examiner probing' },
  { value: 'Technical Depth Focus', label: 'Technical Depth Focus', description: 'Prioritizes content correctness over delivery' },
  { value: 'Behavioral/STAR Focus', label: 'Behavioral/STAR Focus', description: 'Prioritizes structure & storytelling' },
  { value: 'Rapid-Fire Stress Test', label: 'Rapid-Fire Stress Test', description: 'Shorter time limits, fatigue-sensitive' }
];

function MockInterviewContent() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const targetGapParam = searchParams?.get('targetGap');
  const styleParam = searchParams?.get('evaluationStyle');

  // Setup state
  const [step, setStep] = useState('setup'); // 'setup' | 'live'
  const [roleFocus, setRoleFocus] = useState('Software Engineer');
  const [questionsTotal, setQuestionsTotal] = useState(5);
  const [styleSelect, setStyleSelect] = useState('Adaptive Elo + STAR + Follow-ups');

  useEffect(() => {
    if (styleParam) {
      setStyleSelect(styleParam);
    }
  }, [styleParam]);

  // Question Preview Setup State
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // In-Session Question Refresh State
  const [questionSwaps, setQuestionSwaps] = useState({}); // { [qIndex]: count }
  const [isSwapping, setIsSwapping] = useState(false);

  // Error UI states
  const [setupError, setSetupError] = useState(null);
  const [answerError, setAnswerError] = useState(null);

  // Live session telemetry state
  const [sessionId, setSessionId] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [candidateElo, setCandidateElo] = useState(1400);
  const [fatigueState, setFatigueState] = useState(0.0);
  const [fatigueLabel, setFatigueLabel] = useState('stable');
  const [lastQuadrant, setLastQuadrant] = useState(null);
  const [lastModelAnswer, setLastModelAnswer] = useState(null);
  const [timerSec, setTimerSec] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Reveal modal state
  const [revealData, setRevealData] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [reviewDelayActive, setReviewDelayActive] = useState(false);

  useEffect(() => {
    if (showReveal) {
      setReviewDelayActive(true);
      const timer = setTimeout(() => {
        setReviewDelayActive(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showReveal]);

  // Timer runner during live session
  useEffect(() => {
    let interval;
    if (step === 'live' && !submitting && !showReveal) {
      interval = setInterval(() => setTimerSec(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, submitting, showReveal]);

  // Preview Questions Handler
  const handlePreviewQuestions = async () => {
    try {
      setPreviewLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/interview/preview-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleFocus, questionsTotal })
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewQuestions(data.previewQuestions || []);
        setIsPreviewing(true);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Single Slot Preview Regenerate Handler
  const handleRegeneratePreviewSlot = async (slotIdx) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/interview/preview-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleFocus, questionsTotal })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.previewQuestions?.length > 0) {
          const newQ = data.previewQuestions[slotIdx % data.previewQuestions.length];
          setPreviewQuestions(prev => {
            const next = [...prev];
            next[slotIdx] = newQ;
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Regenerate slot error:', err);
    }
  };

  // Start Session handler with preview support
  const handleStartSession = async () => {
    try {
      setSubmitting(true);
      setSetupError(null);
      setAnswerError(null);
      setQuestionSwaps({});

      const token = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

      const res = await fetch(`${backendUrl}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roleFocus,
          questionsTotal,
          evaluationStyle: styleSelect,
          previewedQuestion: previewQuestions[0] || null,
          targetGap: targetGapParam || null
        })
      });

      if (!res.ok) {
        let errorBody = {};
        try { errorBody = await res.json(); } catch (e) { errorBody = { message: await res.text() }; }
        throw new Error(errorBody.message || `Server returned HTTP status ${res.status}`);
      }

      const data = await res.json();

      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setCandidateElo(data.candidateElo || 1400);
      setFatigueState(data.fatigueState || 0.0);
      setFatigueLabel(data.fatigueLabel || 'stable');
      setLastQuadrant(null);
      setLastModelAnswer(null);
      setCurrentQIndex(1);
      setStep('live');
      setTimerSec(0);
    } catch (err) {
      console.error('[DIAGNOSTIC CATCH ERROR]', err);
      setSetupError("We couldn't start your session — please try again, or refresh the page if this persists.");
    } finally {
      setSubmitting(false);
    }
  };

  // Live In-Session Question Swap Handler
  const handleRefreshLiveQuestion = async () => {
    const currentCount = questionSwaps[currentQIndex] || 0;
    if (currentCount >= 2 || isSwapping) return;

    try {
      setIsSwapping(true);
      const token = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

      const res = await fetch(`${backendUrl}/api/interview/refresh-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          currentQuestionId: currentQuestion?.id,
          roleFocus
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.newQuestion) {
          setTimeout(() => {
            setCurrentQuestion(data.newQuestion);
            setQuestionSwaps(prev => ({ ...prev, [currentQIndex]: currentCount + 1 }));
            setIsSwapping(false);
          }, 200);
          return;
        }
      }
    } catch (err) {
      console.error('Refresh live question error:', err);
    }
    setIsSwapping(false);
  };

  // Submit Answer telemetry handler with auto session recovery & UI error state
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    try {
      setSubmitting(true);
      setAnswerError(null);

      const token = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

      let activeSessionId = sessionId;
      if (!activeSessionId) {
        console.warn('[SESSION RECOVERY] Session ID missing, auto-initializing new session');
        const startRes = await fetch(`${backendUrl}/api/interview/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ roleFocus, questionsTotal, evaluationStyle: styleSelect })
        });
        if (startRes.ok) {
          const startData = await startRes.json();
          activeSessionId = startData.sessionId;
          setSessionId(activeSessionId);
        } else {
          throw new Error('Session ID was missing and session initialization failed.');
        }
      }

      const res = await fetch(`${backendUrl}/api/interview/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          questionId: currentQuestion?.id || 1,
          questionText: currentQuestion?.question || currentQuestion?.text || '',
          answerText,
          responseTimeSeconds: Math.max(10, timerSec),
          candidateElo,
          prevFatigueState: fatigueState,
          roleFocus,
          evaluationStyle: styleSelect
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: 'Evaluation error' }));
        throw new Error(errJson.message || 'Failed to evaluate answer');
      }

      const data = await res.json();

      setCandidateElo(data.eloAfter);
      setFatigueState(data.fatigue.fatigueState);
      setFatigueLabel(data.fatigue.label);
      setLastQuadrant(data.quadrant);
      setLastModelAnswer(data.modelAnswer || data.agents?.domain?.model_answer || null);
      setRevealData(data);
      setShowReveal(true);
    } catch (err) {
      console.error('[DIAGNOSTIC ANSWER ERROR]', err);
      setAnswerError(err.message || 'Failed to submit answer for scoring. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = () => {
    setShowReveal(false);
    setAnswerText('');
    setTimerSec(0);
    setAnswerError(null);

    if (revealData?.nextQuestion) {
      setCurrentQuestion(revealData.nextQuestion);
      setCurrentQIndex(prev => prev + 1);
    } else {
      router.push(`/mock-interview/report/${sessionId}`);
    }
  };

  const getFatigueColor = () => {
    if (fatigueState > 0.4) return '#C97B84';
    if (fatigueState < -0.3) return '#8BA888';
    return '#D9A441';
  };

  const currentSwaps = questionSwaps[currentQIndex] || 0;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4">
      
      {/* 4a. SETUP SCREEN */}
      {step === 'setup' && (
        <div className="max-w-3xl mx-auto space-y-8 py-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              SkillMirror Engine Setup
            </span>
            <h1 className="font-serif text-4xl font-bold text-[#2E2A26]">Configure Adaptive Session</h1>
            {targetGapParam && (
              <div className="pt-1 pb-1">
                <span className="text-xs font-semibold text-indigo-900 bg-indigo-100/90 px-3.5 py-1.5 rounded-full border border-indigo-300 inline-flex items-center gap-1.5 shadow-xs font-sans">
                  🎯 Target Gap Pre-selected: <strong className="capitalize">{targetGapParam}</strong> (linked from Resume ATS Studio)
                </span>
              </div>
            )}
            <p className="text-sm text-[#2E2A26]/70 max-w-lg mx-auto font-sans">
              Select your targeted role focus and question length. The SkillMirror multi-agent panel will dynamically adjust Elo difficulty and track latent cognitive fatigue.
            </p>
          </div>

          {/* Setup Cards Grid with High Z-Index so Dropdown Menus Float Above Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-30">
            
            {/* Target Role Focus Custom Select */}
            <BlobPanel accentColor="indigo" className="relative z-10 hover:z-40 focus-within:z-40">
              <span className="text-2xl mb-2 block">🎯</span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26] mb-1">Target Role Focus</h3>
              <p className="text-xs text-[#2E2A26]/70 mb-4">Domain questions tailored to job expectations.</p>
              <Select
                options={ROLE_OPTIONS}
                value={roleFocus}
                onChange={(val) => {
                  setRoleFocus(val);
                  setIsPreviewing(false);
                }}
                accentColor="indigo"
                placeholder="Select role focus..."
              />
            </BlobPanel>

            {/* Session Length Custom Select */}
            <BlobPanel accentColor="amber" className="relative z-10 hover:z-40 focus-within:z-40">
              <span className="text-2xl mb-2 block">⏱️</span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26] mb-1">Session Length</h3>
              <p className="text-xs text-[#2E2A26]/70 mb-4">Number of multi-agent evaluation rounds.</p>
              <Select
                options={LENGTH_OPTIONS}
                value={questionsTotal}
                onChange={setQuestionsTotal}
                accentColor="amber"
                placeholder="Select session length..."
              />
            </BlobPanel>

            {/* Evaluation Style Custom Select */}
            <BlobPanel accentColor="sage" className="relative z-10 hover:z-40 focus-within:z-40">
              <span className="text-2xl mb-2 block">🧠</span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26] mb-1">Evaluation Style</h3>
              <p className="text-xs text-[#2E2A26]/70 mb-4">Multi-signal behavioral & technical rigor.</p>
              <Select
                options={STYLE_OPTIONS}
                value={styleSelect}
                onChange={setStyleSelect}
                accentColor="sage"
                placeholder="Select evaluation style..."
              />
            </BlobPanel>

          </div>

          {/* Question Preview Panel (Expandable Framer Motion BlobPanel) */}
          <AnimatePresence>
            {isPreviewing && previewQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden relative z-20"
              >
                <BlobPanel accentColor="indigo" className="!p-6 bg-white/95 border border-indigo-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Initial Question Preview
                      </span>
                      <h4 className="font-serif font-bold text-lg text-[#2E2A26] mt-0.5">
                        Generated Questions for {roleFocus}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {previewQuestions.length} Questions Ready
                    </span>
                  </div>

                  <div className="space-y-3">
                    {previewQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-100/70 px-2 py-0.5 rounded">
                            Slot {idx + 1} · {q.topic || 'Domain Focus'}
                          </span>
                          <p className="font-serif text-sm font-semibold text-[#2E2A26] leading-snug">
                            "{q.question || q.text}"
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          accentColor="indigo"
                          onClick={() => handleRegeneratePreviewSlot(idx)}
                          className="!py-1.5 !px-3 text-xs font-bold shrink-0 border border-slate-200"
                        >
                          🔄 Regenerate
                        </Button>
                      </div>
                    ))}
                  </div>
                </BlobPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline UI Error Banner State */}
          {setupError && (
            <BlobPanel accentColor="rose" className="!p-4 bg-rose-50/90 border border-rose-200 relative z-20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-rose-900">Session Initialization Issue</h4>
                    <p className="text-xs text-rose-700 font-sans mt-0.5">{setupError}</p>
                  </div>
                </div>
                <Button
                  accentColor="rose"
                  variant="ghost"
                  onClick={handleStartSession}
                  disabled={submitting}
                  className="!py-2 !px-4 text-xs font-bold shrink-0 shadow-xs border border-rose-300"
                >
                  🔄 Try Again
                </Button>
              </div>
            </BlobPanel>
          )}

          {/* Action Buttons Container with z-10 so dropdown menus float over it */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <Button
              variant="ghost"
              accentColor="indigo"
              onClick={handlePreviewQuestions}
              disabled={previewLoading || submitting}
              className="!px-6 !py-3.5 text-xs font-bold border border-slate-300 shadow-xs"
            >
              {previewLoading ? 'Generating Preview...' : '🔄 Preview & Refresh Questions'}
            </Button>

            <Button
              accentColor="indigo"
              onClick={handleStartSession}
              disabled={submitting}
              className="!px-10 !py-4 text-base font-bold shadow-xl"
            >
              {submitting ? 'Initializing Engine...' : '🚀 Start SkillMirror Session'}
            </Button>
          </div>
        </div>
      )}

      {/* 4b. LIVE SESSION VIEW */}
      {step === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2/3): Question Container + Answer Textarea */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Bar Progress */}
            <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A5B8C] animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E2A26]/80">
                  Question {currentQIndex} of {questionsTotal}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2E2A26]/70">
                <span>⏱️ Timer:</span>
                <span className="font-mono text-sm font-bold text-[#4A5B8C]">
                  {Math.floor(timerSec / 60)}:{(timerSec % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Indigo BlobPanel with In-Session Question Refresh Button */}
            <BlobPanel accentColor="indigo" className="p-8 relative">
              
              {/* Question Header & In-Session Refresh Action Button */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-[#4A5B8C]">
                    Topic: {currentQuestion?.topic || 'Domain Focus'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    Rating: {currentQuestion?.difficulty_rating || currentQuestion?.difficultyRating || 1400}
                  </span>
                </div>

                {/* In-Session "Refresh this question" Ghost Button */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    accentColor="indigo"
                    onClick={handleRefreshLiveQuestion}
                    disabled={currentSwaps >= 2 || isSwapping}
                    className="!py-1 !px-2.5 text-[11px] font-bold border border-indigo-200/80 bg-white/90"
                  >
                    {isSwapping ? 'Swapping...' : `🔄 Get a different question (${currentSwaps}/2)`}
                  </Button>

                  {/* Tooltip when refresh limit hit */}
                  {currentSwaps >= 2 && (
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-30 font-sans">
                      No more refreshes for this question slot (max 2)
                    </div>
                  )}
                </div>
              </div>

              {/* Question Text with Smooth 200ms Fade Transition */}
              <motion.div
                animate={{ opacity: isSwapping ? 0.2 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-serif text-2xl font-bold text-[#2E2A26] leading-snug">
                  "{currentQuestion?.question || currentQuestion?.text}"
                </h2>
              </motion.div>
            </BlobPanel>

            {/* Answer Textarea Panel */}
            <BlobPanel accentColor="amber">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E2A26]/80 mb-2">
                Your Answer (Written Telemetry)
              </label>
              <textarea
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  if (answerError) setAnswerError(null);
                }}
                placeholder="Type your structured solution here. Include STAR method milestones, architectural trade-offs, and concrete technical choices..."
                rows={7}
                className="w-full p-4 rounded-xl border border-amber-900/15 bg-white/90 text-sm text-[#2E2A26] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A441] transition-all font-sans leading-relaxed"
              />

              {/* Inline Answer Submission Error Banner */}
              {answerError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{answerError}</span>
                  </div>
                  <Button
                    variant="ghost"
                    accentColor="rose"
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="!py-1 !px-3 text-[11px] font-bold border border-rose-300 shrink-0"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  {answerText.trim().split(/\s+/).filter(Boolean).length} words typed
                </span>
                <Button
                  accentColor="amber"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="!py-2.5 !px-6 text-xs font-bold shadow-md"
                >
                  {submitting ? 'Running Multi-Agent Telemetry...' : '⚡ Submit Answer for Multi-Agent Scoring'}
                </Button>
              </div>
            </BlobPanel>

          </div>

          {/* Right Column (1/3): Real-Time Telemetry Sidebar */}
          <div className="space-y-6">
            <BlobPanel accentColor="sage" className="p-6 space-y-5">
              <h3 className="font-serif font-bold text-lg text-[#2E2A26] border-b border-slate-200/60 pb-3">
                Live Session Telemetry
              </h3>

              {/* Candidate Elo Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Candidate Elo Rating</span>
                  <span className="font-mono text-[#4A5B8C] font-bold">
                    <AnimatedNumber value={candidateElo} />
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8BA888] to-[#4A5B8C] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, ((candidateElo - 1000) / 800) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Latent Cognitive Fatigue */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Latent Cognitive Fatigue</span>
                  <span className="font-mono font-bold uppercase text-[10px]" style={{ color: getFatigueColor() }}>
                    {(fatigueState * 100).toFixed(0)}% ({fatigueLabel})
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(5, Math.abs(fatigueState) * 100))}%`,
                      backgroundColor: getFatigueColor()
                    }}
                  />
                </div>
              </div>

              {/* Last Quadrant Diagnosis */}
              {lastQuadrant && (
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Latest Quadrant</span>
                  <p className="font-serif font-bold text-[#4A5B8C] text-sm">{lastQuadrant.name}</p>
                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{lastQuadrant.diagnosis}</p>
                </div>
              )}

              {/* Latest Submitted Model Answer (Sage-tinted reference panel) */}
              {lastModelAnswer && (
                <div className="p-3.5 bg-[#8BA888]/10 rounded-xl border border-[#8BA888]/30 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#8BA888]/20 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                      <span>✅ Model Answer</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase text-[#4A5B8C] bg-[#4A5B8C]/10 px-1.5 py-0.5 rounded border border-[#4A5B8C]/20">
                      Most Recent
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-sans leading-relaxed font-medium bg-white/90 p-2.5 rounded border border-slate-200/80">
                    {lastModelAnswer}
                  </p>
                </div>
              )}
            </BlobPanel>
          </div>

        </div>
      )}

      {/* REVEAL MODAL */}
      <AnimatePresence>
        {showReveal && revealData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FBF7F0] max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-indigo-900/20 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex justify-between items-start border-b border-indigo-900/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                    Round Evaluation Complete
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">Multi-Agent Telemetry Breakdown</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 block">Elo Rating</span>
                  <span className="font-mono text-xl font-bold text-[#4A5B8C]">
                    <AnimatedNumber value={revealData.eloAfter} />
                  </span>
                </div>
              </div>

              {/* 2x2 Quadrant Result */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classified Quadrant</span>
                <h4 className="font-serif font-bold text-lg text-[#4A5B8C]">{revealData.quadrant.name}</h4>
                <p className="text-xs text-slate-600">{revealData.quadrant.diagnosis}</p>
              </div>

              {/* Agent Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase text-indigo-800">Domain Content Score</span>
                  <span className="font-mono text-2xl font-bold text-[#4A5B8C] block mt-1">{revealData.contentScore}%</span>
                </div>
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold uppercase text-amber-800">Delivery Confidence</span>
                  <span className="font-mono text-2xl font-bold text-[#D9A441] block mt-1">{revealData.deliveryConfidenceScore}%</span>
                </div>
              </div>

              {/* Prominent Model Answer & Benchmark Explanation */}
              <div className="p-5 bg-emerald-50/90 rounded-xl border border-emerald-300/80 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <span>✅ Model Answer & Benchmark Explanation</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    Benchmark Reference
                  </span>
                </div>
                
                <p className="text-xs text-slate-800 font-sans leading-relaxed bg-white/95 p-3.5 rounded-lg border border-emerald-200 shadow-2xs font-medium">
                  {revealData.modelAnswer || revealData.agents?.domain?.model_answer || 'A strong answer clearly addresses the core domain architecture, key technical trade-offs, step-by-step logic, and failure recovery.'}
                </p>

                {/* Covered Points */}
                {(revealData.whatCovered?.length > 0 || revealData.agents?.domain?.what_covered?.length > 0) && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">What your answer covered:</span>
                    <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 font-sans font-medium">
                      {(revealData.whatCovered || revealData.agents?.domain?.what_covered || []).map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missed / Key Improvement Points in Rose-Tinted Box */}
                {(revealData.whatMissed?.length > 0 || revealData.agents?.domain?.missing_points?.length > 0) && (
                  <div className="p-3 bg-rose-50/90 rounded-lg border border-rose-200/90 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-rose-900 flex items-center gap-1.5">
                      <span>⚠️ Key points missed or incomplete:</span>
                    </span>
                    <ul className="list-disc list-inside text-xs text-rose-950 space-y-1 font-sans font-medium">
                      {(revealData.whatMissed || revealData.agents?.domain?.missing_points || []).map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button with 1.5s required review state */}
              <div className="pt-2">
                <Button
                  accentColor="indigo"
                  onClick={handleAdvance}
                  disabled={reviewDelayActive}
                  className={`w-full !py-3.5 font-bold text-sm shadow-md transition-all duration-300 ${
                    reviewDelayActive ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
                  }`}
                >
                  {reviewDelayActive
                    ? '⏳ Reviewing Model Answer...'
                    : (revealData.nextQuestion ? 'Got it, next question →' : 'Got it, view session report →')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function SkillMirrorMockInterviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-serif">Loading Interview Studio...</div>}>
      <MockInterviewContent />
    </Suspense>
  );
}

