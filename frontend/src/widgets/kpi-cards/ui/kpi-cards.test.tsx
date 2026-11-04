import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { reportFixture } from '@/entities/usage';

import { KpiCards } from './kpi-cards';

describe('KpiCards', () => {
  it('renders cost, total tokens and today', () => {
    render(<KpiCards report={reportFixture} today="2026-11-03" />);
    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByText('3.4M')).toBeInTheDocument();
    expect(screen.getByText('2.4M')).toBeInTheDocument();
    expect(screen.getByText('Across 2 models')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Show cost by model' })).toHaveAttribute(
      'href',
      '#by-model',
    );
  });

  it('renders an empty state without data', () => {
    render(<KpiCards report={{ ...reportFixture, daily: [], by_model: [] }} today="2026-11-03" />);
    expect(screen.getByText('No usage yet')).toBeInTheDocument();
  });

  it('shows the busiest hour when days is 1', () => {
    render(<KpiCards report={{ ...reportFixture, days: 1 }} today="2026-11-03" />);
    expect(screen.getByRole('heading', { name: 'Busiest hour' })).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:00 UTC$/)).toBeInTheDocument();
    expect(screen.getByText('Today (UTC)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Show activity by hour' })).toHaveAttribute(
      'href',
      '#activity',
    );
  });

  it('shows a dash for the busiest hour without hourly data', () => {
    render(<KpiCards report={{ ...reportFixture, days: 1, hourly: [] }} today="2026-11-03" />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('No usage yet today')).toBeInTheDocument();
  });
});
