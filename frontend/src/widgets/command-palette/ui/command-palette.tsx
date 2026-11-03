'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { LazyShortcutsDialog } from '@/features/keyboard-shortcuts';
import { useOverlay, useOverlayHost } from '@/shared/lib';

import { GlobalShortcuts } from './global-shortcuts';

const loadBody = () => import('./command-palette-body').then((mod) => mod.CommandPaletteBody);
const PaletteBody = dynamic(loadBody, { ssr: false });

/** Tiny shell: the palette body is only fetched when first needed (or when the browser is idle). */
export function CommandPalette({ connected }: { connected: boolean }) {
  useOverlayHost();
  const open = useOverlay() === 'palette';
  const [seen, setSeen] = useState(false);
  if (open && !seen) setSeen(true);

  useEffect(() => {
    const prefetch = () => {
      loadBody().catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(prefetch, 3000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <GlobalShortcuts connected={connected} />
      {seen ? <PaletteBody open={open} connected={connected} /> : null}
      <LazyShortcutsDialog />
    </>
  );
}
