import { cva } from 'class-variance-authority';
import type { CSSProperties } from 'react';

import { formatHour, type DailyTotal, type HourlyTotal } from '@/entities/usage';
import { cn, formatDay, formatTokens } from '@/shared/lib';
import { Skeleton, panel } from '@/shared/ui';

const bar = cva(
  'absolute inset-0 origin-bottom rounded-pill bg-chart-bar ring-1 ring-chart-edge ring-inset data-[peak=true]:bg-brand data-[peak=true]:ring-brand-foreground motion-safe:animate-bar-grow',
);

const valuePill = cva(
  'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-pill bg-primary px-3 py-1 text-label whitespace-nowrap text-primary-foreground opacity-0 transition-opacity duration-fast group-hover/bar:opacity-100! data-[peak=true]:opacity-100 group-has-[li:hover]/bars:data-[peak=true]:opacity-0',
);

function labelStep(days: number): number {
  if (days <= 7) return 1;
  return days <= 30 ? 5 : 15;
}

function axisLabel(day: string, days: number): string {
  if (days > 7) return formatDay(day);
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

interface Point {
  key: string;
  total: number;
  srLabel: string;
  axisLabel: string | null;
}

type TokensPerDayProps = (
  { granularity: 'day'; series: DailyTotal[] } | { granularity: 'hour'; series: HourlyTotal[] }
) & { id: string; className?: string };

function toPoints(props: TokensPerDayProps): Point[] {
  if (props.granularity === 'hour') {
    return props.series.map((entry) => ({
      key: String(entry.hour),
      total: entry.total,
      srLabel: `${formatHour(entry.hour)} UTC: ${formatTokens(entry.total)} tokens`,
      axisLabel: entry.hour % 3 === 0 ? String(entry.hour).padStart(2, '0') : null,
    }));
  }
  const days = props.series.length;
  const step = labelStep(days);
  return props.series.map((entry, index) => ({
    key: entry.day,
    total: entry.total,
    srLabel: `${formatDay(entry.day)}: ${formatTokens(entry.total)} tokens`,
    axisLabel: (days - 1 - index) % step === 0 ? axisLabel(entry.day, days) : null,
  }));
}

const COPY = {
  day: { title: 'Tokens per day', empty: 'No tokens recorded in this period.' },
  hour: { title: 'Tokens per hour', empty: 'No tokens recorded today.' },
} as const;

export function TokensPerDay(props: TokensPerDayProps) {
  const { id, className, granularity } = props;
  const points = toPoints(props);
  const max = Math.max(0, ...points.map((d) => d.total));
  const peakIndex = max > 0 ? points.findLastIndex((d) => d.total === max) : -1;
  const caption = granularity === 'hour' ? 'Today, UTC' : `Last ${points.length} days, UTC`;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(panel(), 'flex scroll-mt-6 flex-col', className)}
    >
      <figure className="flex flex-1 flex-col gap-4">
        <figcaption className="flex min-h-10 flex-col">
          <h3 id={`${id}-title`} className="text-title">
            {COPY[granularity].title}
          </h3>
          <p className="text-caption text-muted-foreground">{caption}</p>
        </figcaption>
        {max === 0 ? (
          <p className="py-12 text-center text-body text-muted-foreground">
            {COPY[granularity].empty}
          </p>
        ) : (
          <ol className="group/bars flex h-64 items-stretch gap-1 pt-10">
            {points.map((entry, index) => {
              const peak = index === peakIndex;
              return (
                <li key={entry.key} className="group/bar relative flex min-w-0 flex-1 flex-col">
                  <span className="sr-only">{entry.srLabel}</span>
                  <div aria-hidden="true" className="relative flex flex-1 items-end">
                    <div
                      className="relative h-value min-h-1 w-full"
                      style={{ '--value': entry.total / max } as CSSProperties}
                    >
                      <span data-peak={peak} className={bar()} />
                      <span data-peak={peak} className={valuePill()}>
                        {formatTokens(entry.total)}
                      </span>
                    </div>
                  </div>
                  <div aria-hidden="true" className="relative h-6">
                    {entry.axisLabel ? (
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-caption whitespace-nowrap text-muted-foreground">
                        {entry.axisLabel}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </figure>
    </section>
  );
}

export function TokensPerDaySkeleton({ className }: { className?: string }) {
  return <Skeleton aria-hidden="true" className={cn('h-96 rounded-card bg-card', className)} />;
}
