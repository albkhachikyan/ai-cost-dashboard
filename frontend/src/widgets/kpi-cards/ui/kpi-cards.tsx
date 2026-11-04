import { cva } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { busiestHour, formatHour, type UsageReport } from '@/entities/usage';
import { cn, formatDay, formatTokens } from '@/shared/lib';
import { buttonVariants, CountUp, EmptyState, ScrollLink, Skeleton, panel } from '@/shared/ui';

const kpiCard = cva('flex min-h-44 flex-col justify-between', {
  variants: {
    tone: { inverse: '', default: '' },
  },
});

const kpiCaption = cva('text-caption', {
  variants: {
    tone: { inverse: 'text-surface-inverse-muted', default: 'text-muted-foreground' },
  },
});

const kpiLink = cva('size-9', {
  variants: {
    tone: {
      inverse:
        'bg-surface-inverse-foreground text-surface-inverse hover:bg-surface-inverse-foreground/90',
      default: 'bg-background',
    },
  },
});

interface KpiCardProps {
  id: string;
  title: string;
  value: ReactNode;
  caption: string;
  href: string;
  linkLabel: string;
  tone: 'inverse' | 'default';
}

function KpiCard({ id, title, value, caption, href, linkLabel, tone }: KpiCardProps) {
  return (
    <article aria-labelledby={id} className={cn(panel({ tone }), kpiCard({ tone }))}>
      <div className="flex min-h-10 items-start justify-between gap-2">
        <h2 id={id} className="text-title">
          {title}
        </h2>
        <ScrollLink
          href={href}
          aria-label={linkLabel}
          className={cn(buttonVariants({ variant: 'icon', size: 'icon' }), kpiLink({ tone }))}
        >
          <ArrowUpRight aria-hidden="true" strokeWidth={1.75} />
        </ScrollLink>
      </div>
      <div className="flex flex-col gap-2">
        <p className="truncate text-kpi tabular-nums">{value}</p>
        <p className={kpiCaption({ tone })}>{caption}</p>
      </div>
    </article>
  );
}

interface KpiCardsProps {
  report: UsageReport;
  /** UTC date (YYYY-MM-DD) treated as "today". */
  today: string;
}

export function KpiCards({ report, today }: KpiCardsProps) {
  if (report.daily.length === 0) {
    return (
      <EmptyState
        title="No usage yet"
        description="No tokens recorded in this period. Usage appears here after your next Claude Code session."
      />
    );
  }
  const todayTotal = report.daily
    .filter((d) => d.day === today)
    .reduce((sum, d) => sum + d.total, 0);
  const modelCount = report.by_model.length;
  const hourly = report.days === 1;
  const busiest = busiestHour(report.hourly);
  return (
    <section aria-label="Key figures" className="grid gap-4 md:gap-5 lg:grid-cols-3">
      <KpiCard
        id="kpi-cost"
        title="Estimated cost"
        value={<CountUp value={report.totals.cost_usd} format="usd" />}
        caption={`Across ${modelCount} ${modelCount === 1 ? 'model' : 'models'}`}
        href="#by-model"
        linkLabel="Show cost by model"
        tone="inverse"
      />
      <KpiCard
        id="kpi-tokens"
        title="Total tokens"
        value={<CountUp value={report.totals.total} format="tokens" />}
        caption={hourly ? 'Today (UTC)' : `Last ${report.days} days`}
        href="#tokens-per-day"
        linkLabel="Show tokens per day"
        tone="default"
      />
      {hourly ? (
        <KpiCard
          id="kpi-busiest"
          title="Busiest hour"
          value={busiest ? `${formatHour(busiest.hour)} UTC` : '—'}
          caption={busiest ? `${formatTokens(busiest.total)} tokens` : 'No usage yet today'}
          href="#activity"
          linkLabel="Show activity by hour"
          tone="default"
        />
      ) : (
        <KpiCard
          id="kpi-today"
          title="Today"
          value={<CountUp value={todayTotal} format="tokens" />}
          caption={`${formatDay(today)} (UTC)`}
          href="#activity"
          linkLabel="Show activity"
          tone="default"
        />
      )}
    </section>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 md:gap-5 lg:grid-cols-3">
      {['cost', 'tokens', 'today'].map((key) => (
        <Skeleton key={key} className="min-h-44 rounded-card bg-card" />
      ))}
    </div>
  );
}
