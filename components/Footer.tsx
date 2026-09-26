import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FileText, Globe, Database, Palette } from 'lucide-react';

// lucide-react 1.x dropped brand marks, so these two ship as inline SVG.
const Linkedin = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className={className}>
    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
  </svg>
);

const Github = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className={className}>
    <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
  </svg>
);

function useIsCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerType = () => setIsCoarse(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePointerType);

    return () => mediaQuery.removeEventListener('change', updatePointerType);
  }, []);

  return isCoarse;
}

export const Footer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isCoarsePointer = useIsCoarsePointer();

  useLayoutEffect(() => {
    if (isCoarsePointer) {
      if (magneticRef.current) gsap.set(magneticRef.current, { x: 0, y: 0 });
      if (glowRef.current) gsap.set(glowRef.current, { x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const magnetic = magneticRef.current;
      const glow = glowRef.current;
      if (!magnetic || !glow) return;

      const xTo = gsap.quickTo(magnetic, 'x', {
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      });
      const yTo = gsap.quickTo(magnetic, 'y', {
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      });

      const glowXTo = gsap.quickTo(glow, 'x', {
        duration: 1.5,
        ease: 'power3.out',
      });
      const glowYTo = gsap.quickTo(glow, 'y', {
        duration: 1.5,
        ease: 'power3.out',
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = clientX - (rect.left + rect.width / 2);
        const y = clientY - (rect.top + rect.height / 2);

        // Magnetic text logic
        const mRect = magnetic.getBoundingClientRect();
        const mx = clientX - (mRect.left + mRect.width / 2);
        const my = clientY - (mRect.top + mRect.height / 2);
        const mDist = Math.sqrt(mx * mx + my * my);

        if (mDist < 400) {
          xTo(mx * 0.35);
          yTo(my * 0.35);
        } else {
          xTo(0);
          yTo(0);
        }

        // Global glow logic
        glowXTo(x * 0.1);
        glowYTo(y * 0.1);
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, containerRef);
    return () => ctx.revert();
  }, [isCoarsePointer]);

  const socialLinks = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/achrafbenabdallah/',
      icon: Linkedin,
    },
    {
      label: 'Behance',
      href: 'https://www.behance.net/MohamedAshrefBna',
      icon: Palette,
    },
    { label: 'GitHub', href: 'https://github.com/Ashref-dev', icon: Github },
    {
      label: 'Kaggle',
      href: 'https://www.kaggle.com/mohamedashrefbna',
      icon: Database,
    },
  ];

  return (
    <footer
      ref={containerRef}
      className='relative min-h-[85dvh] bg-neutral-900 flex flex-col items-center justify-between py-12 px-6 overflow-hidden lg:py-16 md:min-h-0 md:h-full'
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      {/* Background Architectural Grid */}
      <div className='absolute inset-0 opacity-[0.03] pointer-events-none'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Background Noise */}
      <div
        className='absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* `min-h-0` lets this block absorb any height squeeze. Without it a flex
          item refuses to shrink below its content and pushes the link bar out
          of the fixed-height reveal container, where `overflow-hidden` eats it. */}
      <div className='max-w-7xl w-full mx-auto min-h-0 flex-1 flex flex-col items-center justify-center z-10'>
        <div className='flex items-center gap-4 mb-6 lg:mb-10'>
          <div className='flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-500/30 bg-neutral-500/10 backdrop-blur-sm'>
            <div className='w-1.5 h-1.5 rounded-full bg-neutral-500' />
            <span className='text-[10px] font-sans font-bold tracking-[0.3em] text-neutral-400 uppercase'>
              Unavailable for projects
            </span>
          </div>
        </div>

        <div className='group/cta flex flex-col items-center'>
          <div
            ref={magneticRef}
            className='relative cursor-pointer'
            style={isCoarsePointer ? { transform: 'translate3d(0, 0, 0)' } : undefined}
          >
          <a
            href='mailto:hi@achraf.tn'
            target='_blank'
            rel='noopener noreferrer'
            className='block text-center relative z-10'
          >
            <h2 className='text-[clamp(3.5rem,min(14vw,19vh),13rem)] font-serif italic text-[#fafafa] leading-[0.8] tracking-tighter transition-all duration-700 group-hover/cta:text-rose-600 group-hover/cta:scale-[1.02]'>
              Let's
              <br />
              Talk<span className='text-rose-600 font-light'>.</span>
            </h2>
          </a>

          {/* Advanced Glow Effect */}
          <div
            ref={glowRef}
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-rose-600/5 blur-[140px] rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity duration-1000 -z-10'
          />
        </div>

          <div className='mt-8 [@media(min-height:800px)]:mt-16 opacity-100 md:opacity-0 group-hover/cta:opacity-100 transition-all duration-500 translate-y-0 md:translate-y-4 group-hover/cta:translate-y-0 flex flex-col items-center gap-3 w-full'>
            <p className='text-neutral-500 font-sans text-[11px] font-bold tracking-[0.4em] uppercase ml-[0.2em]'>
              hi@achraf.tn
            </p>
            <a
              href='https://www.linkedin.com/in/achrafbenabdallah/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-neutral-500 underline underline-offset-4 underline-red-600 font-sans text-[11px] font-medium hover:text-neutral-400 transition-colors duration-300 text-center'
            >
              Don't like mail? Send me a message instead.
            </a>
          </div>
        </div>
      </div>

      <div className='max-w-7xl w-full mx-auto shrink-0 flex flex-col lg:flex-row justify-between items-center z-10 border-t border-neutral-800/80 pt-6 gap-6 lg:gap-8'>
        {/* Left: Socials */}
        <div className='flex items-center gap-6 lg:gap-8'>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={link.label}
              className='flex items-center gap-2 text-neutral-500 hover:text-[#fafafa] transition-colors duration-300 group'
            >
              <link.icon className='w-4 h-4 transition-transform group-hover:-rotate-12 group-hover:scale-110 shrink-0' />
              <span className='font-sans text-[10px] font-bold tracking-[0.2em] uppercase hidden md:block'>
                {link.label}
              </span>
            </a>
          ))}
        </div>

        {/* Center: Location */}
        <div className='flex items-center gap-2 text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-[0.3em]'>
          <Globe className='w-3 h-3 text-neutral-600' />
          <span>Based in Tunis, TN</span>
        </div>

        {/* Right: Actions & Copyright */}
        <div className='flex flex-col md:flex-row items-center gap-6 lg:gap-8'>
          <div className='flex flex-col items-center md:items-start gap-1.5'>
            <p className='text-[9px] font-sans font-bold tracking-[0.3em] text-neutral-600 uppercase text-center md:text-left'>
              &copy; {new Date().getFullYear()} Achraf.tn
            </p>
            <p className='text-[7px] font-sans uppercase tracking-[0.25em] text-neutral-500 text-center md:text-left'>
              Photos by <a href='https://www.pexels.com/@aemyr-sahli-154798633/' target='_blank' rel='noopener noreferrer' className='hover:text-rose-600 transition-colors duration-300 font-bold'>Aemir Sahli</a>
            </p>
          </div>
          <a
            href='/assets/resume_ashref.pdf'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-800 text-[#fafafa] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all duration-500'
          >
            <FileText className='w-4 h-4' />
            Download CV
          </a>
        </div>
      </div>
    </footer>
  );
};
