'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { connectAction, disconnectAction } from '@/features/connect-claude-code';
import { syncNowAction } from '@/features/sync-now';
import { useCycleTheme } from '@/features/toggle-theme';
import { notify } from '@/shared/lib';

const DEFAULT_DAYS = 1;

function currentDays(): number {
  const parsed = Number(new URLSearchParams(window.location.search).get('days'));
  return [1, 7, 30, 90].includes(parsed) ? parsed : DEFAULT_DAYS;
}

/** Every dashboard action reachable from the palette or a shortcut. */
export function useAppActions(connected: boolean) {
  const router = useRouter();
  const theme = useCycleTheme();
  const [pending, startTransition] = useTransition();

  const run = (
    job: () => Promise<{ ok: true; message: string } | { ok: false; message: string }>,
  ) => {
    if (pending) return;
    startTransition(async () => {
      document.documentElement.dataset.busy = '';
      try {
        const result = await job();
        if (result.ok) {
          notify.success(result.message);
          router.refresh();
        } else {
          notify.error(result.message);
        }
      } finally {
        delete document.documentElement.dataset.busy;
      }
    });
  };

  return {
    pending,
    sync: () =>
      run(async () => {
        const result = await syncNowAction();
        return result.ok
          ? { ok: true, message: `Synced · ${result.imported} new messages` }
          : result;
      }),
    toggleConnection: () =>
      run(async () => {
        const result = await (connected ? disconnectAction() : connectAction());
        return result.ok ? { ok: true, message: connected ? 'Disconnected' : 'Connected' } : result;
      }),
    exportCsv: () => {
      const days = currentDays();
      const link = document.createElement('a');
      link.href = `/api/export?days=${days}`;
      link.download = '';
      document.body.append(link);
      link.click();
      link.remove();
      notify.success(days === 1 ? 'Exporting today' : `Exporting the last ${days} days`);
    },
    setRange: (days: number) => router.push(`/?days=${days}`),
    cycleTheme: theme.cycle,
    themeLabel: `${theme.current} → ${theme.next}`,
  };
}
