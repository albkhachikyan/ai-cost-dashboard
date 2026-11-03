'use client';

import { useIsMac } from '@/shared/lib';

import { Kbd, KbdGroup } from './shadcn/kbd';

function label(key: string, isMac: boolean) {
  if (key !== 'mod') return key;
  return isMac ? '⌘' : 'Ctrl';
}

/** Keycaps for a shortcut. `mod` renders as ⌘ on macOS and Ctrl elsewhere (after mount). */
export function ShortcutKbd({ keys, className }: { keys: readonly string[]; className?: string }) {
  const isMac = useIsMac();
  return (
    <KbdGroup {...(className ? { className } : {})}>
      {keys.map((key) => (
        <Kbd key={key}>{label(key, isMac)}</Kbd>
      ))}
    </KbdGroup>
  );
}
