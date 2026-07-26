'use client';

import React from 'react';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import BlobPanel from '@/components/ui/BlobPanel';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { computeStrongestAndWeakest } from '@/lib/types/session';

export default function StatsStrip({ user, sessionSummary }) {
  const sessionsCount = sessionSummary?.sessionsCompleted || 0;
  const latestElo = sessionSummary?.latestElo || 1400;
  const eloHistory = sessionSummary?.eloHistory || [
    { date: 'S1', elo: 1350 },
    { date: 'S2', elo: 1380 },
    { date: 'S3', elo: latestElo }
  ];

  // Calculate standing based on Elo
  let standingLabel = 'Building';
  let standingColor = 'bg-amber-100 text-amber-800 border-amber-300';
  let standingDot = 'bg-amber-500';

  if (latestElo >= 1400) {
    standingLabel = 'Mastery';
    standingColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
    standingDot = 'bg-indigo-600';
  } else if (latestElo >= 1300) {
    standingLabel = 'Advancing';
    standingColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    standingDot = 'bg-emerald-600';
  }

  // Build profile object and compute dynamic strongest/weakest topics
  const profile = {
    sessionsCompleted: sessionsCount,
    topics: sessionSummary?.topicSkills || []
  };

  const { strongest, weakest, hasData } = computeStrongestAndWeakest(profile);

  // Focus Area deep-link route logging
  let focusLinkHref = '/mock-interview';
  if (hasData && weakest) {
    // Check deep-link route selection: learning-path vs mock-interview
    focusLinkHref = `/learning-path?focusTopic=${encodeURIComponent(weakest.topic)}`;
    console.log(`[StatsStrip] Deep-link target generated for Focus Area (${weakest.topic}) → ${focusLinkHref}`);
  }

  return (
    <div className="space-y-4">
      {/* Personalized Header with Elo Standing Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/10 pb-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E2A26] tracking-tight">
            Welcome back, <span className="text-[#4A5B8C]">{user?.name || 'Candidate'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1">
            Real-time multi-agent scoring & Bayesian skill distribution center
          </p>
        </div>

        {/* Status Standing Pill */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-xs ${standingColor}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${standingDot}`}></span>
          <span>Elo {latestElo} — {standingLabel}</span>
        </div>
      </div>

      {/* 4 Compact Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Sessions Completed */}
        <BlobPanel accentColor="indigo" className="!p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sessions Completed</span>
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#2E2A26]">
              <AnimatedNumber value={sessionsCount} />
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center">
              ▲ Active
            </span>
          </div>
        </BlobPanel>

        {/* Tile 2: Current Elo Rating with Sparkline */}
        <BlobPanel accentColor="sage" className="!p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Current Elo Rating</span>
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-[#2E2A26]">
                <AnimatedNumber value={latestElo} />
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                ▲ +42
              </span>
            </div>

            {/* Elo Sparkline (Recharts LineChart) */}
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eloHistory}>
                  <Line
                    type="monotone"
                    dataKey="elo"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BlobPanel>

        {/* Tile 3: Strongest Topic */}
        <BlobPanel accentColor="amber" className="!p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Strongest Topic</span>
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="mt-2 truncate">
            {hasData && strongest ? (
              <>
                <span className="font-serif text-lg font-bold text-[#2E2A26] block truncate">
                  {strongest.topic}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block truncate">
                  {Math.round(strongest.compositeScore * 100)}% mastery · {strongest.correctCount}/{strongest.totalCount} correct
                </span>
              </>
            ) : (
              <>
                <span className="font-serif text-lg font-bold text-slate-400 block truncate">
                  —
                </span>
                <Link href="/mock-interview" className="text-[10px] text-indigo-600 font-medium hover:underline block truncate">
                  Complete a session to unlock this
                </Link>
              </>
            )}
          </div>
        </BlobPanel>

        {/* Tile 4: Focus Area */}
        <BlobPanel accentColor="rose" className="!p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Focus Area</span>
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mt-2 truncate">
            {hasData && weakest ? (
              <Link href={focusLinkHref} className="group block truncate">
                <span className="font-serif text-lg font-bold text-[#2E2A26] group-hover:text-rose-600 transition-colors block truncate">
                  {weakest.topic}
                </span>
                <span className="text-[10px] text-rose-700 font-medium block truncate group-hover:underline">
                  {Math.round(weakest.compositeScore * 100)}% mastery · Prime opportunity →
                </span>
              </Link>
            ) : (
              <>
                <span className="font-serif text-lg font-bold text-slate-400 block truncate">
                  —
                </span>
                <Link href="/mock-interview" className="text-[10px] text-indigo-600 font-medium hover:underline block truncate">
                  Complete a session to unlock this
                </Link>
              </>
            )}
          </div>
        </BlobPanel>
      </div>
    </div>
  );
}
