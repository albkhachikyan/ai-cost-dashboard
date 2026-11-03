'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { overlay, useOverlay } from '@/shared/lib';

const ShortcutsDialog = dynamic(
  () => import('./shortcuts-dialog').then((mod) => mod.ShortcutsDialog),
  {
    ssr: false,
  },
);

/** Loads the dialog code on first open only. */
export function LazyShortcutsDialog() {
  const open = useOverlay() === 'shortcuts';
  const [seen, setSeen] = useState(false);
  if (open && !seen) setSeen(true);
  if (!seen) return null;
  return (
    <ShortcutsDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) overlay.close();
      }}
    />
  );
}
