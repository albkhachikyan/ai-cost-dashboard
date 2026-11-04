import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { reportFixture, toDailyTotals, toHourlyTotals } from '@/entities/usage';

import { TokensPerDay } from './tokens-per-day';

describe('TokensPerDay', () => {
  it('lists every day with screen-reader text and marks the peak', () => {
    const series = toDailyTotals(reportFixture.daily, 7, '2026-11-03');
    render(<TokensPerDay granularity="day" series={series} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByText('Nov 3: 2.4M tokens')).toBeInTheDocument();
  });

  it('shows a text fallback without data', () => {
    render(<TokensPerDay granularity="day" series={toDailyTotals([], 7, '2026-11-03')} />);
    expect(screen.getByText('No tokens recorded in this period.')).toBeInTheDocument();
  });

  it('renders 24 hour bars with UTC screen-reader text in hour mode', () => {
    render(<TokensPerDay granularity="hour" series={toHourlyTotals(reportFixture.hourly)} />);
    expect(screen.getByRole('heading', { name: 'Tokens per hour' })).toBeInTheDocument();
    expect(screen.getByText('Today, UTC')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(24);
    expect(screen.getByText(/^14:00 UTC: .* tokens$/)).toBeInTheDocument();
  });

  it('shows an hour-mode text fallback without data', () => {
    render(<TokensPerDay granularity="hour" series={toHourlyTotals([])} />);
    expect(screen.getByText('No tokens recorded today.')).toBeInTheDocument();
  });
});
