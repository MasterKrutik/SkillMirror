'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative pt-12 pb-10 text-xs text-slate-600 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Subtle Horizontal Watercolor Wash Strip Divider */}
      <div className="absolute top-0 left-0 right-0 h-5 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1200 20" preserveAspectRatio="none">
          <path
            d="M 0 10 Q 300 0, 600 12 T 1200 8 L 1200 20 L 0 20 Z"
            fill="#4A5B8C"
          />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Column 1: About */}
        <div className="space-y-3">
          {/* SkillMirror Muted Logo Mark */}
          <div className="flex items-center gap-2 text-[#4A5B8C]">
            <div className="w-7 h-7 rounded-lg bg-[#4A5B8C]/15 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-serif font-bold text-base text-[#4A5B8C]">
              Skill<span className="text-[#C97B84]">Mirror</span>
            </span>
          </div>

          <h3 className="font-serif font-bold text-sm text-[#2E2A26]">About SkillMirror</h3>
          <p className="leading-relaxed">
            SkillMirror is dedicated to empowering students and professionals with multi-agent AI interview telemetry, Elo adaptive scoring, and counterfactual replay simulations.
          </p>
        </div>

        {/* Column 2: Contact */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-sm text-[#2E2A26] mb-3">Contact</h3>
          <p className="leading-relaxed">Email: support@skillmirror.ai</p>
          <p className="leading-relaxed">Platform: SkillMirror Telemetry Suite</p>
        </div>

        {/* Column 3: Legal */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-sm text-[#2E2A26] mb-3">Legal</h3>
          <ul className="space-y-1.5">
            <li><Link href="#" className="hover:text-[#4A5B8C] transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-[#4A5B8C] transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-indigo-900/10 pt-6 text-center text-slate-500 text-[11px]">
        © 2026 SkillMirror Platform. All rights reserved.
      </div>
    </footer>
  );
}
