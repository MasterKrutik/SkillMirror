'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/ui/FeatureCard';
import HowItWorksPipeline from '@/components/landing/HowItWorksPipeline';
import LiveProofStrip from '@/components/landing/LiveProofStrip';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLaunchModule = (targetHref) => {
    if (isAuthenticated) {
      router.push(targetHref);
    } else {
      router.push(`/login?returnTo=${encodeURIComponent(targetHref)}`);
    }
  };

  const features = [
    {
      title: 'SkillMirror Interview Engine',
      desc: 'Multi-agent scoring (Domain, STAR, Adversarial), Elo adaptive difficulty, fatigue tracking & What-If replay.',
      accent: 'indigo',
      href: '/mock-interview',
      badge: 'CORE ENGINE'
    },
    {
      title: 'ATS Resume Studio',
      desc: 'Instant keyword gap identification, structural formatting score, and action-verb recommendations.',
      accent: 'amber',
      href: '/upload-resume',
      badge: 'RESUME AI'
    },
    {
      title: 'Personalized Roadmap',
      desc: 'Dynamic 3-phase curriculum timeline mapping target roles with prerequisite topic graphs.',
      accent: 'sage',
      href: '/learning-path',
      badge: 'CURRICULUM'
    },
    {
      title: 'Code Explainer Studio',
      desc: 'Line-by-line syntax breakdown, algorithmic complexity evaluation, and optimization suggestions.',
      accent: 'sage',
      href: '/code-explainer',
      badge: 'TECHNICAL'
    },
    {
      title: 'Concept Simplifier',
      desc: 'Deconstruct complex system design, concurrency, and database concepts into clear real-world analogies.',
      accent: 'sage',
      href: '/concept-explainer',
      badge: 'MASTERY'
    },
    {
      title: 'Peer Community & FAQs',
      desc: 'Collaborative discussion forums, shared interview experiences, and community polls.',
      accent: 'plum',
      href: '/community',
      badge: 'COMMUNITY'
    }
  ];

  return (
    <div className="space-y-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4A5B8C] bg-indigo-50/90 px-4 py-1.5 rounded-full border border-indigo-200 shadow-xs">
          Multi-Signal AI Career Intelligence Platform
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2E2A26] leading-tight">
          Get Interview Ready With <span className="text-[#4A5B8C]">SkillMirror</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans max-w-3xl mx-auto">
          Not just 'right or wrong' — SkillMirror shows how confidently you answered, how tired or sharp you sounded by the end, and exactly what to fix, with a live 'what if I'd answered differently' replay.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/register">
                <Button accentColor="indigo" className="!py-4 !px-8 text-base font-bold shadow-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" accentColor="indigo" className="!py-4 !px-8 text-base font-bold">
                  Sign In
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button accentColor="indigo" className="!py-4 !px-8 text-base font-bold shadow-lg">
                Go to Candidate Dashboard →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. 6 Large Feature Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#2E2A26] text-center">Platform Core Engines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              title={f.title}
              desc={f.desc}
              accent={f.accent}
              href={f.href}
              onClick={() => handleLaunchModule(f.href)}
              badge={f.badge}
              size="large"
            />
          ))}
        </div>
      </div>

      {/* 3. HowItWorksPipeline Section (Connected Animated Pipeline) */}
      <HowItWorksPipeline />

      {/* 4. Live Proof Strip */}
      <LiveProofStrip />

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}
