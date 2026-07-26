'use client';

import React, { useState, useEffect } from 'react';

const ACCENT_MAP = {
  indigo: {
    fill: '#4A5B8C',
    shadow: '0 12px 36px -8px rgba(74, 91, 140, 0.22)',
    border: 'rgba(74, 91, 140, 0.18)',
    lightBg: 'rgba(74, 91, 140, 0.04)'
  },
  rose: {
    fill: '#C97B84',
    shadow: '0 12px 36px -8px rgba(201, 123, 132, 0.22)',
    border: 'rgba(201, 123, 132, 0.18)',
    lightBg: 'rgba(201, 123, 132, 0.04)'
  },
  sage: {
    fill: '#8BA888',
    shadow: '0 12px 36px -8px rgba(139, 168, 136, 0.22)',
    border: 'rgba(139, 168, 136, 0.18)',
    lightBg: 'rgba(139, 168, 136, 0.04)'
  },
  amber: {
    fill: '#D9A441',
    shadow: '0 12px 36px -8px rgba(217, 164, 65, 0.22)',
    border: 'rgba(217, 164, 65, 0.18)',
    lightBg: 'rgba(217, 164, 65, 0.04)'
  },
  plum: {
    fill: '#6B5876',
    shadow: '0 12px 36px -8px rgba(107, 88, 118, 0.22)',
    border: 'rgba(107, 88, 118, 0.18)',
    lightBg: 'rgba(107, 88, 118, 0.04)'
  }
};

const BLOB_PATHS = [
  "M45.7,-53.4C58.3,-43.2,67.1,-27.7,68.9,-11.2C70.6,5.3,65.3,22.8,55.1,35.8C45,48.8,30,57.3,13.6,61.9C-2.8,66.5,-20.6,67.2,-35.1,59.8C-49.6,52.4,-60.8,36.9,-64.8,19.9C-68.8,2.9,-65.6,-15.6,-56.3,-29.4C-47,-43.2,-31.6,-52.3,-16.1,-55.8C-0.6,-59.3,15,-57.2,45.7,-53.4Z",
  "M38.2,-48.6C49.9,-39.8,60.1,-27.1,62.8,-12.7C65.5,1.7,60.7,17.8,51.8,30.3C42.9,42.8,29.9,51.7,15.2,55.8C0.5,59.9,-15.9,59.2,-29.7,52.7C-43.5,46.2,-54.7,33.9,-58.9,19.2C-63.1,4.5,-60.3,-12.6,-51.9,-25.7C-43.5,-38.8,-29.5,-47.9,-15.6,-50.2C-1.7,-52.5,12.1,-48,38.2,-48.6Z",
  "M42.4,-52.7C54.8,-42.6,64.7,-28.9,67.1,-13.7C69.5,1.5,64.4,18.2,54.8,31.4C45.2,44.6,31.1,54.3,15.3,58.7C-0.5,63.1,-18,62.2,-32.8,54.6C-47.6,47,-59.7,32.7,-63.3,16.5C-66.9,0.3,-62,-17.8,-52,-30.9C-42,-44,-26.9,-52,-11.7,-54C3.5,-56,29.9,-62.8,42.4,-52.7Z",
  "M47.7,-48.3C60.2,-35.1,67.8,-17.5,67.1,-0.7C66.4,16.1,57.4,32.2,44.5,43.2C31.6,54.2,14.8,60,0.1,59.9C-14.6,59.8,-29.2,53.8,-42.1,43.1C-55,32.4,-66.2,16.2,-67.2,-1C-68.2,-18.2,-59,-36.4,-45.5,-49.4C-32,-62.4,-16,-70.2,0.8,-71.1C17.6,-72,35.2,-61.5,47.7,-48.3Z"
];

export default function BlobPanel({
  accentColor = 'indigo',
  children,
  className = '',
  style = {},
  ...props
}) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.indigo;
  const [blobPath, setBlobPath] = useState(BLOB_PATHS[0]);

  useEffect(() => {
    // Pick random path variant on mount
    const randomIdx = Math.floor(Math.random() * BLOB_PATHS.length);
    setBlobPath(BLOB_PATHS[randomIdx]);
  }, []);

  return (
    <div
      className={`relative group transition-all duration-300 ${className}`}
      style={{ ...style }}
      {...props}
    >
      {/* Background SVG Organic Blob */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-2xl">
        <svg
          className="absolute -top-12 -left-12 w-[140%] h-[140%] opacity-20 transform group-hover:scale-105 transition-transform duration-700 ease-out"
          viewBox="-100 -100 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id={`blur-${accentColor}`}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <path
            d={blobPath}
            fill={accent.fill}
            filter={`url(#blur-${accentColor})`}
          />
        </svg>
      </div>

      {/* Main Content Container */}
      <div
        className="rounded-2xl p-6 backdrop-blur-md transition-all duration-300 border"
        style={{
          backgroundColor: '#FBF7F0',
          boxShadow: accent.shadow,
          borderColor: accent.border,
        }}
      >
        {children}
      </div>
    </div>
  );
}
