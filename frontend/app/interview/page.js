'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mock-interview');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#4A5B8C] border-t-transparent animate-spin"></div>
      <p className="font-serif text-lg font-bold text-[#2E2A26]">Redirecting to SkillMirror Engine...</p>
    </div>
  );
}
