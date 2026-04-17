import { useEffect, useLayoutEffect, useState } from 'react';
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

function LenisScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

function useIsCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isCoarse;
}

function AppShell() {
  return (
    <div className='bg-[#fafafa] min-h-screen '>
      <Header />

      <main className='relative z-10 bg-[#fafafa] shadow-2xl mb-[85vh]'>
        <HeroManifesto />
        <Projects />
        <HeroIdentity />
        <ProcessTicker />
        <About />
        <Services />
        <Experience />
        <Testimonials />
        <Blog />
        <div id='contact' className='h-[1px] w-full' />
      </main>

      <div className='fixed bottom-0 left-0 w-full h-[85vh] z-0'>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  const isTouchDevice = useIsCoarsePointer();

  useLayoutEffect(() => {
    const handleLoad = () => {
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
    gsap.ticker.lagSmoothing(0);
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

  useEffect(() => {
    const mode = isTouchDevice ? 'native' : 'lenis';
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document.documentElement.dataset.scrollMode = mode;
    });
    return () => cancelAnimationFrame(id);
  }, [isTouchDevice]);

  if (isTouchDevice) {
    return <AppShell />;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, anchors: true }}>
      <LenisScrollTriggerSync />
      <AppShell />
    </ReactLenis>
  );
}
