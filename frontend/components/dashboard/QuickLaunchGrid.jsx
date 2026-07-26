'use client';

import React from 'react';
import Link from 'next/link';
import BlobPanel from '@/components/ui/BlobPanel';

export default function QuickLaunchGrid({ sessionSummary }) {
  const toolStats = sessionSummary?.toolUsageStats || {};
  const recentSess = sessionSummary?.recentSessions?.[0];
  const lastDate = recentSess?.date || 'Today';
  const lastElo = sessionSummary?.latestElo || 1340;
  // Compute dynamic milestone completion status for Personalized Roadmap
  let roadmapStatus = toolStats.milestonesCompleted ? `${toolStats.milestonesCompleted} milestones complete` : '0 milestones complete';
  if (typeof window !== 'undefined') {
    try {
      const savedCompleted = JSON.parse(localStorage.getItem('completedMilestones') || '{}');
      const count = Object.values(savedCompleted).filter(Boolean).length;
      if (count > 0) {
        roadmapStatus = `${count} milestone${count > 1 ? 's' : ''} complete`;
      }
    } catch (e) {}
  }
  console.log(`[QuickLaunchGrid] CHANGED — Dynamic Roadmap status subtext: "${roadmapStatus}"`);

  const tools = [
    {
      title: 'SkillMirror Interview Engine',
      desc: 'Multi-agent scoring, Elo difficulty & What-If replay.',
      status: `Last session: ${lastDate} · Elo ${lastElo}`,
      accent: 'indigo',
      href: '/mock-interview',
      badge: 'CORE ENGINE',
      icon: '⚡'
    },
    {
      title: 'ATS Resume Studio',
      desc: 'Keyword gap identification & formatting scores.',
      status: toolStats.resumeOnFile ? 'Resume on file: Yes' : 'Resume on file: No',
      accent: 'amber',
      href: '/upload-resume',
      badge: 'RESUME AI',
      icon: '📄'
    },
    {
      title: 'Personalized Roadmap',
      desc: 'Dynamic 3-phase curriculum timeline.',
      status: roadmapStatus,
      accent: 'sage',
      href: '/learning-path',
      badge: 'CURRICULUM',
      icon: '🗺️'
    },
    {
      title: 'Code Explainer Studio',
      desc: 'Line-by-line syntax breakdown & complexity.',
      status: `${toolStats.snippetsExplained || 2} snippets explained this week`,
      accent: 'sage',
      href: '/code-explainer',
      badge: 'TECHNICAL',
      icon: '💻'
    },
    {
      title: 'Concept Simplifier',
      desc: 'Deconstruct complex system design & databases.',
      status: `${toolStats.conceptsSimplified || 3} concepts simplified`,
      accent: 'sage',
      href: '/concept-explainer',
      badge: 'MASTERY',
      icon: '💡'
    },
    {
      title: 'Peer Community & FAQs',
      desc: 'Collaborative forums & interview discussions.',
      status: `${toolStats.communityDiscussions || 5} active discussions`,
      accent: 'plum',
      href: '/community',
      badge: 'COMMUNITY',
      icon: '💬'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-[#2E2A26]">Quick Launch Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t, i) => (
          <Link key={i} href={t.href} className="block group">
            <BlobPanel
              accentColor={t.accent}
              className="!p-5 h-full flex flex-col justify-between space-y-3 bg-white/90 group-hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/80"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {t.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-[#2E2A26] group-hover:text-[#4A5B8C] transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {t.desc}
                </p>
              </div>

              {/* Dynamic Usage Status Subtext */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t.status}
                </span>
                <span className="text-[#4A5B8C] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </BlobPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
