import { cva } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { busiestHour, formatHour, type UsageReport } from '@/entities/usage';
import { cn, formatTokens } from '@/shared/lib';
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
        <h3 id={id} className="text-title">
          {title}
        </h3>
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
  variant: 'today' | 'period';
  /** Prefix for the card heading ids, unique per instance on the page. */
  idPrefix: string;
  /** Hrefs the card links scroll to. */
  anchors: { cost: string; tokens: string; activity: string };
}

export function KpiCards({ report, variant, idPrefix, anchors }: KpiCardsProps) {
  const period = variant === 'period';
  if (period && report.daily.length === 0) {
    return (
      <EmptyState
        title="No usage yet"
        description="No tokens recorded in this period. Usage appears here after your next Claude Code session."
      />
    );
  }
  const modelCount = report.by_model.length;
  const busiest = busiestHour(report.hourly);
  const activeDays = new Set(report.daily.filter((d) => d.total > 0).map((d) => d.day)).size;
  return (
    <section
      aria-label={period ? 'Period key figures' : 'Today key figures'}
      className="grid gap-4 md:gap-5 lg:grid-cols-3"
    >
      <KpiCard
        id={`${idPrefix}-cost`}
        title="Estimated cost"
        value={<CountUp value={report.totals.cost_usd} format="usd" />}
        caption={`Across ${modelCount} ${modelCount === 1 ? 'model' : 'models'}`}
        href={anchors.cost}
        linkLabel={period ? 'Show cost by model' : 'Show cost by hour'}
        tone="inverse"
      />
      <KpiCard
        id={`${idPrefix}-tokens`}
        title="Total tokens"
        value={<CountUp value={report.totals.total} format="tokens" />}
        caption={period ? `Last ${report.days} days` : 'Today (UTC)'}
        href={anchors.tokens}
        linkLabel={period ? 'Show tokens per day' : 'Show tokens per hour'}
        tone="default"
      />
      {period ? (
        <KpiCard
          id={`${idPrefix}-average`}
          title="Daily average"
          value={<CountUp value={Math.round(report.totals.total / report.days)} format="tokens" />}
          caption={`${activeDays} active ${activeDays === 1 ? 'day' : 'days'}`}
          href={anchors.activity}
          linkLabel="Show activity"
          tone="default"
        />
      ) : (
        <KpiCard
          id={`${idPrefix}-busiest`}
          title="Busiest hour"
          value={busiest ? `${formatHour(busiest.hour)} UTC` : '—'}
          caption={busiest ? `${formatTokens(busiest.total)} tokens` : 'No usage yet today'}
          href={anchors.activity}
          linkLabel="Show activity by hour"
          tone="default"
        />
      )}
    </section>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 md:gap-5 lg:grid-cols-3">
      {['cost', 'tokens', 'third'].map((key) => (
        <Skeleton key={key} className="min-h-44 rounded-card bg-card" />
      ))}
    </div>
  );
}
