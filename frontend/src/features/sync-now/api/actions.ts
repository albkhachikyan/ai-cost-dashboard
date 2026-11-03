'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { request, toErrorMessage } from '@/shared/api';
import type { ActionResult } from '@/shared/api';

const syncResultSchema = z.object({ imported: z.number(), skipped: z.number() });

export async function syncNowAction(): Promise<ActionResult<{ imported: number }>> {
  try {
    const result = await request('/api/sync', {
      method: 'POST',
      schema: syncResultSchema,
      timeoutMs: 60_000,
    });
    revalidatePath('/');
    return { ok: true, imported: result.imported };
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }
}
