'use client';

import { Keyboard } from 'lucide-react';

import { overlay, useHasOverlayHost } from '@/shared/lib';
import { Button, ShortcutKbd, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';

export function ShortcutsButton({ tooltipSide }: { tooltipSide?: 'right' | 'bottom' }) {
  if (!useHasOverlayHost()) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="icon"
          size="icon"
          aria-label="Keyboard shortcuts"
          aria-haspopup="dialog"
          aria-keyshortcuts="?"
          onClick={() => overlay.open('shortcuts')}
        >
          <Keyboard aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide ?? 'right'}>
        Shortcuts <ShortcutKbd keys={['?']} />
      </TooltipContent>
    </Tooltip>
  );
}
