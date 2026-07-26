'use client';

import Nav from './Nav';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#2E2A26] flex flex-col selection:bg-[#4A5B8C]/20 selection:text-[#4A5B8C]">
      <Nav />
      <main key={pathname} className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}