import { render, screen } from '@testing-library/react';
import { configureAxe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import {
  reportFixture,
  toDailyTotals,
  toHeatmap,
  toHourlyHeatmap,
  toHourlyTotals,
} from '@/entities/usage';
import { ActivityHeatmap } from '@/widgets/activity-heatmap';
import { ShortcutsDialog } from '@/features/keyboard-shortcuts/ui/shortcuts-dialog';
import { AppRail } from '@/widgets/app-rail';
import { CommandPaletteBody } from '@/widgets/command-palette/ui/command-palette-body';
import { KpiCards } from '@/widgets/kpi-cards';
import { ModelBreakdown } from '@/widgets/model-breakdown';
import { StatusPill } from '@/widgets/top-bar';
import { TokensPerDay } from '@/widgets/tokens-per-day';
import { TooltipProvider } from '@/shared/ui';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

// cmdk needs these browser APIs, which jsdom lacks.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();

    unobserve = vi.fn();

    disconnect = vi.fn();
  },
);
Element.prototype.scrollIntoView = vi.fn();

// jsdom has no layout/canvas: contrast is verified from the token table (DESIGN.md §2.1).
const axe = configureAxe({ rules: { 'color-contrast': { enabled: false } } });

const TODAY = '2026-11-03';

describe('dashboard a11y', () => {
  it('main widgets have no axe violations', async () => {
    const { container } = render(
      <main>
        <h1>Your Claude usage</h1>
        <KpiCards report={reportFixture} today={TODAY} />
        <TokensPerDay granularity="day" series={toDailyTotals(reportFixture.daily, 30, TODAY)} />
        <ActivityHeatmap heatmap={toHeatmap(reportFixture.daily, 30, TODAY)} days={30} />
        <ModelBreakdown models={reportFixture.by_model} />
      </main>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('hour-mode widgets have no axe violations', async () => {
    const { container } = render(
      <main>
        <h1>Your Claude usage</h1>
        <KpiCards report={{ ...reportFixture, days: 1 }} today={TODAY} />
        <TokensPerDay granularity="hour" series={toHourlyTotals(reportFixture.hourly)} />
        <ActivityHeatmap heatmap={toHourlyHeatmap(reportFixture.hourly)} days={1} />
        <ModelBreakdown models={reportFixture.by_model} />
      </main>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('rail and status pill have no axe violations', async () => {
    const { container } = render(
      <TooltipProvider>
        <AppRail />
        <header>
          <StatusPill connected lastSyncAt="2026-11-03T10:00:00Z" />
        </header>
      </TooltipProvider>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('open command palette has no axe violations', async () => {
    render(<CommandPaletteBody open connected />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByText('Sync now')).toBeInTheDocument();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('open shortcuts dialog has no axe violations', async () => {
    render(<ShortcutsDialog open onOpenChange={vi.fn()} />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Single-key shortcuts' })).toBeInTheDocument();
    expect((await axe(document.body)).violations).toEqual([]);
  });
});
