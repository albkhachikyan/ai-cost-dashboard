'use client';

import { Command } from 'lucide-react';

import { overlay, useHasOverlayHost } from '@/shared/lib';
import { Button, ShortcutKbd, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';

export function PaletteButton() {
  if (!useHasOverlayHost()) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="icon"
          size="icon"
          aria-label="Command palette"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          onClick={() => overlay.open('palette')}
        >
          <Command aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Command palette <ShortcutKbd keys={['mod', 'K']} />
      </TooltipContent>
    </Tooltip>
  );
}
