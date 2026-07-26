'use client';

import React from 'react';
import Link from 'next/link';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

export default function HowItWorksPipeline() {
  const steps = [
    {
      step: '1',
      accent: 'indigo',
      glow: 'shadow-[0_0_15px_rgba(74,91,140,0.4)]',
      circleBg: 'bg-[#4A5B8C]',
      title: 'Multi-Agent Scoring',
      desc: 'Three specialized AI examiners evaluate every answer: a Domain Examiner for accuracy, a Behavioral Assessor for structure, and an Adversarial Examiner probing weak spots.'
    },
    {
      step: '2',
      accent: 'amber',
      glow: 'shadow-[0_0_15px_rgba(217,164,65,0.4)]',
      circleBg: 'bg-[#D9A441]',
      title: 'Elo + Fatigue Adaptation',
      desc: 'Question difficulty dynamically adjusts using chess Elo rating math, while tracking cognitive fatigue in real time to prevent unfair drops.'
    },
    {
      step: '3',
      accent: 'rose',
      glow: 'shadow-[0_0_15px_rgba(201,123,132,0.4)]',
      circleBg: 'bg-[#C97B84]',
      title: '2x2 Confidence Quadrant',
      desc: 'Answers are mapped across content knowledge vs. delivery confidence, uncovering articulation gaps that traditional scores miss.'
    },
    {
      step: '4',
      accent: 'sage',
      glow: 'shadow-[0_0_15px_rgba(139,168,136,0.4)]',
      circleBg: 'bg-[#8BA888]',
      title: 'Attribution & Replay',
      desc: 'Deconstruct exact score factors via waterfall breakdown and execute What-If replays to see how key adjustments boost performance.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Platform Architecture
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#2E2A26] mt-1">How SkillMirror Works</h2>
        </div>
        <Link href="/mock-interview">
          <Button accentColor="indigo" className="!py-2 !px-4 text-xs font-bold shadow-xs">
            ⚡ See it in action →
          </Button>
        </Link>
      </div>

      {/* Process Pipeline Container */}
      <div className="relative">
        {/* Continuous Curved SVG Connector Line running behind cards */}
        <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-12 -z-0 pointer-events-none">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 40">
            <path
              d="M 0 20 Q 250 -10, 500 20 T 1000 20"
              fill="none"
              stroke="url(#pipelineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="pipelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A5B8C" />
                <stop offset="33%" stopColor="#D9A441" />
                <stop offset="66%" stopColor="#C97B84" />
                <stop offset="100%" stopColor="#8BA888" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 4 Pipeline Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((st, i) => (
            <BlobPanel key={i} accentColor={st.accent} className="p-6 flex flex-col justify-between space-y-4 bg-white/90 shadow-sm h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Glowing Numbered Circle */}
                  <span className={`w-9 h-9 rounded-full ${st.circleBg} ${st.glow} text-white font-serif font-bold text-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    {st.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step {st.step}</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#2E2A26] leading-tight">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{st.desc}</p>
              </div>
            </BlobPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
