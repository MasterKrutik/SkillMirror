'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-4">
            <span className="text-4xl block">⚠️</span>
            <h2 className="font-serif text-2xl font-bold text-slate-800">Application Error</h2>
            <p className="text-xs text-slate-600 font-sans">{error?.message || 'A global error occurred.'}</p>
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
            >
              Reset Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
