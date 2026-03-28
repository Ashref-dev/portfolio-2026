import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from './ui/scroll-reveal';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: '01',
    author: 'Ahmed Balti',
    role: 'Full-Stack Developer @ NeoCortex',
    image: '/assets/testimonials/balti.jpg',
    colorHex: 'text-blue-600',
    bgPill: 'bg-blue-100',
    text: 'He is an excellent graphic designer and so talented at finding solutions that are simple and effective, without over engineering everything.',
    accentIndices: [17, 18, 19, 20],
  },
  {
    id: '02',
    author: 'Taha Ben Othmen',
    role: 'Solutions Developer @ Forvia',
    image: '/assets/testimonials/taha.jpg',
    colorHex: 'text-blue-600',
    bgPill: 'bg-blue-100',
    text: "Ashref consistently exceeds expectations. He's not afraid to push boundaries and come up with innovative solutions. He's a valuable asset to any team.",
    accentIndices: [16, 17, 18, 19, 20, 21, 22],
  },
];

export const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testi-header', {
        y: 40,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='py-8 bg-[#fafafa] px-6 relative z-20 overflow-hidden'
      id='testimonials'
    >
      <div className='landing-shell'>
        {/* Consistent Title Header Pattern */}
        <div className='flex flex-col md:flex-row justify-between items-baseline mb-20 border-b border-neutral-100 pb-12'>
          <div className='testi-header'>
            {' '}
            <h2 className='text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tighter text-neutral-900 leading-none'>
              Trusted{' '}
              <span className='font-serif italic font-light text-blue-600'>
                Voices.
              </span>
            </h2>
          </div>
        </div>

        {/* Scrolling Quotes powered by GSAP ScrollReveal */}
        {testimonials.map((t, index) => (
          <div
            id={`quote-${t.id}-container`}
            className='mb-24 flex flex-col last:mb-0'
            key={t.id}
          >
            <div
              className={`max-w-4xl text-neutral-900 ${t.id === '02' ? 'md:text-right md:ml-auto' : ''}`}
            >
              <ScrollReveal
                baseOpacity={0.1}
                blurStrength={6}
                baseRotation={0}
                wordAnimationStart='top 80%'
                wordAnimationEnd='bottom 70%'
                textClassName={`font-serif tracking-normal ${t.id === '02' ? 'justify-end' : ''}`}
                accentIndices={t.accentIndices}
                accentClassName={`${t.colorHex} font-light italic`}
              >
                {t.text}
              </ScrollReveal>
            </div>

            {/* Author Metadata Map */}
            <div
              className={`flex flex-col ${t.id === '02' ? 'md:flex-row-reverse md:text-right' : 'md:flex-row'} items-start md:items-center gap-6 border-t border-neutral-200 pt-8 mt-12`}
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ${t.bgPill}`}
              >
                <img
                  src={t.image}
                  className='w-full h-full object-cover opacity-90'
                  alt={t.author}
                />
              </div>
              <div>
                <span className='text-[10px] font-sans font-bold text-neutral-300 tracking-[0.3em] uppercase block mb-1'>
                  {t.id === '01' ? `${t.id} —` : `— ${t.id}`}
                </span>
                <h4 className='text-base font-bold text-neutral-900 uppercase tracking-widest'>
                  {t.author}
                </h4>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${t.colorHex}`}
                >
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
