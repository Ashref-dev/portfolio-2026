import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { PrimaryButton } from "./ui/PrimaryButton";

const NavLink = ({
  children,
  href,
  onClick,
  isScrolled,
  name = "",
}: {
  children?: React.ReactNode;
  href: string;
  onClick?: () => void;
  isScrolled: boolean;
  name?: string;
}) => (
  <a
    href={href}
    onClick={onClick}
    title={name}
    className={`nav-item relative font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 group text-neutral-900`}
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full" />
  </a>
);

export const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    let ctx: gsap.Context;

    // Immediately hide elements to prevent flicker
    gsap.set(headerRef.current?.querySelectorAll(".nav-item") || [], { 
      y: -50, opacity: 0, filter: "blur(10px)", scale: 0.95 
    });

    const startAnimation = () => {
      ctx = gsap.context(() => {
        const navItems = gsap.utils.toArray(".nav-item");

        gsap.to(navItems, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, headerRef);
    };

    window.addEventListener('app-ready', startAnimation);

    // In case preloader already finished or we hot-reloaded
    if (document.readyState === 'complete' && !document.getElementById('preloader')?.style.transform) {
      // fallback just in case
    }

    return () => {
      window.removeEventListener('app-ready', startAnimation);
      ctx?.revert();
    };
  }, []);

  useLayoutEffect(() => {
    // Initial state: Hidden and moved up
    if (menuRef.current) {
      gsap.set(menuRef.current, { yPercent: -100, autoAlpha: 0 });
    }
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (isMenuOpen) {
      // Open animation
      gsap.to(menu, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: "power3.inOut",
      });
      // Link stagger
      gsap.fromTo(
        ".mobile-link",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        },
      );
    } else {
      // Close animation
      gsap.to(menu, {
        yPercent: -100,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.inOut",
      });
    }
  }, [isMenuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-[100] flex items-center justify-between transition-all duration-500 ease-in-out lg:px-12 pointer-events-none ${
          isScrolled ? "px-4 py-4 mt-4" : "px-6 py-8 md:py-10 shadow-none"
        }`}
      >
        <div
          className={`flex items-center justify-between mx-auto w-full transition-all duration-500 ease-in-out pointer-events-auto ${
            isScrolled
              ? "bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-full py-3 px-4 shadow-xl shadow-black/5 max-w-5xl"
              : "max-w-full"
          }`}
        >
          {/* Logo Section */}
          <div className="nav-item flex items-center gap-4">
            <a href="/" className="block">
              <img
                src="/assets/logo.svg"
                alt="Logo"
                className={`w-10 h-10 object-contain hover:scale-110 transition-all duration-300 ${
                  isMenuOpen ? "" : ""
                }`}
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <div className="flex gap-8">
              <NavLink href="#work" isScrolled={isScrolled} name="Work">
                Work
              </NavLink>
              <NavLink href="#about" isScrolled={isScrolled} name="About">
                About
              </NavLink>
              <NavLink
                href="#contact"
                isScrolled={isScrolled}
                name="Check out my resume."
              >
                Resume
              </NavLink>
            </div>
            <PrimaryButton
              href="https://www.linkedin.com/in/achrafbenabdallah/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-[11px]"
              icon={true}
            >
              Let's Talk
            </PrimaryButton>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden nav-item p-2 transition-colors duration-300 ${
              isMenuOpen ? "text-neutral-900" : "text-neutral-900"
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu (GSAP Controlled) */}
      <div
        ref={menuRef}
        className="fixed inset-0 bg-[#fafafa] z-[99] flex flex-col items-center justify-center pointer-events-auto opacity-0 invisible"
      >
        <nav className="flex flex-col items-center gap-8">
          {[
            { label: "Work", href: "#work", external: false, button: false },
            { label: "About", href: "#about", external: false, button: false },
            { label: "Resume", href: "#contact", external: false, button: false },
            {
              label: "Let's Talk",
              href: "mailto:hi@achraf.tn",
              external: false,
              button: true,
            },
          ].map((link, i) => (
            <div key={link.label} className="mobile-link">
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={
                  link.button
                    ? "px-8 py-4 bg-neutral-900 text-white rounded-full text-xl font-medium"
                    : "text-4xl font-serif text-neutral-900 hover:text-rose-600 transition-colors"
                }
              >
                {link.label}
              </a>
            </div>
          ))}
        </nav>

        {/* Mobile Socials or Info */}
        <div className="mobile-link absolute bottom-12 left-0 w-full px-12 flex justify-between items-end text-[10px] tracking-widest uppercase text-neutral-400">
          <div>{new Date().getFullYear()} achraf.tn</div>
          <div>TUNIS, TN</div>
        </div>
      </div>
    </>
  );
};
