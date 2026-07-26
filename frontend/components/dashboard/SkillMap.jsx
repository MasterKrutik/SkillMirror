'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

import { computeStrongestAndWeakest } from '@/lib/types/session';

export default function SkillMap({ topicSkills = [] }) {
  // If no skills or empty, fallback gracefully
  const hasData = topicSkills && topicSkills.length > 0;

  // Format data for Recharts Radar
  const radarData = hasData
    ? topicSkills.map(sk => ({
        subject: sk.topic,
        score: sk.mean || sk.score || 70,
        ciHigh: sk.ciHigh || Math.min(100, (sk.mean || 70) + 7),
        ciLow: sk.ciLow || Math.max(0, (sk.mean || 70) - 7),
        fullMark: 100
      }))
    : [];

  const { strongest, weakest } = computeStrongestAndWeakest({
    sessionsCompleted: hasData ? 1 : 0,
    topics: topicSkills
  });

  const strongestTopic = strongest ? strongest.topic : '—';
  const focusTopic = weakest ? weakest.topic : '—';
  const sorted = hasData ? [...topicSkills].sort((a, b) => (b.mean || b.score) - (a.mean || a.score)) : [];
  const mostImprovedTopic = sorted.length > 2 ? sorted[1]?.topic : (sorted[0]?.topic || '—');

  if (hasData) {
    console.log(`[SkillMap] CHANGED — Rendering real Recharts RadarChart with ${radarData.length} topics. Strongest: ${strongestTopic}, Focus: ${focusTopic}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2E2A26]">Your Skill Map</h2>
          <p className="text-xs text-slate-600 font-sans">
            Aggregated Bayesian Beta Skill Distributions & Confidence Intervals
          </p>
        </div>
        {hasData && (
          <span className="text-[10px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto font-mono">
            Shaded Outer Ring = 95% Confidence Range
          </span>
        )}
      </div>

      {hasData ? (
        <BlobPanel accentColor="sage" className="!p-6 space-y-6">
          {/* Recharts Radar Chart */}
          <div className="w-full h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#2E2A26', fontSize: 11, fontWeight: 600, fontFamily: 'serif' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748B' }} />
                
                {/* Confidence Interval Band */}
                <Radar
                  name="95% CI Range"
                  dataKey="ciHigh"
                  stroke="#8BA888"
                  fill="#8BA888"
                  fillOpacity={0.15}
                  strokeDasharray="4 4"
                />

                {/* Mean Skill Level */}
                <Radar
                  name="Mean Skill Score"
                  dataKey="score"
                  stroke="#4A5B8C"
                  strokeWidth={2.5}
                  fill="url(#radarGradient)"
                  fillOpacity={0.55}
                />
                
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-[#2E2A26] font-serif">{data.subject}</p>
                          <p className="text-[#4A5B8C] font-semibold">Mean Mastery: {data.score}%</p>
                          <p className="text-slate-500 font-mono text-[10px]">95% CI: [{data.ciLow}% - {data.ciHigh}%]</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A5B8C" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8BA888" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 3 Callout Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
            {/* Chip 1: Strongest */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                🏆
              </span>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Strongest</span>
                <span className="text-xs font-semibold text-emerald-950 truncate block">{strongestTopic}</span>
              </div>
            </div>

            {/* Chip 2: Needs Focus */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                🎯
              </span>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Needs Focus</span>
                <span className="text-xs font-semibold text-amber-950 truncate block">{focusTopic}</span>
              </div>
            </div>

            {/* Chip 3: Most Improved */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                📈
              </span>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">Most Improved</span>
                <span className="text-xs font-semibold text-indigo-950 truncate block">{mostImprovedTopic}</span>
              </div>
            </div>
          </div>
        </BlobPanel>
      ) : (
        /* Custom SVG Radar/Target Line-Icon Empty State Fallback */
        <BlobPanel accentColor="sage" className="!p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="6" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path strokeLinecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#2E2A26]">No Session Telemetry Recorded</h3>
            <p className="text-xs text-slate-600">Complete your first interactive interview session to map your multi-topic skill radar.</p>
          </div>
          <Link href="/mock-interview" className="inline-block">
            <Button accentColor="sage" className="!py-2.5 !px-6 text-xs font-bold">
              Start a Session →
            </Button>
          </Link>
        </BlobPanel>
      )}
    </div>
  );
}
