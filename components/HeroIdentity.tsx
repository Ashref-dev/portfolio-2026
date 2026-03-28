import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Code2, MousePointer2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeroIdentity = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Start the dark mode transition smoothly when halfway through Projects
      // We must query document directly since gsap.context scopes string selectors to wrapperRef
      const workEl = document.querySelector('#work');
      gsap.to([workEl, wrapperRef.current], {
        backgroundColor: '#171717',
        ease: 'none',
        scrollTrigger: {
          trigger: workEl,
          start: '80% 50%', // Start when middle of Projects hits middle of screen
          end: 'bottom 10%', // Finish becoming fully dark before Projects leaves screen
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=155%',
          scrub: 0.45, // Slightly more animated, still responsive
          pin: true,
          anticipatePin: 1,
        },
      });

      // 0. Initial Setup
      gsap.set('.grid-item-text', {
        z: 1200, // Reduced distance for a more controlled feel
        scale: 1.5, // Less extreme scale
        opacity: 0,
        filter: 'blur(12px)', // Sharper initial blur
      });
      gsap.set('.grid-item-aux', { y: 20, opacity: 0 });
      gsap.set(scaleRef.current, {
        scale: 0.9,
        opacity: 0,
        filter: 'blur(15px)',
      });

      // 1. Z-Space Injection (Organized Left-to-Right Stagger)
      tl.to('.grid-item-text', {
        z: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.08, // Sequential left-to-right for organizational clarity
        duration: 1.8,
        ease: 'expo.out', // More professional, "snappy" easing
      });

      // 2. Aux Elements Fade In (Subtle)
      tl.to(
        '.grid-item-aux',
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        },
        '-=1',
      );

      // 3. "SCALE" Word Appears (Precise focus)
      tl.to(
        scaleRef.current,
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.15,
          ease: 'expo.out',
        },
        '-=0.8',
      );

      // 4. THE TRANSITION
      // Fade out everything EXCEPT "SCALE"
      tl.to(
        ['.grid-item-text:not(.scale-word)', '.grid-item-aux'],
        {
          opacity: 0,
          z: -200, // Subtle retreat
          filter: 'blur(8px)',
          duration: 0.75,
          ease: 'power2.inOut',
        },
        '+=0.3',
      );

      // Massive expansion of "SCALE" to fill the screen with white
      tl.to(
        scaleRef.current,
        {
          scale: 150,
          duration: 1.55,
          ease: 'power2.inOut',
        },
        '<',
      );

      tl.to(
        wrapperRef.current,
        {
          backgroundColor: '#fafafa',
          duration: 0.55,
          ease: 'power1.inOut',
        },
        '-=0.95',
      );
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id='identity'
      ref={wrapperRef}
      className='relative h-screen w-full bg-[#fafafa] text-[#fafafa] overflow-hidden z-20 perspective-container'
    >
      <style>{`
        .perspective-container {
          perspective: 1000px;
          perspective-origin: center center;
        }
        .grid-item-text {
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }
      `}</style>
      {/* Background Noise */}
      <div
        className='absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        ref={contentRef}
        className='relative w-full h-full flex items-center justify-center'
      >
        {/* Grid Content */}
        <div className='grid-content absolute inset-0 flex flex-col items-center justify-center w-full h-full p-4'>
          {/* Top Row */}
          <div className='flex flex-col md:flex-row items-center gap-4 md:gap-12 mb-2 md:mb-6'>
            <div className='grid-item-aux px-4 py-1.5 rounded-full border border-neutral-700 flex items-center gap-2 bg-neutral-800/50 backdrop-blur-sm'>
              <Code2 className='w-4 h-4 text-neutral-400' />
              <span className='text-[10px] font-sans text-neutral-400 tracking-[0.2em] uppercase'>
                AI AGENTS
              </span>
            </div>

            <div className='flex flex-wrap justify-center gap-x-3 md:gap-x-6'>
              {['I', 'BUILD', 'SMART', 'SYSTEMS', 'THAT'].map((word, i) => (
                <span
                  key={i}
                  className='grid-item-text text-[5vw] md:text-[3vw] font-light tracking-tight leading-none'
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Middle Row: SCALE */}
          <div className='relative z-0 leading-[0.8] flex justify-center items-center'>
            <span
              ref={scaleRef}
              className='scale-word text-[25vw] font-black tracking-tighter text-[#fafafa] block origin-center'
            >
              SCALE
            </span>
          </div>

          {/* Bottom Row */}
          <div className='grid-item-aux mt-4 md:mt-0 md:absolute md:bottom-[20%] md:right-[20%] px-6 py-2 rounded-full bg-[#fafafa] text-black flex items-center gap-2 transform rotate-[-2deg]'>
            <MousePointer2 className='w-4 h-4' />
            <span className='text-sm font-bold tracking-wide'>INTERACTIVE</span>
          </div>
        </div>

        <button
          type='button'
          className='absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-neutral-500 transition-colors duration-500 hover:text-white focus:outline-none'
          onClick={() =>
            document
              .getElementById('process')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <span className='flex h-10 w-6 items-center justify-center rounded-full border border-neutral-500 transition-colors duration-500 hover:border-white'>
            <ArrowDown className='h-3 w-3 animate-bounce' />
          </span>
        </button>
      </div>
    </section>
  );
};
