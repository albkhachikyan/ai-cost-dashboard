import { getConnection } from '@/entities/connection';
import { getUsage, toDailyTotals, toHeatmap } from '@/entities/usage';
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
import { EmptyState, Reveal } from '@/shared/ui';

const todayUtc = () => new Date().toISOString().slice(0, 10);

// Both fetchers are cache()d, so every section can await them without duplicate requests.
async function load(days: number) {
  const [connection, usage] = await Promise.all([getConnection(), getUsage(days)]);
  return { connection, usage, empty: !connection.connected && usage.daily.length === 0 };
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

export async function HeadlineActions({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  const connection = await getConnection();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <RangeSelect days={days} />
      {connection.connected ? <SyncNowButton /> : null}
      <ExportCsvButton days={days} />
      <ConnectButton connected={connection.connected} />
    </div>
  );
}

export async function KpiSection({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  const { usage, empty } = await load(days);
  if (empty) {
    return (
      <EmptyState
        title="No usage yet"
        description="Connect reads your Claude Code transcripts in ~/.claude/projects, read-only, and never changes them."
      >
        <ConnectButton connected={false} />
      </EmptyState>
    );
  }
  return (
    <Reveal index={0}>
      <KpiCards report={usage} today={todayUtc()} />
    </Reveal>
  );
}

export async function TokensSection({
  days: daysPromise,
  className,
}: {
  days: Promise<number>;
  className?: string;
}) {
  const days = await daysPromise;
  const { usage, empty } = await load(days);
  if (empty) return null;
  const series = toDailyTotals(usage.daily, days, todayUtc());
  return (
    <Reveal index={1} {...(className ? { className } : {})}>
      <TokensPerDay series={series} className="h-full" />
    </Reveal>
  );
}

export async function ActivitySection({
  days: daysPromise,
  className,
}: {
  days: Promise<number>;
  className?: string;
}) {
  const days = await daysPromise;
  const { usage, empty } = await load(days);
  if (empty) return null;
  const heatmap = toHeatmap(usage.daily, days, todayUtc());
  return (
    <Reveal index={2} {...(className ? { className } : {})}>
      <ActivityHeatmap heatmap={heatmap} days={days} className="h-full" />
    </Reveal>
  );
}

export async function ModelSection({ days: daysPromise }: { days: Promise<number> }) {
  const days = await daysPromise;
  const { usage, empty } = await load(days);
  if (empty) return null;
  return (
    <Reveal index={3}>
      <ModelBreakdown models={usage.by_model} />
    </Reveal>
  );
}
