'use client';
import { cn } from "../../lib/utils";
import { useMotionValue, motion, useAnimationFrame, wrap } from 'framer-motion';
import { useRef } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [ref, { width, height }] = useMeasure();
  const rawTranslation = useMotionValue(0);
  const isDragging = useRef(false);
  const momentum = useRef(0);

  useAnimationFrame((t, delta) => {
    const size = direction === 'horizontal' ? width : height;
    if (!size) return;

    const contentSize = size + gap;
    const halfSize = contentSize / 2;

    const baseSpeed = halfSize / (duration * 1000);
    const baseDirection = reverse ? 1 : -1;

    let currentMomentum = momentum.current;

    // Apply friction to decay the throw momentum
    if (!isDragging.current) {
      if (Math.abs(currentMomentum) > 0.01) {
        currentMomentum *= 0.95;
      } else {
        currentMomentum = 0;
      }
      momentum.current = currentMomentum;
    }

    // Calculate delta movement
    let moveDelta = 0;
    if (isDragging.current) {
      // When dragging, standard auto-scroll is paused; translation is handled in onPan.
    } else {
      // Normal continuous crawl combined with any lingering momentum
      moveDelta = (baseDirection * baseSpeed + currentMomentum) * delta;
    }

    // Apply wrapped loop bounds: range is [ -halfSize, 0 ]
    if (!isDragging.current) {
      const newRaw = wrap(-halfSize, 0, rawTranslation.get() + moveDelta);
      rawTranslation.set(newRaw);
    }
  });

  return (
    <div 
      className={cn(
        'overflow-hidden', 
        className
      )}
    >
      <motion.div
        className='flex w-max cursor-grab active:cursor-grabbing'
        style={{
          ...(direction === 'horizontal'
            ? { x: rawTranslation }
            : { y: rawTranslation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        onPanStart={() => {
          isDragging.current = true;
          momentum.current = 0;
        }}
        onPan={(e, info) => {
          const deltaMove =
            direction === 'horizontal' ? info.delta.x : info.delta.y;
          const size = direction === 'horizontal' ? width : height;
          if (size) {
            const halfSize = (size + gap) / 2;
            const newRaw = wrap(
              -halfSize,
              0,
              rawTranslation.get() + deltaMove
            );
            rawTranslation.set(newRaw);
          }
        }}
        onPanEnd={(e, info) => {
          isDragging.current = false;
          // Velocity defines the explosive speed of the throw
          const velocity =
            direction === 'horizontal' ? info.velocity.x : info.velocity.y;
          // Scale velocity to pixels per millisecond
          momentum.current = velocity / 1000;
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
