import { cva } from 'class-variance-authority';

/** Rounded surface used by every card and section. */
export const panel = cva('rounded-card p-6', {
  variants: {
    tone: {
      default: 'bg-card text-card-foreground',
      warm: 'bg-surface-warm text-card-foreground',
      inverse: 'bg-surface-inverse text-surface-inverse-foreground',
    },
  },
  defaultVariants: { tone: 'default' },
});
