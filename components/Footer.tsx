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

      <div className='footer-shell flex-1 flex flex-col items-center justify-center z-10 w-full group/cta'>
        <div className='flex items-center gap-4 mb-12'>
          <div className='flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5'>
            <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[9px] font-sans tracking-[0.2em] text-emerald-500 uppercase'>
              Available for projects
            </span>
          </div>
        </div>

        <div ref={magneticRef} className='relative cursor-pointer'>
          <a
            href='mailto:hi@ashref.tn'
            target='_blank'
            rel='noopener noreferrer'
            className='block text-center relative z-10'
          >
            <h2 className='text-[clamp(4rem,15vw,12rem)] font-serif italic font-light text-[#fafafa] leading-[0.8] tracking-tighter transition-all duration-700 group-hover/cta:text-rose-600 group-hover/cta:scale-[1.02]'>
              Let's
              <br />
              Talk<span className='text-rose-600'>.</span>
            </h2>
          </a>

          {/* Advanced Glow Effect */}
          <div
            ref={glowRef}
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-rose-600/5 blur-[140px] rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity duration-1000 -z-10'
          />
        </div>

        <div className='mt-12 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500'>
          <p className='text-neutral-600 font-sans text-[10px] tracking-[0.4em] uppercase'>
            hi@ashref.tn
          </p>
        </div>
      </div>

      <div className='footer-shell w-full flex flex-col md:flex-row justify-between items-center gap-12 z-10 border-t border-neutral-800/50 pt-12'>
        <div className='grid grid-cols-2 md:flex md:flex-wrap justify-center md:justify-start gap-x-8 gap-y-6 md:gap-y-4 w-full md:w-auto'>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center md:justify-start gap-2 text-neutral-500 hover:text-[#fafafa] transition-all duration-300 group'
            >
              <link.icon className='w-4 h-4 transition-transform group-hover:-rotate-12 group-hover:scale-110 shrink-0' />
              <span className='font-sans text-[10px] tracking-[0.2em] uppercase whitespace-nowrap'>
                {link.label}
              </span>
              <ExternalLink className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block' />
            </a>
          ))}
        </div>

        <div className='flex flex-col items-center md:items-end gap-6'>
          <a
            href='/assets/resume_ashref.pdf'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 px-8 py-4 rounded-full border border-neutral-800 text-[#fafafa] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#fafafa] hover:text-black transition-all duration-500'
          >
            <FileText className='w-4 h-4' />
            Download CV
            <div className='w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse' />
          </a>

          <div className='flex flex-col items-center md:items-end gap-1'>
            <p className='text-[9px] font-sans tracking-[0.3em] text-neutral-600 uppercase'>
              &copy; {new Date().getFullYear()} Ashref &bull; Built with
              Precision
            </p>
            <div className='flex items-center gap-2 text-[9px] text-neutral-700 uppercase tracking-widest'>
              <Globe className='w-3 h-3' />
              <span>Based in Tunis, TN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
