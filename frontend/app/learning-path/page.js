'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

const ROLE_OPTIONS = [
  { title: 'Frontend Developer', desc: 'UI Architecture & Web Vitals' },
  { title: 'Backend Developer', desc: 'APIs, Microservices & Databases' },
  { title: 'Full Stack Developer', desc: 'End-to-End Web Applications' },
  { title: 'Data Scientist', desc: 'Modeling & Statistical Analysis' },
  { title: 'Machine Learning Engineer', desc: 'MLOps, Quantization & LLMs' },
  { title: 'DevOps Engineer', desc: 'Kubernetes, CI/CD & Cloud' }
];

const SKILL_OPTIONS = [
  'HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript'
];

export default function LearningPath() {
  const router = useRouter();

  // Selection state
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [currentSkills, setCurrentSkills] = useState(['JavaScript', 'HTML/CSS']);

  // Measured Interview Session Data state
  const [interviewPerf, setInterviewPerf] = useState(null);
  const [loadingPerf, setLoadingPerf] = useState(false);

  // Timeline output & completion tracking states
  const [learningPath, setLearningPath] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [completedMilestones, setCompletedMilestones] = useState({});

  // Fetch candidate interview session data on mount
  useEffect(() => {
    const fetchPerf = async () => {
      try {
        setLoadingPerf(true);
        const token = localStorage.getItem('authToken');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
        const res = await fetch(`${backendUrl}/api/interview/user-sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topicSkills && data.topicSkills.length > 0) {
            const perfMap = {};
            data.topicSkills.forEach(ts => {
              perfMap[ts.topic] = ts.score || ts.mean;
            });
            setInterviewPerf(perfMap);
          }
        }
      } catch (err) {
        console.error('Fetch interview performance error:', err);
      } finally {
        setLoadingPerf(false);
      }
    };
    fetchPerf();
  }, []);

  const toggleSkill = (skill) => {
    setCurrentSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const isFormValid = Boolean(selectedRole) && currentSkills.length > 0;

  // Generate Learning Path Handler
  const generatePath = async () => {
    if (!isFormValid) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRole,
          currentSkills,
          interviewPerformanceData: interviewPerf
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'API execution error' }));
        throw new Error(errJson.error || `HTTP Status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setLearningPath(data);
        // Pre-populate already_mastered milestones as completed so progress bar reflects them
        // UI: user sees them struck-through with ✓ badge — proof the engine reacted to their skills
        const preCompleted = {};
        data.phases?.forEach(phase => {
          phase.milestones?.forEach(ms => {
            if (ms.status === 'already_mastered') {
              preCompleted[ms.id] = true;
            }
          });
        });
        const masteredCount = Object.keys(preCompleted).length;
        setCompletedMilestones(preCompleted);
        console.log(`[LearningPath] CHANGED — pre-populated ${masteredCount} already_mastered milestones as completed`);
      } else {
        throw new Error(data.error || 'Failed to generate timeline');
      }
    } catch (err) {
      console.error('[DIAGNOSTIC ERROR] Learning Path API Error:', err);
      setErrorMsg(err.message || 'Error generating learning timeline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Milestone completion toggle
  const toggleMilestone = (id) => {
    setCompletedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculate total milestones & completion percentage
  const allMilestones = learningPath?.phases?.flatMap(p => p.milestones || []) || [];
  const totalCount = allMilestones.length;
  const completedCount = Object.values(completedMilestones).filter(Boolean).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA888] bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            SkillMirror Career Roadmap Studio
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">Learning Path Timeline</h1>
        </div>
        <Button variant="ghost" accentColor="sage" onClick={() => router.back()} className="!py-1.5 !px-4 !text-xs font-bold border border-slate-300">
          ← Back
        </Button>
      </div>

      {/* SETUP / SELECTION VIEW */}
      {!learningPath ? (
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Interview Performance Data Alert Banner */}
          {interviewPerf ? (
            <BlobPanel accentColor="indigo" className="p-4 bg-indigo-50/90 border border-indigo-200">
              <div className="flex items-center gap-3 text-xs text-indigo-950 font-sans">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold font-serif text-sm text-indigo-900">Real Interview Performance Data Active</h4>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Your generated roadmap will automatically weight measured topic weaknesses from your recent SkillMirror Engine mock interviews.
                  </p>
                </div>
              </div>
            </BlobPanel>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-sans">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Complete a SkillMirror mock interview session for a performance-calibrated roadmap.</span>
              </div>
              <Button
                variant="ghost"
                accentColor="amber"
                onClick={() => router.push('/mock-interview')}
                className="!py-1 !px-3 text-[11px] font-bold border border-amber-300 shrink-0"
              >
                Start Mock Session →
              </Button>
            </div>
          )}

          {/* 1. SELECT TARGET ROLE CARDS */}
          <BlobPanel accentColor="sage" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 1
                </span>
                <h2 className="font-serif text-xl font-bold text-[#2E2A26] mt-0.5">Target Career Role</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Select 1 Role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map(r => {
                const isSelected = selectedRole === r.title;
                // ISSUE 1 FIX — Typography: role title text-xs→text-base font-bold, desc text-[10px]→text-sm
                // font 10px→16px on title (text-xs=10px, text-base=16px), line-height ~1.4
                // card min-h not changed: existing p-4 flex-col gives sufficient room for 2 lines at 16px
                const titleClass = 'font-serif font-bold text-base text-[#2E2A26]';
                const descClass  = 'text-sm text-slate-500 mt-2 font-sans';
                if (r.title === 'Frontend Developer') {
                  console.log('[LearningPath] CHANGED — Role card className check →', {
                    titleClass,
                    descClass,
                    isSelected
                  });
                }
                return (
                  <div
                    key={r.title}
                    onClick={() => setSelectedRole(r.title)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={titleClass}>{r.title}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className={descClass}>{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </BlobPanel>

          {/* 2. CURRENT MASTERY SKILLS SELECTION CARDS */}
          <BlobPanel accentColor="amber" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Step 2
                </span>
                <h2 className="font-serif text-xl font-bold text-[#2E2A26] mt-0.5">Current Mastered Skills</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {currentSkills.length} Skills Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SKILL_OPTIONS.map(s => {
                const isChecked = currentSkills.includes(s);
                // ISSUE 1 FIX — Skill chip: text-xs→text-sm font-semibold
                // font 12px→14px (text-xs=12px, text-sm=14px), line-height 1.4 → 1 line fits in p-3
                // min-h unchanged: p-3 = 24px padding + 14px*1.4≈20px text = 44px total, ≥ original
                const chipClass = `p-3 rounded-xl cursor-pointer transition-all duration-200 border text-sm font-semibold flex items-center justify-between ${
                  isChecked
                    ? 'border-amber-400 bg-amber-50/90 text-amber-950 shadow-xs ring-2 ring-amber-400/20 font-bold'
                    : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50'
                }`;
                if (s === 'HTML/CSS') {
                  console.log('[LearningPath] CHANGED — Skill chip className check →', chipClass);
                }
                return (
                  <div
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={chipClass}
                  >
                    <span className="truncate">{s}</span>
                    {isChecked && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ml-1">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </BlobPanel>

          {/* Inline Diagnostic Error Banner */}
          {errorMsg && (
            <BlobPanel accentColor="rose" className="!p-4 bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between gap-4 text-xs text-rose-800 font-medium">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
                <Button variant="ghost" accentColor="rose" onClick={generatePath} className="!py-1 !px-3 text-[11px] font-bold border border-rose-300">
                  🔄 Try Again
                </Button>
              </div>
            </BlobPanel>
          )}

          {/* Validation & Submit Button */}
          <div className="space-y-2 text-center">
            {!isFormValid && (
              <p className="text-xs text-amber-700 font-medium">
                ⚠️ Please select a target role and check at least 1 mastered skill to generate your roadmap.
              </p>
            )}

            <Button
              accentColor="sage"
              onClick={generatePath}
              disabled={isGenerating || !isFormValid}
              className="w-full !py-4 text-base font-bold shadow-xl"
            >
              {isGenerating ? 'Synthesizing Connected-Node Roadmap...' : '🚀 Generate Learning Timeline'}
            </Button>
          </div>

        </div>
      ) : (

        /* ROADMAP OUTPUT VIEW */
        <div className="space-y-8">
          
          {/* Header Progress Bar & Roadmap Meta */}
          <BlobPanel accentColor="indigo" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  Personalized Connected Roadmap
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">{learningPath.role} Learning Path</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">Estimated Duration: {learningPath.estimatedDuration || '3-5 months'}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Overall Completion</span>
                  <span className="font-mono text-2xl font-bold text-[#4A5B8C]">
                    <AnimatedNumber value={progressPercent} />%
                  </span>
                </div>

                <Button
                  variant="ghost"
                  accentColor="sage"
                  onClick={() => setLearningPath(null)}
                  className="!py-2 !px-4 text-xs font-bold border border-slate-300 shadow-xs"
                >
                  🔄 Re-configure Path
                </Button>
              </div>
            </div>

            {/* Watercolor Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Milestones Completed: {completedCount} of {totalCount}</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D9A441] via-[#4A5B8C] to-[#8BA888] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </BlobPanel>

          {/* 3-PHASE VISUAL TIMELINE GRID */}
          <div className="space-y-8">
            {learningPath.phases?.map((phase, pIdx) => {
              const phaseAccents = { 1: 'amber', 2: 'indigo', 3: 'sage' };
              const accentKey = phaseAccents[phase.phaseId] || 'sage';

              return (
                <BlobPanel key={phase.phaseId || pIdx} accentColor={accentKey} className="p-8 space-y-6">
                  
                  {/* Phase Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-slate-200 bg-white">
                        Phase {phase.phaseId || pIdx + 1}
                      </span>
                      <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">{phase.name}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white/90 px-3 py-1 rounded-full border border-slate-200">
                      ⏱️ {phase.duration}
                    </span>
                  </div>

                  {/* Phase Milestones Grid */}
                  <div className="space-y-4">
                    {phase.milestones?.map((ms, mIdx) => {
                      // v2: milestones carry status:'already_mastered'|'required'
                      const isAlreadyMastered = ms.status === 'already_mastered';
                      const isDone = Boolean(completedMilestones[ms.id || `m_${pIdx}_${mIdx}`]);

                      // ── ALREADY_MASTERED card — special visual treatment ────────────────
                      if (isAlreadyMastered) {
                        return (
                          <div
                            key={ms.id || mIdx}
                            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 opacity-80 space-y-2"
                          >
                            <div className="flex items-center gap-3">
                              {/* Green solid checkmark — not a checkbox, already done */}
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                                ✓
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-bold text-sm text-slate-500 line-through">
                                  {ms.title}
                                </h4>
                                {/* Proof badge: engine reacted to skill selection */}
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                  ✓ Already mastered — skipped by engine
                                </span>
                              </div>
                              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shrink-0">
                                0 weeks
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // ── REQUIRED card — normal render ──────────────────────────────────
                      return (
                        <div
                          key={ms.id || mIdx}
                          className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 ${
                            isDone
                              ? 'bg-emerald-50/60 border-emerald-300 opacity-90 shadow-2xs'
                              : 'bg-white/95 border-slate-200 shadow-xs hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            
                            <div className="flex items-center gap-3">
                              {/* Completion Checkbox */}
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleMilestone(ms.id || `m_${pIdx}_${mIdx}`)}
                                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />

                              <div>
                                <h4 className={`font-serif font-bold text-base ${isDone ? 'line-through text-slate-500' : 'text-[#2E2A26]'}`}>
                                  {ms.title}
                                </h4>
                                {ms.isInterviewFlagged && (
                                  <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300 inline-block mt-0.5">
                                    🎯 Flagged from your interview performance data
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                                ⏱️ {ms.timeInvestment || '2 weeks'}
                              </span>

                              {/* Platform Bridge Retest Button for Flagged Topics */}
                              {ms.isInterviewFlagged && (
                                <Button
                                  variant="ghost"
                                  accentColor="indigo"
                                  onClick={() => {
                                    const gap = encodeURIComponent(ms.title);
                                    const role = encodeURIComponent(learningPath.role);
                                    router.push(`/mock-interview?targetGap=${gap}&roleFocus=${role}`);
                                  }}
                                  className="!py-1 !px-2.5 text-[11px] font-bold border border-indigo-300"
                                >
                                  🚀 Retest this skill →
                                </Button>
                              )}
                            </div>

                          </div>

                          {/* Curated Resources — type-aware icons: ▶ video, 📺 playlist, 🔗 doc, 🎮 interactive */}
                          {ms.resources && ms.resources.length > 0 && (() => {
                            // Normalise: extract label, href, isExternal, type regardless of data source
                            const normalised = ms.resources.map(r => {
                              if (typeof r === 'string') return { label: r, href: null, isExternal: false, type: 'doc' };
                              return {
                                label:      String(r.label || ''),
                                href:       r.url && r.url !== '#' ? String(r.url) : null,
                                isExternal: Boolean(r.isExternal),
                                type:       r.type || 'doc'
                              };
                            });

                            // Icon + label suffix per resource type
                            const getChipMeta = (type) => {
                              if (type === 'video')       return { icon: '▶', suffix: ' · YouTube', chipCls: 'border-red-200 bg-red-50/50 text-red-800 hover:bg-red-100 hover:border-red-300' };
                              if (type === 'playlist')    return { icon: '📺', suffix: ' · Playlist', chipCls: 'border-rose-200 bg-rose-50/50 text-rose-800 hover:bg-rose-100 hover:border-rose-300' };
                              if (type === 'interactive') return { icon: '🎮', suffix: '', chipCls: 'border-violet-200 bg-violet-50/50 text-violet-800 hover:bg-violet-100 hover:border-violet-300' };
                              return { icon: '🔗', suffix: '', chipCls: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300' };
                            };

                            return (
                              <div className="text-xs space-y-1 font-sans">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">📚 Curated Learning Resources:</span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {normalised.map((res, rIdx) => {
                                    const { icon, suffix, chipCls } = getChipMeta(res.type);
                                    const baseChipCls = `px-2.5 py-1 rounded-lg border text-[11px] transition-colors duration-150 inline-flex items-center gap-1 font-medium ${chipCls}`;

                                    if (!res.href) {
                                      // No URL — plain chip (e.g. string-only resource from Gemini)
                                      return (
                                        <span key={rIdx} className={baseChipCls}>
                                          {icon} {res.label}{suffix}
                                        </span>
                                      );
                                    }
                                    if (res.isExternal) {
                                      return (
                                        <a key={rIdx} href={res.href} target="_blank" rel="noopener noreferrer" className={baseChipCls}>
                                          {icon} {res.label}{suffix} <span className="text-[9px] opacity-50">↗</span>
                                        </a>
                                      );
                                    }
                                    // Internal route (e.g. /code-explainer)
                                    return (
                                      <a key={rIdx} href={res.href} className={baseChipCls}>
                                        {icon} {res.label}{suffix}
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}


                        </div>
                      );
                    })}
                  </div>

                </BlobPanel>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
