'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

// ----------------------------------------------------
// WIDGET 1: Interactive Elo Live Calculator
// ----------------------------------------------------
function InteractiveEloWidget() {
  const [candRating, setCandRating] = useState(1200);
  const [qDifficulty, setQDifficulty] = useState(1350);
  const [answerScore, setAnswerScore] = useState(80);

  const expected = 1 / (1 + Math.pow(10, (qDifficulty - candRating) / 400));
  const score = answerScore / 100;
  const delta = Math.round(32 * (score - expected));
  const newRating = candRating + delta;

  return (
    <div className="mt-4 p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
            Interactive Mini-Demo
          </span>
          <h4 className="font-serif font-bold text-sm text-[#2E2A26] mt-0.5">Live Elo Formula Calculator</h4>
        </div>

        {/* Live Result Badge */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs font-mono">
          <span className="text-slate-500 text-[11px]">New Rating:</span>
          <span className="font-bold text-sm text-purple-950">
            <AnimatedNumber value={newRating} />
          </span>
          <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${delta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {delta >= 0 ? `+${delta}` : delta}
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
            <span>Candidate Elo</span>
            <span className="font-mono font-bold text-purple-900">{candRating}</span>
          </div>
          <input
            type="range"
            min="800"
            max="1800"
            step="10"
            value={candRating}
            onChange={(e) => setCandRating(Number(e.target.value))}
            className="w-full accent-purple-700 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
            <span>Question Difficulty</span>
            <span className="font-mono font-bold text-purple-900">{qDifficulty}</span>
          </div>
          <input
            type="range"
            min="800"
            max="1800"
            step="10"
            value={qDifficulty}
            onChange={(e) => setQDifficulty(Number(e.target.value))}
            className="w-full accent-purple-700 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
            <span>Your Answer Score</span>
            <span className="font-mono font-bold text-purple-900">{answerScore}/100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={answerScore}
            onChange={(e) => setAnswerScore(Number(e.target.value))}
            className="w-full accent-purple-700 cursor-pointer"
          />
        </div>
      </div>

      <p className="text-[11px] italic text-slate-500 text-center">
        Try it — drag sliders to see real-time Elo math respond.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// WIDGET 2: Interactive Latent Fatigue Scaffolding
// ----------------------------------------------------
function InteractiveFatigueWidget() {
  const [fatigue, setFatigue] = useState(0.25);
  const isThresholdCrossed = fatigue > 0.4;
  const initialDiff = 1450;
  const currentDiff = isThresholdCrossed ? 1300 : initialDiff;

  return (
    <div className="mt-4 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
            Interactive Mini-Demo
          </span>
          <h4 className="font-serif font-bold text-sm text-[#2E2A26] mt-0.5">Latent Fatigue Scaffolding Trigger</h4>
        </div>

        {/* Animated Badge */}
        <motion.div
          animate={{
            scale: isThresholdCrossed ? [1, 1.03, 1] : 1,
            backgroundColor: isThresholdCrossed ? '#FEF3C7' : '#ECFDF5'
          }}
          transition={{ duration: 0.3 }}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-[11px] font-bold ${
            isThresholdCrossed ? 'border-amber-400 text-amber-950 shadow-xs' : 'border-emerald-300 text-emerald-900'
          }`}
        >
          <span>{isThresholdCrossed ? '⚡ Scaffolded Down ~150pts' : '✓ Normal Difficulty'}</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
            Rating: {currentDiff}
          </span>
        </motion.div>
      </div>

      {/* Hesitation Slider */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Hesitation & Cognitive Load Level:</span>
          <span className="font-mono text-amber-900">{(fatigue).toFixed(2)} (Threshold: 0.40)</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={fatigue}
            onChange={(e) => setFatigue(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          {/* Threshold line */}
          <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-rose-400/70 pointer-events-none" />
        </div>
      </div>

      <p className="text-[11px] italic text-slate-500 text-center">
        Try it — drag past 0.4 threshold to observe automatic scaffolding.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// WIDGET 3: Interactive 2x2 Quadrant Map
// ----------------------------------------------------
function InteractiveQuadrantWidget() {
  const [content, setContent] = useState(70);
  const [delivery, setDelivery] = useState(40);

  const getQuadrant = () => {
    if (content >= 50 && delivery >= 50) {
      return { title: 'Interview-Ready', desc: 'High Technical Depth & High Delivery Confidence', color: 'bg-emerald-50 text-emerald-950 border-emerald-400', accent: '#8BA888' };
    }
    if (content >= 50 && delivery < 50) {
      return { title: 'Articulation Gap', desc: 'Strong Technical Knowledge, Needs Speech & Confidence Support', color: 'bg-amber-50 text-amber-950 border-amber-400', accent: '#D9A441' };
    }
    if (content < 50 && delivery >= 50) {
      return { title: 'Overconfident Zone', desc: 'Fluent Delivery, Needs Technical Accuracy & Evidence', color: 'bg-indigo-50 text-indigo-950 border-indigo-400', accent: '#4A5B8C' };
    }
    return { title: 'Impostor Zone', desc: 'Requires Foundation Scaffolding in Both Content & Confidence', color: 'bg-rose-50 text-rose-950 border-rose-400', accent: '#E06D53' };
  };

  const currentQuad = getQuadrant();

  return (
    <div className="mt-4 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Interactive Mini-Demo
          </span>
          <h4 className="font-serif font-bold text-sm text-[#2E2A26] mt-0.5">Live 2×2 Quadrant Classifier</h4>
        </div>

        {/* Live Quadrant Badge */}
        <motion.div
          key={currentQuad.title}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-3 py-1.5 rounded-xl border font-bold text-xs shadow-2xs ${currentQuad.color}`}
        >
          Zone: {currentQuad.title}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Interactive 2D Coordinate Grid */}
        <div className="relative w-64 h-64 mx-auto bg-white rounded-2xl border-2 border-slate-300 p-2 shadow-inner overflow-hidden flex flex-col justify-between">
          
          {/* 4 Quadrants Background Fills */}
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full rounded-xl overflow-hidden text-[9px] font-bold text-slate-400">
            
            {/* Top-Left: Overconfident */}
            <div className={`p-1.5 border-r border-b border-slate-200 transition-colors ${content < 50 && delivery >= 50 ? 'bg-indigo-100/80 text-indigo-900 font-extrabold' : 'bg-slate-50/40'}`}>
              Overconfident
            </div>

            {/* Top-Right: Interview-Ready */}
            <div className={`p-1.5 border-b border-slate-200 transition-colors ${content >= 50 && delivery >= 50 ? 'bg-emerald-100/80 text-emerald-900 font-extrabold' : 'bg-slate-50/40'}`}>
              Interview-Ready
            </div>

            {/* Bottom-Left: Impostor Zone */}
            <div className={`p-1.5 border-r border-slate-200 transition-colors ${content < 50 && delivery < 50 ? 'bg-rose-100/80 text-rose-900 font-extrabold' : 'bg-slate-50/40'}`}>
              Impostor Zone
            </div>

            {/* Bottom-Right: Articulation Gap */}
            <div className={`p-1.5 transition-colors ${content >= 50 && delivery < 50 ? 'bg-amber-100/80 text-amber-900 font-extrabold' : 'bg-slate-50/40'}`}>
              Articulation Gap
            </div>

          </div>

          {/* Draggable Point Marker */}
          <motion.div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${content}%`,
              bottom: `${delivery}%`,
              backgroundColor: currentQuad.accent
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">Content (X) →</span>
          <span className="absolute top-2 left-1 text-[9px] font-mono text-slate-400">Delivery (Y) ↑</span>
        </div>

        {/* Sliders Control */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Content Correctness (X-Axis):</span>
              <span className="font-mono text-indigo-900">{content}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={content}
              onChange={(e) => setContent(Number(e.target.value))}
              className="w-full accent-indigo-700 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Delivery Confidence (Y-Axis):</span>
              <span className="font-mono text-indigo-900">{delivery}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={delivery}
              onChange={(e) => setDelivery(Number(e.target.value))}
              className="w-full accent-indigo-700 cursor-pointer"
            />
          </div>

          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-indigo-100">
            <strong>Active Classification:</strong> {currentQuad.desc}
          </p>
        </div>

      </div>

      <p className="text-[11px] italic text-slate-500 text-center">
        Try it — move dot or drag sliders to see real-time 2×2 quadrant classification.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// WIDGET 4: Interactive Bell-Curve Percentile Calculator
// ----------------------------------------------------
function InteractivePercentileWidget() {
  const [score, setScore] = useState(78);

  // Logistic percentile estimation
  const percentile = Math.min(99, Math.max(1, Math.round(100 / (1 + Math.exp(-0.08 * (score - 50))))));

  return (
    <div className="mt-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
            Interactive Mini-Demo
          </span>
          <h4 className="font-serif font-bold text-sm text-[#2E2A26] mt-0.5">Reference Population Percentile Calculator</h4>
        </div>

        {/* Readout */}
        <div className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 font-mono text-[11px] font-bold text-emerald-950 shadow-2xs">
          Score: {score}/100 → Rank: <span className="text-emerald-700 text-xs">{percentile}th Percentile</span>
        </div>
      </div>

      {/* Mini SVG Bell Curve */}
      <div className="relative w-full h-24 bg-white rounded-xl border border-emerald-200 p-2 overflow-hidden">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path
            d="M 0 38 Q 25 38 40 15 Q 50 2 60 15 Q 75 38 100 38 L 100 40 L 0 40 Z"
            fill="#D1FAE5"
            stroke="#10B981"
            strokeWidth="1.5"
          />
          {/* Draggable Score Marker Line */}
          <line
            x1={score}
            y1="0"
            x2={score}
            y2="40"
            stroke="#047857"
            strokeWidth="2.5"
            strokeDasharray="2,2"
          />
        </svg>
      </div>

      {/* Score Slider */}
      <div className="space-y-1 max-w-md mx-auto">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Candidate Evaluation Score:</span>
          <span className="font-mono text-emerald-900">{score} Points</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-emerald-700 cursor-pointer"
        />
      </div>

      <p className="text-[11px] italic text-slate-500 text-center">
        Try it — slide score to trace percentile position on reference distribution.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// WIDGET 5: Interactive 3-Agent Pulse Diagram (NEW)
// ----------------------------------------------------
function InteractiveMultiAgentWidget() {
  const [activeAgent, setActiveAgent] = useState('domain');

  const agents = {
    domain: { name: 'Domain Examiner', weight: '40% Weight', desc: 'Evaluates technical correctness, DSA complexity bounds, and system architecture choices.' },
    behavioral: { name: 'Behavioral Assessor', weight: '30% Weight', desc: 'Analyzes STAR structure, clarity of communication, and leadership indicators.' },
    adversarial: { name: 'Adversarial Examiner', weight: '30% Weight', desc: 'Probes edge cases, unhandled input risks, and potential memory overflow vulnerabilities.' }
  };

  return (
    <div className="mt-4 p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-4 text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
            Interactive Mini-Demo
          </span>
          <h4 className="font-serif font-bold text-sm text-[#2E2A26] mt-0.5">Multi-Agent Triangulation Architecture</h4>
        </div>

        <span className="text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-purple-200">
          3 Agents → 1 Weighted Consensus
        </span>
      </div>

      {/* 3 Node Diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(agents).map(([key, item]) => {
          const isSelected = activeAgent === key;
          return (
            <div
              key={key}
              onClick={() => setActiveAgent(key)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-400/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold font-serif text-xs">{item.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {item.weight}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Agent Inspector Card */}
      <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs space-y-1">
        <span className="font-bold text-purple-900 uppercase tracking-wider text-[10px] block">
          Agent Inspection: {agents[activeAgent].name} ({agents[activeAgent].weight})
        </span>
        <p className="text-slate-700 leading-relaxed font-sans">
          {agents[activeAgent].desc}
        </p>
      </div>

      <p className="text-[11px] italic text-slate-500 text-center">
        Try it — click agent nodes to inspect multi-agent weighting.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// MAIN COMMUNITY PAGE COMPONENT
// ----------------------------------------------------
export default function Community() {
  const [activeTab, setActiveTab] = useState('insights');
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const userStats = {
    contentPercentile: 78,
    deliveryPercentile: 82,
    communityAvg: 50
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B5876] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            SkillMirror Community Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">Community Insights & Peer Benchmarks</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3 border-b border-slate-200/60 pb-3">
        {[
          { id: 'insights', label: '📊 Community Insights', accent: 'plum' },
          { id: 'faqs', label: '💬 FAQs & Interactive Mechanics', accent: 'indigo' }
        ].map(t => (
          <Button
            key={t.id}
            variant={activeTab === t.id ? 'primary' : 'ghost'}
            accentColor={t.accent}
            onClick={() => setActiveTab(t.id)}
            className="!py-2.5 !px-5 !text-xs font-bold shadow-xs"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* TAB 1: COMMUNITY INSIGHTS */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* SECTION 1: AGGREGATE BENCHMARKS */}
          <BlobPanel accentColor="plum" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  Reference Population Data
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#2E2A26] mt-1">
                  Aggregate Candidate Benchmarks
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                🔒 Anonymized Synthetic Reference Population
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Average Candidate Elo
                </span>
                <div className="font-mono text-3xl font-bold text-[#6B5876]">
                  <AnimatedNumber value={1340} />
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  📈 +140 pts avg growth over 3 sessions
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Most Common Growth Area
                </span>
                <span className="font-serif font-bold text-sm text-[#2E2A26] block">
                  System Design Tradeoffs
                </span>
                <p className="text-[11px] text-slate-600 font-medium">
                  🎯 Flagged in 42% of initial candidate runs
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Most Improved Quadrant Shift
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Articulation Gap
                  </span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Interview-Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                  68% transformation rate with scaffolding
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Mean Fatigue Threshold
                </span>
                <div className="font-mono text-2xl font-bold text-amber-800">
                  Question #3.4
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  ⚡ Point where hesitation density peaks
                </p>
              </div>
            </div>
          </BlobPanel>

          {/* SECTION 2: TOP PATTERNS */}
          <BlobPanel accentColor="indigo" className="p-6 space-y-4">
            <div className="border-b border-slate-200/80 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                Pattern Analysis
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2E2A26] mt-1">
                Common Interview Landscape Question Patterns
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <h4 className="font-serif font-bold text-sm text-[#2E2A26]">Tradeoff Reasoning Over Syntax</h4>
                </div>
                <p className="text-slate-700 leading-relaxed pl-6">
                  <strong>40% of System Design & Backend questions</strong> test explicit tradeoff reasoning (e.g. CAP theorem compromises, caching invalidation limits) rather than memorized architecture schemas.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">📊</span>
                  <h4 className="font-serif font-bold text-sm text-[#2E2A26]">STAR Framework Impact</h4>
                </div>
                <p className="text-slate-700 leading-relaxed pl-6">
                  Behavioral answers utilizing structured <strong>Situation-Task-Action-Result</strong> framing score on average <strong>+24% higher on Content Depth</strong> in multi-agent evaluations.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧠</span>
                  <h4 className="font-serif font-bold text-sm text-[#2E2A26]">Fatigue Recovery Micro-Pauses</h4>
                </div>
                <p className="text-slate-700 leading-relaxed pl-6">
                  Candidates taking a 5-second deliberate pause before answering high-difficulty questions show <strong>35% lower hesitation density</strong> during multi-turn interviews.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <h4 className="font-serif font-bold text-sm text-[#2E2A26]">Quantified Resume Evidence</h4>
                </div>
                <p className="text-slate-700 leading-relaxed pl-6">
                  Candidates who tie quantified metrics (e.g., <em>"reduced latency by 30%"</em>) directly to live interview answers rank consistently in the <strong>top 15th percentile</strong> of candidate pools.
                </p>
              </div>
            </div>
          </BlobPanel>

          {/* SECTION 3: PEER COMPARISON */}
          <BlobPanel accentColor="indigo" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  Performance Calibration
                </span>
                <h2 className="font-serif text-xl font-bold text-[#2E2A26] mt-1">
                  You vs. Community Reference Population
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Calibrated against 1,000+ simulated candidates</span>
            </div>

            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#2E2A26]">
                  <span>Content Depth & Technical Accuracy</span>
                  <span className="font-mono text-[#4A5B8C]">You: {userStats.contentPercentile}th Percentile (Community Avg: {userStats.communityAvg}th)</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#4A5B8C] w-24 shrink-0">Your Score</span>
                    <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div
                        className="h-full bg-[#4A5B8C] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${userStats.contentPercentile}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-[#4A5B8C] w-12 text-right">{userStats.contentPercentile}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-500 w-24 shrink-0">Community Avg</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-slate-400/60 rounded-full" style={{ width: `${userStats.communityAvg}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-12 text-right">{userStats.communityAvg}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#2E2A26]">
                  <span>Delivery Confidence & Articulation</span>
                  <span className="font-mono text-[#4A5B8C]">You: {userStats.deliveryPercentile}th Percentile (Community Avg: {userStats.communityAvg}th)</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#4A5B8C] w-24 shrink-0">Your Score</span>
                    <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div
                        className="h-full bg-[#8BA888] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${userStats.deliveryPercentile}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-[#8BA888] w-12 text-right">{userStats.deliveryPercentile}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-500 w-24 shrink-0">Community Avg</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-slate-400/60 rounded-full" style={{ width: `${userStats.communityAvg}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-12 text-right">{userStats.communityAvg}%</span>
                  </div>
                </div>
              </div>
            </div>
          </BlobPanel>

          {/* SECTION 4: MENTOR MATCH TEASER */}
          <BlobPanel accentColor="plum" className="p-6 bg-purple-900/5 border border-purple-300 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-300">
                  Platform Vision Roadmap
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26]">
                  🔮 Coming Soon: Mentor Match
                </h3>
                <p className="text-xs text-[#2E2A26]/80 max-w-xl font-sans leading-relaxed">
                  Connect practicing candidates directly with verified alumni and senior engineering mentors based on your weakest Skill-Map topic. Receive 1-on-1 code reviews and real mock interview feedback.
                </p>
              </div>

              <Button
                accentColor="plum"
                onClick={() => setJoinedWaitlist(true)}
                disabled={joinedWaitlist}
                className="!py-3 !px-6 text-xs font-bold shrink-0 shadow-lg"
              >
                {joinedWaitlist ? "✓ You're on the Waitlist!" : "✨ Join the Mentor Match Waitlist"}
              </Button>
            </div>
          </BlobPanel>
        </motion.div>
      )}

      {/* TAB 2: FAQS & INTERACTIVE MECHANICS */}
      {activeTab === 'faqs' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <BlobPanel accentColor="plum" className="p-6 space-y-8">
            <div className="border-b border-slate-200/80 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                System Mechanics
              </span>
              <h2 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">
                Interactive Technical Engine Mechanics
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Drag the interactive sliders and controls inside each card to verify SkillMirror's mathematical mechanics in real time.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* Card 1: Elo Rating */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-2 shadow-2xs">
                <p className="font-bold text-[#6B5876] font-serif text-base">Q: How does the SkillMirror Elo Rating work?</p>
                <p className="text-slate-700 leading-relaxed font-sans">
                  SkillMirror uses standard Elo rating updates ($K=32$ factor). When you answer a question, your performance score is evaluated against the target question difficulty rating. High accuracy against difficult questions yields larger Elo gains.
                </p>
                <InteractiveEloWidget />
              </div>

              {/* Card 2: Latent Fatigue Scaffolding */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-2 shadow-2xs">
                <p className="font-bold text-[#6B5876] font-serif text-base">Q: What is Latent Fatigue Scaffolding?</p>
                <p className="text-slate-700 leading-relaxed font-sans">
                  When cognitive load &amp; hesitation density rise (&gt;0.4 threshold) over consecutive questions, SkillMirror scaffolds difficulty DOWN by ~150 points for the next question to help candidates recover momentum and composure.
                </p>
                <InteractiveFatigueWidget />
              </div>

              {/* Card 3: 2x2 Candidate Quadrant */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-2 shadow-2xs">
                <p className="font-bold text-[#6B5876] font-serif text-base">Q: How is the 2×2 Candidate Quadrant calculated?</p>
                <p className="text-slate-700 leading-relaxed font-sans">
                  Content correctness and delivery confidence are plotted on a 50-threshold 2D axis yielding 4 zones: Impostor Zone, Articulation Gap, Overconfident, and Interview-Ready.
                </p>
                <InteractiveQuadrantWidget />
              </div>

              {/* Card 4: Percentile Benchmarks */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-2 shadow-2xs">
                <p className="font-bold text-[#6B5876] font-serif text-base">Q: How are Percentile Benchmarks calculated?</p>
                <p className="text-slate-700 leading-relaxed font-sans">
                  Your content depth and delivery confidence are benchmarked against a calibrated reference population of 1,000+ candidate evaluations across technical domains.
                </p>
                <InteractivePercentileWidget />
              </div>

              {/* Card 5: Multi-Agent Architecture (NEW) */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 text-xs space-y-2 shadow-2xs">
                <p className="font-bold text-[#6B5876] font-serif text-base">Q: How is this different from a single ChatGPT call?</p>
                <p className="text-slate-700 leading-relaxed font-sans">
                  Most AI interview tools make one LLM request per answer. SkillMirror runs three specialized agents per answer (Domain Examiner, Behavioral Assessor, Adversarial Cross-Examiner), combines their outputs with a deterministic weighting formula, and layers Elo, fatigue tracking, and quadrant classification on top — all independently verifiable, not a single opaque score.
                </p>
                <InteractiveMultiAgentWidget />
              </div>

            </div>
          </BlobPanel>
        </motion.div>
      )}

    </div>
  );
}
