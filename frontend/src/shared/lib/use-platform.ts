'use client';

import { useSyncExternalStore } from 'react';

export function detectMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, then the real platform (no mismatch). */
export function useIsMac(): boolean {
  return useSyncExternalStore(noopSubscribe, detectMac, () => false);
}
