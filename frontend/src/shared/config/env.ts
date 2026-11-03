import 'server-only';

import { z } from 'zod';

const schema = z.object({
  BACKEND_URL: z.url().default('http://localhost:8000'),
});

export const env = schema.parse({ BACKEND_URL: process.env.BACKEND_URL });
