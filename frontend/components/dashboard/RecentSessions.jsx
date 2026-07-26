'use client';

import React from 'react';
import Link from 'next/link';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

export default function RecentSessions({ recentSessions = [] }) {
  const hasSessions = recentSessions && recentSessions.length > 0;

  const getQuadrantColor = (quadrantName) => {
    const q = (quadrantName || '').toLowerCase();
    if (q.includes('ready') || q.includes('interview_ready')) return { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (q.includes('hidden') || q.includes('mastery')) return { dot: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' };
    if (q.includes('articulation') || q.includes('gap')) return { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2E2A26]">Recent Sessions Timeline</h2>
          <p className="text-xs text-slate-600 font-sans">
            Chronological telemetry history, quadrant balance & Elo trajectory
          </p>
        </div>
        {hasSessions && (
          <Link href="/mock-interview">
            <Button accentColor="indigo" className="!py-1.5 !px-3 text-xs font-bold">
              + New Session
            </Button>
          </Link>
        )}
      </div>

      {hasSessions ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {recentSessions.map((sess, idx) => {
            const quadMeta = getQuadrantColor(sess.quadrant?.id || sess.quadrant?.name);
            const eloDelta = sess.eloChange || (sess.finalElo ? sess.finalElo - (sess.initialElo || 1200) : 0);
            const isPositive = eloDelta >= 0;

            const qMix = sess.quadrantMix || { interview_ready: 60, hidden_mastery: 20, articulation_gap: 20, unprepared: 0 };

            return (
              <div key={idx} className="relative group">
                {/* Timeline Connector Circle Node */}
                <div className={`absolute -left-6 top-5 w-4 h-4 rounded-full border-2 border-white ${quadMeta.dot} shadow-xs ring-4 ring-slate-100 z-10 group-hover:scale-125 transition-transform`} />

                <BlobPanel accentColor="indigo" className="!p-5 bg-white/90 shadow-sm border border-slate-200/80">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Role & Date Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">{sess.date}</span>
                        {sess.isDemo && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            Demo Session
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${quadMeta.bg} ${quadMeta.text}`}>
                          {sess.quadrant?.name || 'Interview-Ready'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2E2A26]">
                        {sess.roleFocus || 'Software Engineer'} Session
                      </h3>
                      <p className="text-xs text-slate-500">
                        {sess.answersCount || sess.questionsTotal || 5} questions answered · Avg Content {sess.avgContent || 78}%
                      </p>
                    </div>

                    {/* Elo Delta & Quadrant Mix Mini-Bar */}
                    <div className="flex flex-col md:items-end space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Elo Result:</span>
                        <span className="font-mono font-bold text-base text-[#2E2A26]">
                          {sess.finalElo || 1340}
                        </span>
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {isPositive ? `+${eloDelta}` : eloDelta} {isPositive ? '▲' : '▼'}
                        </span>
                      </div>

                      {/* Quadrant Mix Mini Horizontal Bar */}
                      <div className="w-full md:w-44 space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>Quadrant Mix</span>
                          <span>{qMix.interview_ready}% Ready</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${qMix.interview_ready}%` }} className="bg-emerald-500 h-full" title={`Interview Ready: ${qMix.interview_ready}%`} />
                          <div style={{ width: `${qMix.hidden_mastery}%` }} className="bg-indigo-500 h-full" title={`Hidden Mastery: ${qMix.hidden_mastery}%`} />
                          <div style={{ width: `${qMix.articulation_gap}%` }} className="bg-amber-500 h-full" title={`Articulation Gap: ${qMix.articulation_gap}%`} />
                          <div style={{ width: `${qMix.unprepared}%` }} className="bg-rose-500 h-full" title={`Unprepared: ${qMix.unprepared}%`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <Link href={`/mock-interview/report/${sess.id}`}>
                      <Button variant="ghost" accentColor="indigo" className="!py-1.5 !px-3 text-xs font-bold">
                        View Full Telemetry Report →
                      </Button>
                    </Link>
                  </div>
                </BlobPanel>
              </div>
            );
          })}
        </div>
      ) : (
        /* Intentional Empty State */
        <BlobPanel accentColor="indigo" className="!p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4A5B8C]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Timeline Ready</h3>
            <p className="text-xs text-slate-600">Your session history will appear here as a chronological timeline.</p>
          </div>
          <Link href="/mock-interview" className="inline-block">
            <Button accentColor="indigo" className="!py-2.5 !px-6 text-xs font-bold">
              Start a Session →
            </Button>
          </Link>
        </BlobPanel>
      )}
    </div>
  );
}
