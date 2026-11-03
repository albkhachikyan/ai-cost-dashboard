import { formatTokens } from '@/shared/lib';

import type { DailyUsage } from './types';

export interface DailyTotal {
  day: string;
  total: number;
}

export interface HeatmapColumn {
  key: string;
  label: string;
}

export interface HeatmapCell {
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export interface HeatmapRow {
  model: string;
  cells: HeatmapCell[];
}

export interface Heatmap {
  columns: HeatmapColumn[];
  rows: HeatmapRow[];
}

const DAY_MS = 86_400_000;

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Every UTC day of the window ending at `today`, oldest first. */
function windowDays(days: number, today: string): string[] {
  const end = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) => toIso(end - (days - 1 - i) * DAY_MS));
}

function mondayOf(day: string): string {
  const ms = Date.parse(`${day}T00:00:00Z`);
  const offset = (new Date(ms).getUTCDay() + 6) % 7;
  return toIso(ms - offset * DAY_MS);
}

function shortDate(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Zero-filled continuous series for the whole window ending today (UTC). */
export function toDailyTotals(daily: DailyUsage[], days: number, today: string): DailyTotal[] {
  const sums = new Map<string, number>();
  daily.forEach((d) => sums.set(d.day, (sums.get(d.day) ?? 0) + d.total));
  return windowDays(days, today).map((day) => ({ day, total: sums.get(day) ?? 0 }));
}

function levelOf(value: number, max: number, sortedRest: number[]): HeatmapCell['level'] {
  if (value === 0) return 0;
  if (value === max) return 4;
  const rank = sortedRest.filter((v) => v < value).length / sortedRest.length;
  if (rank < 1 / 3) return 1;
  if (rank < 2 / 3) return 2;
  return 3;
}

/** Daily columns for 7d, Monday-based week columns for longer windows. */
export function toHeatmap(daily: DailyUsage[], days: number, today: string): Heatmap {
  const window = windowDays(days, today);
  const weekly = days > 7;
  const bucketOf = (day: string) => (weekly ? mondayOf(day) : day);
  const columns: HeatmapColumn[] = [...new Set(window.map(bucketOf))].map((key) => ({
    key,
    label: shortDate(key),
  }));

  const inWindow = new Set(window);
  const byModel = new Map<string, Map<string, number>>();
  daily.forEach((d) => {
    if (!inWindow.has(d.day)) return;
    const buckets = byModel.get(d.model) ?? new Map<string, number>();
    const key = bucketOf(d.day);
    buckets.set(key, (buckets.get(key) ?? 0) + d.total);
    byModel.set(d.model, buckets);
  });

  const raw = [...byModel.entries()]
    .map(([model, buckets]) => ({
      model,
      values: columns.map((c) => buckets.get(c.key) ?? 0),
    }))
    .sort((a, b) => {
      const sum = (v: number[]) => v.reduce((x, y) => x + y, 0);
      return sum(b.values) - sum(a.values) || a.model.localeCompare(b.model);
    });

  const all = raw.flatMap((r) => r.values);
  const max = Math.max(0, ...all);
  const sortedRest = all.filter((v) => v > 0 && v < max).sort((a, b) => a - b);

  const rows = raw.map(({ model, values }) => ({
    model,
    cells: values.map((value, i) => ({
      value,
      level: levelOf(value, max, sortedRest),
      label: `${weekly ? 'Week of ' : ''}${columns[i]?.label ?? ''}: ${formatTokens(value)} tokens`,
    })),
  }));
  return { columns, rows };
}
