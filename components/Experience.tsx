import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    role: 'AI Engineer',
    company: 'Lameh AI',
    period: 'February 2026 — Present',
    desc: 'The New Edge in Financial Services. Building the future of finance with AI.',
    tech: ['AWS', 'AI Agents', 'Langsmith', 'Langchain', 'Temporal.io'],
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Software Engineer',
    company: 'HeloSolutions',
    period: 'May 2025 — March 2026',
    desc: 'Architected resilient cloud deployment for cybersecurity AI agent platforms on AWS. Engineered high-performance Go microservices and RAG pipelines.',
    tech: ['AWS', 'Go', 'AI Agents'],
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Software Engineer',
    company: 'Bookme OÜ',
    period: 'June 2024 — May 2025',
    desc: 'Architecting full-stack Next.js solutions with advanced AI integration. Optimizing document processing pipelines via AWS and real-time analytics.',
    tech: ['Next.js', 'AWS', 'AI Integration'],
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Solutions Developer',
    company: 'Forvia',
    period: 'January 2024 — June 2024',
    desc: 'Engineered industrial VR training modules in Unity (90+ FPS). Designed custom interaction systems that boosted user engagement by 50%.',
    tech: ['Unity', 'C#', 'VR'],
    image:
      'https://images.unsplash.com/photo-1478416272538-5f7e51dc5400?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Blazor Developer',
    company: 'Forvia',
    period: 'December 2023',
    desc: 'Built high-performance .NET Blazor applications. Achieved 95% Lighthouse accessibility scores and significantly reduced load times.',
    tech: ['.NET', 'Blazor', 'Performance'],
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Full-stack Developer',
    company: 'TSI',
    period: 'June 2023 — September 2023',
    desc: 'Developed a QR-based inventory system that cut seasonal worker login times by 80%. Built a robust Angular management interface.',
    tech: ['Angular', 'QR Systems', 'Inventory'],
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Creative Developer',
    company: 'Chilift',
    period: 'May 2023 — June 2023',
    desc: 'Crafted a high-converting landing page using React/Tailwind. Improved conversion rates by 35% through performance optimization.',
    tech: ['React', 'Tailwind', 'CRO'],
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Co-Founder & Dev',
    company: 'RedSpear',
    period: 'March 2022 — June 2023',
    desc: 'Developed core C# gameplay systems (60 FPS). Implemented Python AI scripts to automate repetitive development tasks.',
    tech: ['C#', 'Python', 'Game Dev'],
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Web Developer',
    company: 'AJico Group',
    period: 'January 2023 — May 2023',
    desc: 'Launched an event website serving 10K+ visitors. Implemented real-time communication features for live updates.',
    tech: ['WebSockets', 'Real-time', 'Scale'],
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Junior Developer',
    company: 'CIN Group',
    period: 'August 2022 — January 2023',
    desc: 'Maintained a secure investment platform with 99.9% uptime. Handled sensitive financial data with zero security incidents.',
    tech: ['Security', 'FinTech', 'Uptime'],
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
  },
  {
    role: 'Junior Developer',
    company: 'Smart Kokusai',
    period: 'June 2022 — August 2022',
    desc: 'Implemented responsive web designs and animations using React, Chakra UI, and Framer Motion.',
    tech: ['React', 'Chakra UI', 'Framer Motion'],
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
  },
];

export const Experience = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header Reveal
      gsap.from('.exp-header-reveal', {
        y: 40,
        opacity: 0,
        filter: 'blur(15px)',
        scale: 0.95,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      });

      // Line Draw
      gsap.from('.exp-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.5,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        },
      });

      // Row Reveal
      gsap.from('.exp-row', {
        y: 40,
        opacity: 0,
        filter: 'blur(15px)',
        scale: 0.95,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.exp-list',
          start: 'top 85%',
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className='relative py-32 bg-[#fafafa] px-6 overflow-hidden'
      id='experience'
    >
      <div className='landing-shell'>
        {/* Header */}
        <div className='mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8'>
          <div>
            <h2 className='exp-header-reveal text-[clamp(3rem,6vw,5rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900'>
              Career
              <span className='pl-6 font-serif italic font-normal text-rose-600'>
                Trajectory.
              </span>
            </h2>
          </div>
          <div className='md:max-w-md mb-2'>
            <p className='exp-header-reveal text-lg text-neutral-500 font-light leading-relaxed'>
              A timeline of technical challenges, product launches, and
              continuous engineering evolution.
            </p>
          </div>
        </div>

        {/* Experience Grid */}
        <div className='exp-list flex flex-col'>
          {/* Top Line */}
          <div className='exp-line w-full h-px bg-neutral-200' />

          {experiences.map((exp, i) => (
            <div key={i} className='exp-row group relative'>
              <div className='py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start transition-colors duration-500 hover:bg-neutral-50/50 px-4 -mx-4 rounded-xl'>
                {/* Period (Left) */}
                <div className='md:col-span-3'>
                  <span className='font-mono text-xs uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors duration-300'>
                    {exp.period}
                  </span>
                </div>

                {/* Role & Company (Middle) */}
                <div className='md:col-span-4'>
                  <h3 className='text-2xl font-bold text-neutral-900 mb-1 group-hover:text-rose-600 transition-colors duration-300'>
                    {exp.role}
                  </h3>
                  <p className='font-serif italic text-xl text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300'>
                    {exp.company}
                  </p>
                </div>

                {/* Description (Right) */}
                <div className='md:col-span-5'>
                  <p className='text-neutral-500 font-light leading-relaxed mb-6 group-hover:text-neutral-700 transition-colors duration-300'>
                    {exp.desc}
                  </p>

                  {/* Tech Tags */}
                  <div className='flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300'>
                    {exp.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className='text-[10px] uppercase tracking-wider font-medium text-neutral-400 border border-neutral-200 px-2 py-1 rounded-md'
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
