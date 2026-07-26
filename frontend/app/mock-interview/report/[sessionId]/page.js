'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block ml-1.5 align-middle">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 text-xs focus:outline-none cursor-pointer"
        title="Click or hover for information"
      >
        ℹ️
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-slate-900/95 text-white text-[11px] rounded-xl shadow-xl z-30 font-sans leading-relaxed pointer-events-none border border-slate-700">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  );
}

function renderDynamicMemoryGraph(memoryGraph) {
  const nodes = memoryGraph?.nodes || [];
  const edges = memoryGraph?.edges || [];
  const note = memoryGraph?.note;

  if (nodes.length === 0) {
    return (
      <div className="h-56 w-full rounded-xl bg-white/70 border border-slate-200 p-4 flex flex-col items-center justify-center text-slate-500 text-xs font-sans">
        <span>No topic nodes generated for this session yet.</span>
      </div>
    );
  }

  const nodeCoords = {};
  const count = nodes.length;

  nodes.forEach((node, idx) => {
    let x, y;
    if (count === 1) {
      x = 200;
      y = 100;
    } else if (count === 2) {
      x = idx === 0 ? 120 : 280;
      y = 100;
    } else if (count === 3) {
      const coords = [
        { x: 120, y: 140 },
        { x: 200, y: 60 },
        { x: 280, y: 140 }
      ];
      x = coords[idx].x;
      y = coords[idx].y;
    } else {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const rx = 130;
      const ry = 60;
      x = 200 + rx * Math.cos(angle);
      y = 100 + ry * Math.sin(angle);
    }
    nodeCoords[node.id] = { x, y };
  });

  return (
    <div className="space-y-2">
      <div className="h-56 w-full rounded-xl bg-white/70 border border-slate-200 p-4 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Dynamic Edges */}
          {edges.map((edge, i) => {
            const src = nodeCoords[edge.source];
            const tgt = nodeCoords[edge.target];
            if (!src || !tgt) return null;
            return (
              <g key={i}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#4A5B8C"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                />
              </g>
            );
          })}

          {/* Dynamic Nodes */}
          {nodes.map((node) => {
            const pos = nodeCoords[node.id];
            if (!pos) return null;

            let color = '#8BA888';
            if (node.score < 50) color = '#C97B84';
            else if (node.score < 70) color = '#D9A441';

            return (
              <g key={node.id} transform={`translate(${pos.x},${pos.y})`}>
                <circle r="22" fill={color} className="shadow-md" />
                <text textAnchor="middle" dy="-2" fill="white" fontSize="8" fontWeight="bold">
                  {node.label.length > 10 ? `${node.label.slice(0, 8)}..` : node.label}
                </text>
                <text textAnchor="middle" dy="9" fill="white" fontSize="8" fontWeight="600">
                  {node.score}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {note && (
        <div className="text-center text-[11px] font-medium text-slate-600 bg-slate-100/90 py-1.5 px-3 rounded-lg border border-slate-200/80">
          ℹ️ {note}
        </div>
      )}
    </div>
  );
}

export default function SkillMirrorReportPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // What-If state
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [whatIfType, setWhatIfType] = useState('add_star_structure');
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);

  // Full Session Review Card Expansion State
  const [expandedCards, setExpandedCards] = useState({});
  const [lowestAnsId, setLowestAnsId] = useState(null);

  useEffect(() => {
    if (reportData?.rawAnswers?.length > 0) {
      const answers = reportData.rawAnswers;
      const sorted = [...answers].sort((a, b) => (a.content_score ?? 0) - (b.content_score ?? 0));
      const lowestId = sorted[0]?.id;
      setLowestAnsId(lowestId);
      if (lowestId) {
        setExpandedCards({ [lowestId]: true });
      }
    }
  }, [reportData]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

      const res = await fetch(`${backendUrl}/api/interview/report/${sessionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Failed to load session report telemetry');
      const data = await res.json();
      setReportData(data);
      if (data.rawAnswers?.length > 0) {
        setSelectedQuestion(data.rawAnswers[0]);
      }
    } catch (err) {
      setError(err.message || 'Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const handleRunWhatIf = async (modificationType) => {
    if (!selectedQuestion) return;
    try {
      setWhatIfLoading(true);
      setWhatIfType(modificationType);
      const authToken = localStorage.getItem('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

      const res = await fetch(`${backendUrl}/api/interview/what-if`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          questionText: selectedQuestion.question_text,
          originalAnswer: selectedQuestion.answer_text,
          modificationType,
          originalContentScore: selectedQuestion.content_score,
          originalConfidenceScore: selectedQuestion.delivery_confidence_score
        })
      });
      if (!res.ok) throw new Error('Failed to run What-If replay');
      const data = await res.json();
      setWhatIfResult(data);
    } catch (err) {
      console.error('What-If error:', err);
    } finally {
      setWhatIfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#4A5B8C] border-t-transparent animate-spin mx-auto"></div>
        <h2 className="font-serif text-2xl font-bold text-[#2E2A26]">Synthesizing Multi-Signal Telemetry...</h2>
        <p className="text-xs text-[#2E2A26]/60">Computing Elo ratings, Beta CIs, attribution waterfall, and memory graph edges.</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <BlobPanel accentColor="rose" className="text-center py-8">
          <h3 className="font-serif text-xl font-bold text-[#C97B84]">Report Error</h3>
          <p className="text-xs text-slate-600 my-2">{error || 'Could not find requested report.'}</p>
          <Button accentColor="rose" onClick={() => router.push('/mock-interview')}>Return to Session Setup</Button>
        </BlobPanel>
      </div>
    );
  }

  const { summary, trajectory, topicSkills, attribution, percentiles, memoryGraph, coachingSummary, rawAnswers } = reportData;

  // Safely extract string or fallback text from primitives or objects
  const safeText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      if (typeof val.overall_assessment === 'string') return val.overall_assessment;
      if (typeof val.text === 'string') return val.text;
      return JSON.stringify(val);
    }
    return String(val);
  };

  let coachingObj = null;
  if (typeof coachingSummary === 'object' && coachingSummary !== null) {
    coachingObj = coachingSummary;
  } else if (typeof coachingSummary === 'string') {
    try {
      const p = JSON.parse(coachingSummary);
      if (typeof p === 'object' && p !== null) coachingObj = p;
    } catch (e) {}
  }

  const overallAssessment = safeText(coachingObj?.overall_assessment || coachingSummary);
  const biggestStrength = safeText(coachingObj?.biggest_strength);
  const improvementArea = safeText(coachingObj?.improvement_area || coachingObj?.growth_edge);
  const nextStep = safeText(coachingObj?.next_step);

  return (
    <div className="space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8BA888] bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            Session Benchmark Complete
          </span>
          <h1 className="font-serif text-4xl font-bold text-[#2E2A26] mt-2">
            SkillMirror Evaluation Report
          </h1>
          <p className="text-sm text-[#2E2A26]/70 mt-1">
            Role: <span className="font-semibold text-[#4A5B8C]">{reportData.session?.role_focus || 'Software Engineer'}</span> | Session ID: #{sessionId}
          </p>
        </div>
        <div className="flex gap-3">
          <Button accentColor="indigo" onClick={() => setShowWhatIf(true)} className="shadow-md">
            🔮 Explore What-If Counterfactual Replay
          </Button>
          <Button variant="ghost" accentColor="indigo" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>

      {/* Top Benchmark Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BlobPanel accentColor="indigo">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Content Correctness</span>
          <div className="text-3xl font-serif font-bold text-[#4A5B8C] mt-1">
            <AnimatedNumber value={summary.avgContentScore} suffix=" / 100" />
          </div>
          <span className="text-[11px] font-semibold text-[#4A5B8C] mt-1 block">
            Top {100 - (summary.percentiles?.contentPercentile || 50)}% Percentile
          </span>
        </BlobPanel>

        <BlobPanel accentColor="amber">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Delivery Confidence</span>
          <div className="text-3xl font-serif font-bold text-[#D9A441] mt-1">
            <AnimatedNumber value={summary.avgDeliveryConfidenceScore} suffix=" / 100" />
          </div>
          <span className="text-[11px] font-semibold text-[#D9A441] mt-1 block">
            Top {100 - (summary.percentiles?.deliveryPercentile || 50)}% Percentile
          </span>
        </BlobPanel>

        <BlobPanel accentColor="sage">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Final Candidate Elo</span>
          <div className="text-3xl font-serif font-bold text-[#8BA888] mt-1">
            <AnimatedNumber value={summary.finalElo} suffix=" ELO" />
          </div>
          <span className="text-[11px] font-semibold text-[#8BA888] mt-1 block">
            Adaptive Difficulty Benchmark
          </span>
        </BlobPanel>

        <BlobPanel accentColor={summary.finalQuadrant.accent}>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quadrant Zone</span>
          <div className="text-lg font-serif font-bold mt-1" style={{ color: summary.finalQuadrant.colorHex }}>
            {summary.finalQuadrant.name}
          </div>
          <span className="text-[10px] text-slate-600 mt-1 block leading-snug">
            {summary.finalQuadrant.diagnosis}
          </span>
        </BlobPanel>
      </div>

      {/* 4c-1: Trajectory Chart (Recharts AreaChart with watercolor gradients) */}
      <BlobPanel accentColor="indigo" className="p-6">
        <h3 className="font-serif font-bold text-xl text-[#2E2A26] mb-4">
          📈 Performance Trajectory Across Questions
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorContent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A5B8C" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4A5B8C" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D9A441" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#D9A441" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="questionIndex" tickLine={false} label={{ value: 'Question Number', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FBF7F0', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
              <Area type="monotone" dataKey="contentScore" name="Content Score" stroke="#4A5B8C" strokeWidth={3} fillOpacity={1} fill="url(#colorContent)" />
              <Area type="monotone" dataKey="deliveryConfidenceScore" name="Delivery Confidence" stroke="#D9A441" strokeWidth={3} fillOpacity={1} fill="url(#colorDelivery)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BlobPanel>

      {/* 4c-2: Quadrant Map & Skill Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2x2 Quadrant Map */}
        <BlobPanel accentColor="amber" className="p-6">
          <h3 className="font-serif font-bold text-xl text-[#2E2A26] mb-2">
            🎯 Confidence-Competence Quadrant Map
          </h3>
          <p className="text-xs text-slate-600 mb-4">Plotted answers classified by content vs delivery confidence (Threshold 50).</p>
          
          <div className="grid grid-cols-2 gap-3 h-64 relative bg-white/60 p-3 rounded-xl border border-slate-200">
            
            {/* Top-Left: Articulation Gap */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#D9A441] uppercase">Articulation Gap</span>
              <p className="text-[10px] text-slate-600">High Content / Low Delivery</p>
            </div>

            {/* Top-Right: Interview-Ready */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#8BA888] uppercase">Interview-Ready</span>
              <p className="text-[10px] text-slate-600">High Content / High Delivery</p>
            </div>

            {/* Bottom-Left: Foundational Gap */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#6B5876] uppercase">Foundational Gap</span>
              <p className="text-[10px] text-slate-600">Low Content / Low Delivery</p>
            </div>

            {/* Bottom-Right: False-Confidence Risk */}
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#C97B84] uppercase">False-Confidence Risk</span>
              <p className="text-[10px] text-slate-600">Low Content / High Delivery</p>
            </div>

            {/* Plotted Dots */}
            {trajectory.map((t, idx) => {
              const leftPercent = Math.min(90, Math.max(10, t.deliveryConfidenceScore));
              const bottomPercent = Math.min(90, Math.max(10, t.contentScore));
              return (
                <div
                  key={idx}
                  title={`Q${t.questionIndex}: ${t.quadrant}`}
                  className="absolute w-6 h-6 rounded-full bg-[#4A5B8C] text-white text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125"
                  style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                >
                  Q{t.questionIndex}
                </div>
              );
            })}
          </div>
        </BlobPanel>

        {/* Skill Distribution Panel with 95% CIs */}
        <BlobPanel accentColor="sage" className="p-6 space-y-4">
          <h3 className="font-serif font-bold text-xl text-[#2E2A26]">
            📊 Bayesian Skill Distribution (Beta 95% CI)
          </h3>
          <p className="text-xs text-slate-600">Estimated skill mean with Bayesian confidence interval bands per topic.</p>

          <div className="space-y-4">
            {topicSkills.map((sk, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#2E2A26]">{sk.topic}</span>
                  <span className="font-mono text-[#8BA888]">{sk.mean}% [{sk.ciLow}% - {sk.ciHigh}%]</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 relative overflow-hidden">
                  <div
                    className="h-full bg-[#8BA888] rounded-full transition-all duration-500"
                    style={{ width: `${sk.mean}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 bg-[#4A5B8C]/30 border-l border-r border-[#4A5B8C]"
                    style={{ left: `${sk.ciLow}%`, width: `${sk.ciHigh - sk.ciLow}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BlobPanel>

      </div>

      {/* 4c-3: Attribution Waterfall & Memory Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attribution Waterfall */}
        <BlobPanel accentColor="plum" className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif font-bold text-xl text-[#2E2A26] flex items-center">
              <span>🌊 Score Attribution Waterfall</span>
              <InfoTooltip text="This shows exactly how your final score was built, step by step — starting from a neutral baseline of 50, then adding or subtracting points for each factor our AI examiners detected in your weakest answer. It's full transparency: no black-box scoring." />
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-3 font-sans leading-relaxed">
            This shows exactly how your final score was built, step by step — starting from a neutral baseline of 50, then adding or subtracting points for each factor our AI examiners detected in your weakest answer. It's full transparency: no black-box scoring.
          </p>

          {attribution?.questionText && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-0.5">
                Breakdown for lowest-scoring answer:
              </span>
              <p className="text-slate-800 italic font-sans font-medium line-clamp-2">
                "{attribution.questionText}"
              </p>
            </div>
          )}

          <div className="space-y-2">
            {attribution?.waterfall?.map((step, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/80 border border-slate-200 text-xs shadow-2xs">
                <span className="font-medium text-[#2E2A26]">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold ${step.delta >= 0 ? 'text-[#8BA888]' : 'text-[#C97B84]'}`}>
                    {step.delta >= 0 ? `+${step.delta}` : step.delta}
                  </span>
                  <span className="font-mono text-slate-500 font-semibold w-12 text-right">
                    = {step.running_total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </BlobPanel>

        {/* Dynamic Topic Memory Graph */}
        <BlobPanel accentColor="indigo" className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif font-bold text-xl text-[#2E2A26] flex items-center">
              <span>🕸️ Topic Memory Graph</span>
              <InfoTooltip text="Each circle is a topic covered in this session. A connecting line means one topic is a prerequisite for another — for example, a weak score in Databases can predict difficulty with System Design questions later, since System Design builds on database concepts. Use this to see which foundational gaps might be holding back your performance in more advanced topics." />
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4 font-sans leading-relaxed">
            Each circle is a topic covered in this session. A connecting line means one topic is a prerequisite for another — for example, a weak score in Databases can predict difficulty with System Design questions later, since System Design builds on database concepts. Use this to see which foundational gaps might be holding back your performance in more advanced topics.
          </p>

          {renderDynamicMemoryGraph(memoryGraph)}
        </BlobPanel>

      </div>

      {/* 4c-4: Full Session Review — Question by Question */}
      <BlobPanel accentColor="indigo" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200/80">
              Complete Question Breakdown
            </span>
            <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1 flex items-center">
              <span>📋 Full Session Review — Question by Question</span>
              <InfoTooltip text="Detailed side-by-side AI answer key, key points covered/missed, and specific delivery feedback for every question answered in your session." />
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-sans font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {rawAnswers?.length || 0} Questions Evaluated
          </span>
        </div>

        {/* Expandable Question Cards List */}
        <div className="space-y-4">
          {rawAnswers?.map((ans, idx) => {
            const isExpanded = expandedCards[ans.id] ?? false;
            const contentScore = ans.content_score ?? 0;
            const deliveryScore = ans.delivery_confidence_score ?? 0;
            const qName = ans.quadrant || 'Foundational Gap';

            let badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            if (qName.includes('Articulation')) badgeBg = 'bg-amber-50 border-amber-200 text-amber-900';
            else if (qName.includes('False-Confidence')) badgeBg = 'bg-rose-50 border-rose-200 text-rose-900';
            else if (qName.includes('Foundational')) badgeBg = 'bg-purple-50 border-purple-200 text-purple-900';

            return (
              <div
                key={ans.id || idx}
                className="rounded-2xl border border-slate-200 bg-white/90 shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Card Header (Always Visible) */}
                <div
                  onClick={() => toggleCard(ans.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100/80 text-[#4A5B8C] font-mono font-bold text-xs flex items-center justify-center border border-indigo-200/60">
                      Q{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {ans.topicLabel || ans.topic || 'TECHNICAL'}
                        </span>
                        {ans.id === lowestAnsId && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                            Lowest Score
                          </span>
                        )}
                      </div>
                      <p className={`font-serif text-sm font-semibold text-[#2E2A26] ${!isExpanded ? 'truncate' : ''}`}>
                        {ans.question_text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className={`px-3 py-1 rounded-xl border text-xs font-mono font-semibold ${badgeBg}`}>
                      <span>Content {contentScore}%</span>
                      <span className="mx-1 text-slate-300">|</span>
                      <span>Delivery {deliveryScore}%</span>
                      <span className="mx-1 text-slate-300">|</span>
                      <span className="font-sans font-bold text-[11px]">{qName}</span>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700 text-sm transition-transform font-bold"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Card Body (Visible when expanded) */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/50 space-y-5">
                    
                    {/* Side-by-Side (Desktop) / Stacked (Mobile) Answers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Your Answer */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1.5 font-mono">
                          🗣️ Your Answer
                        </span>
                        <p className="text-xs text-slate-800 font-sans leading-relaxed font-normal whitespace-pre-wrap">
                          "{ans.answer_text}"
                        </p>
                      </div>

                      {/* Model Answer */}
                      <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200/90 shadow-2xs space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block border-b border-emerald-200/60 pb-1.5 font-mono">
                          ✅ Model Answer
                        </span>
                        <p className="text-xs text-slate-800 font-sans leading-relaxed font-medium bg-white/90 p-3 rounded-lg border border-emerald-200/50">
                          {ans.model_answer || 'A strong answer clearly addresses the core domain architecture, key technical trade-offs, step-by-step logic, and failure recovery.'}
                        </p>
                      </div>
                    </div>

                    {/* What you covered & What you missed */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Covered Points */}
                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1 font-mono">
                          <span>✅ What your answer covered:</span>
                        </span>
                        {(ans.what_covered?.length > 0) ? (
                          <ul className="space-y-1.5">
                            {ans.what_covered.map((pt, i) => (
                              <li key={i} className="text-xs text-emerald-950 font-sans flex items-start gap-1.5 font-medium">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic font-sans">No key rubric points were fully addressed in this response.</p>
                        )}
                      </div>

                      {/* Missed Points */}
                      <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1 font-mono">
                          <span>🚩 Key points missed or incomplete:</span>
                        </span>
                        {(ans.what_missed?.length > 0) ? (
                          <ul className="space-y-1.5">
                            {ans.what_missed.map((pt, i) => (
                              <li key={i} className="text-xs text-rose-950 font-sans flex items-start gap-1.5 font-medium">
                                <span className="text-rose-600 font-bold">🚩</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-emerald-800 font-medium font-sans">Full key points coverage achieved on this question!</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Notes */}
                    {ans.delivery_notes && (
                      <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
                          🎙️ Delivery & Tone Notes
                        </span>
                        <p className="font-sans leading-relaxed text-amber-950 font-medium">
                          {ans.delivery_notes}
                        </p>
                      </div>
                    )}

                    {/* Practice Button */}
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        accentColor="indigo"
                        onClick={() => router.push(`/mock-interview?role=${encodeURIComponent(session?.role_focus || 'Software Engineer')}&targetGap=${encodeURIComponent(ans.topic || 'technical')}`)}
                        className="!py-2 !px-4 !text-xs font-semibold"
                      >
                        🔄 Practice {ans.topicLabel || ans.topic || 'this topic'} again →
                      </Button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BlobPanel>

      {/* Upgraded Executive AI Evaluation Synthesis Card */}
      <BlobPanel accentColor="sage" className="p-6 space-y-5">
        <div className="border-b border-slate-200/80 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded border border-emerald-200 font-mono">
            Personalized Examiner Synthesis
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">
            🤖 Executive AI Evaluation Synthesis
          </h3>
        </div>

        {/* Overall Assessment Summary */}
        <div className="p-4 rounded-xl bg-white/90 border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Overall Executive Assessment</span>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
            {overallAssessment}
          </p>
        </div>

        {/* Structured 3-Card Assessment Blocks */}
        {(biggestStrength || improvementArea || nextStep) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            
            {/* Strongest Moment */}
            {biggestStrength && (
              <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200/90 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 font-mono">
                  <span>💪 Your Strongest Moment</span>
                </span>
                <p className="text-xs text-emerald-950 font-sans leading-relaxed font-medium">
                  {biggestStrength}
                </p>
              </div>
            )}

            {/* Growth Edge */}
            {improvementArea && (
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-mono">
                  <span>🎯 Your Growth Edge</span>
                </span>
                <p className="text-xs text-amber-950 font-sans leading-relaxed font-medium">
                  {improvementArea}
                </p>
              </div>
            )}

            {/* Recommended Next Step */}
            {nextStep && (
              <div className="p-4 rounded-xl bg-indigo-50/90 border border-indigo-200/90 space-y-2 shadow-2xs flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 font-mono">
                    <span>▶️ Recommended Next Step</span>
                  </span>
                  <p className="text-xs text-indigo-950 font-sans leading-relaxed font-medium">
                    {nextStep}
                  </p>
                </div>

                <Button
                  accentColor="indigo"
                  onClick={() => router.push(`/mock-interview?role=${encodeURIComponent(reportData?.session?.role_focus || 'Software Engineer')}`)}
                  className="w-full !py-2 !text-xs font-bold mt-2 shadow-2xs"
                >
                  Launch Target Focus Session →
                </Button>
              </div>
            )}

          </div>
        )}
      </BlobPanel>

      {/* 4d. WHAT-IF COUNTERFACTUAL REPLAY MODAL / VIEW */}
      <AnimatePresence>
        {showWhatIf && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <BlobPanel accentColor="indigo" className="p-6 space-y-6">
                
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#4A5B8C] uppercase tracking-wider">SkillMirror Engine Replay</span>
                    <h3 className="font-serif text-2xl font-bold text-[#2E2A26]">What-If Counterfactual Simulator</h3>
                  </div>
                  <button onClick={() => setShowWhatIf(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
                </div>

                {/* Select Question */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Select Question to Re-simulate
                  </label>
                  <div className="space-y-2">
                    {rawAnswers?.map((ans, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedQuestion(ans)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedQuestion?.id === ans.id
                            ? 'border-[#4A5B8C] bg-indigo-50/60 font-semibold'
                            : 'border-slate-200 bg-white/60 hover:bg-white'
                        }`}
                      >
                        <p className="text-xs text-[#2E2A26]">Q{i+1}: {ans.question_text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Three Modification Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Apply Single Target Improvement
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { type: 'add_star_structure', label: '⭐ Add STAR Structure', accent: 'sage' },
                      { type: 'reduce_hedging', label: '🎯 Reduce Hedging & Filler', accent: 'indigo' },
                      { type: 'add_specificity', label: '📊 Add Concrete Specificity', accent: 'amber' }
                    ].map((mod) => (
                      <Button
                        key={mod.type}
                        variant={whatIfType === mod.type ? 'primary' : 'ghost'}
                        accentColor={mod.accent}
                        onClick={() => handleRunWhatIf(mod.type)}
                        disabled={whatIfLoading}
                        className="!py-2.5 !text-xs"
                      >
                        {mod.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Simulation Side-by-Side Comparison */}
                {whatIfResult && (
                  <div className="p-4 rounded-xl bg-white/80 border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-[#4A5B8C]">Simulation Output</span>
                      <span className="text-xs font-bold text-[#8BA888] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Score Delta: +{whatIfResult.scoreDelta} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase block mb-1">Original Quadrant</span>
                        <span className="font-bold" style={{ color: whatIfResult.originalQuadrant.colorHex }}>
                          {whatIfResult.originalQuadrant.name}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-1">Score: {whatIfResult.originalContentScore}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="font-bold text-emerald-600 uppercase block mb-1">Simulated Quadrant</span>
                        <span className="font-bold" style={{ color: whatIfResult.newQuadrant.colorHex }}>
                          {whatIfResult.newQuadrant.name}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-1">Score: {whatIfResult.newContentScore}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Rewritten Optimized Text:</span>
                      <p className="text-xs font-sans text-[#2E2A26] bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                        "{whatIfResult.rewrittenText}"
                      </p>
                    </div>
                  </div>
                )}

              </BlobPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
