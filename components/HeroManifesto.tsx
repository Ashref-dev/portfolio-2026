import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { cn } from "../utils";
import { PrimaryButton } from "./ui/PrimaryButton";

gsap.registerPlugin(ScrollTrigger);

// --- Sub-components ---

const Word = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "manifesto-element font-md inline-block mr-[0.2em] will-change-[transform,opacity,filter] leading-[1.1] origin-center",
      className,
    )}
  >
    {children}
  </span>
);

const FlippingImagePill = ({
  img1,
  img2,
  index = 0,
}: {
  img1: string;
  img2: string;
  index?: number;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(innerRef.current, {
        rotateY: "+=180",
        duration: 1.2,
        ease: "back.inOut(1.5)",
        delay: index * 0.7 + 2.5,
        repeat: -1,
        repeatDelay: 10,
      });
    });
    return () => ctx.revert();
  }, [index]);

  const handleFlip = () => {
    gsap.to(innerRef.current, {
      rotateY: "+=180",
      duration: 0.8,
      ease: "back.out(1.5)",
      overwrite: "auto",
    });
    // Restart the infinite loop after manual flip
    gsap.to(innerRef.current, {
      rotateY: "+=180",
      duration: 1.2,
      ease: "back.inOut(1.5)",
      delay: 10,
      repeat: -1,
      repeatDelay: 10,
    });
  };

  return (
    <span
      onMouseEnter={handleFlip}
      className={cn(
        "manifesto-element h-14 w-20 inline-block align-middle mx-[0.12em] relative shadow-float hover:shadow-float cursor-pointer rounded-full overflow-hidden will-change-[transform,opacity,filter]",
      )}
    >
      <div
        className="absolute inset-0 w-full h-full flip-container"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={innerRef}
          className="flip-inner w-full h-full relative origin-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={img1}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            alt="Visual 1"
          />
          <img
            src={img2}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            alt="Visual 2"
          />
        </div>
      </div>
    </span>
  );
};

const TextPill = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <span
    className={cn(
      "manifesto-element font-sm inline-flex h-14 items-center whitespace-nowrap align-middle mx-[0.12em] px-[0.7em] bg-white text-[0.66em] text-neutral-900 rounded-full font-sans font-bold leading-none tracking-tight shadow-[0_10px_24px_-8px_rgba(0,0,0,0.14)] will-change-[transform,opacity,filter] border border-neutral-100",
      className,
    )}
  >
    {text}
  </span>
);

// --- Main Component ---

