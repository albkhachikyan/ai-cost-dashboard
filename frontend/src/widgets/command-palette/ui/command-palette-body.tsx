'use client';

import { Calendar, Download, Keyboard, Link2, Link2Off, Palette, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { overlay } from '@/shared/lib';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ShortcutKbd,
} from '@/shared/ui';

import { useAppActions } from '../model/use-app-actions';

interface CommandPaletteBodyProps {
  open: boolean;
  connected: boolean;
}

function Row({
  icon,
  label,
  keys,
  keywords,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  keys?: readonly string[];
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <CommandItem value={label} {...(keywords ? { keywords } : {})} onSelect={onSelect}>
      {icon}
      <span>{label}</span>
      {keys ? <ShortcutKbd keys={keys} className="ml-auto" /> : null}
    </CommandItem>
  );
}

export function CommandPaletteBody({ open, connected }: CommandPaletteBodyProps) {
  const actions = useAppActions(connected);
  const exec = (fn: () => void) => () => {
    overlay.close();
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) overlay.close();
      }}
      title="Command palette"
      description="Search for an action and press Enter to run it."
    >
      <CommandInput placeholder="Search or run a command" />
      <CommandList>
        <CommandEmpty>No matching command.</CommandEmpty>
        <CommandGroup heading="Actions">
          {connected ? (
            <Row
              icon={<RefreshCw aria-hidden />}
              label="Sync now"
              keys={['S']}
              keywords={['refresh', 'import']}
              onSelect={exec(actions.sync)}
            />
          ) : null}
          <Row
            icon={connected ? <Link2Off aria-hidden /> : <Link2 aria-hidden />}
            label={connected ? 'Disconnect Claude Code' : 'Connect Claude Code'}
            keywords={['link', 'source']}
            onSelect={exec(actions.toggleConnection)}
          />
          <Row
            icon={<Download aria-hidden />}
            label="Export CSV"
            keys={['E']}
            keywords={['download']}
            onSelect={exec(actions.exportCsv)}
          />
        </CommandGroup>
        <CommandGroup heading="View">
          {([7, 30, 90] as const).map((days, i) => (
            <Row
              key={days}
              icon={<Calendar aria-hidden />}
              label={`Last ${days} days`}
              keys={[String(i + 1)]}
              keywords={['range', 'period']}
              onSelect={exec(() => actions.setRange(days))}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Preferences">
          <Row
            icon={<Palette aria-hidden />}
            label={`Cycle theme (${actions.themeLabel})`}
            keys={['T']}
            keywords={['dark', 'light', 'appearance']}
            onSelect={exec(actions.cycleTheme)}
          />
          <Row
            icon={<Keyboard aria-hidden />}
            label="Keyboard shortcuts"
            keys={['?']}
            keywords={['help', 'keys']}
            onSelect={() => overlay.open('shortcuts')}
          />
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
