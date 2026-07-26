'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACCENT_HOVER_MAP = {
  indigo: 'hover:bg-indigo-50/80 text-indigo-900',
  amber: 'hover:bg-amber-50/80 text-amber-900',
  sage: 'hover:bg-emerald-50/80 text-emerald-900',
  rose: 'hover:bg-rose-50/80 text-rose-900',
  plum: 'hover:bg-purple-50/80 text-purple-900'
};

const ACCENT_TEXT_MAP = {
  indigo: 'text-[#4A5B8C]',
  amber: 'text-[#D9A441]',
  sage: 'text-[#8BA888]',
  rose: 'text-[#C97B84]',
  plum: 'text-[#6B5876]'
};

export default function Select({
  options = [],
  value,
  onChange,
  accentColor = 'indigo',
  placeholder = 'Select option...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Find currently selected option label
  const selectedOption = options.find(opt => !opt.isHeader && opt.value === value);
  const hoverStyle = ACCENT_HOVER_MAP[accentColor] || ACCENT_HOVER_MAP.indigo;
  const activeTextStyle = ACCENT_TEXT_MAP[accentColor] || ACCENT_TEXT_MAP.indigo;

  // Filter out headers for keyboard navigation index calculation
  const selectableOptions = options.filter(opt => !opt.isHeader);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < selectableOptions.length) {
        onChange(selectableOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => (prev + 1) % selectableOptions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(selectableOptions.length - 1);
      } else {
        setHighlightedIndex(prev => (prev - 1 + selectableOptions.length) % selectableOptions.length);
      }
    }
  };

  return (
    <div className={`relative w-full text-left ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 rounded-xl border border-slate-300/80 bg-white/95 text-sm font-semibold text-[#2E2A26] flex items-center justify-between shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-all ${
          isOpen ? 'ring-2 ring-indigo-500/30 border-indigo-400' : ''
        }`}
      >
        <div className="truncate pr-2">
          {selectedOption ? (
            <span className="font-semibold">{selectedOption.label}</span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        {/* Rotating Chevron Icon */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className={`w-4 h-4 text-slate-500 shrink-0 ${activeTextStyle}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown Panel Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl border border-slate-200/90 origin-top backdrop-blur-md"
            style={{
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.18)'
            }}
          >
            {options.map((opt, idx) => {
              // Section Header Row
              if (opt.isHeader) {
                return (
                  <div
                    key={`header-${idx}`}
                    className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none border-t border-slate-100 first:border-t-0 first:pt-1"
                  >
                    {opt.label}
                  </div>
                );
              }

              // Option Row
              const isSelected = opt.value === value;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 flex items-start justify-between gap-3 ${hoverStyle} ${
                    isSelected ? 'bg-slate-100/90 font-bold' : ''
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <span className="text-sm text-[#2E2A26] block truncate leading-tight">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-xs text-slate-500 font-normal block truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>

                  {/* Selected Checkmark Icon */}
                  {isSelected && (
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${activeTextStyle}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
