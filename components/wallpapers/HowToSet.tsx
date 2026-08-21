import { cn } from '../../lib/utils';
import { Reveal } from '../Reveal';
import { EYEBROW, RULER_STYLE, WALLPAPER_SHELL } from './WallpaperHero';

interface Step {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

const STEPS: readonly Step[] = [
  {
    id: '01',
    title: 'Save the image',
    body: 'Tap Save on any wallpaper. iOS opens the share sheet — choose Save Image to add it to Photos.',
  },
  {
    id: '02',
    title: 'Open Settings',
    body: 'Go to Settings, then Wallpaper, then Add New Wallpaper, and pick Photos.',
  },
  {
    id: '03',
    title: 'Turn off Perspective Zoom',
    body: 'Select the wallpaper, pinch slightly outward so it sits at native scale, then tap Add. Turning off Perspective Zoom keeps the grid perfectly aligned.',
  },
];

export const HowToSet = () => (
  <section className='relative border-t border-neutral-100 py-24 md:py-32'>
    <div className={WALLPAPER_SHELL}>
      <Reveal>
        <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-16'>
          <div>
            <span className={cn(EYEBROW, 'block')}>Assembly · One minute</span>
            <h2 className='mt-5 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900'>
              How to
              <span className='font-serif font-light italic text-emerald-600 md:pl-3'> set it.</span>
            </h2>
          </div>
          <div aria-hidden='true' className='hidden h-2.5 flex-1 md:block' style={RULER_STYLE} />
        </div>
      </Reveal>

      <ol className='mt-14 flex flex-col md:mt-20'>
        {STEPS.map((step) => (
          <li key={step.id} className='border-t border-neutral-100 last:border-b'>
            <Reveal>
              <div className='flex flex-col gap-4 py-10 md:flex-row md:items-baseline md:gap-16 md:py-14'>
                <span className='shrink-0 font-sans text-[10px] font-bold tracking-[0.2em] text-neutral-500 tabular-nums md:w-16'>
                  {step.id}
                </span>
                <div className='max-w-2xl'>
                  <h3 className='font-serif text-3xl leading-none text-neutral-900 md:text-5xl'>
                    {step.title}
                  </h3>
                  <p className='mt-4 text-sm leading-relaxed text-neutral-600 md:mt-5 md:text-base'>
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
