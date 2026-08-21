import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '../../lib/utils';
import { PrimaryButton } from '../ui/PrimaryButton';
import {
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  WALLPAPER_COUNT,
  wallpapers,
  type Wallpaper,
} from './data';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wider than the site's 70rem `landing-shell` on purpose: this page is a
 * specimen sheet, and a five-across plate of phone-shaped tiles needs the
 * extra measure. It matches the footer's own `max-w-7xl` so the page still
 * lines up with the rest of the portfolio.
 */
export const WALLPAPER_SHELL = 'mx-auto w-full max-w-[80rem] px-6 md:px-10';

export const EYEBROW =
  'font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500';

/** Drafting-ruler hairline: minor ticks every 12px, major every 60px. */
export const RULER_STYLE: React.CSSProperties = {
  backgroundImage: [
    'repeating-linear-gradient(to right, rgba(23,23,23,0.30) 0 1px, transparent 1px 60px)',
    'repeating-linear-gradient(to right, rgba(23,23,23,0.16) 0 1px, transparent 1px 12px)',
  ].join(', '),
  backgroundSize: '100% 10px, 100% 5px',
  backgroundPosition: 'left bottom, left bottom',
  backgroundRepeat: 'repeat-x, repeat-x',
};

const BLUEPRINT_STYLE: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(to right, rgba(23,23,23,0.05) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(23,23,23,0.05) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '72px 72px',
  maskImage: 'radial-gradient(115% 85% at 50% 0%, #000 25%, transparent 78%)',
  WebkitMaskImage: 'radial-gradient(115% 85% at 50% 0%, #000 25%, transparent 78%)',
};

interface FanSlot {
  readonly id: string;
  /** Horizontal offset expressed in card widths, so the fan scales with `--card-w`. */
  readonly offset: number;
  readonly rotate: number;
  /** Downward nudge in px; the outer cards sit lower, like a held hand of cards. */
  readonly lift: number;
  readonly scale: number;
  readonly z: number;
  /** Scroll-parallax weight. Front card moves least so depth reads correctly. */
  readonly depth: number;
  /** Literal class strings — Tailwind cannot see values assembled at runtime. */
  readonly visibility: string;
}

const FAN: readonly FanSlot[] = [
  { id: '03', offset: -0.66, rotate: -13, lift: 54, scale: 0.88, z: 10, depth: 1, visibility: 'hidden lg:block' },
  { id: '11', offset: -0.34, rotate: -6.5, lift: 20, scale: 0.945, z: 20, depth: 0.68, visibility: 'hidden sm:block' },
  { id: '19', offset: 0.34, rotate: 6.5, lift: 20, scale: 0.945, z: 20, depth: 0.68, visibility: 'hidden sm:block' },
  { id: '07', offset: 0.66, rotate: 13, lift: 54, scale: 0.88, z: 10, depth: 1, visibility: 'hidden lg:block' },
];

const CENTRE_ID = '01';

const byId = (id: string): Wallpaper => {
  const match = wallpapers.find((wallpaper) => wallpaper.id === id);
  if (!match) throw new Error(`Hero references wallpaper ${id}, which does not exist.`);
  return match;
};

interface FanCardProps {
  wallpaper: Wallpaper;
  priority: boolean;
}

