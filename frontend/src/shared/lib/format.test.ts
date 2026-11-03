import { describe, expect, it } from 'vitest';

import { formatDay, formatPercent, formatTokens, formatUsd } from './format';

describe('format', () => {
  it('formats tokens compactly', () => {
    expect(formatTokens(950)).toBe('950');
    expect(formatTokens(1234)).toBe('1.2K');
    expect(formatTokens(3_400_000)).toBe('3.4M');
  });

  it('formats usd and null as a dash', () => {
    expect(formatUsd(12.5)).toBe('$12.50');
    expect(formatUsd(null)).toBe('—');
  });

  it('formats percent from a fraction', () => {
    expect(formatPercent(0.1234)).toBe('12.3%');
  });

  it('formats a day in UTC', () => {
    expect(formatDay('2026-11-03')).toBe('Nov 3');
    expect(formatDay('garbage')).toBe('garbage');
  });
});
