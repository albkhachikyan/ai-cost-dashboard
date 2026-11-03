import { z } from 'zod';

const tokenCounts = {
  input: z.number(),
  output: z.number(),
  cache_read: z.number(),
  cache_write: z.number(),
  total: z.number(),
  cost_usd: z.number().nullable(),
};

export const usageTotalsSchema = z.object(tokenCounts);

export const dailyUsageSchema = z.object({
  day: z.string(),
  model: z.string(),
  ...tokenCounts,
});

export const modelUsageSchema = z.object({
  model: z.string(),
  ...tokenCounts,
  share: z.number(),
});

export const usageReportSchema = z.object({
  days: z.number(),
  totals: usageTotalsSchema,
  daily: z.array(dailyUsageSchema),
  by_model: z.array(modelUsageSchema),
});

export type UsageTotals = z.infer<typeof usageTotalsSchema>;
export type DailyUsage = z.infer<typeof dailyUsageSchema>;
export type ModelUsage = z.infer<typeof modelUsageSchema>;
export type UsageReport = z.infer<typeof usageReportSchema>;
