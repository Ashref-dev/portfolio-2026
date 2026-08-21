import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '../lib/utils';
import { InfiniteSlider } from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-blur';
import { PrimaryButton } from './ui/PrimaryButton';
import {
  wallpapers,
  WALLPAPER_COUNT,
  altTextFor,
  NATIVE_WIDTH,
  NATIVE_HEIGHT,
  type Wallpaper,
} from './wallpapers/data';

gsap.registerPlugin(ScrollTrigger);

/**
 * A curated ten, ordered for chromatic rhythm rather than by id, so the strip
 * alternates warm and cool instead of drifting through one hue block.
 * `InfiniteSlider` duplicates its children internally, so ten entries already
 * paint twenty tiles — the full pack would double that for no visual gain.
 */
const MARQUEE_IDS = [
  '01',
  '05',
  '19',
  '07',
  '11',
  '03',
  '14',
  '02',
  '06',
  '04',
] as const;

const wallpaperById = new Map<string, Wallpaper>(
  wallpapers.map((wallpaper) => [wallpaper.id, wallpaper]),
);

const curated = MARQUEE_IDS.map((id) => wallpaperById.get(id)).filter(
  (wallpaper): wallpaper is Wallpaper => wallpaper !== undefined,
);

/**
 * The curated list is a soft preference, not a contract: if the pack is ever
 * re-cut and those ids stop existing, the band degrades to the first ten
 * rather than rendering a half-empty strip.
 */
const marqueeWallpapers: readonly Wallpaper[] =
  curated.length >= 6 ? curated : wallpapers.slice(0, 10);

const CARD_SIZE = 'h-[10rem] sm:h-[13rem] md:h-[18.5rem] aspect-[1572/3408]';
const CARD_SHELL =
  'relative shrink-0 overflow-hidden rounded-[1.4rem] bg-neutral-800 bg-cover bg-center ' +
  'shadow-[0_26px_50px_-18px_rgba(0,0,0,0.9)]';

/**
 * Resolved on mount and kept live. The server always reports `false`, which is
 * deliberate: the static snapshot must contain the real marquee markup so the
 * tiles are crawlable, and the client swaps to the still strip on first paint
 * (the page mounts with `createRoot`, so there is no hydration contract).
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      if (typeof window === 'undefined' || !window.matchMedia) return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return prefersReducedMotion;
}

// The image must stay out of flow: in flow, its 1572px intrinsic width becomes
// the tile's max-content contribution inside the slider's `w-max` row and blows
// the card open. Absolute leaves the aspect ratio as the only width source.
const PhoneTile: React.FC<{ wallpaper: Wallpaper }> = ({ wallpaper }) => (
  <div
    className={cn(CARD_SHELL, CARD_SIZE)}
    style={{ backgroundImage: `url("${wallpaper.blur}")` }}
  >
    <img
      src={wallpaper.preview}
      alt={altTextFor(wallpaper)}
      width={NATIVE_WIDTH}
      height={NATIVE_HEIGHT}
      loading='lazy'
      decoding='async'
      draggable={false}
      className='absolute inset-0 h-full w-full select-none object-cover'
    />
    {/* Glass edge: a hairline plus a single specular sweep, so the tile reads
        as a lit object on the shelf instead of a flat sticker. */}
    <div className='pointer-events-none absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-white/15' />
    <div className='pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent' />
  </div>
);

