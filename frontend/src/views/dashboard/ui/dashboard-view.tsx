import { Suspense } from 'react';

import { ActivityHeatmapSkeleton } from '@/widgets/activity-heatmap';
import { KpiCardsSkeleton } from '@/widgets/kpi-cards';
import { ModelBreakdownSkeleton } from '@/widgets/model-breakdown';
import { TokensPerDaySkeleton } from '@/widgets/tokens-per-day';
import { TopBarSkeleton } from '@/widgets/top-bar';
import { Skeleton } from '@/shared/ui';

import {
  ActivitySection,
  HeadlineActions,
  KpiSection,
  ModelSection,
  TokensSection,
  TopBarSection,
} from './dashboard-sections';

const TOKENS_SPAN = 'lg:col-span-5';
const ACTIVITY_SPAN = 'lg:col-span-7';

function HeadlineActionsSkeleton() {
  return <Skeleton aria-hidden="true" className="h-10 w-80 rounded-pill bg-card" />;
}

export function DashboardView({ days }: { days: Promise<number> }) {
  return (
    <>
      <Suspense fallback={<TopBarSkeleton />}>
        <TopBarSection />
      </Suspense>
      <main id="content" className="flex flex-col gap-4 md:gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-display">Your Claude usage</h1>
          <Suspense fallback={<HeadlineActionsSkeleton />}>
            <HeadlineActions days={days} />
          </Suspense>
        </div>
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiSection days={days} />
        </Suspense>
        <div className="grid gap-4 md:gap-5 lg:grid-cols-12">
          <Suspense fallback={<TokensPerDaySkeleton className={TOKENS_SPAN} />}>
            <TokensSection days={days} className={TOKENS_SPAN} />
          </Suspense>
          <Suspense fallback={<ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />}>
            <ActivitySection days={days} className={ACTIVITY_SPAN} />
          </Suspense>
        </div>
        <Suspense fallback={<ModelBreakdownSkeleton />}>
          <ModelSection days={days} />
        </Suspense>
      </main>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <TopBarSkeleton />
      <main id="content" aria-busy="true" className="flex flex-col gap-4 md:gap-5">
        <h1 className="text-display">Your Claude usage</h1>
        <KpiCardsSkeleton />
        <div className="grid gap-4 md:gap-5 lg:grid-cols-12">
          <TokensPerDaySkeleton className={TOKENS_SPAN} />
          <ActivityHeatmapSkeleton className={ACTIVITY_SPAN} />
        </div>
        <ModelBreakdownSkeleton />
      </main>
    </>
  );
}
