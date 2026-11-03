'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type OverlayName = 'palette' | 'shortcuts';

let current: OverlayName | null = null;
let hosts = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function emit(next: OverlayName | null) {
  if (next === current) return;
  current = next;
  notify();
}

/** One global slot: opening an overlay closes the other. */
export const overlay = {
  get: () => current,
  open: (name: OverlayName) => emit(name),
  close: () => emit(null),
  toggle: (name: OverlayName) => emit(current === name ? null : name),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOverlay(): OverlayName | null {
  return useSyncExternalStore(subscribe, overlay.get, () => null);
}

/** Mounted by the component that renders the overlays (the dashboard's palette shell). */
export function useOverlayHost(): void {
  useEffect(() => {
    hosts += 1;
    notify();
    return () => {
      hosts -= 1;
      notify();
    };
  }, []);
}

/** Overlay triggers render only where a host exists, so they are never dead buttons. */
export function useHasOverlayHost(): boolean {
  // Server snapshot `true` keeps the dashboard (the only host page) free of layout shift.
  return useSyncExternalStore(
    subscribe,
    () => hosts > 0,
    () => true,
  );
}
