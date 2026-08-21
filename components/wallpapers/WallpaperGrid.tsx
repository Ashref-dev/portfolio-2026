import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderDown } from 'lucide-react';

import { track } from '../../lib/analytics';
import { cn } from '../../lib/utils';
import { SaveButton } from './SaveButton';
import { WallpaperDetail } from './WallpaperDetail';
import { EYEBROW, WALLPAPER_SHELL } from './WallpaperHero';
import {
  altTextFor,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  plainQuote,
  WALLPAPER_COUNT,
  wallpapers,
  type Quote,
  type Wallpaper,
} from './data';

gsap.registerPlugin(ScrollTrigger);

const EAGER_COUNT = 4;

// Gitignored; emitted by scripts/build-wallpaper-zip.mjs. Stored uncompressed,
// so the archive size is exactly the sum of the originals.
const PACK_HREF = '/wallpapers/achraf-wallpaper-pack.zip';
const PACK_FILENAME = 'achraf-wallpaper-pack.zip';
const PACK_MB = Math.round(
  wallpapers.reduce((total, wallpaper) => total + wallpaper.bytes, 0) / 1_000_000
);

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Emitted as raw HTML rather than JSX children on purpose.
 *
 * React's server renderer escapes apostrophes to `&#x27;`, which would make
 * `scripts/prerender.mjs` fail its content assertions — it compares the static
 * snapshot against the plain source strings. The input is a typed literal from
 * `data.ts`, never user input, and `&`, `<` and `>` are still escaped here.
 */
const quoteHtml = (quote: Quote): string => {
  const emphasis = quote.em
    ? `<em class="font-serif italic">${escapeHtml(quote.em)}</em>`
    : '';
  return `${escapeHtml(quote.before)}${emphasis}${escapeHtml(quote.after)}`;
};

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  index: number;
  onOpen: (index: number) => void;
  registerRef: (index: number, node: HTMLButtonElement | null) => void;
}

