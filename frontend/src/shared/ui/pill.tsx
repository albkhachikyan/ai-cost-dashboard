import { cva } from 'class-variance-authority';

/** Static pill container (status pill, range pill, search pill). */
export const pill = cva(
  'inline-flex h-10 items-center gap-2 rounded-pill bg-card px-4 text-label text-card-foreground',
);
