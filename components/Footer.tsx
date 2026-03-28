import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    Linkedin,
    Github,
    ExternalLink,
    FileText,
    Globe,
    Code2,
    Palette,
} from 'lucide-react';

export const Footer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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
  }, []);

  const socialLinks = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/mohamedashrefbna/',
      icon: Linkedin,
    },
    {
      label: 'Behance',
      href: 'https://www.behance.net/mohamedashrefbna',
      icon: Palette,
    },
    { label: 'GitHub', href: 'https://github.com/Ashref-dev', icon: Github },
    {
      label: 'LeetCode',
      href: 'https://leetcode.com/u/mohamedashrefbenabdallah/',
      icon: Code2,
    },
  ];

  return (
    <footer
      ref={containerRef}
      className='relative h-full bg-neutral-900 flex flex-col items-center justify-between py-24 px-6 overflow-hidden'
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

      <div className='max-w-7xl w-full mx-auto flex-1 flex flex-col items-center justify-center z-10'>
        <div className='flex items-center gap-4 mb-12'>
          <div className='flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-500/30 bg-neutral-500/10 backdrop-blur-sm'>
            <div className='w-1.5 h-1.5 rounded-full bg-neutral-500' />
            <span className='text-[10px] font-sans font-bold tracking-[0.3em] text-neutral-400 uppercase'>
              Unavailable for projects
            </span>
          </div>
        </div>

        <div className='group/cta flex flex-col items-center'>
          <div ref={magneticRef} className='relative cursor-pointer'>
          <a
            href='mailto:hi@ashref.tn'
            target='_blank'
            rel='noopener noreferrer'
            className='block text-center relative z-10'
          >
            <h2 className='text-[clamp(4.5rem,15vw,13rem)] font-serif italic text-[#fafafa] leading-[0.8] tracking-tighter transition-all duration-700 group-hover/cta:text-rose-600 group-hover/cta:scale-[1.02]'>
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

          <div className='mt-16 opacity-0 group-hover/cta:opacity-100 transition-all duration-500 translate-y-4 group-hover/cta:translate-y-0 flex flex-col items-center gap-3 w-full'>
            <p className='text-neutral-500 font-sans text-[11px] font-bold tracking-[0.4em] uppercase ml-[0.2em]'>
              hi@ashref.tn
            </p>
            <a
              href='https://www.linkedin.com/in/mohamedashrefbna/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-neutral-500 font-sans text-[11px] font-medium hover:text-neutral-400 transition-colors duration-300 text-center'
            >
              Don't like mail? Send me a message instead.
            </a>
          </div>
        </div>
      </div>

      <div className='max-w-7xl w-full mx-auto flex flex-col lg:flex-row justify-between items-center z-10 border-t border-neutral-800/80 pt-8 pb-4 gap-8'>
        {/* Left: Socials */}
        <div className='flex items-center gap-6 lg:gap-8'>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
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
              &copy; {new Date().getFullYear()} Ashref.tn
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
