import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Terminal, Database, Network } from "lucide-react";
import { cn } from "../lib/utils";

gsap.registerPlugin(ScrollTrigger);

// --- Styled Components for this section ---
const TextSegment = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "text-[clamp(3.5rem,9vw,7rem)] font-bold tracking-tighter whitespace-nowrap shrink-0 leading-none select-none text-neutral-900",
      className,
    )}
  >
    {children}
  </span>
);

const HighlightWord = ({
  children,
  color = "text-blue-600",
}: {
  children?: React.ReactNode;
  color?: string;
}) => (
  <span
    className={cn(
      "font-serif italic mx-3 relative inline-block group cursor-none text-[clamp(3.5rem,9vw,7rem)] leading-none",
      color,
    )}
  >
    {children}
    <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
  </span>
);

export const ProcessTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const container = containerRef.current;

      if (!track || !container) return;

      // Function to calculate scroll amount dynamically
      const getScrollAmount = () => {
        return -(track.scrollWidth - window.innerWidth);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${Math.abs(getScrollAmount()) * 0.72}`,
          scrub: 0.35,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Main track movement
      tl.to(track, {
        x: getScrollAmount,
        ease: "none",
      });

      // Parallax elements - synced with main timeline
      const parallaxItems = track.querySelectorAll("[data-speed]");
      parallaxItems.forEach((item) => {
        const speed = parseFloat(item.getAttribute("data-speed") || "1");
        tl.to(
          item,
          {
            x: () => getScrollAmount() * (speed * 0.15),
            ease: "none",
          },
          0,
        ); // Start at time 0
      });

      // Popups - using containerAnimation
      const popups = track.querySelectorAll(".popup-element");
      popups.forEach((popup) => {
        gsap.fromTo(
          popup,
          { scale: 0.5, opacity: 0, rotation: -15, filter: "blur(10px)" },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: popup,
              containerAnimation: tl,
              start: "left 90%",
              end: "right 10%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative w-full h-screen overflow-hidden bg-[#fafafa] z-30 border-t border-neutral-100"
    >
      <div className="w-full h-full flex items-center bg-[#fafafa]">
        <div
          ref={trackRef}
          className="flex flex-nowrap items-center px-[3vw] w-max gap-7"
        >
          {/* 1 */}
          <div className="flex items-center gap-3 shrink-0 relative">
            <TextSegment>flexible & robust</TextSegment>
            <HighlightWord color="text-blue-600">Cloud Systems</HighlightWord>
            <div className="popup-element mx-4 p-3.5 bg-blue-50 rounded-full border border-blue-100 shadow-xl">
              <Network className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* 2 */}
          <div className="flex items-center gap-3 shrink-0 relative ml-10">
            <TextSegment>integrating</TextSegment>

            <HighlightWord color="text-rose-600">
              Frontier AI Agents
            </HighlightWord>
            <div className="popup-element mx-4 p-3.5 bg-rose-50 rounded-full border border-rose-100 shadow-xl">
              <Terminal className="w-14 h-14 text-rose-600 drop-shadow-2xl" />
            </div>
          </div>

          {/* 3 */}
          <div className="flex items-center gap-3 shrink-0 relative ml-10">
            <TextSegment>delivered through</TextSegment>
            <div className="popup-element mx-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-xl rotate-6">
              <Database className="w-10 h-10 text-emerald-600" />
            </div>
            <HighlightWord color="text-emerald-600">Polished UX</HighlightWord>
            <TextSegment>.</TextSegment>
            <div className="w-[14em]"></div>
          </div>

          <div className="w-[14vw] shrink-0" />
        </div>
      </div>

      <div className="absolute bottom-10 left-10 flex items-center gap-3 text-neutral-400 font-sans text-[9px] tracking-[0.28em] uppercase">
        <div className="w-8 h-px bg-neutral-200" />
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};
