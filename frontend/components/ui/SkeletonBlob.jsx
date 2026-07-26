'use client';

import React from 'react';

export default function SkeletonBlob({ className = '', height = 'h-24' }) {
  return (
    <div className={`w-full rounded-2xl bg-gradient-to-r from-slate-200/60 via-amber-100/40 to-slate-200/60 animate-pulse border border-slate-200/50 p-4 ${height} ${className}`}>
      <div className="h-4 w-1/3 bg-slate-300/50 rounded-full mb-3"></div>
      <div className="h-3 w-2/3 bg-slate-300/30 rounded-full mb-2"></div>
      <div className="h-3 w-1/2 bg-slate-300/30 rounded-full"></div>
    </div>
  );
}
