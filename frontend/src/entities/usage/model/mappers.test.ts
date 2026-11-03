import { describe, expect, it } from 'vitest';

import { toDailyTotals, toHeatmap } from './mappers';
import type { DailyUsage } from './types';

function row(day: string, model: string, total: number): DailyUsage {
  return { day, model, input: 0, output: 0, cache_read: 0, cache_write: 0, total, cost_usd: null };
}

const TODAY = '2026-11-03';

describe('toDailyTotals', () => {
  it('zero-fills the whole window ending today', () => {
    const series = toDailyTotals([row('2026-11-01', 'a', 1), row('2026-11-01', 'b', 2)], 7, TODAY);
    expect(series).toHaveLength(7);
    expect(series[0]?.day).toBe('2026-10-28');
    expect(series[6]).toEqual({ day: TODAY, total: 0 });
    expect(series.find((d) => d.day === '2026-11-01')?.total).toBe(3);
  });

  it('returns zeros for empty data', () => {
    const series = toDailyTotals([], 30, TODAY);
    expect(series).toHaveLength(30);
    expect(series.every((d) => d.total === 0)).toBe(true);
  });
});

describe('toHeatmap', () => {
  it('returns no rows for empty data', () => {
    const map = toHeatmap([], 7, TODAY);
    expect(map.rows).toEqual([]);
    expect(map.columns).toHaveLength(7);
  });

  it('uses daily columns for 7d and a single model', () => {
    const map = toHeatmap([row('2026-11-03', 'a', 5)], 7, TODAY);
    expect(map.rows).toHaveLength(1);
    const cells = map.rows[0]?.cells ?? [];
    expect(cells).toHaveLength(7);
    expect(cells[6]?.level).toBe(4);
    expect(cells[0]?.level).toBe(0);
    expect(cells[6]?.label).toBe('Nov 3: 5 tokens');
  });

  it('buckets weeks across a month boundary', () => {
    const map = toHeatmap(
      [row('2026-10-31', 'a', 1), row('2026-11-01', 'a', 2), row('2026-11-02', 'a', 4)],
      30,
      TODAY,
    );
    expect(map.columns.map((c) => c.key)).toEqual([
      '2026-10-05',
      '2026-10-12',
      '2026-10-19',
      '2026-10-26',
      '2026-11-02',
    ]);
    const cells = map.rows[0]?.cells ?? [];
    expect(cells[3]?.value).toBe(3);
    expect(cells[4]?.value).toBe(4);
    expect(cells[4]?.level).toBe(4);
    expect(cells[3]?.level).toBe(1);
  });

  it('assigns levels 1-3 by tertiles of the non-zero rest', () => {
    const days = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];
    const map = toHeatmap(
      [
        row(days[0] ?? '', 'a', 1),
        row(days[1] ?? '', 'a', 2),
        row(days[2] ?? '', 'a', 3),
        row(days[3] ?? '', 'a', 4),
        row('2026-11-03', 'a', 100),
      ],
      7,
      TODAY,
    );
    const levels = (map.rows[0]?.cells ?? []).map((c) => c.level);
    expect(levels).toEqual([0, 1, 1, 2, 3, 0, 4]);
  });
});
