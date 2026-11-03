'use client';

import { useLenis } from 'lenis/react';
import type { ComponentProps, MouseEvent } from 'react';

const SCROLL_OFFSET = -24;

/**
 * In-page anchor. With Lenis mounted it smooth-scrolls; otherwise the browser jumps natively
 * (and the href keeps working without JS). Focus moves to the target either way.
 */
export function ScrollLink({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const target = document.getElementById(href.replace(/^#/, ''));
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    if (lenis) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: SCROLL_OFFSET });
      window.history.replaceState(null, '', href);
    }
    target.focus({ preventScroll: true });
  };

  // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from the spread props
  return <a href={href} onClick={handleClick} {...props} />;
}
