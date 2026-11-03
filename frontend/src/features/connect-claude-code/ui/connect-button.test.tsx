import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const notifyError = vi.hoisted(() => vi.fn());
vi.mock('@/shared/lib', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib')>()),
  notify: { success: vi.fn(), error: notifyError },
}));
vi.mock('../api/actions', () => ({
  connectAction: vi.fn().mockResolvedValue({ ok: false, message: 'Claude Code data not found' }),
  disconnectAction: vi.fn().mockResolvedValue({ ok: true }),
}));

const { ConnectButton } = await import('./connect-button');

describe('ConnectButton', () => {
  it('notifies with the error message when the action fails', async () => {
    render(<ConnectButton connected={false} />);
    await userEvent.click(screen.getByRole('button', { name: /connect/i }));
    await vi.waitFor(() => expect(notifyError).toHaveBeenCalledWith('Claude Code data not found'));
  });

  it('offers Disconnect when connected', () => {
    render(<ConnectButton connected />);
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
  });
});
