'use client';

import React from 'react';
import { motion } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';

export default function HowItWorksPipeline() {
  const steps = [
    {
      num: '1',
      title: 'Upload Resume',
      desc: 'Get instant ATS & formatting feedback',
      accent: 'indigo',
      glowColor: 'rgba(74, 91, 140, 0.4)',
      // Custom SVG icon: Document shape
      icon: (
        <svg className="w-6 h-6 stroke-[#4A5B8C]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      num: '2',
      title: 'Practice Interviews',
      desc: 'Simulate multi-agent AI panel rounds',
      accent: 'amber',
      glowColor: 'rgba(217, 164, 65, 0.4)',
      // Custom SVG icon: Speech bubble with waveform
      icon: (
        <svg className="w-6 h-6 stroke-[#D9A441]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10v1M12 8v5M16 9v3" />
        </svg>
      )
    },
    {
      num: '3',
      title: 'Get Telemetry',
      desc: 'Elo, fatigue state, and quadrant breakdown',
      accent: 'rose',
      glowColor: 'rgba(201, 123, 132, 0.4)',
      // Custom SVG icon: Radar / gauge shape
      icon: (
        <svg className="w-6 h-6 stroke-[#C97B84]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12L16 8" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      )
    },
    {
      num: '4',
      title: 'What-If Replay',
      desc: 'Replay answers with target improvements',
      accent: 'sage',
      glowColor: 'rgba(139, 168, 136, 0.4)',
      // Custom SVG icon: Branching path shape
      icon: (
        <svg className="w-6 h-6 stroke-[#8BA888]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Connected Engine Architecture
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E2A26]">
          How SkillMirror Works
        </h2>
        <p className="text-sm text-slate-600">
          From initial resume parsing to counterfactual What-If answer replays.
        </p>
      </div>

      {/* Pipeline Container */}
      <div className="relative">
        
        {/* Animated Bezier Curved Connecting Line (Desktop Only) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-0 pt-16">
          <svg className="w-full h-24 overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <motion.path
              d="M 125 50 Q 250 10, 375 50 T 625 50 T 875 50"
              fill="none"
              stroke="#4A5B8C"
              strokeWidth="3"
              strokeDasharray="8 6"
              strokeOpacity="0.3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* 4 Step Panels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <BlobPanel
                accentColor={step.accent}
                className="p-6 h-full flex flex-col justify-between text-center space-y-4 transition-all duration-300 group-hover:shadow-2xl"
              >
                <div className="space-y-3">
                  {/* Step Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  {/* Glowing Number Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 + idx * 0.15 }}
                    className="w-10 h-10 rounded-full text-white font-serif font-bold text-base flex items-center justify-center mx-auto transition-shadow duration-300"
                    style={{
                      backgroundColor:
                        step.accent === 'indigo' ? '#4A5B8C' :
                        step.accent === 'amber' ? '#D9A441' :
                        step.accent === 'rose' ? '#C97B84' : '#8BA888',
                      boxShadow: `0 0 16px ${step.glowColor}`
                    }}
                  >
                    {step.num}
                  </motion.div>

                  <h3 className="font-serif font-bold text-lg text-[#2E2A26]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </BlobPanel>
            </motion.div>
          ))}
        </div>

      </div>

    </div>
  );
}
