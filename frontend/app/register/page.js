'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

const ROTATING_PROPS = [
  {
    title: 'Track what you know',
    subtitle: 'Not just what you say. Multi-agent AI scoring across content & STAR behaviors.',
    color: 'sage'
  },
  {
    title: 'See your confidence gap',
    subtitle: 'Before an interviewer does. Elo rating and latent fatigue modeling.',
    color: 'indigo'
  },
  {
    title: 'One unified skill graph',
    subtitle: 'Resume, interview practice, and learning paths synced on SQLite.',
    color: 'amber'
  }
];

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [propIdx, setPropIdx] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setPropIdx((prev) => (prev + 1) % ROTATING_PROPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => {
        login(data.token, data.user);
        if (returnTo) {
          router.push(returnTo);
        } else {
          router.push('/dashboard');
        }
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains number', valid: /\d/.test(password) },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains special character', valid: /[^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Column: Form Container */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-[#4A5B8C] mb-2 tracking-tight">
              Skill<span className="text-[#C97B84]">Mirror</span>
            </h1>
            <p className="text-[#2E2A26]/70 text-sm font-medium">
              Create your account to unlock adaptive multi-agent evaluation.
            </p>
          </div>

          {success ? (
            <BlobPanel accentColor="sage" className="text-center py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#8BA888] text-white flex items-center justify-center text-3xl shadow-lg">
                  ✓
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2E2A26]">Account Created!</h3>
                <p className="text-xs text-[#2E2A26]/60">Redirecting to {returnTo || 'dashboard'}...</p>
              </motion.div>
            </BlobPanel>
          ) : (
            <BlobPanel accentColor="sage" className="shadow-lg">
              {error && (
                <BlobPanel accentColor="rose" className="mb-6 py-3 px-4 !bg-rose-50/50">
                  <div className="flex items-center gap-2 text-[#C97B84] text-xs font-semibold">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </BlobPanel>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2E2A26]/80 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-900/15 bg-white/80 text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-all duration-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2E2A26]/80 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-900/15 bg-white/80 text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-all duration-200 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-[#2E2A26]/80 uppercase tracking-wide">
                      Create Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#8BA888] font-semibold hover:underline"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-900/15 bg-white/80 text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-all duration-200 text-sm"
                  />

                  {password.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-white/60 border border-slate-200/60 text-xs space-y-1">
                      {passwordChecks.map((chk, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={chk.valid ? 'text-[#8BA888] font-bold' : 'text-slate-300'}>
                            {chk.valid ? '✓' : '○'}
                          </span>
                          <span className={chk.valid ? 'text-[#2E2A26] font-medium' : 'text-slate-400'}>
                            {chk.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  accentColor="sage"
                  className="w-full !py-3.5 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-200/60">
                <p className="text-xs text-[#2E2A26]/70">
                  Already have an account?{' '}
                  <Link
                    href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'}
                    className="font-bold text-[#8BA888] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </BlobPanel>
          )}
        </div>

        {/* Right Column: Rotating Value Props BlobPanel */}
        <div className="hidden md:block w-full">
          <BlobPanel accentColor={ROTATING_PROPS[propIdx].color} className="p-10 min-h-[380px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={propIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/80 border border-slate-200 text-[#8BA888]">
                  SkillMirror Advantage #{propIdx + 1}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#2E2A26] leading-tight">
                  "{ROTATING_PROPS[propIdx].title}"
                </h2>
                <p className="text-sm text-[#2E2A26]/80 leading-relaxed max-w-sm">
                  {ROTATING_PROPS[propIdx].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Indicators */}
            <div className="flex gap-2 mt-8">
              {ROTATING_PROPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPropIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === propIdx ? 'w-8 bg-[#8BA888]' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </BlobPanel>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#8BA888] border-t-transparent animate-spin"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