export const HeroManifesto = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroPortraits = {
    intro: [
      "https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
      "https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    ],
    engineer: [
      "https://images.pexels.com/photos/340152/pexels-photo-340152.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
      "https://images.pexels.com/photos/5483075/pexels-photo-5483075.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    ],
    tunisia: [
      "https://images.pexels.com/photos/891116/pexels-photo-891116.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
      "https://images.pexels.com/photos/36092721/pexels-photo-36092721.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    ],
    clients: [
      "https://images.pexels.com/photos/325685/pexels-photo-325685.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop",
      "https://images.pexels.com/photos/36383643/pexels-photo-36383643.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop",
      "https://images.pexels.com/photos/4930931/pexels-photo-4930931.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop",
    ],
  };

  useLayoutEffect(() => {
    let ctx: gsap.Context;
    const elements =
      containerRef.current?.querySelectorAll(".manifesto-element") || [];
    const badge = containerRef.current?.querySelector(".avail-badge");
    const actions =
      containerRef.current?.querySelectorAll(".action-item") || [];

    // Immediately hide elements to prevent flicker before app-ready
    gsap.set(badge, { y: 20, opacity: 0 });
    gsap.set(elements, {
      y: 40,
      opacity: 0,
      filter: "blur(15px)",
      scale: 0.95,
    });
    gsap.set(actions, { y: 20, opacity: 0 });

    const startAnimation = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        // 1. Badge
        if (badge) {
          tl.to(badge, { y: 0, opacity: 1, duration: 0.8 }, 0.0);
        }

        // 2. Text and Pills Blur Fade In
        tl.to(
          elements,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.2,
            stagger: 0.05,
          },
          0.2, // slightly overlap with badge
        );

        // 3. Actions / Footer
        tl.to(actions, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.8);
      }, containerRef);
    };

    window.addEventListener("app-ready", startAnimation);

    // Initial fallback if preloader fired before mount
    if (
      document.readyState === "complete" &&
      !document.getElementById("preloader")?.style.transform
    ) {
      // fallback ignored
    }

    return () => {
      window.removeEventListener("app-ready", startAnimation);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col justify-center items-center bg-[#fafafa] text-neutral-950 z-10 overflow-hidden px-5 pt-24 pb-12 md:pb-16"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob-1 absolute top-[20%] left-[20%] size-[30vw] bg-neutral-200/50 rounded-full blur-[120px] mix-blend-multiply opacity-80" />
        <div className="bg-blob-2 absolute bottom-[20%] right-[20%] size-[25vw] bg-neutral-300/40 rounded-full blur-[100px] mix-blend-multiply opacity-80" />
      </div>

      <div className="landing-shell relative z-10 flex flex-col items-center md:items-start text-center md:text-left pt-8 mt-6">
        {/* Availability Badge */}
        <div className="avail-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 text-[11px] font-semibold tracking-wide mb-6 md:mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          Not available for work
        </div>

        {/* Hero Phrase */}
        <div className="text-[clamp(2rem,3.85vw,4rem)] space-y-4 font-bold tracking-[-0.03em] text-neutral-900">
          <div className="flex items-center flex-wrap justify-center md:justify-start">
            <Word>Hi,</Word>
            <Word>I'm</Word>
            <FlippingImagePill
              img1={heroPortraits.intro[0]}
              img2={heroPortraits.intro[1]}
              index={0}
            />
            <TextPill text="Ashref" />
          </div>

          <div className="flex items-center flex-wrap justify-center md:justify-start">
            <Word>a</Word>
            <FlippingImagePill
              img1={heroPortraits.engineer[0]}
              img2={heroPortraits.engineer[1]}
              index={1}
            />
            <TextPill text="Software Engineer" className="mr-2" />

            <Word>from</Word>
            <FlippingImagePill
              img1={heroPortraits.tunisia[0]}
              img2={heroPortraits.tunisia[1]}
              index={2}
            />
            <TextPill text="Tunisia" />
          </div>

          <Word>Building full-stack AI solutions.</Word>
        </div>

        {/* Action Buttons & Social Proof */}
        <div className="mt-8 w-full flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pb-6 md:pb-0">
          <div className="action-item block">
            <PrimaryButton
              className="px-8 py-4 text-sm"
              icon={true}
              onClick={() =>
                document
                  .getElementById("work")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Work
            </PrimaryButton>
          </div>

          <div className="action-item block">
            <PrimaryButton variant="secondary" className="px-8 py-4 text-sm">
              Get in touch
            </PrimaryButton>
          </div>

          <div className="action-item flex items-center gap-3 ml-0 sm:ml-4">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 p-1.5 rounded-full border-2 border-[#fafafa] bg-white"
                src={"assets/icons/next.png"}
                alt="Client portrait"
              />
              <img
                className="w-10 h-10 p-1.5 rounded-full border-2 border-[#fafafa] bg-white"
                src={"/assets/icons/pgsql.png"}
                alt="Client portrait"
              />
              <img
                className="w-10 h-10 p-1.5 rounded-full border-2 border-[#fafafa] bg-white"
                src={"/assets/icons/azure.png"}
                alt="Client portrait"
              />
            </div>
            <div className="text-sm flex flex-col items-start">
              <div className="font-bold text-neutral-900 flex items-center gap-1 leading-none">
                3+ years experience
              </div>
              <div className="text-neutral-500 text-xs mt-1">
                4x Microsoft certified
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="action-item mt-16 w-full flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-all duration-500 cursor-pointer text-neutral-400 hover:text-neutral-900 group"
          onClick={() =>
            document
              .getElementById("work")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <div className="flex h-10 w-6 items-center justify-center rounded-full border border-neutral-200 group-hover:border-neutral-400 transition-colors duration-500">
            <ArrowDown className="h-3 w-3 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
