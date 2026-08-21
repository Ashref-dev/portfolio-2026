import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { useLenis } from 'lenis/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

import { cn } from '../../lib/utils';
import { SaveButton } from './SaveButton';
import { EYEBROW } from './WallpaperHero';
import { altTextFor, NATIVE_HEIGHT, NATIVE_WIDTH, type Wallpaper } from './data';

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const formatSize = (bytes: number): string => `${(bytes / 1_000_000).toFixed(1)} MB`;

interface WallpaperDetailProps {
  wallpaper: Wallpaper;
  index: number;
  total: number;
  label: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const WallpaperDetail = ({
  wallpaper,
  index,
  total,
  label,
  onClose,
  onPrev,
  onNext,
}: WallpaperDetailProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  /** The scroll panel covers the backdrop edge to edge, so only a hit test can detect a dismissing click. */
  const handleSurfaceClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-dialog-surface]')) return;
      onClose();
    },
    [onClose]
  );

  const trapTab = useCallback((event: KeyboardEvent) => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
        case 'Tab':
          trapTab(event);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrev, trapTab]);

  /**
   * Two locks, because there are two scrollers. Lenis owns the virtual scroll
   * position on pointer devices and is simply absent on touch, where the
   * native `overflow` lock is the only thing that stops the page behind.
   */
  useEffect(() => {
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [lenis]);

  useLayoutEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, { opacity: 0, duration: 0.32, ease: 'power2.out' });
      gsap.from(panelRef.current, {
        opacity: 0,
        scale: 0.985,
        duration: 0.5,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from(plateRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [wallpaper.id]);

  if (typeof document === 'undefined') return null;

  const counter = `${wallpaper.id} / ${total}`;

  return createPortal(
    <div className='fixed inset-0 z-[300] font-sans'>
      <div
        ref={backdropRef}
        aria-hidden='true'
        className='absolute inset-0 bg-[#fafafa]/92 backdrop-blur-2xl'
      />

      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-label={`${wallpaper.colorway} wallpaper — ${label}`}
        tabIndex={-1}
        data-lenis-prevent=''
        onClick={handleSurfaceClick}
        className='relative flex h-full w-full flex-col overflow-y-auto focus:outline-none'
      >
        <div
          data-dialog-surface=''
          className='mx-auto flex w-full max-w-[80rem] items-center justify-between px-6 py-6 md:px-10'
        >
          <span className={cn(EYEBROW, 'tabular-nums')}>Sheet {counter}</span>
          <button
            type='button'
            onClick={onClose}
            className='flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/70 text-neutral-900 transition-all duration-500 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]'
          >
            <X className='h-4 w-4' aria-hidden='true' />
            <span className='sr-only'>Close</span>
          </button>
        </div>

        <div className='mx-auto flex w-full max-w-[80rem] flex-1 flex-col items-center gap-12 px-6 pb-20 md:px-10 lg:flex-row lg:items-center lg:justify-center lg:gap-20 lg:pb-10'>
          <div ref={plateRef} data-dialog-surface='' className='relative shrink-0'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute -inset-16'
              style={{
                background: `radial-gradient(52% 42% at 50% 52%, ${wallpaper.accent}4d, transparent 70%)`,
              }}
            />
            <div
              className='relative aspect-[1572/3408] w-[56vw] max-w-[17rem] overflow-hidden rounded-[2.4rem] bg-neutral-200 shadow-[0_50px_90px_-36px_rgba(15,23,42,0.55)] ring-1 ring-neutral-900/10 lg:h-[68vh] lg:w-auto lg:max-w-none'
              style={{
                backgroundImage: `url("${wallpaper.blur}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <img
                key={wallpaper.id}
                src={wallpaper.preview}
                srcSet={`${wallpaper.preview} 1x, ${wallpaper.preview2x} 2x`}
                alt={altTextFor(wallpaper)}
                width={NATIVE_WIDTH}
                height={NATIVE_HEIGHT}
                decoding='async'
                fetchPriority='high'
                className='h-full w-full object-cover'
              />
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent mix-blend-overlay'
              />
            </div>
          </div>

          <div data-dialog-surface='' className='w-full max-w-lg'>
            <div className='flex items-center gap-2.5'>
              <span
                className='h-2 w-2 shrink-0 rounded-full'
                style={{ backgroundColor: wallpaper.accent }}
              />
              <span className={EYEBROW}>{wallpaper.colorway}</span>
            </div>

            <p className='mt-6 font-serif text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-tight text-neutral-900'>
              {wallpaper.quote.before}
              {wallpaper.quote.em ? (
                <em className='font-serif italic'>{wallpaper.quote.em}</em>
              ) : null}
              {wallpaper.quote.after}
            </p>

            <dl className='mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200'>
              {[
                { term: 'Resolution', detail: `${NATIVE_WIDTH} × ${NATIVE_HEIGHT}` },
                { term: 'Format', detail: 'JPEG' },
                { term: 'Size', detail: formatSize(wallpaper.bytes) },
              ].map((spec) => (
                <div
                  key={spec.term}
                  className='flex flex-col gap-1 bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5'
                >
                  <dt className='font-sans text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500'>
                    {spec.term}
                  </dt>
                  <dd className='font-sans text-[11px] font-semibold tracking-tight text-neutral-900 tabular-nums sm:text-sm'>
                    {spec.detail}
                  </dd>
                </div>
              ))}
            </dl>

            <div className='mt-10 flex flex-wrap items-center gap-4'>
              <SaveButton wallpaper={wallpaper} />

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={onPrev}
                  className='flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition-all duration-500 hover:-translate-y-0.5 hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]'
                >
                  <ArrowLeft className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'>Previous wallpaper</span>
                </button>
                <button
                  type='button'
                  onClick={onNext}
                  className='flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition-all duration-500 hover:-translate-y-0.5 hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]'
                >
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'>Next wallpaper</span>
                </button>
              </div>
            </div>

            <p className='mt-6 text-xs leading-relaxed text-neutral-500'>
              Saving delivers the original {NATIVE_WIDTH} × {NATIVE_HEIGHT} JPEG. The image
              above is a compressed preview. Sheet {index + 1} of {total}.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
