'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import StatsStrip from '@/components/dashboard/StatsStrip';
import HowItWorksPipeline from '@/components/dashboard/HowItWorksPipeline';
import SkillMap from '@/components/dashboard/SkillMap';
import QuickLaunchGrid from '@/components/dashboard/QuickLaunchGrid';
import RecentSessions from '@/components/dashboard/RecentSessions';
import SessionComparison from '@/components/dashboard/SessionComparison';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [sessionSummary, setSessionSummary] = useState({
    sessionsCompleted: 0,
    latestElo: 1400,
    recentSessions: [],
    topicSkills: [],
    toolUsageStats: {},
    sessionComparison: null
  });
  const [loadingData, setLoadingData] = useState(true);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch Session Telemetry & Analytics Summary
  useEffect(() => {
    async function fetchSessions() {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('authToken');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
        const res = await fetch(`${backendUrl}/api/interview/user-sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessionSummary(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard sessions:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchSessions();
  }, [isAuthenticated]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#4A5B8C] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 1. Live Stats Strip Header */}
      <StatsStrip user={user} sessionSummary={sessionSummary} />

      {/* 2. Platform Architecture & How SkillMirror Works Pipeline */}
      <HowItWorksPipeline />

      {/* 3. Skill Map Radar Visualization */}
      <SkillMap topicSkills={sessionSummary.topicSkills} />

      {/* 4. Quick-Launch Tools Grid with Usage Depth */}
      <QuickLaunchGrid sessionSummary={sessionSummary} />

      {/* 5. Recent Sessions Timeline */}
      <RecentSessions recentSessions={sessionSummary.recentSessions} />

      {/* 6. Session-over-Session Comparison (Rendered when 2+ sessions exist) */}
      <SessionComparison comparisonData={sessionSummary.sessionComparison} />

    </div>
  );
}