const FanCard = ({ wallpaper, priority }: FanCardProps) => (
  <div
    className='relative aspect-[1572/3408] w-full overflow-hidden rounded-[2.2rem] bg-neutral-200 shadow-[0_44px_80px_-32px_rgba(15,23,42,0.45)] ring-1 ring-neutral-900/10'
    style={{
      backgroundImage: `url("${wallpaper.blur}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <img
      src={wallpaper.preview}
      alt=''
      width={NATIVE_WIDTH}
      height={NATIVE_HEIGHT}
      decoding='async'
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      className='h-full w-full object-cover'
    />
    {/* Screen sheen: reads as glass without resorting to a drawn device frame. */}
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent mix-blend-overlay'
    />
  </div>
);

interface WallpaperHeroProps {
  isTouchDevice: boolean;
}

export const WallpaperHero = ({ isTouchDevice }: WallpaperHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let started = false;
    let ctx: gsap.Context | undefined;

    // Hidden via gsap, never via a class: the prerendered snapshot has to ship
    // this copy fully visible for crawlers that do not run JavaScript.
    gsap.set(section.querySelectorAll('.wp-hero-line'), {
      y: 34,
      opacity: 0,
      filter: 'blur(12px)',
    });
    gsap.set(section.querySelectorAll('.wp-fan-enter'), {
      y: 60,
      opacity: 0,
      scale: 0.94,
    });

    const start = () => {
      if (started) return;
      started = true;

      ctx = gsap.context(() => {
        const timeline = gsap.timeline();

        timeline
          .to('.wp-hero-line', {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.1,
            stagger: 0.09,
            ease: 'power3.out',
          })
          .to(
            '.wp-fan-enter',
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.3,
              stagger: { each: 0.08, from: 'center' },
              ease: 'power3.out',
            },
            0.15
          );

        if (isTouchDevice) return;

        gsap.to('.wp-fan-float', {
          y: -14,
          duration: 3.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: 'center' },
        });

        gsap.utils.toArray<HTMLElement>('.wp-fan-parallax').forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? '0');
          gsap.to(layer, {
            y: -110 * depth,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        });
      }, section);
    };

    window.addEventListener('app-ready', start);
    const fallback = window.setTimeout(start, 2200);
    if (document.documentElement.dataset.appReady === 'true') start();

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('app-ready', start);
      ctx?.revert();
    };
  }, [isTouchDevice]);

  const centre = byId(CENTRE_ID);

  return (
    <section
      ref={sectionRef}
      className='relative flex min-h-[100svh] flex-col justify-center overflow-x-clip pt-36 pb-16 md:pt-44 md:pb-24'
    >
      <div aria-hidden='true' className='pointer-events-none absolute inset-0' style={BLUEPRINT_STYLE} />

      <div className={cn(WALLPAPER_SHELL, 'relative')}>
        <div className='grid items-center gap-16 lg:grid-cols-12 lg:gap-10'>
          <div className='lg:col-span-6 xl:col-span-6'>
            <div className='wp-hero-line inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white/70 px-4 py-2 backdrop-blur-sm'>
              <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600' />
              <span className={EYEBROW}>{WALLPAPER_COUNT} originals · Free</span>
            </div>

            <h1 className='wp-hero-line mt-8 text-[clamp(2.9rem,8.5vw,6.25rem)] font-bold leading-[0.86] tracking-tighter text-neutral-900'>
              Wallpapers
              <span className='mt-2 block font-serif text-[0.92em] font-light italic text-blue-600 md:mt-1'>
                for a better you.
              </span>
            </h1>

            <p className='wp-hero-line mt-8 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg'>
              Drafting-grid blueprints laid over soft, silk-like gradients, each carrying a
              single line typeset in a high-contrast serif. Every sheet is exported at 1572
              × 3408 — native scale on iPhone, with margin left for parallax.
            </p>

            <div className='wp-hero-line mt-10 flex flex-col gap-4 sm:flex-row sm:items-center'>
              <PrimaryButton
                href='#grid'
                icon
                className='px-8 py-4 text-[11px] uppercase tracking-[0.2em]'
              >
                Browse the pack
              </PrimaryButton>
              <PrimaryButton
                href='/#work'
                variant='secondary'
                className='px-8 py-4 text-[11px] uppercase tracking-[0.2em]'
              >
                See the work
              </PrimaryButton>
            </div>
          </div>

          <div className='lg:col-span-6 xl:col-span-6'>
            <div
              aria-hidden='true'
              className='relative flex justify-center pb-14 [--card-w:12rem] sm:[--card-w:11rem] lg:[--card-w:10.5rem] xl:[--card-w:12rem]'
            >
              {FAN.map((slot) => {
                const wallpaper = byId(slot.id);
                return (
                  <div
                    key={slot.id}
                    className={cn('absolute top-0 left-1/2 w-[var(--card-w)]', slot.visibility)}
                    style={{
                      zIndex: slot.z,
                      transform: `translate(calc(-50% + var(--card-w) * ${slot.offset}), ${slot.lift}px) rotate(${slot.rotate}deg) scale(${slot.scale})`,
                    }}
                  >
                    <div className='wp-fan-parallax' data-depth={slot.depth}>
                      <div className='wp-fan-float'>
                        <div className='wp-fan-enter'>
                          <FanCard wallpaper={wallpaper} priority={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* The centre card stays in normal flow so it defines the plate height. */}
              <div className='relative z-30 w-[var(--card-w)]'>
                <div className='wp-fan-parallax' data-depth='0.28'>
                  <div className='wp-fan-float'>
                    <div className='wp-fan-enter'>
                      <FanCard wallpaper={centre} priority />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className={cn(EYEBROW, 'wp-hero-line mt-2 text-center')}>
              Drawn to scale · {NATIVE_WIDTH} × {NATIVE_HEIGHT}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

interface SpecItem {
  readonly value: string;
  readonly label: string;
}

const SPECS: readonly SpecItem[] = [
  { value: `${WALLPAPER_COUNT} wallpapers`, label: 'Originals in the pack' },
  { value: `${NATIVE_WIDTH} × ${NATIVE_HEIGHT}`, label: 'Pixels, native export' },
  { value: 'JPEG · original quality', label: 'Untouched, never re-encoded' },
  { value: 'Free · no signup', label: 'No email, no tracking' },
];

/** Hairlines differ per cell (2×2 below `lg`, 4-up above) and Tailwind only sees literal classes. */
const SPEC_CELL: readonly string[] = [
  'pr-5',
  'border-l border-neutral-200 pl-5 md:pl-8',
  'border-t border-neutral-200 pr-5 pt-8 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-8 xl:pl-8',
  'border-t border-l border-neutral-200 pl-5 pt-8 md:pl-8 lg:border-t-0 lg:pt-8',
];

/**
 * The drafting ruler that separates the plate from the index. Deliberately
 * slim: it is a measuring device, not a feature band.
 */
export const SpecRule = () => (
  <section aria-label='Pack specifications' className='relative border-y border-neutral-200 bg-white/50'>
    <div aria-hidden='true' className='absolute inset-x-0 top-0 h-2.5' style={RULER_STYLE} />

    <div className={cn(WALLPAPER_SHELL, 'relative')}>
      <dl className='grid grid-cols-2 lg:grid-cols-4'>
        {SPECS.map((spec, index) => (
          <div
            key={spec.value}
            className={cn('flex flex-col gap-1.5 py-8 md:py-9', SPEC_CELL[index])}
          >
            <dt className='font-sans text-[0.95rem] font-semibold tracking-tight text-neutral-900 md:text-lg'>
              {spec.value}
            </dt>
            <dd className={EYEBROW}>{spec.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);
