import { cache } from 'react';

import { request } from '@/shared/api';

import { usageReportSchema } from '../model/types';

// cache(): widgets in separate <Suspense> boundaries share one fetch per request.
export const getUsage = cache((days: number) =>
  request(`/api/usage?days=${days}`, { schema: usageReportSchema }),
);
