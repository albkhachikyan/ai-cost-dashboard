import { z } from 'zod';

export const connectionStatusSchema = z.object({
  connected: z.boolean(),
  source_found: z.boolean(),
  last_sync_at: z.string().nullable(),
  messages: z.number(),
});

export const syncResultSchema = z.object({
  imported: z.number(),
  skipped: z.number(),
});

export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;
export type SyncResult = z.infer<typeof syncResultSchema>;
