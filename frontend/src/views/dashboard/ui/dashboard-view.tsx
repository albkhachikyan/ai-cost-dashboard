import { Suspense } from 'react';

import { ActivityHeatmapSkeleton } from '@/widgets/activity-heatmap';
import { KpiCardsSkeleton } from '@/widgets/kpi-cards';
import { ModelBreakdownSkeleton } from '@/widgets/model-breakdown';
import { TokensPerDaySkeleton } from '@/widgets/tokens-per-day';
import { TopBarSkeleton } from '@/widgets/top-bar';
import { Skeleton } from '@/shared/ui';

import {
  HeadlineActions,
  ModelSection,
  TodayActivitySection,
  TodayCaption,
  TodayKpiSection,
  TodayTokensSection,
  TopBarSection,
  TrendsActions,
  TrendsActivitySection,
  TrendsKpiSection,
  TrendsTokensSection,
} from './dashboard-sections';

const TOKENS_SPAN = 'lg:col-span-5';
const ACTIVITY_SPAN = 'lg:col-span-7';
const SECTION = 'flex scroll-mt-6 flex-col gap-4 md:gap-5';
const GRID = 'grid gap-4 md:gap-5 lg:grid-cols-12';

function HeadlineActionsSkeleton() {
  return <Skeleton aria-hidden="true" className="h-10 w-48 rounded-pill bg-card" />;
}

function TrendsActionsSkeleton() {
  return <Skeleton aria-hidden="true" className="h-10 w-72 rounded-pill bg-card" />;
}

function CaptionSkeleton() {
  return <Skeleton aria-hidden="true" className="h-4 w-32 rounded-pill bg-card" />;
}

// Today never awaits `days`, so it renders independently of the Trends range.
// Not connected and no data: Today shows the Connect empty state, Trends keeps only its h2.
export function DashboardView({ days }: { days: Promise<number> }) {
  return (
    <>
      <Suspense fallback={<TopBarSkeleton />}>
        <TopBarSection />
      </Suspense>
      <main id="content" className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-display">Your Claude usage</h1>
          <Suspense fallback={<HeadlineActionsSkeleton />}>
            <HeadlineActions />
          </Suspense>
        </div>
        <section id="today" aria-labelledby="today-title" className={SECTION}>
          <header className="flex flex-col">
            <h2 id="today-title" className="text-section">
              Today
            </h2>
            <Suspense fallback={<CaptionSkeleton />}>
              <TodayCaption />
            </Suspense>
          </header>
          <Suspense fallback={<KpiCardsSkeleton />}>
            <TodayKpiSection />
          </Suspense>
          <div className={GRID}>
            <Suspense fallback={<TokensPerDaySkeleton className={TOKENS_SPAN} />}>
              <TodayTokensSection className={TOKENS_SPAN} />
            </Suspense>
            <Suspense fallback={<ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />}>
              <TodayActivitySection className={ACTIVITY_SPAN} />
            </Suspense>
          </div>
        </section>
        <section id="trends" aria-labelledby="trends-title" className={SECTION}>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="trends-title" className="text-section">
              Trends
            </h2>
            <Suspense fallback={<TrendsActionsSkeleton />}>
              <TrendsActions days={days} />
            </Suspense>
          </header>
          <Suspense fallback={<KpiCardsSkeleton />}>
            <TrendsKpiSection days={days} />
          </Suspense>
          <div className={GRID}>
            <Suspense fallback={<TokensPerDaySkeleton className={TOKENS_SPAN} />}>
              <TrendsTokensSection days={days} className={TOKENS_SPAN} />
            </Suspense>
            <Suspense fallback={<ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />}>
              <TrendsActivitySection days={days} className={ACTIVITY_SPAN} />
            </Suspense>
          </div>
          <Suspense fallback={<ModelBreakdownSkeleton />}>
            <ModelSection days={days} />
          </Suspense>
        </section>
      </main>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <TopBarSkeleton />
      <main id="content" aria-busy="true" className="flex flex-col gap-8 md:gap-10">
        <h1 className="text-display">Your Claude usage</h1>
        <section aria-labelledby="today-title" className={SECTION}>
          <h2 id="today-title" className="text-section">
            Today
          </h2>
          <KpiCardsSkeleton />
          <div className={GRID}>
            <TokensPerDaySkeleton className={TOKENS_SPAN} />
            <ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />
          </div>
        </section>
        <section aria-labelledby="trends-title" className={SECTION}>
          <h2 id="trends-title" className="text-section">
            Trends
          </h2>
          <KpiCardsSkeleton />
          <div className={GRID}>
            <TokensPerDaySkeleton className={TOKENS_SPAN} />
            <ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />
          </div>
          <ModelBreakdownSkeleton />
        </section>
      </main>
    </>
  );
}
