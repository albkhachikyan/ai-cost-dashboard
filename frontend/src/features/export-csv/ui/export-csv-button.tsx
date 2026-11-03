import { ArrowUpRight } from 'lucide-react';

import { buttonVariants } from '@/shared/ui';

export function ExportCsvButton({ days }: { days: number }) {
  return (
    <a href={`/api/export?days=${days}`} download className={buttonVariants({ variant: 'solid' })}>
      Export CSV
      <ArrowUpRight aria-hidden />
    </a>
  );
}
