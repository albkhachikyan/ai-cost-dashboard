'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Button } from '@/shared/ui';

import { useCycleTheme } from '../model/use-cycle-theme';

const ICONS = { system: Monitor, light: Sun, dark: Moon };

export function ThemeToggle() {
  const { current, next, cycle } = useCycleTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const shown = mounted ? current : 'system';
  const nextShown = mounted ? next : 'light';
  const Icon = ICONS[shown];

  return (
    <Button
      variant="icon"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${shown}. Switch to ${nextShown}`}
      title={`Theme: ${shown}`}
    >
      <Icon aria-hidden />
    </Button>
  );
}
