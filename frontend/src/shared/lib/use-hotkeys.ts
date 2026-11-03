'use client';

import { useEffect } from 'react';

import { isSingleKeyEnabled } from './single-key-shortcuts';
import { detectMac } from './use-platform';

type Handler = (e: KeyboardEvent) => void;

interface Parsed {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

function parse(binding: string): Parsed {
  const parts = binding.toLowerCase().split('+');
  const key = parts.pop() ?? '';
  return {
    key,
    mod: parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.contentEditable === 'true' ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

function matches(e: KeyboardEvent, p: Parsed, isMac: boolean): boolean {
  if (e.key.toLowerCase() !== p.key) return false;
  const modPressed = isMac ? e.metaKey : e.ctrlKey;
  const otherMod = isMac ? e.ctrlKey : e.metaKey;
  if (p.mod) return modPressed && !otherMod && !e.altKey && e.shiftKey === p.shift;
  // Single-key: any Ctrl/Meta/Alt turns it into a browser or OS shortcut. Shift is allowed (`?`).
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return p.alt === e.altKey;
}

/**
 * Registers global keyboard bindings, e.g. `{ 'mod+k': open, '/': open, s: sync }`.
 * `mod` is Cmd on macOS, Ctrl elsewhere. Single-key bindings respect the user's
 * "single-key shortcuts" preference; `mod+` bindings always work.
 */
export function useHotkeys(
  bindings: Record<string, Handler>,
  { enabled = true }: { enabled?: boolean } = {},
) {
  useEffect(() => {
    if (!enabled) return undefined;
    const entries = Object.entries(bindings).map(([binding, handler]) => ({
      parsed: parse(binding),
      handler,
    }));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.repeat || isEditable(e.target)) return;
      const isMac = detectMac();
      const hit = entries.find(({ parsed }) => matches(e, parsed, isMac));
      if (!hit) return;
      if (!hit.parsed.mod && !isSingleKeyEnabled()) return;
      e.preventDefault();
      hit.handler(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bindings, enabled]);
}
