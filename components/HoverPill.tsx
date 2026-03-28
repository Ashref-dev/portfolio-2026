import React from 'react';
import { cn } from '../utils';

interface HoverPillProps {
  text: string;
  icon?: React.ElementType;
  imageUrl?: string;
  colorClass?: string;
  bgClass?: string;
  className?: string;
}

export const HoverPill = ({
  text,
  icon: Icon,
  imageUrl,
  colorClass = 'text-red-500',
  bgClass = 'bg-red-100',
  className,
}: HoverPillProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center align-middle relative mx-2 align-baseline',
        className
      )}
    >
      {/* Text Label */}
      <span
        className={cn(
          'font-serif italic text-[1.05em] leading-none px-1 relative',
          colorClass
        )}
      >
        {text}
      </span>

      {/* Pill with Image - Always Visible */}
      <span className='flex items-center rounded-full ml-3 inline-block align-middle'>
        <span
          className={cn(
            'flex items-center justify-center p-1 rounded-full whitespace-nowrap h-[0.5em] md:h-[1em] aspect-[16/9] overflow-hidden border border-black/5 shadow-sm relative transition-transform duration-300 hover:scale-105',
            bgClass
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={text}
              className='w-full h-full object-cover rounded-full'
            />
          ) : (
            Icon && <Icon className={cn('w-6 h-6', colorClass)} />
          )}
        </span>
      </span>
    </span>
  );
};
