import { cva } from 'class-variance-authority';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';

import { ShortcutsButton } from '@/features/keyboard-shortcuts';
import { PaletteButton } from '@/features/open-palette';
import { ThemeToggle } from '@/features/toggle-theme';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';

const railItem = cva(
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-foreground transition-colors duration-fast hover:bg-accent aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground',
);

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-11">
      <circle cx="16" cy="16" r="16" className="fill-brand-foreground" />
      <g className="stroke-brand" strokeWidth="2.5" strokeLinecap="round">
        <line x1="16" y1="8" x2="16" y2="24" />
        <line x1="8" y1="16" x2="24" y2="16" />
        <line x1="10.3" y1="10.3" x2="21.7" y2="21.7" />
        <line x1="21.7" y1="10.3" x2="10.3" y2="21.7" />
      </g>
    </svg>
  );
}

export function AppRail() {
  return (
    <nav
      aria-label="Primary"
      className="hidden w-18 shrink-0 flex-col items-center gap-2 py-8 md:flex"
    >
      <Link href="/" aria-label="tokscope home" className="rounded-pill">
        <LogoMark />
      </Link>
      <ul className="mt-6 flex flex-col items-center gap-2">
        <li>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/" aria-label="Dashboard" aria-current="page" className={railItem()}>
                <LayoutGrid aria-hidden="true" size={20} strokeWidth={1.75} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
        </li>
      </ul>
      <div className="mt-auto flex flex-col items-center gap-2">
        <PaletteButton />
        <ShortcutsButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
