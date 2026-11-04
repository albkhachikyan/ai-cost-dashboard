'use client';

import * as m from 'motion/react-m';
import Link from 'next/link';

import { cn } from '@/shared/lib';
import { pill, SPRING } from '@/shared/ui';

export const RANGE_OPTIONS = [1, 7, 30, 90] as const;

export function RangeSelect({ days }: { days: number }) {
  return (
    <nav aria-label="Date range" className={cn(pill(), 'gap-1 px-1')}>
      {RANGE_OPTIONS.map((option) => {
        const active = option === days;
        return (
          <Link
            key={option}
            href={`/?days=${option}`}
            aria-current={active ? 'page' : undefined}
            className="relative inline-flex h-8 cursor-pointer items-center rounded-pill px-3 text-label transition-colors duration-fast hover:bg-accent aria-[current=page]:text-primary-foreground aria-[current=page]:hover:bg-transparent"
          >
            {active ? (
              <m.span
                layoutId="range-indicator"
                transition={SPRING}
                aria-hidden="true"
                className="absolute inset-0 rounded-pill bg-primary"
              />
            ) : null}
            <span className="relative">{option === 1 ? 'Today' : `${option}d`}</span>
          </Link>
        );
      })}
    </nav>
  );
}
