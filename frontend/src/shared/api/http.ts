import type { ZodType } from 'zod';
import { z } from 'zod';

import { env } from '@/shared/config';

export class ApiError extends Error {
  readonly code: string;

  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const errorBodySchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'DELETE';
  schema: ZodType<T>;
  timeoutMs?: number;
}

async function toHttpError(response: Response): Promise<ApiError> {
  const fallback = new ApiError(
    `HTTP_${response.status}`,
    response.status,
    `Backend responded with ${response.status}`,
  );
  try {
    const parsed = errorBodySchema.safeParse(await response.json());
    if (!parsed.success) return fallback;
    const { code, message } = parsed.data.error;
    return new ApiError(code, response.status, message);
  } catch {
    return fallback;
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', schema, timeoutMs = 5000 }: RequestOptions<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.BACKEND_URL}${path}`, {
      method,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError('BACKEND_UNREACHABLE', 0, 'Backend is unreachable');
  }

  if (!response.ok) throw await toHttpError(response);
  if (response.status === 204) return schema.parse(undefined);

  try {
    return schema.parse(await response.json());
  } catch {
    throw new ApiError(
      'INVALID_RESPONSE',
      response.status,
      'Backend returned an unexpected response',
    );
  }
}

export type ActionResult<T extends object = object> =
  ({ ok: true } & T) | { ok: false; message: string };

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong. Please try again.';
}
