import React, { useLayoutEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Code2,
    CheckCircle2,
    Gamepad2,
    LucideIcon,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface BlogPost {
  id: string;
  title: string;
  category: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  image: string;
  link: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "01",
    title: "Harness the prowess of Reflection in C#",
    category: "Development",
    description:
      "Learn about reflection in C# and it's powerful features allowing for run-time flexibility.",
    Icon: Code2,
    color: "text-orange-600",
    image: "/assets/blog/reflection.jpeg",
    link: "https://www.instagram.com/p/C3YGWzVNp5V",
  },
  {
    id: "02",
    title: "A few things about improving productivity",
    category: "Productivity",
    description:
      "A few notes on on how to boost your productivity with some simple but effective advice.",
    Icon: CheckCircle2,
    color: "text-blue-600",
    image: "/assets/blog/perfection.jpeg",
    link: "https://www.instagram.com/p/Co5UA5WLJId",
  },
  {
    id: "03",
    title: "Godot? is that a new pokemon or what?",
    category: "Game Dev",
    description:
      "Learn what Godot is and why it's loved by the game dev and open-source community.",
    Icon: Gamepad2,
    color: "text-rose-600",
    image: "/assets/blog/godot.jpeg",
    link: "https://www.instagram.com/p/Ck8D36rLkV9/",
  },
];

export const Blog: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Center the image directly on the cursor
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

      // Smooth cursor follow
      // Title reveal
      gsap.from(".blog-header", {
        y: 40,
        opacity: 0,
        filter: "blur(15px)",
        scale: 0.95,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      const xTo = gsap.quickTo(cursorRef.current, "x", {
        duration: 0.35,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(cursorRef.current, "y", {
        duration: 0.35,
        ease: "power2.out",
      });

      const moveCursor = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      window.addEventListener("mousemove", moveCursor);
      return () => window.removeEventListener("mousemove", moveCursor);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-[#fafafa] px-6 relative z-20 border-t border-neutral-100"
    >
      <div className="landing-shell">
        {/* Header: Minimalist & Architectural */}
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-neutral-100">
          <h2 className="blog-header text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tighter text-neutral-900">
            Latest{" "}
            <span className="font-serif italic font-light text-amber-600">
              Thoughts.
            </span>
          </h2>
        </div>

        {/* The List: Pure Typography & Interaction */}
        <div className="flex flex-col">
          {blogPosts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-row group relative py-12 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between transition-all duration-500 hover:px-4"
              onMouseEnter={() => setActiveImage(post.image)}
              onMouseLeave={() => setActiveImage(null)}
            >
              <div className="flex items-center gap-8 md:gap-16 z-10">
                <span className="text-[10px] font-bold text-neutral-300 tracking-widest font-sans">
                  {post.id}
                </span>
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ${post.color}`}
                  >
                    {post.category}
                  </span>
                  <h3 className="text-3xl md:text-6xl font-serif text-neutral-900 transition-all duration-500 leading-none">
                    {post.title}
                  </h3>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  Read Article
                </span>
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Link */}
        {/* <div className="mt-16 flex justify-center">
          <a
            href="https://www.instagram.com/ashref.dev/"
            target="_blank"
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 hover:text-black transition-colors"
          >
            View Archive{" "}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div> */}
      </div>

      {/* The "Artifact" Cursor: Square Aspect Ratio (1:1) */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 size-[30em] pointer-events-none z-[100] overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ease-out ${
          activeImage
            ? "opacity-100 scale-100 rotate-3"
            : "opacity-0 scale-50 rotate-0"
        }`}
      >
        {activeImage && (
          <div className="w-full h-full bg-neutral-100">
            <img
              src={activeImage}
              className="w-full h-full object-cover"
              alt="Blog Preview"
            />
          </div>
        )}
      </div>
    </section>
  );
};
