import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * Light-glass twin of the Selected Works "Check it out" pill. It reacts to the
 * nearest `group` ancestor. The label track animates 0fr -> 1fr so any label
 * expands to its own width; touch devices get it open by default.
 */
export const GlassPill = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <span className='flex h-10 shrink-0 items-center overflow-hidden rounded-full border border-neutral-900/10 bg-neutral-900/[0.04] backdrop-blur-md transition-colors duration-500 group-hover:bg-neutral-900/[0.08]'>
    <span className='grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-hover:opacity-100 pointer-coarse:grid-cols-[1fr] pointer-coarse:opacity-100'>
      <span className='overflow-hidden'>
        <span className='block whitespace-nowrap pl-4 pr-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-900'>
          {label}
        </span>
      </span>
    </span>
    <span className='flex size-10 shrink-0 items-center justify-center text-neutral-900'>
      {children}
    </span>
  </span>
);

export const PillArrow = () => (
  <ArrowUpRight className='size-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-45 group-hover:scale-110' />
);
