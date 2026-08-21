import { useState } from 'react';

/**
 * Resolved once, on mount, and never updated.
 *
 * Both page shells branch their whole component tree on this value — Lenis
 * wraps the app on fine pointers, native scrolling is used on coarse ones —
 * so reacting to a mid-session change would remount everything and destroy
 * scroll position and every live ScrollTrigger. A stale value after a device
 * mode switch is a far cheaper failure than that.
 */
export function useIsCoarsePointer(): boolean {
  const [isCoarse] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;

    return (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches ||
      navigator.maxTouchPoints > 0
    );
  });

  return isCoarse;
}
