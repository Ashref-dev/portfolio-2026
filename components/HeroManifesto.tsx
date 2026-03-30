import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { cn } from "../lib/utils";
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
  images,
  index = 0,
}: {
  images: string[];
  index?: number;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const rotationTarget = useRef(0);
  const timerRef = useRef<any>(null);

  const frontImgIdx = useRef(0);
  const backImgIdx = useRef(images.length > 1 ? 1 : 0);
  const [, setRenderKey] = useState(0);

  const triggerFlip = () => {
    rotationTarget.current += 180;
    gsap.to(innerRef.current, {
      rotateY: rotationTarget.current,
      duration: 1.2,
      ease: 'back.inOut(1.5)',
      overwrite: 'auto',
      onComplete: () => {
        const flips = Math.round(rotationTarget.current / 180);
        if (flips % 2 !== 0) {
          // Back is visible, so rotate front to the next image
          frontImgIdx.current = (backImgIdx.current + 1) % images.length;
        } else {
          // Front is visible, so rotate back to the next image
          backImgIdx.current = (frontImgIdx.current + 1) % images.length;
        }
        setRenderKey((k) => k + 1);
      }
    });

    // Reset loop
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(triggerFlip, 5000);
  };

  useLayoutEffect(() => {
    timerRef.current = setTimeout(triggerFlip, (index * 0.7 + 2.5) * 1000);
    return () => clearTimeout(timerRef.current);
  }, [index, images.length]);

  return (
    <span
      className={cn(
        "manifesto-element h-10 w-16 md:h-14 md:w-20 inline-block align-middle mx-[0.12em] relative will-change-[transform,opacity,filter]",
      )}
    >
      <div
        onMouseEnter={() => triggerFlip()}
        className="absolute inset-0 w-full h-full shadow-float hover:shadow-float cursor-pointer rounded-full overflow-hidden flip-container"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={innerRef}
          className="flip-inner w-full h-full relative origin-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={images[frontImgIdx.current]}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            alt="Visual Front"
          />
          <img
            src={images[backImgIdx.current]}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            alt="Visual Back"
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
      "manifesto-element font-sm inline-flex h-10 md:h-14 items-center whitespace-nowrap align-middle mx-[0.12em] px-[0.7em] bg-white text-[0.66em] text-neutral-900 rounded-full font-sans font-bold leading-none tracking-tight shadow-[0_10px_24px_-8px_rgba(0,0,0,0.14)] will-change-[transform,opacity,filter] border border-neutral-100",
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
      "/assets/ashref-green.webp",
      "/assets/ashref-purple.webp",
      "/assets/ashref-red.webp",
    ],
    engineer: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=365&h=256",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=365&h=256",
    ],
    tunisia: [
      "https://images.pexels.com/photos/35347791/pexels-photo-35347791.jpeg?auto=compress&cs=tinysrgb&w=365&h=256&fit=crop",
      "https://images.pexels.com/photos/15965246/pexels-photo-15965246.jpeg?auto=compress&cs=tinysrgb&w=365&h=256&fit=crop",
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
        <div className="text-[clamp(2rem,3.85vw,4rem)] leading-[1.6] md:leading-[1.2] font-bold tracking-[-0.03em] text-neutral-900 text-center md:text-left my-4">
          <Word>Hi,</Word>
          <Word>I'm</Word>
          <FlippingImagePill
            images={heroPortraits.intro}
            index={0}
          />
          <TextPill text="Ashref" />
          
          <br className="hidden md:block" />

          <Word>a</Word>
          <FlippingImagePill
            images={heroPortraits.engineer}
            index={1}
          />
          <TextPill text="Software Engineer" className="mr-1 md:mr-2" />

          <Word>from</Word>
          <FlippingImagePill
            images={heroPortraits.tunisia}
            index={2}
          />
          <TextPill text="Tunisia" />

          <br className="hidden md:block" />

          <Word className="block mt-4 md:mt-0 md:inline-block">Building full-stack AI solutions.</Word>
        </div>

        {/* Action Buttons & Social Proof */}
        <div className="mt-8 md:mt-10 w-full flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pb-6 md:pb-0">
          <div className="action-item w-full sm:w-auto">
            <PrimaryButton
              className="w-full sm:w-auto justify-center px-8 py-4 text-sm"
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

          <div className="action-item w-full sm:w-auto">
            <PrimaryButton variant="secondary" className="w-full sm:w-auto justify-center px-8 py-4 text-sm">
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
