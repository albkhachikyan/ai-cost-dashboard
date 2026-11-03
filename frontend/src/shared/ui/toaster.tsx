'use client';

import { Toaster as SonnerToaster } from './shadcn/sonner';

export function Toaster() {
  return <SonnerToaster position="bottom-right" className="z-toast" />;
}
