'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Nav() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FBF7F0]/90 border-b border-indigo-900/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        
        {/* Top Left Brand Logo - Routes to "/" */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4A5B8C] text-white font-bold shadow-md shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-[#4A5B8C] group-hover:opacity-90 transition-opacity">
            Skill<span className="text-[#C97B84]">Mirror</span>
          </span>
        </Link>
        
        {/* Navigation Bar Links (Home is FIRST) */}
        <nav className="hidden md:flex gap-6 items-center">
          {[
            { href: '/', label: 'Home' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/mock-interview', label: 'SkillMirror Engine' },
            { href: '/upload-resume', label: 'Resume ATS' },
            { href: '/code-explainer', label: 'Code AI' },
            { href: '/learning-path', label: 'Learning Path' },
            { href: '/community', label: 'Community' },
          ].map((item, idx) => (
            <Link 
              key={idx}
              href={item.href}
              className="text-[#2E2A26] font-medium text-xs md:text-sm hover:text-[#4A5B8C] transition-colors duration-200 relative group py-1"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4A5B8C] group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4A5B8C]/10 border border-[#4A5B8C]/15">
                <div className="w-2 h-2 rounded-full bg-[#8BA888] animate-pulse"></div>
                <span className="text-[#2E2A26] font-medium text-xs">{user?.name || 'Candidate'}</span>
              </div>
              <Button 
                variant="ghost" 
                accentColor="rose" 
                onClick={logout}
                className="!px-4 !py-1.5 !text-xs"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" accentColor="indigo" className="!px-4 !py-1.5 !text-xs font-bold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button accentColor="indigo" className="!px-4 !py-1.5 !text-xs font-bold shadow-sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}