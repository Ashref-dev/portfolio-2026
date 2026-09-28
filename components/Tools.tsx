import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Tool {
  id: string;
  name: string;
  domain: string;
  description: string;
}

const tools: readonly Tool[] = [
  {
    id: 'remi',
    name: 'Remi',
    domain: 'remi.achraf.tn',
    description:
      'Liquid Glass notes that live in the macOS menu bar, one keystroke away. Written in Swift, free and open source, and the project I am proudest of. It is open on my Mac every day.',
  },
  {
    id: 'ots',
    name: 'OTS',
    domain: 'ots.achraf.tn',
    description:
      'One-time secret links, encrypted in your browser and burned after a single read. Fully sovereign and self-hosted in Tunisia, it is how I share anything sensitive.',
  },
  {
    id: 'blank',
    name: 'blank.',
    domain: 'blank.achraf.tn',
    description:
      'A clutter-free page for quick notes that lives in your browser, no account needed. I use it to stage prompts and screenshots before handing them to my agents.',
  },
  {
    id: 'diff',
    name: 'diff',
    domain: 'diff.achraf.tn',
    description:
      'Paste two texts and see every change instantly, split or unified, with word-level highlights and syntax colors. It stays fast at ten thousand lines and never leaves your browser.',
  },
  {
    id: 'md',
    name: 'md.',
    domain: 'md.achraf.tn',
    description:
      'Paste Markdown, get a clean, print-ready PDF with tables, code, Mermaid and LaTeX. Everything renders in the browser and nothing is uploaded. It is how my agents’ output becomes documents I can send.',
  },
  {
    id: 'excel',
    name: 'excel.',
    domain: 'excel.achraf.tn',
    description:
      'Drop in .xlsx, .xls or .csv files and get clean Markdown tables, one sheet or every sheet at once. The quickest way to turn a spreadsheet into something a doc or a prompt can use.',
  },
];

export const Tools = () => {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('.tools-reveal', { y: 24, opacity: 0 });

      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        gsap.to('.tools-reveal', {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      };

      window.addEventListener('app-ready', start);
      const fallback = window.setTimeout(start, 2200);
      if (document.documentElement.dataset.appReady === 'true') start();

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener('app-ready', start);
      };
    }, containerRef);

    return () => mm.revert();
  }, []);

  return (
    <section
      id='tools'
      ref={containerRef}
      aria-labelledby='tools-title'
      className='relative z-10 bg-[#fafafa] px-6 pb-24 scroll-mt-24 md:pb-32 md:scroll-mt-32'
    >
      <div className='landing-shell'>
        <h2
          id='tools-title'
          className='tools-reveal mb-12 text-[clamp(2.5rem,5vw,4.75rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900 md:mb-16'
        >
          Tools I
          <span className='mt-2 block font-serif font-normal italic text-amber-600 md:mt-0 md:inline md:pl-4'>
            Built.
          </span>
        </h2>

        <ul className='grid grid-cols-1 gap-x-5 gap-y-14 md:grid-cols-2 md:gap-y-16'>
          {tools.map((tool) => (
            <li key={tool.id} className='tools-reveal'>
              <a
                href={`https://${tool.domain}`}
                target='_blank'
                rel='noopener noreferrer'
                className='group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-8 focus-visible:ring-offset-[#fafafa]'
              >
                <div className='overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.02]'>
                  <img
                    src={`/assets/tools/${tool.id}-og.webp`}
                    alt={tool.name}
                    width={1200}
                    height={630}
                    loading='lazy'
                    decoding='async'
                    className='block aspect-[1200/630] w-full'
                  />
                </div>

                <div className='px-1 pt-6'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={`/assets/tools/${tool.id}-icon.webp`}
                      alt=''
                      width={256}
                      height={256}
                      loading='lazy'
                      decoding='async'
                      className='size-10 shrink-0 rounded-[26%] ring-1 ring-black/5'
                    />
                    <h3 className='text-2xl font-bold tracking-tight text-neutral-900'>
                      {tool.name}
                    </h3>
                    {/* Light-glass twin of the Selected Works pill. The label
                        track animates 0fr -> 1fr so every domain length expands
                        to its own width; touch devices get it open by default. */}
                    <span className='ml-auto flex h-10 shrink-0 items-center overflow-hidden rounded-full border border-neutral-900/10 bg-neutral-900/[0.04] backdrop-blur-md transition-colors duration-500 group-hover:bg-neutral-900/[0.08]'>
                      <span className='grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-hover:opacity-100 pointer-coarse:grid-cols-[1fr] pointer-coarse:opacity-100'>
                        <span className='overflow-hidden'>
                          <span className='block whitespace-nowrap pl-4 pr-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-900'>
                            {tool.domain}
                          </span>
                        </span>
                      </span>
                      <span className='flex size-10 shrink-0 items-center justify-center'>
                        <ArrowUpRight className='size-4 text-neutral-900 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-45 group-hover:scale-110' />
                      </span>
                    </span>
                  </div>
                  <p className='mt-4 max-w-[34rem] text-[15px] leading-relaxed text-neutral-600'>
                    {tool.description}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
