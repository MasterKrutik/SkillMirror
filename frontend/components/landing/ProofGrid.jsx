'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export default function ProofGrid() {
  // Live ticking Elo for Card 2
  const [eloValue, setEloValue] = useState(1200);
  useEffect(() => {
    const values = [1200, 1247, 1231, 1285, 1260];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % values.length;
      setEloValue(values[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Evaluated Intelligence
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E2A26]">
          Multi-Signal Telemetry Proof Engine
        </h2>
        <p className="text-sm text-slate-600">
          Real telemetry signals beyond binary right/wrong correctness.
        </p>
      </div>

      {/* Asymmetric 12-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CARD 1: Large Card (Span 6 cols, 2 rows), Indigo BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="md:col-span-6 md:row-span-2"
        >
          <BlobPanel accentColor="indigo" className="h-full flex flex-col justify-between p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                Multi-Agent Panel
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#2E2A26]">
                Multi-Agent Interview Panel
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Three AI examiners, one verdict
              </p>
            </div>

            {/* Interactive 3-Node Animated Converging Diagram */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-900/10 relative overflow-hidden space-y-6">
              <div className="flex justify-between items-center relative z-10">
                {/* 3 Source Agent Nodes */}
                <div className="space-y-3">
                  {[
                    { title: 'Domain Examiner', color: '#4A5B8C' },
                    { title: 'Behavioral Assessor', color: '#8BA888' },
                    { title: 'Adversarial Cross-Examiner', color: '#C97B84' }
                  ].map((node, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white shadow-xs text-[11px] font-bold text-[#2E2A26]"
                      style={{ borderColor: `${node.color}40` }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }} />
                      {node.title}
                    </motion.div>
                  ))}
                </div>

                {/* Looping Pulse Flow Connection Lines (SVG) */}
                <div className="flex-1 px-4 relative h-24 flex items-center justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
                    <path d="M 0 10 Q 50 10, 100 30" fill="none" stroke="#4A5B8C" strokeWidth="1.5" strokeOpacity="0.2" />
                    <path d="M 0 30 Q 50 30, 100 30" fill="none" stroke="#8BA888" strokeWidth="1.5" strokeOpacity="0.2" />
                    <path d="M 0 50 Q 50 50, 100 30" fill="none" stroke="#C97B84" strokeWidth="1.5" strokeOpacity="0.2" />
                    
                    {/* Animated Pulses traveling to final node */}
                    <motion.circle
                      r="3"
                      fill="#4A5B8C"
                      animate={{ offsetDistance: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ offsetPath: 'path("M 0 10 Q 50 10, 100 30")' }}
                    />
                    <motion.circle
                      r="3"
                      fill="#8BA888"
                      animate={{ offsetDistance: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      style={{ offsetPath: 'path("M 0 30 Q 50 30, 100 30")' }}
                    />
                    <motion.circle
                      r="3"
                      fill="#C97B84"
                      animate={{ offsetDistance: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                      style={{ offsetPath: 'path("M 0 50 Q 50 50, 100 30")' }}
                    />
                  </svg>
                </div>

                {/* Final Score Node */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#4A5B8C] text-white shadow-md text-center min-w-[90px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Verdict</span>
                  <span className="font-serif text-lg font-bold">92 / 100</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Consensus scoring engine synthesizing domain accuracy, STAR framing, and counter-question resilience.
            </p>
          </BlobPanel>
        </motion.div>

        {/* CARD 2: Medium Card (Span 3 cols, 1 row), Amber BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-3"
        >
          <BlobPanel accentColor="amber" className="h-full flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A441] bg-amber-100/70 px-2 py-0.5 rounded-full">
                Elo Rating
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Elo Adaptive Difficulty</h3>
              <p className="text-xs text-slate-600 font-medium">Real-time difficulty scaling</p>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-amber-900/10 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Candidate Rating</span>
              <div className="font-serif text-3xl font-bold text-[#D9A441]">
                <AnimatedNumber value={eloValue} suffix=" ELO" />
              </div>
            </div>
          </BlobPanel>
        </motion.div>

        {/* CARD 3: Medium Card (Span 3 cols, 1 row), Rose BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-3"
        >
          <BlobPanel accentColor="rose" className="h-full flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C97B84] bg-rose-100/70 px-2 py-0.5 rounded-full">
                Cognitive Sensor
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Cognitive Fatigue Tracking</h3>
              <p className="text-xs text-slate-600 font-medium">Latent cognitive load sensor</p>
            </div>

            {/* Sparkline SVG Animation */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-rose-900/10 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span>Live Fatigue Signal</span>
                <span className="text-[#C97B84] animate-pulse">● Active</span>
              </div>
              <div className="h-10 w-full overflow-hidden flex items-center justify-center">
                <svg className="w-full h-8" viewBox="0 0 100 30">
                  <defs>
                    <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C97B84" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#C97B84" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 0 20 Q 25 5, 50 18 T 100 8"
                    fill="none"
                    stroke="#C97B84"
                    strokeWidth="2"
                    animate={{
                      d: [
                        "M 0 20 Q 25 5, 50 18 T 100 8",
                        "M 0 12 Q 25 22, 50 8 T 100 20",
                        "M 0 20 Q 25 5, 50 18 T 100 8"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M 0 20 Q 25 5, 50 18 T 100 8 L 100 30 L 0 30 Z"
                    fill="url(#roseGrad)"
                    animate={{
                      d: [
                        "M 0 20 Q 25 5, 50 18 T 100 8 L 100 30 L 0 30 Z",
                        "M 0 12 Q 25 22, 50 8 T 100 20 L 100 30 L 0 30 Z",
                        "M 0 20 Q 25 5, 50 18 T 100 8 L 100 30 L 0 30 Z"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </div>
            </div>
          </BlobPanel>
        </motion.div>

        {/* CARD 4: Wide Card (Span 6 cols, 1 row), Sage BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-6"
        >
          <BlobPanel accentColor="sage" className="h-full flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8BA888] bg-sage-100/70 px-2.5 py-0.5 rounded-full">
                2x2 Mapping
              </span>
              <h3 className="font-serif font-bold text-xl text-[#2E2A26]">Confidence-Competence Quadrant</h3>
              <p className="text-xs text-slate-600 font-medium">2x2 delivery vs content mapping</p>
            </div>

            {/* Mini 2x2 Grid Visual with Floating Dots */}
            <div className="bg-white/80 p-4 rounded-xl border border-sage-900/10 grid grid-cols-2 gap-2 relative">
              {[
                { name: 'Calibrated Master', color: '#8BA888', dotX: 0, dotY: 0 },
                { name: 'Unprepared Charmer', color: '#D9A441', dotX: 4, dotY: -4 },
                { name: 'Anxious Expert', color: '#4A5B8C', dotX: -4, dotY: 4 },
                { name: 'Underprepared', color: '#C97B84', dotX: 2, dotY: 2 }
              ].map((q, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200/60 bg-slate-50/50 relative overflow-hidden flex flex-col justify-between h-16">
                  <span className="text-[10px] font-bold text-slate-600">{q.name}</span>
                  <div className="self-end">
                    <motion.div
                      animate={{
                        x: [q.dotX, q.dotX + 6, q.dotX],
                        y: [q.dotY, q.dotY - 6, q.dotY]
                      }}
                      transition={{ duration: 2.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: q.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BlobPanel>
        </motion.div>

        {/* CARD 5: Medium Card (Span 3 cols, 1 row), Plum BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:col-span-3"
        >
          <BlobPanel accentColor="plum" className="h-full flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B5876] bg-purple-100/70 px-2 py-0.5 rounded-full">
                AI Engine
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Adaptive Multi-Agent Intelligence</h3>
              <p className="text-xs text-slate-600 font-medium">Real-time multi-vector evaluation engine</p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-purple-900/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6B5876] text-white flex items-center justify-center text-xs font-bold">
                  ⚡
                </div>
                <div className="flex gap-1 items-center px-2.5 py-1.5 rounded-full bg-purple-50 text-[10px] font-semibold text-[#6B5876]">
                  <span>Evaluating</span>
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }}>•</motion.span>
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>•</motion.span>
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>•</motion.span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-snug">
                Real-time career guidance, 24/7.
              </p>
            </div>
          </BlobPanel>
        </motion.div>

        {/* CARD 6: Medium Card (Span 3 cols, 1 row), Indigo BlobPanel */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="md:col-span-3"
        >
          <BlobPanel accentColor="indigo" className="h-full flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Scoring Math
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Explainable Attribution</h3>
              <p className="text-xs text-slate-600 font-medium">Transparent mathematical signals</p>
            </div>

            {/* Waterfall Mini-Chart */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-900/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Every score, fully explained</span>
              <div className="flex items-end justify-between h-8 gap-1.5 pt-1">
                {[
                  { height: '40%', color: '#4A5B8C' },
                  { height: '70%', color: '#8BA888' },
                  { height: '55%', color: '#D9A441' },
                  { height: '90%', color: '#6B5876' }
                ].map((bar, i) => (
                  <motion.div
                    key={i}
                    whileInView={{ height: bar.height }}
                    initial={{ height: '10%' }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="flex-1 rounded-sm"
                    style={{ backgroundColor: bar.color }}
                  />
                ))}
              </div>
            </div>
          </BlobPanel>
        </motion.div>

      </div>
    </div>
  );
}
