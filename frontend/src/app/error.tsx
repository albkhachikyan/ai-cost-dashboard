'use client';

import { TriangleAlert } from 'lucide-react';

import { Button, EmptyState } from '@/shared/ui';

// Production builds sanitize server errors, so show a fixed message and only the digest.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="content" className="flex flex-col gap-4">
      <h1 className="text-display">Your Claude usage</h1>
      <EmptyState
        title="Couldn't load your usage"
        description="Backend unreachable. Check that the backend container is running, then retry."
      >
        <TriangleAlert
          aria-hidden="true"
          size={20}
          strokeWidth={1.75}
          className="text-destructive"
        />
        {error.digest ? (
          <p className="text-caption text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
        <Button onClick={reset}>Retry</Button>
      </EmptyState>
    </main>
  );
}
