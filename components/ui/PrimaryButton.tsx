import React from "react";
import { cn } from "../../utils";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  icon?: boolean;
  variant?: "primary" | "secondary";
}

export const PrimaryButton = ({
  children,
  onClick,
  href,
  target,
  rel,
  className,
  icon = false,
  variant = "primary",
}: PrimaryButtonProps) => {
  const isPrimary = variant === "primary";

  const innerContent = (
    <>
      <div className="relative overflow-hidden h-[1.3em] leading-[1.3] flex items-center">
        <span className="block transition-transform duration-[0.6s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full">
          {children}
        </span>
        <span className={cn(
          "absolute inset-0 block transition-transform duration-[0.6s] ease-[cubic-bezier(0.19,1,0.22,1)] translate-y-full group-hover:translate-y-0",
          isPrimary ? "text-white/90" : "text-neutral-900/80"
        )}>
          {children}
        </span>
      </div>
      {icon && (
        <div className="relative overflow-hidden w-4 h-4 ml-1 flex items-center justify-center">
          <svg
            className="absolute w-4 h-4 transition-transform duration-[0.6s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-full group-hover:-translate-y-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
          <svg
            className="absolute w-4 h-4 -translate-x-full translate-y-full transition-transform duration-[0.6s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-0 group-hover:translate-y-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
      )}
    </>
  );

  const baseClasses = cn(
    "group relative flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all hover:-translate-y-1.5",
    isPrimary 
      ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)]"
      : "bg-transparent text-neutral-900 border border-neutral-300/80 hover:border-neutral-400 hover:bg-neutral-50/50 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]",
    className,
  );

  const styleArgs = {
    transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
    transitionDuration: "0.6s",
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={baseClasses}
        style={styleArgs}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} style={styleArgs}>
      {innerContent}
    </button>
  );
};
