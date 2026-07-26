'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript / TypeScript', description: 'V8, Event Loop & Promises' },
  { value: 'python', label: 'Python 3', description: 'GIL, Iterators & List Comprehensions' },
  { value: 'java', label: 'Java', description: 'JVM Memory & Thread Pools' },
  { value: 'cpp', label: 'C++', description: 'Pointers, RAII & STL Containers' },
  { value: 'go', label: 'Go (Golang)', description: 'Goroutines & Channels' },
  { value: 'rust', label: 'Rust', description: 'Borrow Checker & Ownership' }
];

const DEPTH_OPTIONS = [
  { value: 'beginner', label: 'Beginner (Conceptual)', description: 'Line-by-line focus, simple analogies' },
  { value: 'intermediate', label: 'Intermediate (Balanced)', description: 'Balanced walkthrough & Big-O' },
  { value: 'advanced', label: 'Advanced (Memory & Big-O)', description: 'Deep Big-O proofs & optimizations' }
];

export default function CodeExplainer() {
  const router = useRouter();
  const resultsRef = useRef(null);

  // Input State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('intermediate');

  // Diagnostic Output States
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Advanced Mode States: Optimization Diff & Execution Trace Debugger
  const [optimizedData, setOptimizedData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const [traceData, setTraceData] = useState(null);
  const [isTracing, setIsTracing] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Main Explain Handler
  const handleExplain = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setExplanation(null);
    setShowDiff(false);
    setShowTrace(false);

    try {
      const explainController = new AbortController();
      const explainTimeout = setTimeout(() => explainController.abort(), 12000);
      const response = await fetch('/api/code-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: explainController.signal,
        body: JSON.stringify({
          code: code.trim(),
          language,
          difficulty,
          action: 'explain'
        })
      });
      clearTimeout(explainTimeout);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'API execution error' }));
        throw new Error(errJson.error || `HTTP Status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setExplanation(data);
        // Smooth auto-scroll down to the top of the results grid
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        throw new Error(data.error || 'Failed to analyze code');
      }
    } catch (err) {
      console.error('[DIAGNOSTIC ERROR] Code Explainer API Error:', err);
      setErrorMsg(err.message || 'Error analyzing code snippet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Side-by-Side Optimization Diff
  const handleFetchOptimization = async () => {
    if (showDiff) {
      setShowDiff(false);
      return;
    }
    if (optimizedData) {
      setShowDiff(true);
      return;
    }

    try {
      setIsOptimizing(true);
      const optController = new AbortController();
      const optTimeout = setTimeout(() => optController.abort(), 12000);
      const res = await fetch('/api/code-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: optController.signal,
        body: JSON.stringify({ code, language, difficulty, action: 'optimize' })
      });
      clearTimeout(optTimeout);
      if (res.ok) {
        const data = await res.json();
        setOptimizedData(data);
        setShowDiff(true);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Fetch Visual Execution Trace Debugger
  const handleFetchTrace = async () => {
    if (showTrace) {
      setShowTrace(false);
      return;
    }
    if (traceData) {
      setShowTrace(true);
      return;
    }

    try {
      setIsTracing(true);
      const traceController = new AbortController();
      const traceTimeout = setTimeout(() => traceController.abort(), 12000);
      const res = await fetch('/api/code-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: traceController.signal,
        body: JSON.stringify({ code, language, difficulty, action: 'trace' })
      });
      clearTimeout(traceTimeout);
      if (res.ok) {
        const data = await res.json();
        setTraceData(data);
        setActiveStepIndex(0);
        setShowTrace(true);
      }
    } catch (err) {
      console.error('Trace error:', err);
    } finally {
      setIsTracing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA888] bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            SkillMirror Technical Learning Studio
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">Code Explainer Studio</h1>
        </div>
        <Button variant="ghost" accentColor="sage" onClick={() => router.back()} className="!py-1.5 !px-4 !text-xs font-bold border border-slate-300">
          ← Back
        </Button>
      </div>

      {/* COMPACT TOP INPUT CARD */}
      <div className="max-w-4xl mx-auto">
        <BlobPanel accentColor="sage" className="p-6 space-y-5">
          
          {/* Language & Depth Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Programming Language
              </label>
              <Select
                options={LANGUAGE_OPTIONS}
                value={language}
                onChange={setLanguage}
                accentColor="sage"
                placeholder="Select language..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Analysis Depth Level
              </label>
              <Select
                options={DEPTH_OPTIONS}
                value={difficulty}
                onChange={setDifficulty}
                accentColor="sage"
                placeholder="Select depth level..."
              />
            </div>
          </div>

          {/* Code Textarea & Compact Integrated Sample Snippet Chips */}
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E2A26]/80">
                Source Code Snippet
              </label>

              {/* Sample Snippet Chips Integrated Header */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-slate-400">Samples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('javascript');
                    setCode(`function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`);
                  }}
                  className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  Binary Search (JS)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('python');
                    setCode(`def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`);
                  }}
                  className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  Two Sum (Python)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('javascript');
                    setCode(`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`);
                  }}
                  className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 font-mono text-[10px] transition-colors"
                >
                  Recursive Fib
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setErrorMsg(null); }}
              placeholder="// Paste your algorithm or function snippet here..."
              rows={8}
              className="w-full p-4 rounded-xl border border-sage-900/15 bg-white/95 font-mono text-xs text-[#2E2A26] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-all leading-relaxed max-h-64 overflow-y-auto"
            />
          </div>

          {/* Diagnostic Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 font-medium">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
              <Button variant="ghost" accentColor="rose" onClick={handleExplain} className="!py-1 !px-3 text-[11px] font-bold border border-rose-300">
                🔄 Try Again
              </Button>
            </div>
          )}

          {/* Main Generate Button */}
          <Button
            accentColor="sage"
            onClick={handleExplain}
            disabled={isLoading || !code.trim()}
            className="w-full !py-3.5 font-bold text-sm shadow-md"
          >
            {isLoading ? 'Running Multi-Panel AI Compiler Analysis...' : '✨ Generate AI Breakdown'}
          </Button>

        </BlobPanel>
      </div>

      {/* LOADING INDICATOR */}
      {isLoading && (
        <div className="max-w-4xl mx-auto pt-6">
          <BlobPanel accentColor="indigo" className="p-8 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#4A5B8C] border-t-transparent animate-spin mx-auto mb-3"></div>
            <h3 className="font-serif font-bold text-base text-[#2E2A26]">Deconstructing Code Logic...</h3>
            <p className="text-xs text-slate-500 mt-1">Analyzing syntax trees, Big-O complexity bounds, and potential runtime bug risks.</p>
          </BlobPanel>
        </div>
      )}

      {/* FULL-WIDTH RESPONSIVE 2-COLUMN BENTO RESULTS GRID */}
      {explanation && (
        <div ref={resultsRef} className="space-y-6 pt-4 border-t border-slate-200/80">
          
          {/* Code Overview Bar & Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 p-4 rounded-xl border border-indigo-200 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                Code Overview ({difficulty} depth)
              </span>
              <p className="text-xs text-[#2E2A26] font-sans mt-1 leading-relaxed">
                {explanation.overview}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                accentColor="sage"
                onClick={handleFetchOptimization}
                disabled={isOptimizing}
                className="!py-1.5 !px-3 text-xs font-bold border border-slate-300 shadow-xs"
              >
                {isOptimizing ? 'Generating Diff...' : showDiff ? 'Hide Optimized Diff' : '✨ Show Optimized Code Diff'}
              </Button>

              <Button
                variant="ghost"
                accentColor="amber"
                onClick={handleFetchTrace}
                disabled={isTracing}
                className="!py-1.5 !px-3 text-xs font-bold border border-slate-300 shadow-xs"
              >
                {isTracing ? 'Generating Trace...' : showTrace ? 'Hide Debugger Trace' : '🔍 Trace Execution'}
              </Button>
            </div>
          </div>

          {/* SIDE-BY-SIDE OPTIMIZATION DIFF VIEW (EXPANDABLE) */}
          <AnimatePresence>
            {showDiff && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <BlobPanel accentColor="sage" className="!p-5 bg-white space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-[#2E2A26]">Side-by-Side Optimization Comparison</h4>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      AI Refactored
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Original Code</span>
                      <pre className="p-3 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-700 overflow-x-auto border border-slate-200 leading-relaxed max-h-60">
                        {code}
                      </pre>
                    </div>

                    {/* Optimized */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">Optimized Version</span>
                      <pre className="p-3 bg-emerald-50/70 rounded-xl text-[11px] font-mono text-emerald-950 overflow-x-auto border border-emerald-300 leading-relaxed font-bold max-h-60">
                        {optimizedData?.optimized_code || '// Generating optimized version...'}
                      </pre>
                    </div>
                  </div>

                  {optimizedData?.explanation && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                      💡 <strong>Optimization Insight:</strong> {optimizedData.explanation}
                    </p>
                  )}
                </BlobPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VISUAL EXECUTION TRACE DEBUGGER VIEW (EXPANDABLE) */}
          <AnimatePresence>
            {showTrace && traceData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <BlobPanel accentColor="amber" className="!p-5 bg-white space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Interactive Step Debugger
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#2E2A26] mt-0.5">Execution Step-Through</h4>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{traceData.sample_input}</span>
                  </div>

                  {/* Step Tabs Navigation */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {traceData.steps?.map((stepItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                          activeStepIndex === idx
                            ? 'bg-[#D9A441] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Step {stepItem.step_number}
                      </button>
                    ))}
                  </div>

                  {/* Active Step Content with Framer Motion Transition */}
                  {traceData.steps?.[activeStepIndex] && (
                    <motion.div
                      key={activeStepIndex}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-amber-950 border-b border-amber-200/80 pb-2">
                        <span>Step {traceData.steps[activeStepIndex].step_number} Execution</span>
                        <span className="font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                          Line #{traceData.steps[activeStepIndex].line_number || activeStepIndex + 1}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {traceData.steps[activeStepIndex].description}
                      </p>

                      {/* Variable State Table */}
                      {traceData.steps[activeStepIndex].variables_state && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Variable Memory State</span>
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs font-mono">
                            <div className="grid grid-cols-2 bg-slate-100 p-2 font-bold text-[11px] text-slate-600 border-b border-slate-200">
                              <span>Variable</span>
                              <span>Current Value</span>
                            </div>
                            {Object.entries(traceData.steps[activeStepIndex].variables_state).map(([k, v], vIdx) => (
                              <div key={vIdx} className="grid grid-cols-2 p-2 border-b border-slate-100 last:border-b-0 text-slate-800">
                                <span className="text-indigo-900 font-semibold">{k}</span>
                                <span className="text-slate-700">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </BlobPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESPONSIVE 2-COLUMN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* PANEL A: LINE-BY-LINE WALKTHROUGH (SPANS FULL 2 COLUMNS FOR READABILITY) */}
            {explanation.line_by_line?.length > 0 && (
              <div className="lg:col-span-2">
                <BlobPanel accentColor="indigo" className="!p-5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                    Panel A · Line-by-Line Walkthrough
                  </span>
                  <h4 className="font-serif font-bold text-lg text-[#2E2A26]">Annotated Code Reading</h4>

                  <div className="space-y-3">
                    {explanation.line_by_line.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white/90 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#4A5B8C] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.line_range || `Block ${idx + 1}`}
                          </span>
                        </div>
                        {item.code_snippet && (
                          <pre className="p-2 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto">
                            {item.code_snippet}
                          </pre>
                        )}
                        <p className="text-slate-700 font-sans leading-relaxed pt-0.5">
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </BlobPanel>
              </div>
            )}

            {/* PANEL B: COMPLEXITY ANALYSIS (LEFT COLUMN 1 - TIGHT PADDING) */}
            {explanation.complexity && (
              <div className="lg:col-span-1">
                <BlobPanel accentColor="amber" className="!p-5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                    Panel B · Algorithmic Complexity Analysis
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#2E2A26]">Big-O Performance Bounds</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{explanation.complexity.justification}</p>
                    </div>
                    <div className="bg-[#D9A441] text-white px-3.5 py-1.5 rounded-xl text-center shrink-0 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider block opacity-90">Time Bound</span>
                      <span className="font-mono text-lg font-bold">{explanation.complexity.big_o || 'O(n)'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">Time Complexity</span>
                      <span className="font-mono font-bold text-amber-900 text-xs">{explanation.complexity.time_complexity}</span>
                    </div>
                    <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">Space Complexity</span>
                      <span className="font-mono font-bold text-amber-900 text-xs">{explanation.complexity.space_complexity}</span>
                    </div>
                  </div>
                </BlobPanel>
              </div>
            )}

            {/* PANEL C: BUGS & RISK FLAGS (RIGHT COLUMN 2 - SAME ROW AS PANEL B) */}
            <div className="lg:col-span-1">
              <BlobPanel accentColor={explanation.bugs_or_risks?.length > 0 ? "rose" : "sage"} className="!p-5 space-y-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                  explanation.bugs_or_risks?.length > 0 ? "text-rose-900 bg-rose-50 border-rose-200" : "text-emerald-900 bg-emerald-50 border-emerald-200"
                }`}>
                  Panel C · Bugs & Risk Flags
                </span>

                {explanation.bugs_or_risks?.length > 0 ? (
                  <div className="space-y-2">
                    {explanation.bugs_or_risks.map((bug, idx) => (
                      <div key={idx} className="p-3 bg-rose-50/90 rounded-xl border border-rose-200 flex items-start gap-3 text-xs">
                        <span className="text-lg shrink-0">⚠️</span>
                        <div>
                          <h5 className="font-bold text-rose-950 font-serif">{bug.title || 'Runtime Risk'}</h5>
                          <p className="text-rose-800 font-sans leading-relaxed mt-0.5">{bug.description || bug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 font-semibold">
                    <span className="text-lg">✓</span>
                    <span>No obvious bugs, memory leaks, or unhandled exceptions detected in this snippet.</span>
                  </div>
                )}
              </BlobPanel>
            </div>

            {/* PANEL D: OPTIMIZATION SUGGESTIONS (SPANS FULL 2 COLUMNS BELOW B/C) */}
            {explanation.optimization_suggestions?.length > 0 && (
              <div className="lg:col-span-2">
                <BlobPanel accentColor="sage" className="!p-5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Panel D · Actionable Optimization Suggestions
                  </span>
                  <div className="space-y-2">
                    {explanation.optimization_suggestions.map((sug, idx) => (
                      <div key={idx} className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">#{idx + 1}</span>
                        <span className="leading-relaxed font-sans">{sug}</span>
                      </div>
                    ))}
                  </div>
                </BlobPanel>
              </div>
            )}

            {/* INTERVIEW ENGINE PLATFORM BRIDGE CROSS-LINK (SPANS FULL 2 COLUMNS LAST) */}
            <div className="lg:col-span-2">
              <BlobPanel accentColor="indigo" className="p-6 bg-indigo-900/5 border border-indigo-300 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-300">
                      SkillMirror Platform Bridge
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#2E2A26] mt-1">
                      Practice This Code Pattern in a Mock Interview
                    </h4>
                    <p className="text-xs text-[#2E2A26]/80 max-w-md font-sans leading-relaxed mt-0.5">
                      Complexity and edge-case questions for <strong className="capitalize">{language}</strong> code come up frequently in technical interviews. Test your verbal explanation skills in an adaptive session.
                    </p>
                  </div>

                  <Button
                    accentColor="indigo"
                    onClick={() => {
                      const role = encodeURIComponent(explanation.recommended_role || 'Software Engineer');
                      router.push(`/mock-interview?roleFocus=${role}`);
                    }}
                    className="!py-3 !px-6 text-xs font-bold shrink-0 shadow-lg"
                  >
                    🚀 Practice in Mock Interview →
                  </Button>
                </div>
              </BlobPanel>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
