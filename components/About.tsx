import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from "../lib/utils";
import { LogoCloud } from './ui/logo-cloud-4';

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom bottom',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Title & Bio Reveal
      tl.from('.about-reveal', {
        y: 40,
        opacity: 0,
        filter: "blur(15px)",
        scale: 0.95,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
      });

      // 2. Stats Line Draw & Reveal
      tl.from(
        '.stat-border',
        {
          scaleX: 0,
          duration: 1,
          ease: 'expo.out',
        },
        '-=0.5'
      );

      tl.from(
        '.stat-item',
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        },
        '-=0.8'
      );

      // 3. Logo Cloud Fade In
      tl.from(
        '.tech-ticker-container',
        {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: 'power2.out',
        },
        '-=0.5'
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '4x', label: 'Microsoft Certified', color: 'text-amber-600' },
    { value: '20+', label: 'Projects Delivered', color: 'text-blue-600' },
    { value: '5k+', label: 'Cups of Coffee', color: 'text-rose-600' },
  ];

  const logos = [
    { name: 'Python', alt: 'Python', src: 'https://svgl.app/library/python.svg' },
    { name: 'Go', alt: 'Go', src: 'https://svgl.app/library/golang.svg' },
    { name: 'Next.js', alt: 'Next.js', src: 'https://svgl.app/library/nextjs_icon_dark.svg' },
    { name: 'AWS', alt: 'AWS', src: 'https://svgl.app/library/aws_light.svg' },
    { name: 'Azure', alt: 'Azure', src: 'https://svgl.app/library/azure.svg' },
    { name: 'Docker', alt: 'Docker', src: 'https://svgl.app/library/docker.svg' },
    { name: 'PostgreSQL', alt: 'PostgreSQL', src: 'https://svgl.app/library/postgresql.svg' },
    { name: 'Agentic AI', alt: 'Agentic AI', src: 'https://svgl.app/library/openai.svg' },
  ];

  return (
    <section
      ref={containerRef}
      className='relative py-24 bg-[#fafafa] px-6 border-b border-neutral-100 overflow-hidden'
      id='about'
    >
      <div className='landing-shell'>
        {/* Top Section: Compact Bio */}
        <div className='flex flex-col md:flex-row gap-8 md:gap-24 items-start mb-12 md:mb-20'>
          <div className='w-full md:w-1/3 shrink-0'>
            <h2 className='about-reveal text-[clamp(3rem,5vw,4rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900'>
              About
              <br />
              <span className='font-serif italic font-light text-emerald-600 mt-1'>
                Me.
              </span>
            </h2>
          </div>

          <div className='w-full md:w-2/3 pt-2'>
            <p className='about-reveal text-xl md:text-2xl font-light leading-relaxed text-neutral-800 max-w-2xl'>
              I'm <strong className='font-semibold text-black'>Ashref</strong>.
              I bridge the gap between heavy backend logic and the human
              experience. From dynamically provisioning cloud containers to
              tuning AI agents for real-world reasoning, I care about the{' '}
              <span className='italic font-serif'>entire</span> stack.
            </p>
          </div>
        </div>

        {/* Middle Section: Minimalist Stats Strip */}
        <div ref={statsRef} className='relative mb-20'>
          {/* Top Border */}
          <div className='stat-border absolute top-0 left-0 w-full h-px bg-neutral-100 origin-left' />

          <div className='grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100'>
            {stats.map((stat, i) => (
              <div
                key={i}
                className='stat-item group py-8 md:py-12 md:px-8 first:pl-0 transition-colors hover:bg-neutral-50/50'
              >
                <div
                  className={cn(
                    'text-4xl md:text-5xl font-bold mb-2 tracking-tight transition-colors duration-300',
                    stat.color
                  )}
                >
                  {stat.value}
                </div>
                <div className='font-sans text-xs uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-600 transition-colors'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Border */}
          <div className='stat-border absolute bottom-0 left-0 w-full h-px bg-neutral-100 origin-left' />
        </div>

        {/* Bottom Section: Logo Cloud */}
        <div className='tech-ticker-container relative'>
          <LogoCloud logos={logos} />
        </div>
      </div>
    </section>
  );
};
