'use client';

import { useId } from 'react';

import { useSingleKeyShortcuts } from '@/shared/lib';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ShortcutKbd,
  Switch,
} from '@/shared/ui';

import { SHORTCUTS } from '../model/shortcuts';

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const [singleKey, setSingleKey] = useSingleKeyShortcuts();
  const switchId = useId();
  const descId = useId();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Move around the dashboard without the mouse.</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col divide-y divide-border">
          {SHORTCUTS.map(({ keys, action, singleKey: needsFlag }) => (
            <div key={`${keys.join('+')}-${action}`} className="flex items-center gap-4 py-2">
              <dt className="w-24 shrink-0">
                <ShortcutKbd keys={keys} />
              </dt>
              <dd
                className={
                  needsFlag && !singleKey ? 'text-body text-muted-foreground' : 'text-body'
                }
              >
                {action}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-start justify-between gap-4 rounded-card bg-card p-4">
          <div className="flex flex-col gap-1">
            {/* Radix Switch renders a button, which is a valid label target. */}
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor={switchId} className="cursor-pointer text-label">
              Single-key shortcuts
            </label>
            <p id={descId} className="text-caption text-muted-foreground">
              Letters and numbers run actions on their own. Turn off if they clash with assistive
              technology. Ctrl or ⌘ + K always works.
            </p>
          </div>
          <Switch
            id={switchId}
            aria-describedby={descId}
            checked={singleKey}
            onCheckedChange={setSingleKey}
            className="mt-1 cursor-pointer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
