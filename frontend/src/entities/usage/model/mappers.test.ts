import { describe, expect, it } from 'vitest';

import {
  busiestHour,
  formatHour,
  toDailyTotals,
  toHeatmap,
  toHourlyHeatmap,
  toHourlyTotals,
} from './mappers';
import type { DailyUsage, HourlyUsage } from './types';

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

function hr(hour: number, model: string, total: number): HourlyUsage {
  return { hour, model, input: 0, output: 0, cache_read: 0, cache_write: 0, total, cost_usd: null };
}

describe('toHourlyTotals', () => {
  it('zero-fills to 24 hours', () => {
    const t = toHourlyTotals([]);
    expect(t).toHaveLength(24);
    expect(t[0]).toEqual({ hour: 0, total: 0 });
    expect(t[23]).toEqual({ hour: 23, total: 0 });
  });

  it('sums across models', () => {
    const t = toHourlyTotals([hr(14, 'a', 5), hr(14, 'b', 7), hr(2, 'a', 1)]);
    expect(t[14]?.total).toBe(12);
    expect(t[2]?.total).toBe(1);
  });
});

describe('toHourlyHeatmap', () => {
  it('has 24 labelled columns and no rows when empty', () => {
    const map = toHourlyHeatmap([]);
    expect(map.columns).toHaveLength(24);
    expect(map.columns[0]).toEqual({ key: 'h00', label: '00' });
    expect(map.columns[23]).toEqual({ key: 'h23', label: '23' });
    expect(map.rows).toEqual([]);
  });

  it('sorts models by total, levels cells and labels them', () => {
    const map = toHourlyHeatmap([hr(14, 'small', 1), hr(14, 'big', 1_200_000), hr(3, 'big', 10)]);
    expect(map.rows.map((r) => r.model)).toEqual(['big', 'small']);
    const big = map.rows[0];
    expect(big?.cells).toHaveLength(24);
    expect(big?.cells[14]?.level).toBe(4);
    expect(big?.cells[14]?.label).toBe('14:00 UTC: 1.2M tokens');
    expect(big?.cells[0]?.level).toBe(0);
    expect(big?.cells[3]?.level).toBeGreaterThan(0);
  });
});

describe('busiestHour', () => {
  it('returns null when empty or all zero', () => {
    expect(busiestHour([])).toBeNull();
    expect(busiestHour([hr(5, 'a', 0)])).toBeNull();
  });

  it('picks the highest hour, earliest on ties', () => {
    expect(busiestHour([hr(9, 'a', 5), hr(4, 'a', 5), hr(20, 'a', 1)])).toEqual({
      hour: 4,
      total: 5,
    });
  });
});

describe('formatHour', () => {
  it('zero-pads', () => {
    expect(formatHour(4)).toBe('04:00');
    expect(formatHour(14)).toBe('14:00');
  });
});
