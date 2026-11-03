'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { request, toErrorMessage } from '@/shared/api';
import type { ActionResult } from '@/shared/api';

export async function connectAction(): Promise<ActionResult> {
  try {
    await request('/api/connection', {
      method: 'POST',
      schema: z.object({ imported: z.number(), skipped: z.number() }),
      timeoutMs: 60_000,
    });
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }
  revalidatePath('/');
  return { ok: true };
}

export async function disconnectAction(): Promise<ActionResult> {
  try {
    await request('/api/connection', { method: 'DELETE', schema: z.void() });
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }
  revalidatePath('/');
  return { ok: true };
}
