import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "01",
    title: "Sbiba Heritage",
    cat: "WebGL • AWS • Next.js",
    image: "/assets/works/sbiba.jpg",
    link: "https://sbiba.vercel.app/",
  },
  {
    id: "02",
    title: "Entretien AI",
    cat: "AI Agent • LLMs • Python",
    image: "/assets/works/entretien-ai.jpg",
    link: "https://entretien-ai.com/",
  },
  {
    id: "03",
    title: "Maxula",
    cat: ".NET Blazor • Azure • Fintech",
    image: "/assets/works/maxula.jpg",
    link: "https://maxula-project.azurewebsites.net/",
  },
  {
    id: "04",
    title: "Ride",
    cat: "Angular • ThreeJS • Real-time",
    image: "/assets/works/ride.jpg",
    link: "https://ride-project.vercel.app/",
  },
  {
    id: "05",
    title: "MR ADT",
    cat: "Unity • Digital Twins • IoT",
    image: "/assets/works/WindFarm.jpg",
    link: "https://github.com/Ashref-dev/Azure-digitaltwins-windfarm",
  },
  {
    id: "06",
    title: "AR Medicheck",
    cat: "Unity • AR • Healthcare",
    image: "/assets/works/medicheck.jpg",
    link: "https://github.com/Ashref-dev/Medicheck-ar-project",
  },
];

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx: gsap.Context | undefined;
    const hoverCleanups: Array<() => void> = [];

    const initCtx = gsap.context(() => {
      gsap.set(".project-card", {
        y: 40,
        opacity: 0,
        filter: "blur(15px)",
        scale: 0.95,
      });
      gsap.set(".projects-reveal", {
        y: 20,
        opacity: 0,
        filter: "blur(15px)",
        scale: 0.95,
      });
      gsap.set(".project-image", { scale: 1 });
      gsap.set(".hover-overlay", { opacity: 0.6 });
      gsap.set(".arrow-box", { backgroundColor: "rgba(255, 255, 255, 0.1)" });
      gsap.set(".arrow-text", {
        width: 0,
        opacity: 0,
        paddingLeft: 0,
        paddingRight: 0,
      });
      gsap.set(".arrow-icon", { rotation: 0, scale: 1 });
    }, containerRef);

    const bindHoverAnimations = () => {
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");

      cards.forEach((card) => {
        const image = card.querySelector<HTMLElement>(".project-image");
        const arrowBox = card.querySelector<HTMLElement>(".arrow-box");
        const arrowText = card.querySelector<HTMLElement>(".arrow-text");
        const arrowIcon = card.querySelector<HTMLElement>(".arrow-icon");
        const overlay = card.querySelector<HTMLElement>(".hover-overlay");

        const hoverIn = () => {
          gsap.to(card, {
            scale: 1.02,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
          });

          gsap.to(overlay, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(arrowBox, {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            duration: 0.4,
            overwrite: "auto",
          });

          gsap.to(arrowText, {
            width: 120,
            opacity: 1,
            paddingLeft: 16,
            paddingRight: 4,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });

          gsap.to(arrowIcon, {
            rotation: 45,
            scale: 1.1,
            duration: 0.4,
            ease: "back.out(2)",
            overwrite: "auto",
          });
        };

        const hoverOut = () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.85,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(overlay, {
            opacity: 0.6,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(arrowBox, {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            duration: 0.4,
            overwrite: "auto",
          });

          gsap.to(arrowText, {
            width: 0,
            opacity: 0,
            paddingLeft: 0,
            paddingRight: 0,
            duration: 0.4,
            ease: "power3.inOut",
            overwrite: "auto",
          });

          gsap.to(arrowIcon, {
            rotation: 0,
            scale: 1,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        card.addEventListener("mouseenter", hoverIn);
        card.addEventListener("mouseleave", hoverOut);

        hoverCleanups.push(() => {
          card.removeEventListener("mouseenter", hoverIn);
          card.removeEventListener("mouseleave", hoverOut);
        });
      });
    };

    const startAnimation = () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 1.0 });

        tl.to(".projects-reveal", {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
        });

        tl.to(
          ".project-card",
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.2,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.8",
        );

        bindHoverAnimations();
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
      hoverCleanups.forEach((cleanup) => cleanup());
      initCtx.revert();
      ctx?.revert();
    };
  }, []);

  const featuredProjects = projects.slice(0, 4);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#fafafa] z-10 pb-24 md:pb-32 px-6 scroll-mt-24 md:scroll-mt-32"
      id="work"
    >
      <div className="landing-shell">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="projects-reveal text-[clamp(2.5rem,5vw,4.75rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900">
              Selected
              <span className="pl-4 font-serif italic font-normal text-amber-600">
                Works.
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {featuredProjects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card relative block overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.02)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 aspect-square will-change-transform"
            >
              <div className="absolute inset-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image h-full w-full object-cover will-change-transform"
                />
              </div>

              {/* Hover Overlay - Soft Glass Effect */}
              <div className="hover-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Bottom Content Container */}
              <div className="absolute bottom-0 left-0 w-full p-5 lg:p-6 flex items-end justify-between z-10">
                {/* Tech Stack Tags */}
                <div className="flex items-center">
                  <span className="block text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-white/90">
                    {project.cat}
                  </span>
                </div>

                {/* Expanding Animated Arrow Pill */}
                <div className="arrow-box flex h-10 shrink-0 flex-row items-center justify-end overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md will-change-[width,background-color]">
                  <div className="arrow-text flex w-0 items-center overflow-hidden opacity-0 pl-0 pr-0">
                    <span className="whitespace-nowrap text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-white">
                      Check it out
                    </span>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <ArrowUpRight className="arrow-icon h-4 w-4 text-white will-change-transform" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <button
          type="button"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-500 transition-colors duration-500 hover:text-white focus:outline-none"
          onClick={() =>
            document.getElementById("identity")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <span className="flex h-10 w-6 items-center justify-center rounded-full border border-neutral-500 transition-colors duration-500 hover:border-white">
            <ArrowDown className="h-3 w-3 animate-bounce" />
          </span>
        </button>
      </div>
    </section>
  );
};
