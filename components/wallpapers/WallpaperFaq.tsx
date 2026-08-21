import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Reveal } from '../Reveal';
import { EYEBROW, WALLPAPER_SHELL } from './WallpaperHero';

interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Verbatim mirror of the FAQPage JSON-LD in `wallpapers/index.html`. Structured
 * data that disagrees with the visible copy is a manual-action risk, so these
 * two must be edited together or not at all.
 */
const FAQ: readonly FaqEntry[] = [
  {
    id: '01',
    question: 'Are these iPhone wallpapers free?',
    answer:
      'Yes. All 21 wallpapers are free to download and use on your own devices. There is no signup, no email, and no tracking. Please do not resell them or repackage them as your own.',
  },
  {
    id: '02',
    question: 'What resolution are the wallpapers?',
    answer:
      'Every wallpaper is 1572 × 3408 pixels. That is deliberately taller than the iPhone 16 screen so iOS has margin for parallax and the composition is never cropped into.',
  },
  {
    id: '03',
    question: 'Do they work on models other than iPhone 16?',
    answer:
      'Yes. The 1572 × 3408 export covers every recent iPhone from the 12 onward, and iOS scales it down cleanly. On Android and on iPad the aspect ratio differs, so expect some cropping at the top and bottom.',
  },
  {
    id: '04',
    question: 'Why does the text look slightly off-centre on my lock screen?',
    answer:
      'The quote sits below the centre line on purpose, so the iOS clock and widgets never overlap it. If it drifts, turn off Perspective Zoom when setting the wallpaper.',
  },
  {
    id: '05',
    question: 'Can I use these commercially?',
    answer:
      'No. Personal use is free and encouraged. For commercial licensing, or for a custom set, email hi@achraf.tn.',
  },
];

export const WallpaperFaq = () => (
  <section className='relative border-t border-neutral-100 py-24 md:py-32'>
    <div className={WALLPAPER_SHELL}>
      <div className='grid gap-12 lg:grid-cols-12 lg:gap-16'>
        <div className='lg:col-span-4'>
          <Reveal>
            <span className={cn(EYEBROW, 'block')}>Notes</span>
            <h2 className='mt-5 text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900'>
              Before you
              <span className='block font-serif font-light italic text-blue-600'>ask.</span>
            </h2>
            <p className='mt-8 max-w-sm text-sm leading-relaxed text-neutral-600'>
              Anything still unclear, or you want a set drawn for your own brand? Write to{' '}
              <a
                href='mailto:hi@achraf.tn'
                className='font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors duration-500 hover:decoration-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]'
              >
                hi@achraf.tn
              </a>
              .
            </p>
          </Reveal>
        </div>

        <div className='lg:col-span-8'>
          {FAQ.map((entry) => (
            <details
              key={entry.id}
              className='group border-t border-neutral-200 last:border-b'
            >
              <summary className='flex cursor-pointer list-none items-center gap-5 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa] [&::-webkit-details-marker]:hidden'>
                <span className='shrink-0 font-sans text-[10px] font-bold tracking-[0.2em] text-neutral-500 tabular-nums'>
                  {entry.id}
                </span>
                <h3 className='flex-1 font-serif text-xl leading-snug text-neutral-900 transition-colors duration-500 group-hover:text-blue-600 md:text-2xl'>
                  {entry.question}
                </h3>
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition-colors duration-500 group-hover:border-neutral-400'>
                  <ChevronDown
                    aria-hidden='true'
                    className='h-4 w-4 transition-transform duration-500 ease-out group-open:rotate-180'
                  />
                </span>
              </summary>

              <p className='max-w-2xl pb-8 pl-[2.6rem] text-sm leading-relaxed text-neutral-600 md:text-base'>
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  </section>
);
