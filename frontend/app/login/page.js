'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

const ROTATING_PROPS = [
  {
    title: 'Track what you know',
    subtitle: 'Not just what you say. Deep multi-signal evaluation.',
    color: 'sage'
  },
  {
    title: 'See your confidence gap',
    subtitle: 'Before an interviewer does. Elo & latent fatigue tracking.',
    color: 'indigo'
  },
  {
    title: 'One unified skill graph',
    subtitle: 'Resume, interview practice, and roadmaps aligned seamlessly.',
    color: 'amber'
  }
];

function LoginForm() {
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

  // Rotate value props every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setPropIdx((prev) => (prev + 1) % ROTATING_PROPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Google Sign-In script
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google) {
        try {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1049355735471-lf6tojm268ndcg26rigaacjam3q0elkh.apps.googleusercontent.com';
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn
          });
          const container = document.getElementById('google-signin-button');
          if (container) {
            google.accounts.id.renderButton(container, { 
              theme: 'outline', 
              size: 'large',
              width: '100%',
              text: 'signin_with'
            });
          }
        } catch (e) {
          console.warn('Google Sign-In initialization fallback:', e);
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) existingScript.remove();
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });
      if (!res.ok) throw new Error('Google sign-in failed');
      const data = await res.json();
      triggerSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Login failed');
      }
      const data = await res.json();
      triggerSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  const triggerSuccess = (token, user) => {
    setSuccess(true);
    setTimeout(() => {
      login(token, user);
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push('/dashboard');
      }
    }, 600);
  };

  // Password strength checks
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
              Welcome back! Access your multi-signal career intelligence.
            </p>
          </div>

          {/* Success Morph Animation */}
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
                <h3 className="font-serif text-2xl font-bold text-[#2E2A26]">Authenticated!</h3>
                <p className="text-xs text-[#2E2A26]/60">Redirecting to {returnTo || 'dashboard'}...</p>
              </motion.div>
            </BlobPanel>
          ) : (
            <BlobPanel accentColor="indigo" className="shadow-lg">
              {/* Error Banner */}
              {error && (
                <BlobPanel accentColor="rose" className="mb-6 py-3 px-4 !bg-rose-50/50">
                  <div className="flex items-center gap-2 text-[#C97B84] text-xs font-semibold">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </BlobPanel>
              )}

              {/* One-Click Demo Sign-In */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('guest@skillmirror.ai');
                    setPassword('guestpass');
                    handleEmailLogin({ preventDefault: () => {} });
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4A5B8C] to-[#5C6F9E] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡ Instant Demo Sign-In</span>
                </button>
              </div>

              {/* Google Auth Button Container */}
              <div className="mb-6">
                <div id="google-signin-button" className="w-full h-11 flex items-center justify-center"></div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-3 text-slate-400 font-semibold tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    className="w-full px-4 py-3 rounded-xl border border-indigo-900/15 bg-white/80 text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#4A5B8C] transition-all duration-200 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-[#2E2A26]/80 uppercase tracking-wide">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#4A5B8C] font-semibold hover:underline"
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
                    className="w-full px-4 py-3 rounded-xl border border-indigo-900/15 bg-white/80 text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#4A5B8C] transition-all duration-200 text-sm"
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
                  accentColor="indigo"
                  className="w-full !py-3.5 mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In to SkillMirror'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-200/60">
                <p className="text-xs text-[#2E2A26]/70">
                  New to SkillMirror?{' '}
                  <Link
                    href={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : '/register'}
                    className="font-bold text-[#4A5B8C] hover:underline"
                  >
                    Create your account
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/80 border border-slate-200 text-[#4A5B8C]">
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
                    i === propIdx ? 'w-8 bg-[#4A5B8C]' : 'w-2 bg-slate-300'
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#4A5B8C] border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
