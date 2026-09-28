import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock } from 'lucide-react';

import { Github } from '../ui/BrandIcons';
import { GlassPill, PillArrow } from './GlassPill';
import type { Tool } from './data';

gsap.registerPlugin(ScrollTrigger);

const LABEL =
  'font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400';

const PILL_LINK =
  'group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]';

const LIGHTS = ['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]'] as const;

const isMacApp = (tool: Tool) => tool.runsOn.includes('macOS');

const TrafficLights = () => (
  <span aria-hidden='true' className='flex items-center gap-1.5'>
    {LIGHTS.map((color) => (
      <span
        key={color}
        className={`size-2.5 rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)] ${color}`}
      />
    ))}
  </span>
);

/** Browser chrome for web apps, a titlebar for native ones. The artwork below is never cropped. */
const WindowFrame = ({ tool }: { tool: Tool }) => {
  const mac = isMacApp(tool);

  return (
    <div className='overflow-hidden rounded-xl border border-neutral-900/10 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_56px_-32px_rgba(15,23,42,0.35)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.02]'>
      <div
        className={`grid grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center border-b border-black/[0.07] px-3.5 ${mac ? 'h-9 bg-neutral-100/80' : 'h-10 bg-neutral-50'}`}
      >
        <TrafficLights />
        {mac ? (
          <span className='truncate text-center text-[12px] font-semibold text-neutral-700'>
            {tool.name}
          </span>
        ) : (
          <span className='mx-auto flex h-6 w-full max-w-[15rem] items-center justify-center gap-1.5 rounded-md bg-black/[0.045] px-3 text-[11px] text-neutral-500'>
            <Lock aria-hidden='true' strokeWidth={2.25} className='size-2.5 shrink-0 text-neutral-400' />
            <span className='truncate'>{tool.domain}</span>
          </span>
        )}
        <span />
      </div>
      <img
        src={`/assets/tools/${tool.id}-og.webp`}
        alt=''
        width={1200}
        height={630}
        loading='lazy'
        decoding='async'
        className='te-image block aspect-[1200/630] h-auto w-full bg-neutral-100'
      />
    </div>
  );
};

export function ToolEntry({ tool, index }: { tool: Tool; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const site = `https://${tool.domain}`;
  const source = `https://github.com/${tool.repo}`;
  const flipped = index % 2 === 1;

  useLayoutEffect(() => {
    const article = ref.current;
    if (!article) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', (context) => {
      const q = gsap.utils.selector(article);
      const reveal = q('.te-reveal');
      const image = q('.te-image');
      const lines = q('.te-line');

      // The inset overshoots on three sides so the frame's shadow is never clipped mid-wipe.
      gsap.set(reveal, { clipPath: 'inset(-12% -12% 100% -12%)' });
      gsap.set(image, { scale: 1.04, transformOrigin: '50% 0%' });
      gsap.set(lines, { opacity: 0, y: 18 });

      let started = false;
      const start = () => {
        if (started) return;
        started = true;

        context.add(() => {
          gsap
            .timeline({
              scrollTrigger: { trigger: article, start: 'top 75%', once: true },
            })
            .to(reveal, {
              clipPath: 'inset(-12% -12% -12% -12%)',
              duration: 1.2,
              ease: 'power3.inOut',
              clearProps: 'clipPath',
            })
            .to(image, { scale: 1, duration: 1.4, ease: 'power3.out', clearProps: 'transform' }, 0.1)
            .to(lines, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.2);
        });
      };

      window.addEventListener('app-ready', start);
      const fallback = window.setTimeout(start, 2200);
      if (document.documentElement.dataset.appReady === 'true') start();

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener('app-ready', start);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <article
      ref={ref}
      className={`grid items-center gap-10 border-t border-neutral-200 py-14 md:gap-16 md:py-24 ${flipped ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]' : 'md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'}`}
    >
      <a
        href={site}
        target='_blank'
        rel='noopener noreferrer'
        tabIndex={-1}
        aria-hidden='true'
        className={`te-reveal group block ${flipped ? 'md:order-2' : ''}`}
      >
        <WindowFrame tool={tool} />
      </a>

      <div className={`flex flex-col ${flipped ? 'md:order-1' : ''}`}>
        <div className='te-line flex items-center gap-4'>
          <span className='font-mono text-xs tabular-nums text-amber-600'>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span aria-hidden='true' className='h-px w-10 bg-neutral-200' />
        </div>

        <div className='te-line mt-6 flex items-center gap-3.5'>
          <img
            src={`/assets/tools/${tool.id}-icon.webp`}
            alt=''
            width={256}
            height={256}
            loading='lazy'
            decoding='async'
            className='size-12 shrink-0 rounded-[26%] ring-1 ring-black/5'
          />
          <h2 className='text-4xl font-bold tracking-tighter text-neutral-900'>{tool.name}</h2>
        </div>

        <p className='te-line mt-5 text-[15px] leading-relaxed text-neutral-600 md:text-base'>
          {tool.description}
        </p>

        <dl className='te-line mt-8 border-t border-neutral-100 text-sm'>
          <div className='flex items-baseline justify-between gap-6 border-b border-neutral-100 py-3'>
            <dt className={LABEL}>Runs on</dt>
            <dd className='text-right text-neutral-900'>{tool.runsOn}</dd>
          </div>
          <div className='flex items-baseline justify-between gap-6 border-b border-neutral-100 py-3'>
            <dt className={LABEL}>Source</dt>
            <dd className='min-w-0 truncate text-right font-mono text-[13px] text-neutral-900'>
              {tool.repo}
            </dd>
          </div>
          <div className='flex items-baseline justify-between gap-6 border-b border-neutral-100 py-3'>
            <dt className={LABEL}>Kind</dt>
            <dd className='text-right text-neutral-900'>{isMacApp(tool) ? 'macOS app' : 'Web app'}</dd>
          </div>
        </dl>

        <div className='te-line mt-8 flex flex-wrap items-center gap-3'>
          <a
            href={site}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Open ${tool.name} at ${tool.domain}`}
            className={PILL_LINK}
          >
            <GlassPill label={tool.domain}>
              <PillArrow />
            </GlassPill>
          </a>
          <a
            href={source}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`${tool.name} source code on GitHub`}
            className={PILL_LINK}
          >
            <GlassPill label='GitHub'>
              <Github className='size-4' />
            </GlassPill>
          </a>
        </div>
      </div>
    </article>
  );
}
