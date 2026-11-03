'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { formatTokens, formatUsd } from '@/shared/lib';

const FORMATTERS = { usd: formatUsd, tokens: formatTokens } as const;
const DURATION_S = 0.6;

interface CountUpProps {
  value: number | null;
  format: keyof typeof FORMATTERS;
}

/**
 * Renders the real value in the HTML (SSR, no JS, screen readers), then counts up once after
 * hydration. Reduced motion keeps the final value.
 */
export function CountUp({ value, format }: CountUpProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<number | null>(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setShown(value);
  }

  useEffect(() => {
    if (reduced || !value) return undefined;
    let stop = () => {};
    let cancelled = false;
    // The animation engine is loaded on demand, so it stays out of the initial JS.
    import('motion')
      .then(({ animate }) => {
        if (cancelled) return;
        const controls = animate(0, value, {
          duration: DURATION_S,
          ease: 'easeOut',
          onUpdate: setShown,
          onComplete: () => setShown(value),
        });
        stop = () => controls.stop();
      })
      .catch(() => setShown(value));
    return () => {
      cancelled = true;
      stop();
    };
  }, [reduced, value]);

  return <>{shown === null ? '—' : FORMATTERS[format](shown)}</>;
}
