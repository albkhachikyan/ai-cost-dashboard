import { z } from 'zod';

import { getUsage } from '@/entities/usage';
import { ApiError } from '@/shared/api';
import { toCsv } from '@/shared/lib';

const daysSchema = z.coerce.number().pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]));

export async function GET(request: Request) {
  const parsed = daysSchema.safeParse(new URL(request.url).searchParams.get('days'));
  const days = parsed.success ? parsed.data : 30;

  try {
    const report = await getUsage(days);
    const csv = toCsv(
      ['day', 'model', 'input', 'output', 'cache_read', 'cache_write', 'total', 'cost_usd'],
      report.daily.map((r) => [
        r.day,
        r.model,
        r.input,
        r.output,
        r.cache_read,
        r.cache_write,
        r.total,
        r.cost_usd,
      ]),
    );
    const date = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ai-cost-${days}d-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: 502 },
      );
    }
    throw error;
  }
}
