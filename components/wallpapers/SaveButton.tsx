import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';

import { track } from '../../lib/analytics';
import { cn } from '../../lib/utils';
import type { Wallpaper } from './data';

type SaveState = 'idle' | 'preparing' | 'done';

/** How long the confirmed state stays on screen before reverting to idle. */
const DONE_MS = 2000;
/**
 * Object URLs are revoked late rather than immediately: Safari cancels an
 * in-flight download the moment its blob URL is released.
 */
const REVOKE_MS = 60_000;

const LABEL: Readonly<Record<SaveState, string>> = {
  idle: 'Save',
  preparing: 'Preparing…',
  done: 'Saved',
};

/**
 * Probe for file sharing support before touching the network.
 *
 * This is the whole reason the button exists. On iOS Safari the `download`
 * attribute cannot write into Photos — it opens a preview instead — whereas
 * `navigator.share({ files })` raises the native share sheet with "Save Image",
 * which does. Everywhere else the plain anchor is already the better answer, so
 * we let the browser handle the click untouched.
 */
function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') {
    return false;
  }
  if (typeof File === 'undefined') return false;

  try {
    const probe = new File([new Uint8Array(1)], 'probe.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export interface SaveButtonProps {
  wallpaper: Wallpaper;
  /** `solid` is the detail-view control, `compact` the pill overlaid on a grid card. */
  variant?: 'solid' | 'compact';
  className?: string;
}

export const SaveButton = ({
  wallpaper,
  variant = 'solid',
  className,
}: SaveButtonProps) => {
  const [state, setState] = useState<SaveState>('idle');

  const isMounted = useRef(true);
  const timers = useRef<Set<number>>(new Set());
  const objectUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    isMounted.current = true;
    const pendingTimers = timers.current;
    const pendingUrls = objectUrls.current;

    return () => {
      isMounted.current = false;
      pendingTimers.forEach((id) => window.clearTimeout(id));
      pendingTimers.clear();
      pendingUrls.forEach((url) => URL.revokeObjectURL(url));
      pendingUrls.clear();
    };
  }, []);

  const schedule = useCallback((task: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      task();
    }, delay);
    timers.current.add(id);
  }, []);

  /**
   * Last resort. Anything that is not a deliberate cancel lands here so the
   * click always produces a file, even when share, fetch or CORS misbehave.
   */
  const forceDownload = useCallback(
    (blob: Blob | null) => {
      const href = blob ? URL.createObjectURL(blob) : wallpaper.full;
      if (blob) {
        objectUrls.current.add(href);
        schedule(() => {
          if (objectUrls.current.delete(href)) URL.revokeObjectURL(href);
        }, REVOKE_MS);
      }

      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = wallpaper.filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    },
    [schedule, wallpaper.filename, wallpaper.full]
  );

  const report = useCallback(
    (method: 'share' | 'download' | 'fallback' | 'browser') => {
      track('wallpaper_downloaded', {
        id: wallpaper.id,
        colorway: wallpaper.colorway,
        filename: wallpaper.filename,
        source: variant === 'compact' ? 'grid' : 'detail',
        method,
      });
    },
    [variant, wallpaper.colorway, wallpaper.filename, wallpaper.id]
  );

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (state === 'preparing') {
        event.preventDefault();
        return;
      }

      // Modified clicks (open in new tab, save link as) keep their native meaning.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        report('browser');
        return;
      }
      if (!canShareFiles()) {
        report('download');
        return;
      }

      event.preventDefault();
      setState('preparing');

      let blob: Blob | null = null;

      try {
        const response = await fetch(wallpaper.full);
        if (!response.ok) throw new Error(`Wallpaper request failed: ${response.status}`);

        blob = await response.blob();
        const file = new File([blob], wallpaper.filename, { type: 'image/jpeg' });

        if (!navigator.canShare({ files: [file] })) {
          throw new Error('This file cannot be shared on this device.');
        }

        await navigator.share({ files: [file] });
        report('share');

        if (!isMounted.current) return;
        setState('done');
        schedule(() => {
          if (isMounted.current) setState('idle');
        }, DONE_MS);
      } catch (error) {
        // A cancelled share sheet is a normal outcome, not a failure to report.
        if (error instanceof DOMException && error.name === 'AbortError') {
          if (isMounted.current) setState('idle');
          return;
        }

        forceDownload(blob);
        report('fallback');
        if (!isMounted.current) return;
        setState('done');
        schedule(() => {
          if (isMounted.current) setState('idle');
        }, DONE_MS);
      }
    },
    [forceDownload, report, schedule, state, wallpaper.filename, wallpaper.full]
  );

  const isCompact = variant === 'compact';
  const Icon = state === 'preparing' ? Loader2 : state === 'done' ? Check : Download;

  return (
    <a
      href={wallpaper.full}
      download={wallpaper.filename}
      onClick={handleClick}
      aria-busy={state === 'preparing'}
      aria-disabled={state === 'preparing' || undefined}
      title={`Save ${wallpaper.colorway} — ${wallpaper.filename}`}
      className={cn(
        'group/save relative inline-flex select-none items-center justify-center font-sans font-bold uppercase',
        'transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]',
        isCompact
          ? 'gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[9px] tracking-[0.18em] text-neutral-900 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-md hover:bg-white'
          : 'gap-2.5 rounded-full bg-neutral-900 px-7 py-4 text-[11px] tracking-[0.2em] text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]',
        state === 'preparing' && 'cursor-progress',
        className
      )}
    >
      <Icon
        aria-hidden='true'
        className={cn(
          'shrink-0',
          isCompact ? 'h-3 w-3' : 'h-4 w-4',
          state === 'preparing' && 'animate-spin',
          state === 'done' && 'text-emerald-500'
        )}
      />
      <span aria-live='polite'>{LABEL[state]}</span>
    </a>
  );
};
