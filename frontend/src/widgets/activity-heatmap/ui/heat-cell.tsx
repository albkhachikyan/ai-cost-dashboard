import { cva } from 'class-variance-authority';

export const heatCell = cva(
  'block rounded-cell ring-1 ring-chart-edge ring-inset data-[level=0]:bg-card data-[level=1]:bg-heat-1 data-[level=2]:bg-heat-2 data-[level=3]:bg-heat-3 data-[level=4]:bg-brand',
  {
    variants: {
      size: { cell: 'h-10 min-w-8', legend: 'size-4' },
    },
    defaultVariants: { size: 'cell' },
  },
);
