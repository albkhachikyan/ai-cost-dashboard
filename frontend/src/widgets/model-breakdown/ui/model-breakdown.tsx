import type { CSSProperties } from 'react';

import type { ModelUsage } from '@/entities/usage';
import { cn, formatPercent, formatTokens, formatUsd } from '@/shared/lib';
import { Skeleton, panel } from '@/shared/ui';

export function ModelBreakdown({ models }: { models: ModelUsage[] }) {
  const sorted = [...models].sort((a, b) => b.total - a.total);
  return (
    <section
      id="by-model"
      aria-labelledby="by-model-title"
      className={cn(panel({ tone: 'warm' }), 'flex scroll-mt-6 flex-col gap-4')}
    >
      <div className="flex min-h-10 items-center">
        <h3 id="by-model-title" className="text-title">
          By model
        </h3>
      </div>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-body text-muted-foreground">
          Per-model usage appears here once tokens are recorded.
        </p>
      ) : (
        <div data-lenis-prevent className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead className="text-label text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Model
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  Tokens
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Share
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr key={m.model} className="border-t border-border">
                  <th scope="row" className="py-3 pr-4 font-normal whitespace-nowrap">
                    {m.model}
                  </th>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatTokens(m.total)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="h-2 w-32 overflow-hidden rounded-pill bg-chart-bar"
                      >
                        <div
                          className="h-full w-value rounded-pill bg-primary"
                          style={{ '--value': m.share } as CSSProperties}
                        />
                      </div>
                      <span className="w-14 text-right tabular-nums">{formatPercent(m.share)}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {m.cost_usd === null ? (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">price unknown</span>
                      </>
                    ) : (
                      formatUsd(m.cost_usd)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ModelBreakdownSkeleton() {
  return <Skeleton aria-hidden="true" className="h-64 rounded-card bg-surface-warm" />;
}
