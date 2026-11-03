'use client';

import { RefreshCw } from 'lucide-react';
import { useTransition } from 'react';

import { notify } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { syncNowAction } from '../api/actions';

export function SyncNowButton() {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      document.documentElement.dataset.busy = '';
      try {
        const result = await syncNowAction();
        if (result.ok) notify.success(`Synced · ${result.imported} new messages`);
        else notify.error(result.message);
      } finally {
        delete document.documentElement.dataset.busy;
      }
    });
  };

  return (
    <Button variant="soft" disabled={pending} aria-busy={pending} onClick={handleClick}>
      <RefreshCw aria-hidden className={pending ? 'animate-spin' : undefined} />
      Sync now
    </Button>
  );
}
