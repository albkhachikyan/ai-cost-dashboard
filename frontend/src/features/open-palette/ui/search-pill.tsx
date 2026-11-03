'use client';

import { Search } from 'lucide-react';

import { cn, overlay } from '@/shared/lib';
import { pill, ShortcutKbd } from '@/shared/ui';

export function SearchPill() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K"
      onClick={() => overlay.open('palette')}
      className={cn(
        pill(),
        'min-w-0 cursor-pointer text-muted-foreground transition-colors duration-fast outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98 sm:min-w-64',
      )}
    >
      <Search aria-hidden="true" size={16} className="shrink-0" />
      <span className="truncate">Search or run a command</span>
      <ShortcutKbd keys={['mod', 'K']} className="ml-auto hidden sm:inline-flex" />
    </button>
  );
}
