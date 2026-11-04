import { connection as atRequestTime } from 'next/server';

import { getConnection } from '@/entities/connection';
import {
  getUsage,
  toDailyTotals,
  toHeatmap,
  toHourlyHeatmap,
  toHourlyTotals,
} from '@/entities/usage';
import { ConnectButton } from '@/features/connect-claude-code';
import { ExportCsvButton } from '@/features/export-csv';
import { RangeSelect } from '@/features/select-range';
import { SyncNowButton } from '@/features/sync-now';
import { CommandPalette } from '@/widgets/command-palette';
import { ActivityHeatmap } from '@/widgets/activity-heatmap';
import { KpiCards } from '@/widgets/kpi-cards';
import { ModelBreakdown } from '@/widgets/model-breakdown';
import { TokensPerDay } from '@/widgets/tokens-per-day';
import { TopBar } from '@/widgets/top-bar';
import { formatDay } from '@/shared/lib';
import { EmptyState, Reveal } from '@/shared/ui';

const todayUtc = () => new Date().toISOString().slice(0, 10);

// Both fetchers are cache()d, so every section can await them without duplicate requests.
async function load(days: number) {
  const [connection, usage] = await Promise.all([getConnection(), getUsage(days)]);
  return { connection, usage };
}

export async function TopBarSection() {
  const connection = await getConnection();
  return (
    <>
      <TopBar connected={connection.connected} lastSyncAt={connection.last_sync_at} />
      <CommandPalette connected={connection.connected} />
    </>
  );
}

function ConnectEmptyState() {
  return (
    <EmptyState
      title="No usage yet"
      description="Connect reads your Claude Code transcripts in ~/.claude/projects, read-only, and never changes them."
    >
      <ConnectButton connected={false} />
    </EmptyState>
  );
}

/** True when nothing is connected and no usage has ever been imported (data survives disconnect). */
async function isEmpty() {
  const connection = await getConnection();
  return !connection.connected && connection.messages === 0;
}

export async function HeadlineActions() {
  const connection = await getConnection();
  return (
    <div className="flex flex-wrap items-center gap-3">
      {connection.connected ? <SyncNowButton /> : null}
      <ConnectButton connected={connection.connected} />
    </div>
  );
}

export async function TrendsActions({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  if (await isEmpty()) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <RangeSelect days={days} />
      <ExportCsvButton days={days} />
    </div>
  );
}

export async function TodayCaption() {
  // The date must be read per request, not frozen into the prerendered shell.
  await atRequestTime();
  return <p className="text-caption text-muted-foreground">{formatDay(todayUtc())}, UTC</p>;
}

/** Today section content; streams independently of the range. */
export async function TodayKpiSection() {
  if (await isEmpty()) return <ConnectEmptyState />;
  const { usage } = await load(1);
  return (
    <Reveal index={0}>
      <KpiCards
        report={usage}
        variant="today"
        idPrefix="today-kpi"
        anchors={{ cost: '#today-activity', tokens: '#today-tokens', activity: '#today-activity' }}
      />
    </Reveal>
  );
}

export async function TodayTokensSection({ className }: { className?: string }) {
  if (await isEmpty()) return null;
  const { usage } = await load(1);
  return (
    <Reveal index={1} {...(className ? { className } : {})}>
      <TokensPerDay
        granularity="hour"
        id="today-tokens"
        series={toHourlyTotals(usage.hourly)}
        className="h-full"
      />
    </Reveal>
  );
}

export async function TodayActivitySection({ className }: { className?: string }) {
  if (await isEmpty()) return null;
  const { usage } = await load(1);
  return (
    <Reveal index={2} {...(className ? { className } : {})}>
      <ActivityHeatmap
        heatmap={toHourlyHeatmap(usage.hourly)}
        days={1}
        mode="hour"
        id="today-activity"
        className="h-full"
      />
    </Reveal>
  );
}

export async function TrendsKpiSection({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  if (await isEmpty()) return null;
  const { usage } = await load(days);
  return (
    <Reveal index={3}>
      <KpiCards
        report={usage}
        variant="period"
        idPrefix="kpi"
        anchors={{ cost: '#by-model', tokens: '#tokens-per-day', activity: '#activity' }}
      />
    </Reveal>
  );
}

export async function TrendsTokensSection({
  days: daysPromise,
  className,
}: {
  days: Promise<number>;
  className?: string;
}) {
  const days = await daysPromise;
  if (await isEmpty()) return null;
  const { usage } = await load(days);
  return (
    <Reveal index={4} {...(className ? { className } : {})}>
      <TokensPerDay
        granularity="day"
        id="tokens-per-day"
        series={toDailyTotals(usage.daily, days, todayUtc())}
        className="h-full"
      />
    </Reveal>
  );
}

export async function TrendsActivitySection({
  days: daysPromise,
  className,
}: {
  days: Promise<number>;
  className?: string;
}) {
  const days = await daysPromise;
  if (await isEmpty()) return null;
  const { usage } = await load(days);
  return (
    <Reveal index={5} {...(className ? { className } : {})}>
      <ActivityHeatmap
        heatmap={toHeatmap(usage.daily, days, todayUtc())}
        days={days}
        mode="range"
        id="activity"
        className="h-full"
      />
    </Reveal>
  );
}

export async function ModelSection({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  if (await isEmpty()) return null;
  const { usage } = await load(days);
  return (
    <Reveal index={6}>
      <ModelBreakdown models={usage.by_model} />
    </Reveal>
  );
}
