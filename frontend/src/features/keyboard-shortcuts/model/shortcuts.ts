export interface ShortcutDef {
  keys: readonly string[];
  action: string;
  /** Needs the "single-key shortcuts" preference to be on. */
  singleKey: boolean;
}

/** DESIGN.md §8. */
export const SHORTCUTS: readonly ShortcutDef[] = [
  { keys: ['mod', 'K'], action: 'Open command palette', singleKey: false },
  { keys: ['/'], action: 'Open command palette', singleKey: true },
  { keys: ['S'], action: 'Sync now', singleKey: true },
  { keys: ['1'], action: 'Show 7 days', singleKey: true },
  { keys: ['2'], action: 'Show 30 days', singleKey: true },
  { keys: ['3'], action: 'Show 90 days', singleKey: true },
  { keys: ['E'], action: 'Export CSV', singleKey: true },
  { keys: ['T'], action: 'Cycle theme', singleKey: true },
  { keys: ['?'], action: 'Show shortcuts', singleKey: true },
  { keys: ['Esc'], action: 'Close dialog', singleKey: false },
];
