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

/** tokscope mark: ink/paper stem (follows the theme) with the green crossbar. See docs/brand. */
function LogoMark() {
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true" className="size-11">
      <path
        className="fill-foreground"
        d="M85 54A24 24 0 0 1 133 54V150A32 32 0 0 0 165 182H191A24 24 0 0 1 191 230H165A80 80 0 0 1 85 150Z"
      />
      <rect x="41" y="74" width="172" height="48" rx="24" className="fill-brand" />
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
