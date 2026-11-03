import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { reportFixture, toDailyTotals } from '@/entities/usage';

import { TokensPerDay } from './tokens-per-day';

describe('TokensPerDay', () => {
  it('lists every day with screen-reader text and marks the peak', () => {
    const series = toDailyTotals(reportFixture.daily, 7, '2026-11-03');
    render(<TokensPerDay series={series} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByText('Nov 3: 2.4M tokens')).toBeInTheDocument();
  });

  it('shows a text fallback without data', () => {
    render(<TokensPerDay series={toDailyTotals([], 7, '2026-11-03')} />);
    expect(screen.getByText('No tokens recorded in this period.')).toBeInTheDocument();
  });
});
