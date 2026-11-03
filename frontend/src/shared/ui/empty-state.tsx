import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import { panel } from './panel';

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn(panel(), 'flex flex-col items-center gap-3 py-12 text-center', className)}>
      <h2 className="text-title">{title}</h2>
      {description ? (
        <p className="max-w-prose text-body text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
