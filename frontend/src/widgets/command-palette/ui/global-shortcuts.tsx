'use client';

import { overlay, useHotkeys } from '@/shared/lib';

import { useAppActions } from '../model/use-app-actions';

/** The one place where global keyboard bindings are registered. */
export function GlobalShortcuts({ connected }: { connected: boolean }) {
  const actions = useAppActions(connected);
  // Single-key bindings stay quiet while a dialog is open.
  const idle = (fn: () => void) => () => {
    if (overlay.get() === null) fn();
  };

  useHotkeys({
    'mod+k': () => overlay.toggle('palette'),
    '/': idle(() => overlay.open('palette')),
    '?': idle(() => overlay.open('shortcuts')),
    s: idle(() => {
      if (connected) actions.sync();
    }),
    '1': idle(() => actions.setRange(7)),
    '2': idle(() => actions.setRange(30)),
    '3': idle(() => actions.setRange(90)),
    e: idle(actions.exportCsv),
    t: idle(actions.cycleTheme),
  });
  return null;
}
