'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  accentColor = 'indigo',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const COLOR_MAP = {
    indigo: { text: '#4A5B8C', fill: '#4A5B8C', border: '#4A5B8C' },
    rose: { text: '#C97B84', fill: '#C97B84', border: '#C97B84' },
    sage: { text: '#8BA888', fill: '#8BA888', border: '#8BA888' },
    amber: { text: '#D9A441', fill: '#D9A441', border: '#D9A441' },
    plum: { text: '#6B5876', fill: '#6B5876', border: '#6B5876' }
  };

  const colors = COLOR_MAP[accentColor] || COLOR_MAP.indigo;

  if (variant === 'ghost') {
    return (
      <motion.button
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden rounded-xl font-medium transition-all duration-300 border border-gray-300/80 bg-white/70 text-slate-800 shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none group ${className}`}
        {...props}
      >
        {/* Hover Bleed Effect */}
        <motion.span
          className="absolute inset-0 z-0 origin-left opacity-15"
          style={{ backgroundColor: colors.fill }}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }

  // Primary Variant
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden rounded-xl font-medium text-white shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group ${className}`}
      style={{ backgroundColor: colors.fill }}
      {...props}
    >
      {/* Watercolor Hover Bleed Overlay */}
      <motion.span
        className="absolute inset-0 z-0 origin-left bg-black/20"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
