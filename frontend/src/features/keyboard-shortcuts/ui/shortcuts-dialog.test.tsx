import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SINGLE_KEY_STORAGE_KEY } from '@/shared/lib';

import { ShortcutsDialog } from './shortcuts-dialog';

describe('ShortcutsDialog', () => {
  beforeEach(() => window.localStorage.clear());

  it('lists shortcuts and persists the single-key switch', async () => {
    render(<ShortcutsDialog open onOpenChange={vi.fn()} />);
    expect(await screen.findByText('Sync now')).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Single-key shortcuts' });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(window.localStorage.getItem(SINGLE_KEY_STORAGE_KEY)).toBe('off');
  });
});
