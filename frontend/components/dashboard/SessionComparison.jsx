'use client';

import React from 'react';
import BlobPanel from '@/components/ui/BlobPanel';

export default function SessionComparison({ comparisonData }) {
  if (!comparisonData || !comparisonData.current || !comparisonData.previous) {
    return null;
  }

  const { current, previous, eloTrend, confidenceTrend, isImproving } = comparisonData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2E2A26]">Session-over-Session Comparison</h2>
          <p className="text-xs text-slate-600 font-sans">
            Tracking growth velocity & readiness shift across consecutive telemetry runs
          </p>
        </div>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${isImproving ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
          {isImproving ? '📈 Trending Towards Interview-Ready' : '🔄 Building Consistency'}
        </span>
      </div>

      <BlobPanel accentColor="indigo" className="!p-6 bg-white/90 shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* Divider line for desktop */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-slate-200 -translate-x-1/2" />

          {/* Previous Session Box */}
          <div className="space-y-4 pr-0 md:pr-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-mono font-semibold text-slate-400">Previous Session ({previous.date})</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Baseline
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Final Elo</span>
                <span className="font-mono text-xl font-bold text-slate-800">{previous.finalElo}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Conf.</span>
                <span className="font-mono text-xl font-bold text-slate-800">{previous.avgDelivery}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Content Mastery</span>
                <span>{previous.avgContent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${previous.avgContent}%` }} />
              </div>
            </div>
          </div>

          {/* Latest Session Box */}
          <div className="space-y-4 pl-0 md:pl-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-mono font-semibold text-slate-400">Latest Session ({current.date})</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                Current State
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Final Elo</span>
                  <span className="text-[10px] font-bold text-emerald-700 font-mono">+{eloTrend} ▲</span>
                </div>
                <span className="font-mono text-xl font-bold text-emerald-950">{current.finalElo}</span>
              </div>
              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">Delivery Conf.</span>
                  <span className="text-[10px] font-bold text-indigo-700 font-mono">+{confidenceTrend}% ▲</span>
                </div>
                <span className="font-mono text-xl font-bold text-indigo-950">{current.avgDelivery}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span>Content Mastery</span>
                <span>{current.avgContent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4A5B8C] to-[#8BA888] rounded-full" style={{ width: `${current.avgContent}%` }} />
              </div>
            </div>
          </div>

        </div>
      </BlobPanel>
    </div>
  );
}
