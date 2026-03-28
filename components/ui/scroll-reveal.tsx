import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  wordAnimationStart?: string;
  accentIndices?: number[];
  accentClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  wordAnimationStart = 'top 80%',
  accentIndices = [],
  accentClassName = '',
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    let wordCount = 0;
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      const isAccent = accentIndices.includes(wordCount);
      wordCount++;
      return (
        <span
          className={`inline-block word ${isAccent ? accentClassName : ''}`}
          key={index}
        >
          {word}
        </span>
      );
    });
  }, [children, accentIndices, accentClassName]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    // Use GSAP Context to isolate scopes and prevent trigger leaks that break Lenin/other components
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            end: rotationEnd,
            scrub: true,
          },
        },
      );

      const wordElements = el.querySelectorAll<HTMLElement>('.word');

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity' },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: wordAnimationStart,
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: wordAnimationStart,
              end: wordAnimationEnd,
              scrub: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    wordAnimationStart,
    blurStrength,
  ]);

  return (
    <h2 ref={containerRef} className={`m-0 ${containerClassName}`}>
      <span
        className={`text-[clamp(1.6rem,4vw,3.5rem)] leading-[1.2] font-light ${textClassName}`}
      >
        {splitText}
      </span>
    </h2>
  );
};

export default ScrollReveal;
