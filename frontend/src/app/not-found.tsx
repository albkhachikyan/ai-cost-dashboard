import Link from 'next/link';

import { buttonVariants, EmptyState } from '@/shared/ui';

export default function NotFound() {
  return (
    <main id="content" className="flex flex-col gap-4">
      <h1 className="text-display">Page not found</h1>
      <EmptyState
        title="Nothing here"
        description="This page does not exist. Go back to your usage."
      >
        <Link href="/" className={buttonVariants()}>
          Back to dashboard
        </Link>
      </EmptyState>
    </main>
  );
}
