import { ShortcutsButton } from '@/features/keyboard-shortcuts';
import { SearchPill } from '@/features/open-palette';
import { ThemeToggle } from '@/features/toggle-theme';
import { Skeleton } from '@/shared/ui';

import { StatusPill } from './status-pill';

interface TopBarProps {
  connected: boolean;
  lastSyncAt: string | null;
}

export function TopBar({ connected, lastSyncAt }: TopBarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <SearchPill />
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-2 md:hidden">
          <ShortcutsButton tooltipSide="bottom" />
          <ThemeToggle />
        </div>
        <StatusPill connected={connected} lastSyncAt={lastSyncAt} />
      </div>
    </header>
  );
}

export function TopBarSkeleton() {
  return (
    <div aria-hidden="true" className="flex justify-end">
      <Skeleton className="h-10 w-48 rounded-pill bg-card" />
    </div>
  );
}
