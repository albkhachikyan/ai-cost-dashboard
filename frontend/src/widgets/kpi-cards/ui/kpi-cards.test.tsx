import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { reportFixture } from '@/entities/usage';

import { KpiCards } from './kpi-cards';

const anchors = { cost: '#by-model', tokens: '#tokens-per-day', activity: '#activity' };

describe('KpiCards period', () => {
  it('renders cost, total tokens and daily average', () => {
    render(<KpiCards report={reportFixture} variant="period" idPrefix="kpi" anchors={anchors} />);
    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByText('3.4M')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Daily average' })).toBeInTheDocument();
    const average = Math.round(reportFixture.totals.total / reportFixture.days);
    expect(average).toBeGreaterThan(0);
    const active = new Set(reportFixture.daily.filter((d) => d.total > 0).map((d) => d.day)).size;
    expect(
      screen.getByText(`${active} active ${active === 1 ? 'day' : 'days'}`),
    ).toBeInTheDocument();
    expect(screen.getByText('Across 2 models')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Show cost by model' })).toHaveAttribute(
      'href',
      '#by-model',
    );
  });

  it('applies the id prefix to heading ids', () => {
    const { container } = render(
      <KpiCards report={reportFixture} variant="period" idPrefix="kpi" anchors={anchors} />,
    );
    expect(container.querySelector('#kpi-cost')).toHaveTextContent('Estimated cost');
    expect(container.querySelector('#kpi-average')).toBeInTheDocument();
  });

  it('renders an empty state without data', () => {
    render(
      <KpiCards
        report={{ ...reportFixture, daily: [], by_model: [] }}
        variant="period"
        idPrefix="kpi"
        anchors={anchors}
      />,
    );
    expect(screen.getByText('No usage yet')).toBeInTheDocument();
  });
});

describe('KpiCards today', () => {
  const today = { ...reportFixture, days: 1 };
  const todayAnchors = {
    cost: '#today-activity',
    tokens: '#today-tokens',
    activity: '#today-activity',
  };

  it('shows the busiest hour', () => {
    render(<KpiCards report={today} variant="today" idPrefix="today-kpi" anchors={todayAnchors} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Busiest hour' })).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:00 UTC$/)).toBeInTheDocument();
    expect(screen.getByText('Today (UTC)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Show activity by hour' })).toHaveAttribute(
      'href',
      '#today-activity',
    );
  });

  it('still renders three cards with a dash when there is no usage today', () => {
    render(
      <KpiCards
        report={{ ...today, daily: [], hourly: [], by_model: [] }}
        variant="today"
        idPrefix="today-kpi"
        anchors={todayAnchors}
      />,
    );
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('No usage yet today')).toBeInTheDocument();
  });
});
