import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    HoverSlider,
    HoverSliderImage,
    HoverSliderImageWrap,
    TextStaggerHover,
    useHoverSliderContext,
} from "./ui/animated-slideshow";
import { motion } from "motion/react";

// Asset paths
const cloudImg = "/assets/services/cloud.png";
const backImg = "/assets/services/back.png";
const frontImg = "/assets/services/front.png";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "01",
    title: "Cloud",
    desc: "Resilient, auto-scaling infrastructure. I orchestrate ECS clusters, serverless functions, and multi-region deployments with advanced observability.",
    tags: ["AWS", "Azure", "Docker", "ChromaDB"],
    image: cloudImg,
  },
  {
    id: "02",
    title: "Backend",
    desc: "High-performance microservices and AI agents. I engineer clean logic and efficient data pipelines using Go and Python for systems that must scale.",
    tags: ["Go", "Python", "AI Agents", "PostgreSQL"],
    image: backImg,
  },
  {
    id: "03",
    title: "Frontend",
    desc: "Interactive, accessible interfaces. I build pixel-perfect user journeys with Next.js that feel invisible and instantaneous.",
    tags: ["Next.js", "React", "TypeScript", "GSAP"],
    image: frontImg,
  },
];

const ServiceDescription = () => {
  const { activeSlide } = useHoverSliderContext();
  const activeService = services[activeSlide];

  return (
    <motion.div
      key={activeSlide}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 pointer-events-none"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {activeService.tags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] uppercase tracking-widest font-semibold text-blue-600 border border-blue-100 bg-blue-50/50 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-neutral-500 font-light leading-relaxed text-base md:text-lg max-w-md">
        {activeService.desc}
      </p>
    </motion.div>
  );
};

export const Services = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-header-reveal", {
        y: 40,
        opacity: 0,
        filter: "blur(15px)",
        scale: 0.95,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-32 bg-[#fafafa] px-6"
      id="services"
    >
      <div className="landing-shell">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 className="service-header-reveal text-[clamp(3rem,6vw,5rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900">
            Technical
            <span className="pl-6 font-serif italic font-normal text-blue-600">
              Expertise.
            </span>
          </h2>
        </div>

        {/* Hover Slider Component */}
        <HoverSlider className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
            {/* Left Column: List of Titles */}
            <div className="flex flex-col space-y-6 md:space-y-10 justify-center py-12">
              {services.map((service, index) => (
                <div key={service.id} className="group cursor-pointer">
                  <span className="block text-xs font-mono text-neutral-400 mb-2 tracking-widest group-hover:text-amber-600 transition-colors">
                    {service.id}
                  </span>
                  <TextStaggerHover
                    index={index}
                    className="text-5xl md:text-8xl font-bold uppercase tracking-tighter text-neutral-900"
                    text={service.title}
                  />
                </div>
              ))}
            </div>

            {/* Right Column: Image + Description */}
            <div className="flex flex-col">
              <div className="relative aspect-[4/3] w-full">
                <HoverSliderImageWrap className="rounded-2xl overflow-hidden bg-neutral-100 w-full h-full">
                  {services.map((service, index) => (
                    <HoverSliderImage
                      key={service.id}
                      index={index}
                      imageUrl={service.image}
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-contain p-12 bg-neutral-50"
                      loading="eager"
                    />
                  ))}
                </HoverSliderImageWrap>
              </div>

              {/* Description Area moved here */}
              <ServiceDescription />
            </div>
          </div>
        </HoverSlider>
      </div>
    </section>
  );
};
