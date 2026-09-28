import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import { useIsCoarsePointer } from './lib/useIsCoarsePointer';
import { Header } from './components/Header';
import { HeroManifesto } from './components/HeroManifesto';
import { HeroIdentity } from './components/HeroIdentity';
import { ProcessTicker } from './components/ProcessTicker';
import { About } from './components/About';
import { Services } from './components/Services';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { ToolsFinder } from './components/tools/ToolsFinder';
import { Testimonials } from './components/Testimonials';
import { Blog } from './components/Blog';
import { WallpaperTeaser } from './components/WallpaperTeaser';
import { Footer } from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

function AppShell({ isTouchDevice }: { isTouchDevice: boolean }) {
  return (
    <div className='bg-[#fafafa] min-h-screen '>
      <Header />

      <main
        className={`relative z-10 bg-[#fafafa] shadow-2xl ${
          isTouchDevice ? '' : 'mb-[85vh]'
        }`}
      >
        <HeroManifesto />
        <ToolsFinder />
        <Projects />
        <HeroIdentity />
        <ProcessTicker />
        <About />
        <Services />
        <Experience />
        <Testimonials />
        <Blog />
        <WallpaperTeaser />
        <div id='contact' className='h-[1px] w-full' />
      </main>

      <div
        className={
          isTouchDevice
            ? 'relative z-0 min-h-[85dvh]'
            : 'fixed bottom-0 left-0 z-0 h-[85vh] w-full'
        }
      >
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
            document.documentElement.dataset.appReady = 'true';
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
    return <AppShell isTouchDevice />;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, anchors: true }}>
      <LenisScrollTriggerSync />
      <AppShell isTouchDevice={false} />
    </ReactLenis>
  );
}
