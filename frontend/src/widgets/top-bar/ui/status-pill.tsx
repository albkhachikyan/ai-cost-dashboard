'use client';

import { cva } from 'class-variance-authority';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

import { formatDay, cn } from '@/shared/lib';
import { pill } from '@/shared/ui';

const TICK_MS = 30_000;
const REFRESH_MS = 60_000;
const FRESH_MS = 5 * 60_000;

const statusDot = cva('size-2 shrink-0 rounded-pill', {
  variants: {
    tone: { live: 'bg-brand ring-1 ring-brand-foreground', idle: 'bg-chart-edge' },
  },
});

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}
const snapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;
const serverSnapshot = () => null;

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });

function formatRelative(diffMs: number): string {
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return relative.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, 'hour');
  return relative.format(-Math.floor(hours / 24), 'day');
}

interface StatusPillProps {
  connected: boolean;
  lastSyncAt: string | null;
}

export function StatusPill({ connected, lastSyncAt }: StatusPillProps) {
  const router = useRouter();
  const now = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  useEffect(() => {
    if (!connected) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [connected, router]);

  const syncedMs = lastSyncAt === null ? Number.NaN : Date.parse(lastSyncAt);
  const known = !Number.isNaN(syncedMs);

  let text: string;
  let tone: 'live' | 'idle' = 'idle';
  if (!connected) {
    text = known
      ? `Disconnected · data until ${formatDay(lastSyncAt?.slice(0, 10) ?? '')}`
      : 'Not connected';
  } else if (!known) {
    text = 'Connected · not synced yet';
  } else if (now === null) {
    text = 'Synced';
  } else {
    const diff = Math.max(0, now - syncedMs);
    text = `Synced ${formatRelative(diff)}`;
    if (diff < FRESH_MS) tone = 'live';
  }

  return (
    <p role="status" aria-live="polite" className={cn(pill(), 'tabular-nums')}>
      <span aria-hidden="true" className={statusDot({ tone })} />
      {text}
    </p>
  );
}
