import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import type { ReactNode } from 'react';

import { AppRail } from '@/widgets/app-rail';

import { Providers } from './_providers/providers';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Your Claude usage · ai-cost',
  description: 'Claude Code token usage dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.variable}>
        <Providers>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-label focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="flex min-h-dvh p-4 lg:p-8">
            <div className="mx-auto flex w-full max-w-frame rounded-frame bg-background">
              <AppRail />
              <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
