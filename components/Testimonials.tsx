import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: '01',
    text: 'He is an excellent graphic designer and so talented at finding solutions that are simple and effective, without over engineering everything.',
    author: 'Ahmed Balti',
    role: 'Full-Stack Developer @ NeoCortex',
    image: '/assets/testimonials/balti.jpg',
    textAccent: 'text-rose-600',
  },
  {
    id: '02',
    text: "Ashref consistently exceeds expectations. He's not afraid to push boundaries and come up with innovative solutions. He's a valuable asset to any team.",
    author: 'Taha Ben Othmen',
    role: 'Solutions Developer @ Forvia',
    image: '/assets/testimonials/taha.jpg',
    textAccent: 'text-blue-600',
  },
];

export const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Sticky header reveal
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

      // Individual quotes fade & float
      const rows = gsap.utils.toArray<HTMLElement>('.testimonial-row');
      rows.forEach((row, i) => {
        gsap.from(row, {
          y: 60,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 1.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className='relative bg-[#fafafa] py-32 px-6' id='testimonials'>
      
      <div className='landing-shell'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24'>
          
          {/* Left Column: Sticky Header */}
          <div className='lg:col-span-4'>
            <div className='sticky top-32'>
              <div className='testi-header'>
                <span className='block text-[10px] font-sans font-bold tracking-[0.3em] text-neutral-400 uppercase mb-6'>
                  Testimonials
                </span>
                <h2 className='text-[clamp(3.5rem,6vw,5rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900 mb-6'>
                  Trusted
                  <br />
                  <span className='font-serif italic font-normal text-blue-600'>
                    Voices.
                  </span>
                </h2>
                <p className='text-lg text-neutral-500 font-light leading-relaxed max-w-sm'>
                  Feedback from the engineers, founders, and teams I've had the
                  privilege to build with.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Flowing Typography Architecture */}
          <div className='lg:col-span-8 flex flex-col pt-12 lg:pt-0'>
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className={`testimonial-row py-16 lg:py-24 first:pt-0`}
              >
                {/* Minimalist Quote Icon */}
                <Quote className={`w-8 h-8 ${t.textAccent} opacity-30 mb-8`} />
                
                {/* Heavy Statement Typography */}
                <h3 className='text-3xl md:text-4xl lg:text-[2.5rem] font-serif text-neutral-800 leading-[1.15] tracking-tight mb-12'>
                  "{t.text}"
                </h3>
                
                {/* Author Block */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    {/* User Profile Avatar */}
                    <div className='w-12 h-12 rounded-full overflow-hidden shadow-sm border border-neutral-200 shrink-0'>
                      <img 
                        src={t.image} 
                        alt={t.author} 
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div>
                      <h4 className='text-sm font-bold text-neutral-900 uppercase tracking-wide'>
                        {t.author}
                      </h4>
                      <p className='text-xs text-neutral-500 mt-0.5 font-medium tracking-wide'>
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <span className='text-[10px] font-sans font-bold text-neutral-200 tracking-[0.3em] uppercase'>
                    {t.id}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
