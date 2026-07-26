'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value = 0, suffix = '', prefix = '', className = '' }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15
  });

  const displayValue = useTransform(spring, (current) => Math.round(current));
  const [renderedText, setRenderedText] = useState('0');

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (v) => {
      setRenderedText(v.toLocaleString());
    });
    return unsubscribe;
  }, [displayValue]);

  return (
    <span className={`inline-block font-semibold ${className}`}>
      {prefix}{renderedText}{suffix}
    </span>
  );
}
