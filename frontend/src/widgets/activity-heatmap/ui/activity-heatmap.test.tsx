import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { reportFixture, toHeatmap, toHourlyHeatmap } from '@/entities/usage';

import { ActivityHeatmap } from './activity-heatmap';

describe('ActivityHeatmap', () => {
  it('renders a table with row and column headers and cell text', () => {
    render(<ActivityHeatmap heatmap={toHeatmap(reportFixture.daily, 7, '2026-11-03')} days={7} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'opus-4-5' })).toBeInTheDocument();
    expect(screen.getByText('Nov 3: 1.8M tokens')).toBeInTheDocument();
  });

  it('renders text when empty', () => {
    render(<ActivityHeatmap heatmap={{ columns: [], rows: [] }} days={30} />);
    expect(screen.getByText('No activity recorded in this period.')).toBeInTheDocument();
  });

  it('uses hour wording when days is 1', () => {
    render(<ActivityHeatmap heatmap={toHourlyHeatmap(reportFixture.hourly)} days={1} />);
    expect(screen.getByText('Tokens by model per hour')).toBeInTheDocument();
    expect(screen.getByText('Tokens per model per hour, today (UTC)')).toBeInTheDocument();
    expect(screen.getAllByText(/^14:00 UTC: .* tokens$/).length).toBeGreaterThan(0);
  });

  it('renders hour-mode text when empty', () => {
    render(<ActivityHeatmap heatmap={{ columns: [], rows: [] }} days={1} />);
    expect(screen.getByText('No activity recorded today.')).toBeInTheDocument();
  });
});