const WallpaperCard = ({ wallpaper, index, onOpen, registerRef }: WallpaperCardProps) => {
  const isEager = index < EAGER_COUNT;

  return (
    <figure className='wp-card group relative'>
      <div className='relative'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -inset-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
          style={{
            background: `radial-gradient(58% 46% at 50% 56%, ${wallpaper.accent}59, transparent 72%)`,
          }}
        />

        <div className='relative transition-transform duration-500 ease-out group-hover:-translate-y-1.5'>
          <button
            type='button'
            ref={(node) => {
              registerRef(index, node);
            }}
            onClick={() => onOpen(index)}
            aria-haspopup='dialog'
            className='block w-full cursor-pointer overflow-hidden rounded-[1.6rem] bg-neutral-200 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.5)] ring-1 ring-neutral-900/10 transition-shadow duration-500 group-hover:shadow-[0_34px_60px_-28px_rgba(15,23,42,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]'
            style={{
              backgroundImage: `url("${wallpaper.blur}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <img
              data-wp-img=''
              src={wallpaper.preview}
              srcSet={`${wallpaper.preview} 1x, ${wallpaper.preview2x} 2x`}
              alt={altTextFor(wallpaper)}
              width={NATIVE_WIDTH}
              height={NATIVE_HEIGHT}
              decoding='async'
              loading={isEager ? 'eager' : 'lazy'}
              fetchPriority={isEager ? 'high' : 'auto'}
              className='aspect-[1572/3408] w-full object-cover'
            />
          </button>

          <div
            aria-hidden='true'
            className='hover-trigger pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[1.6rem] bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100'
          />

          {/* `group-focus-within` matters: an opacity-0 control is still tabbable. */}
          <SaveButton
            wallpaper={wallpaper}
            variant='compact'
            className='hover-trigger absolute right-3 bottom-3 translate-y-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
          />
        </div>
      </div>

      <figcaption className='mt-4 flex items-start gap-3'>
        <span className='mt-0.5 shrink-0 font-sans text-[10px] font-bold tracking-[0.18em] text-neutral-500 tabular-nums'>
          {wallpaper.id}
        </span>
        <p
          className='font-serif text-[0.9rem] leading-snug text-neutral-700 md:text-[0.95rem]'
          dangerouslySetInnerHTML={{ __html: quoteHtml(wallpaper.quote) }}
        />
      </figcaption>
    </figure>
  );
};

export const WallpaperGrid = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const registerRef = useCallback((index: number, node: HTMLButtonElement | null) => {
    cardRefs.current[index] = node;
  }, []);

  const handleOpen = useCallback((index: number) => {
    const wallpaper = wallpapers[index];
    track('wallpaper_opened', { id: wallpaper.id, colorway: wallpaper.colorway });
    setOpenIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    const closing = openIndex;
    setOpenIndex(null);
    if (closing === null) return;

    // Deferred one frame: the card only regains focusability after the dialog unmounts.
    requestAnimationFrame(() =>
      cardRefs.current[closing]?.focus({ preventScroll: true })
    );
  }, [openIndex]);

  const handleStep = useCallback((delta: number) => {
    setOpenIndex((current) =>
      current === null ? current : (current + delta + WALLPAPER_COUNT) % WALLPAPER_COUNT
    );
  }, []);

  /**
   * Reveals the preview once it decodes. Driven by gsap instead of a class so
   * the prerendered snapshot ships every image at full opacity — an
   * `opacity-0` in `className` would hide them from crawlers and from anyone
   * whose JavaScript never arrives.
   */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const images = Array.from(section.querySelectorAll<HTMLImageElement>('img[data-wp-img]'));
    const detach: Array<() => void> = [];

    images.forEach((image) => {
      // `complete` covers cached successes and hard failures alike; neither
      // fires another event, so anything already settled must be shown
      // outright. Setting opacity explicitly rather than returning early
      // matters: on a remount this image may still carry an `opacity: 0`
      // left by a previous pass, and nothing else would ever clear it.
      if (image.complete) {
        gsap.set(image, { opacity: 1 });
        return;
      }

      gsap.set(image, { opacity: 0 });
      const reveal = () => {
        gsap.to(image, { opacity: 1, duration: 0.55, ease: 'power2.out' });
      };

      image.addEventListener('load', reveal, { once: true });
      image.addEventListener('error', reveal, { once: true });
      detach.push(() => {
        image.removeEventListener('load', reveal);
        image.removeEventListener('error', reveal);
      });
    });

    return () => {
      detach.forEach((teardown) => teardown());
      gsap.set(images, { clearProps: 'opacity' });
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.wp-grid-header', {
        y: 40,
        opacity: 0,
        filter: 'blur(14px)',
        duration: 1.1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%' },
      });

      const cards = gsap.utils.toArray<HTMLElement>('.wp-card');
      gsap.set(cards, { opacity: 0, y: 30 });

      // One batched trigger instead of twenty: cheaper to refresh and it keeps
      // the stagger reading as a single wave rather than twenty separate ones.
      ScrollTrigger.batch(cards, {
        start: 'top 94%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.055,
            ease: 'power3.out',
            overwrite: true,
          }),
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const open = openIndex === null ? null : wallpapers[openIndex];

  return (
    <section
      ref={sectionRef}
      id='grid'
      className='relative scroll-mt-24 border-t border-neutral-100 py-24 md:py-32'
    >
      <div className={WALLPAPER_SHELL}>
        <div className='flex flex-col gap-8 border-b border-neutral-200 pb-10 md:flex-row md:items-end md:justify-between md:gap-16'>
          <div>
            <span className={cn(EYEBROW, 'wp-grid-header block')}>
              Index · Sheets 01—{WALLPAPER_COUNT}
            </span>
            <h2 className='wp-grid-header mt-5 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900'>
              Pick
              <span className='font-serif font-light italic text-blue-600 pl-1.5 md:pl-3'>
                {' '}
                your line.
              </span>
            </h2>
          </div>
          <div className='wp-grid-header flex max-w-xs flex-col items-start gap-5'>
            <p className='text-sm leading-relaxed text-neutral-600'>
              Open any sheet for the full view. Save pulls the untouched JPEG straight from the
              original export, never the compressed preview shown here.
            </p>
            <a
              href={PACK_HREF}
              download={PACK_FILENAME}
              onClick={() =>
                track('wallpaper_pack_downloaded', {
                  count: WALLPAPER_COUNT,
                  megabytes: PACK_MB,
                })
              }
              className={cn(
                'group/pack inline-flex items-center gap-2.5 rounded-full border border-neutral-300/80 px-5 py-3',
                'font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900',
                'transition-all duration-500 hover:-translate-y-1 hover:border-neutral-400 hover:bg-white',
                'hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2'
              )}
            >
              <FolderDown
                aria-hidden='true'
                className='h-3.5 w-3.5 shrink-0 transition-transform duration-500 group-hover/pack:translate-y-0.5'
              />
              Download all
              <span className='font-normal tracking-[0.12em] text-neutral-400 tabular-nums'>
                ZIP · {PACK_MB} MB
              </span>
            </a>
          </div>
        </div>

        <div className='mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4 lg:gap-x-8 xl:grid-cols-5'>
          {wallpapers.map((wallpaper, index) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              index={index}
              onOpen={handleOpen}
              registerRef={registerRef}
            />
          ))}
        </div>
      </div>

      {open !== null && openIndex !== null && (
        <WallpaperDetail
          wallpaper={open}
          index={openIndex}
          total={WALLPAPER_COUNT}
          label={plainQuote(open.quote)}
          onClose={handleClose}
          onPrev={() => handleStep(-1)}
          onNext={() => handleStep(1)}
        />
      )}
    </section>
  );
};