export const WallpaperTeaser: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.wt-reveal', {
        y: 40,
        opacity: 0,
        filter: 'blur(15px)',
        scale: 0.97,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      });

      // Opacity and y only: the strip carries a CSS rotation, and letting GSAP
      // write a full transform would flatten the tilt when the tween settles.
      gsap.from('.wt-wall', {
        y: 28,
        opacity: 0,
        duration: 1.4,
        delay: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const tiles = marqueeWallpapers.map((wallpaper) => (
    <PhoneTile key={wallpaper.id} wallpaper={wallpaper} />
  ));

  // Doubled by hand: the still strip loses InfiniteSlider's internal duplication
  // and would otherwise stop short of the shelf edge on a wide viewport.
  const stillTiles = [...marqueeWallpapers, ...marqueeWallpapers].map(
    (wallpaper, index) => (
      <PhoneTile key={`${wallpaper.id}-${index}`} wallpaper={wallpaper} />
    ),
  );

  return (
    <section
      ref={containerRef}
      aria-labelledby='wallpaper-teaser-title'
      className='relative z-20 border-t border-neutral-100 bg-[#fafafa] px-6 py-12 md:py-24'
    >
      <div className='landing-shell'>
        {/* The shelf. Inset and dark rather than a full-bleed inversion: the
            artwork needs a near-black stage to read as lit, but the page still
            has to hand a light edge to the footer reveal below. */}
        <div className='relative overflow-hidden rounded-[1.75rem] bg-neutral-900 ring-1 ring-black/5 md:rounded-[2.25rem]'>
          {/* Drafting grid — the pack itself is built on one. */}
          <div
            className='pointer-events-none absolute inset-0 opacity-[0.055]'
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div
            className='pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className='pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]' />
          <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent' />

          {/* The wall column must be minmax(0,1fr): as a bare 1fr its min-content
              floor is the entire tile strip, which crushes the copy column. */}
          <div className='relative grid items-center gap-y-6 px-6 py-8 md:grid-cols-[minmax(20rem,25rem)_minmax(0,1fr)] md:gap-x-10 md:px-12 md:py-12'>
            {/* Copy */}
            <div className='flex flex-col items-start'>
              <div className='wt-reveal inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                <span className='font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400'>
                  Free download
                </span>
              </div>

              <h2
                id='wallpaper-teaser-title'
                className='wt-reveal mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-tighter text-[#fafafa]'
              >
                Wallpapers,
                <span className='mt-2 block font-serif font-light italic text-blue-400'>
                  on the house.
                </span>
              </h2>

              <p className='wt-reveal mt-4 max-w-sm font-sans text-sm leading-relaxed text-neutral-400 md:mt-5 md:text-[15px]'>
                Drafting grids and angle arcs laid over soft silk colors,
                made for iPhone at full native resolution. Free.
              </p>

              <div className='wt-reveal mt-7 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 md:mt-8'>
                <PrimaryButton
                  href='/wallpapers'
                  icon={true}
                  variant='secondary'
                  className={cn(
                    'w-full justify-center px-8 py-4 text-sm sm:w-auto',
                    'border-transparent bg-white text-neutral-900',
                    'hover:border-transparent hover:bg-neutral-100',
                    'shadow-[0_20px_45px_-14px_rgba(0,0,0,0.7)] hover:shadow-[0_30px_60px_-16px_rgba(0,0,0,0.85)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900',
                  )}
                >
                  Get the pack
                </PrimaryButton>

                <p className='flex items-center font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-400'>
                  {WALLPAPER_COUNT} files
                  <span
                    aria-hidden='true'
                    className='mx-3 inline-block h-3 w-px bg-white/20'
                  />
                  {NATIVE_WIDTH} &times; {NATIVE_HEIGHT}
                </p>
              </div>
            </div>

            {/* The wall. Decorative repetition of what the copy already states,
                so it is kept out of the accessibility tree; the alt strings stay
                on the images for crawlers and for any context that unhides it. */}
            <div
              aria-hidden='true'
              className='wt-wall -mx-6 min-w-0 md:-mr-12 md:ml-0'
            >
              <div className='md:-rotate-3'>
                <div className='relative'>
                  {prefersReducedMotion ? (
                    <div className='w-full select-none overflow-hidden'>
                      <div className='flex w-max gap-4'>{stillTiles}</div>
                    </div>
                  ) : (
                    <InfiniteSlider
                      gap={16}
                      duration={38}
                      className='w-full select-none'
                    >
                      {tiles}
                    </InfiniteSlider>
                  )}

                  {/* Feather both ends so the strip bleeds into the shelf
                      instead of stopping at a hard cut. The stacked
                      backdrop-filter layers are pointer-device only: on touch
                      they would repaint the whole strip every scroll frame,
                      and the gradient alone already carries the fade there. */}
                  <ProgressiveBlur
                    direction='left'
                    blurLayers={5}
                    blurIntensity={0.5}
                    className='pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 md:block'
                  />
                  <div className='pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-transparent md:w-24' />

                  <ProgressiveBlur
                    direction='right'
                    blurLayers={5}
                    blurIntensity={0.5}
                    className='pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-28 md:block'
                  />
                  <div className='pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-neutral-900 via-neutral-900/70 to-transparent md:w-28' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
