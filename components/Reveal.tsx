import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: '0' | '100' | '200' | '300';
}

export const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = '0' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const el = ref.current;
      if (!el) return;

      const delaySeconds = parseInt(delay) / 1000;

      gsap.fromTo(el, 
        { y: 40, opacity: 0, filter: "blur(15px)", scale: 0.95 },
        {
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          scale: 1,
          duration: 1.2, 
          delay: delaySeconds,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
};