'use client';

import { useTheme } from 'next-themes';

export const THEME_ORDER = ['system', 'light', 'dark'] as const;
export type ThemeName = (typeof THEME_ORDER)[number];

export function useCycleTheme() {
  const { theme, setTheme } = useTheme();
  const current: ThemeName = THEME_ORDER.find((t) => t === theme) ?? 'system';
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  return { current, next, cycle: () => setTheme(next ?? 'system') };
}
