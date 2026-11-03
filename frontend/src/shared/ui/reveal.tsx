'use client';

import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

import { SPRING } from './motion-tokens';

const STAGGER_S = 0.04;
const subscribe = () => () => {};

interface RevealProps {
  children: ReactNode;
  /** Position in the stagger sequence (40ms per step). */
  index?: number;
  className?: string;
}

/**
 * Staggered section entry (y 8 -> 0, opacity 0 -> 1).
 * Server HTML and hydration render the final state (visible without JS, no layout shift);
 * only sections mounted later on the client animate in. MotionConfig handles reduced motion.
 */
export function Reveal({ children, index = 0, className }: RevealProps) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <m.div
      initial={hydrated ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: index * STAGGER_S }}
      {...(className ? { className } : {})}
    >
      {children}
    </m.div>
  );
}
