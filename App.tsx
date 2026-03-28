import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
// @ts-ignore
import 'lenis/dist/lenis.css';

import { Header } from './components/Header';
import { HeroManifesto } from './components/HeroManifesto';
import { HeroIdentity } from './components/HeroIdentity';
import { ProcessTicker } from './components/ProcessTicker';
import { About } from './components/About';
import { Services } from './components/Services';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { Testimonials } from './components/Testimonials';
import { Blog } from './components/Blog';
import { Footer } from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function LenisSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

export default function App() {
  const lenisRef = useRef<any>(null);

  useLayoutEffect(() => {
    // Wait for all assets (images, fonts, etc.) to load
    const handleLoad = () => {
      // Small timeout to ensure visual readiness
      setTimeout(() => {
        gsap.to('#preloader', {
          yPercent: -100,
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: () => {
            window.dispatchEvent(new CustomEvent('app-ready'));
          },
        });
      }, 200);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    const handleAppReady = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    };

    window.addEventListener('app-ready', handleAppReady);
    return () => window.removeEventListener('app-ready', handleAppReady);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
      <LenisSync />

      <div className='bg-[#fafafa] min-h-screen '>
        {/* Global Header */}
        <Header />

        {/* Main Content Wrapper - Slides over the footer */}
        <main className='relative z-10 bg-[#fafafa] shadow-2xl mb-[85vh]'>
          {/* 1. Hero Manifesto (Clean Intro) */}
          <HeroManifesto />

          {/* 2. Projects Gallery (Horizontal) */}
          <Projects />

          {/* 3. Hero Identity (Dark Mode Transition) */}
          <HeroIdentity />

          {/* 4. Process Ticker (Horizontal Story) */}
          <ProcessTicker />

          {/* 5. About Me (Bio, Stats, Tech) */}
          <About />

          {/* 6. Services (Grid) */}
          <Services />

          {/* 7. Experience (Timeline) */}
          <Experience />

          {/* 8. Testimonials */}
          <Testimonials />

          {/* 9. Blog */}
          <Blog />

          {/* Footer Trigger Anchor */}
          <div id='contact' className='h-[1px] w-full' />
        </main>

        {/* Global Footer - Fixed at the bottom */}
        <div className='fixed bottom-0 left-0 w-full h-[85vh] z-0'>
          <Footer />
        </div>
      </div>
    </ReactLenis>
  );
}
