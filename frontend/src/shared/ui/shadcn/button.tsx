import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';
import { Slot } from 'radix-ui';

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill text-label whitespace-nowrap transition-[color,background-color,transform] duration-fast outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
        soft: 'bg-card text-card-foreground hover:bg-accent',
        ghost: 'bg-transparent text-foreground hover:bg-accent',
        icon: 'bg-card text-card-foreground hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'solid',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
