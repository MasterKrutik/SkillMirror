'use client';

import React from 'react';
import { motion } from 'framer-motion';
import BlobPanel from '@/components/ui/BlobPanel';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export default function LiveProofStrip() {
  const stats = [
    { value: 3, prefix: '', suffix: '', label: 'AI agents scoring every answer' },
    { value: 6, prefix: '', suffix: '', label: 'signals tracked beyond correctness' },
    { value: 1200, prefix: '', suffix: '±', label: 'starting Elo, adapts live' },
    { value: 100, prefix: '', suffix: '%', label: 'explainable, not black-box' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <BlobPanel accentColor="indigo" className="p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-indigo-900/10">
            {stats.map((st, i) => (
              <div key={i} className="text-center px-4 pt-4 md:pt-0 space-y-1">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-[#4A5B8C]">
                  <AnimatedNumber value={st.value} prefix={st.prefix} suffix={st.suffix} />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 font-sans max-w-[180px] mx-auto">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </BlobPanel>
      </motion.div>
    </div>
  );
}
