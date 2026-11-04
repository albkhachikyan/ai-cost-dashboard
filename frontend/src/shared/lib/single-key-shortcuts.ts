'use client';

import { useSyncExternalStore } from 'react';

export const SINGLE_KEY_STORAGE_KEY = 'tokscope:single-key-shortcuts';

const listeners = new Set<() => void>();

/** Default on; only an explicit "off" disables single-key shortcuts. */
export function isSingleKeyEnabled(): boolean {
  try {
    return window.localStorage.getItem(SINGLE_KEY_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSingleKeyEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(SINGLE_KEY_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Storage unavailable: the preference simply is not persisted.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SINGLE_KEY_STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useSingleKeyShortcuts() {
  const enabled = useSyncExternalStore(subscribe, isSingleKeyEnabled, () => true);
  return [enabled, setSingleKeyEnabled] as const;
}
