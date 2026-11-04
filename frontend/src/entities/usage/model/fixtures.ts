import type { UsageReport } from './types';

const zero = { input: 0, output: 0, cache_read: 0, cache_write: 0 };

/** Shared fixture for widget tests. */
export const reportFixture: UsageReport = {
  days: 30,
  totals: { ...zero, total: 3_400_000, cost_usd: 12.5 },
  daily: [
    { day: '2026-10-20', model: 'claude-opus-4-5', ...zero, total: 500_000, cost_usd: 2 },
    { day: '2026-11-02', model: 'claude-opus-4-5', ...zero, total: 1_000_000, cost_usd: 4 },
    { day: '2026-11-03', model: 'claude-opus-4-5', ...zero, total: 1_800_000, cost_usd: 6.5 },
    { day: '2026-11-03', model: 'claude-haiku-4-5', ...zero, total: 600_000, cost_usd: null },
  ],
  by_model: [
    { model: 'claude-haiku-4-5', ...zero, total: 600_000, cost_usd: null, share: 0.18 },
    { model: 'claude-opus-4-5', ...zero, total: 2_800_000, cost_usd: 12.5, share: 0.82 },
  ],
  hourly: [
    { hour: 9, model: 'claude-opus-4-5', ...zero, total: 400_000, cost_usd: 1.5 },
    { hour: 14, model: 'claude-opus-4-5', ...zero, total: 900_000, cost_usd: 3 },
    { hour: 14, model: 'claude-haiku-4-5', ...zero, total: 100_000, cost_usd: null },
  ],
};
