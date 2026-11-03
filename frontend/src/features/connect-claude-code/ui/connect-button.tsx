'use client';

import { useTransition } from 'react';

import { notify } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { connectAction, disconnectAction } from '../api/actions';

export function ConnectButton({ connected }: { connected: boolean }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      document.documentElement.dataset.busy = '';
      try {
        const result = await (connected ? disconnectAction() : connectAction());
        if (result.ok) notify.success(connected ? 'Disconnected' : 'Connected');
        else notify.error(result.message);
      } finally {
        delete document.documentElement.dataset.busy;
      }
    });
  };

  return (
    <Button
      variant={connected ? 'soft' : 'solid'}
      disabled={pending}
      aria-busy={pending}
      onClick={handleClick}
    >
      {connected ? 'Disconnect' : 'Connect Claude Code'}
    </Button>
  );
}
