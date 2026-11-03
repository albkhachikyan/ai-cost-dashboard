'use client';

import 'lenis/dist/lenis.css';

import { ReactLenis } from 'lenis/react';
import { LazyMotion, MotionConfig, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@/features/toggle-theme';
import { Toaster, TooltipProvider } from '@/shared/ui';

const loadMotionFeatures = () => import('./motion-features').then((mod) => mod.domMax);
const LENIS_OPTIONS = { lerp: 0.1 };

export function Providers({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          {reduced ? null : <ReactLenis root options={LENIS_OPTIONS} />}
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
