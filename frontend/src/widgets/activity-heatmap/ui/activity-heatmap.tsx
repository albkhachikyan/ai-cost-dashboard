import type { Heatmap } from '@/entities/usage';
import { cn } from '@/shared/lib';
import { Skeleton, panel } from '@/shared/ui';

import { heatCell } from './heat-cell';

const LEVELS = [0, 1, 2, 3, 4] as const;

function shortModel(model: string): string {
  return model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
}

interface ActivityHeatmapProps {
  heatmap: Heatmap;
  days: number;
  className?: string;
}

export function ActivityHeatmap({ heatmap, days, className }: ActivityHeatmapProps) {
  const hourly = days === 1;
  let unit = days > 7 ? 'week' : 'day';
  if (hourly) unit = 'hour';
  return (
    <section
      id="activity"
      aria-labelledby="activity-title"
      className={cn(panel(), 'flex scroll-mt-6 flex-col gap-4', className)}
    >
      <div className="flex min-h-10 flex-col">
        <h2 id="activity-title" className="text-title">
          Activity
        </h2>
        <p className="text-caption text-muted-foreground">Tokens by model per {unit}</p>
      </div>
      {heatmap.rows.length === 0 ? (
        <p className="py-12 text-center text-body text-muted-foreground">
          {hourly ? 'No activity recorded today.' : 'No activity recorded in this period.'}
        </p>
      ) : (
        <>
          <div data-lenis-prevent className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1">
              <caption className="sr-only">
                {hourly
                  ? 'Tokens per model per hour, today (UTC)'
                  : `Tokens per model per ${unit}, last ${days} days`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Model</span>
                  </th>
                  {heatmap.columns.map((column, index) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="pb-1 text-center text-caption font-normal whitespace-nowrap text-muted-foreground"
                    >
                      {/* 24 hour labels don't fit: show every 3rd, keep the rest for screen readers */}
                      <span
                        data-minor={hourly && index % 3 !== 0}
                        className="data-[minor=true]:sr-only"
                      >
                        {column.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.rows.map((row) => (
                  <tr key={row.model}>
                    <th
                      scope="row"
                      className="max-w-32 truncate pr-3 text-left text-label whitespace-nowrap"
                      title={row.model}
                    >
                      {shortModel(row.model)}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td key={heatmap.columns[index]?.key} className="p-0">
                        <span
                          data-level={cell.level}
                          className={heatCell({ size: hourly ? 'compact' : 'cell' })}
                        >
                          <span className="sr-only">{cell.label}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <span>Less</span>
            {LEVELS.map((level) => (
              <span
                key={level}
                aria-hidden="true"
                data-level={level}
                className={heatCell({ size: 'legend' })}
              />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </section>
  );
}

export function ActivityHeatmapSkeleton({ className }: { className?: string }) {
  return <Skeleton aria-hidden="true" className={cn('h-96 rounded-card bg-card', className)} />;
}
