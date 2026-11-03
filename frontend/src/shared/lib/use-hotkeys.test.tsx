import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SINGLE_KEY_STORAGE_KEY } from './single-key-shortcuts';
import { useHotkeys } from './use-hotkeys';

function Harness({ bindings }: { bindings: Record<string, (e: KeyboardEvent) => void> }) {
  useHotkeys(bindings);
  return <input aria-label="field" />;
}

describe('useHotkeys', () => {
  beforeEach(() => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux x86_64');
    window.localStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('fires single keys and prevents default', () => {
    const s = vi.fn();
    render(<Harness bindings={{ s }} />);
    const notCancelled = fireEvent.keyDown(document.body, { key: 's' });
    expect(s).toHaveBeenCalledTimes(1);
    expect(notCancelled).toBe(false);
  });

  it('fires mod+k with Ctrl on non-mac', () => {
    const open = vi.fn();
    render(<Harness bindings={{ 'mod+k': open }} />);
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    expect(open).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('uses Cmd on mac', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const open = vi.fn();
    render(<Harness bindings={{ 'mod+k': open }} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(open).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('ignores events while typing', () => {
    const s = vi.fn();
    const { getByLabelText } = render(<Harness bindings={{ s, 'mod+k': s }} />);
    fireEvent.keyDown(getByLabelText('field'), { key: 's' });
    fireEvent.keyDown(getByLabelText('field'), { key: 'k', ctrlKey: true });
    expect(s).not.toHaveBeenCalled();
  });

  it('ignores IME composition', () => {
    const s = vi.fn();
    render(<Harness bindings={{ s }} />);
    fireEvent.keyDown(document.body, { key: 's', isComposing: true });
    expect(s).not.toHaveBeenCalled();
  });

  it('blocks single keys, not mod+k, when the flag is off', () => {
    window.localStorage.setItem(SINGLE_KEY_STORAGE_KEY, 'off');
    const s = vi.fn();
    const open = vi.fn();
    render(<Harness bindings={{ s, 'mod+k': open }} />);
    fireEvent.keyDown(document.body, { key: 's' });
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(s).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('ignores single keys when a modifier is held, but allows shift for ?', () => {
    const s = vi.fn();
    const help = vi.fn();
    render(<Harness bindings={{ s, '?': help }} />);
    fireEvent.keyDown(document.body, { key: 's', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 's', metaKey: true });
    fireEvent.keyDown(document.body, { key: 's', altKey: true });
    expect(s).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: '?', shiftKey: true });
    expect(help).toHaveBeenCalledTimes(1);
  });
});
