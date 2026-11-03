import { cache } from 'react';

import { request } from '@/shared/api';

import { connectionStatusSchema } from '../model/types';

export const getConnection = cache(() =>
  request('/api/connection', { schema: connectionStatusSchema }),
);
