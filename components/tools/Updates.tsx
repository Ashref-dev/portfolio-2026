import { Reveal } from '../Reveal';

interface Update {
  date: string;
  label: string;
  text: string;
  image?: { src: string; alt: string; width: number; height: number };
}

const updates: readonly Update[] = [
  {
    date: '2026-10-05',
    label: 'Oct 5, 2026',
    text: 'Cloudflare emailed me to say my sites passed 10K global page views last month, a first for achraf.tn. I did not expect that at all. Thank you to everyone who stopped by.',
    image: {
      src: '/assets/tools/updates/cloudflare-10k.webp',
      alt: 'Cloudflare email: Congrats on surpassing 10,000 pageviews on achraf.tn last month.',
      width: 1600,
      height: 953,
    },
  },
  {
    date: '2026-10-01',
    label: 'Oct 1, 2026',
    text: 'Started on my next project: a fully local meeting transcription app for macOS. Nothing leaves your Mac. I think it might end up being the best thing I have built. More soon.',
  },
];

export const Updates = () => (
  <section aria-labelledby='updates-title' className='px-6 pb-24 md:pb-32'>
    <div className='landing-shell'>
      <Reveal>
        <h2
          id='updates-title'
          className='border-t border-neutral-200 pt-14 text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-tighter text-neutral-900 md:pt-20'
        >
          Update
          <span className='pl-3 font-serif font-normal italic text-amber-600'>log.</span>
        </h2>
      </Reveal>

      <ol className='mt-12 md:mt-16'>
        {updates.map((update) => (
          <li key={update.date}>
            <Reveal>
              <article className='relative grid gap-3 pb-14 pl-7 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-10 md:pl-0'>
                <span
                  aria-hidden='true'
                  className='absolute bottom-0 left-[3px] top-2 w-px bg-neutral-200 md:left-[calc(9rem+1.25rem-0.5px)]'
                />
                <span
                  aria-hidden='true'
                  className='absolute left-0 top-[0.45rem] size-[7px] rounded-full bg-amber-600 ring-4 ring-[#fafafa] md:left-[calc(9rem+1.25rem-3.5px)]'
                />
                <time
                  dateTime={update.date}
                  className='font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 md:pt-0.5'
                >
                  {update.label}
                </time>
                <div className='md:pl-10'>
                  <p className='max-w-2xl text-base leading-relaxed text-neutral-700 md:text-[17px]'>
                    {update.text}
                  </p>
                  {update.image && (
                    <figure className='mt-6 max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white'>
                      <img
                        src={update.image.src}
                        alt={update.image.alt}
                        width={update.image.width}
                        height={update.image.height}
                        loading='lazy'
                        decoding='async'
                        className='block h-auto w-full'
                      />
                    </figure>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
