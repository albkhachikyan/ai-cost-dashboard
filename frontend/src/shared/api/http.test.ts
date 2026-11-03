import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('server-only', () => ({}));

const { ApiError, request } = await import('./http');

const schema = z.object({ ok: z.boolean() });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    await expect(request('/x', { schema })).resolves.toEqual({ ok: true });
  });

  it('maps an error body to ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: { code: 'SYNC_IN_PROGRESS', message: 'busy' } }, { status: 409 }),
        ),
    );
    await expect(request('/x', { schema })).rejects.toMatchObject({
      code: 'SYNC_IN_PROGRESS',
      status: 409,
      message: 'busy',
    });
  });

  it('falls back to HTTP_<status> when the body is not an error envelope', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 502 })));
    await expect(request('/x', { schema })).rejects.toMatchObject({
      code: 'HTTP_502',
      status: 502,
    });
  });

  it('maps network failures to BACKEND_UNREACHABLE', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const error = await request('/x', { schema }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'BACKEND_UNREACHABLE', status: 0 });
  });

  it('returns undefined for 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(request('/x', { method: 'DELETE', schema: z.void() })).resolves.toBeUndefined();
  });
});
