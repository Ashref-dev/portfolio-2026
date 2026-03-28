'use client';
import { InfiniteSlider } from './infinite-slider';
import { ProgressiveBlur } from './progressive-blur';

type Logo = {
  src: string;
  alt: string;
  name: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<'div'> & {
  logos: Logo[];
};

export function LogoCloud({ logos, className, ...props }: LogoCloudProps) {
  return (
    <div className={`relative mx-auto w-full py-6 ${className || ''}`} {...props}>
      <InfiniteSlider gap={42} reverse duration={60} durationOnHover={20}>
        {logos.map((logo) => (
          <div key={`logo-${logo.name}`} className="flex items-center gap-3 select-none px-4">
            <img
              alt={logo.alt}
              className='pointer-events-none w-8 h-8 md:w-10 md:h-10 object-contain'
              loading='lazy'
              src={logo.src}
            />
            <span className="text-xl md:text-2xl font-serif italic text-neutral-400">
              {logo.name}
            </span>
          </div>
        ))}
      </InfiniteSlider>

      <div className='pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-10' />
      <div className='pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-10' />

      <ProgressiveBlur
        blurIntensity={2}
        className='pointer-events-none absolute top-0 left-0 h-full w-[160px] z-20'
        direction='left'
      />
      <ProgressiveBlur
        blurIntensity={2}
        className='pointer-events-none absolute top-0 right-0 h-full w-[160px] z-20'
        direction='right'
      />
    </div>
  );
}
