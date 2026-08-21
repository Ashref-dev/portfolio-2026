import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';

import { useIsCoarsePointer } from './lib/useIsCoarsePointer';
import { cn } from './lib/utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Reveal } from './components/Reveal';
import { HowToSet } from './components/wallpapers/HowToSet';
import { WallpaperFaq } from './components/wallpapers/WallpaperFaq';
import { WallpaperGrid } from './components/wallpapers/WallpaperGrid';
import {
  EYEBROW,
  RULER_STYLE,
  SpecRule,
  WALLPAPER_SHELL,
  WallpaperHero,
} from './components/wallpapers/WallpaperHero';

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

function Colophon() {
  return (
    <section className='relative border-t border-neutral-100 py-24 md:py-28'>
      <div className={WALLPAPER_SHELL}>
        <div aria-hidden='true' className='mb-14 h-2.5 w-full' style={RULER_STYLE} />

        <Reveal>
          <div className='flex flex-col gap-12 md:flex-row md:items-end md:justify-between md:gap-20'>
            <p className='font-serif text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[1.05] tracking-tight text-neutral-900'>
              Made in Tunis by{' '}
              <a
                href='/'
                className='italic text-blue-600 underline decoration-blue-600/25 underline-offset-[0.16em] transition-colors duration-500 hover:decoration-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]'
              >
                Achraf
              </a>
              .
            </p>

            <div className='max-w-sm'>
              <span className={cn(EYEBROW, 'block')}>Licence</span>
              <p className='mt-4 text-sm leading-relaxed text-neutral-600'>
                Free for personal use on your own devices. Please do not resell the pack or
                repackage it as your own. For commercial licensing, or a set drawn to your
                brand, email{' '}
                <a
                  href='mailto:hi@achraf.tn'
                  className='font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors duration-500 hover:decoration-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]'
                >
                  hi@achraf.tn
                </a>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WallpapersShell({ isTouchDevice }: { isTouchDevice: boolean }) {
  return (
    <div className='min-h-screen bg-[#fafafa]'>
      <Header anchorBase='/' current='wallpapers' />

      <main
        className={`relative z-10 bg-[#fafafa] shadow-2xl ${
          isTouchDevice ? '' : 'mb-[85vh]'
        }`}
      >
        <WallpaperHero isTouchDevice={isTouchDevice} />
        <SpecRule />
        <WallpaperGrid />
        <HowToSet />
        <WallpaperFaq />
        <Colophon />
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

export default function WallpapersApp() {
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
    return <WallpapersShell isTouchDevice />;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, anchors: true }}>
      <LenisScrollTriggerSync />
      <WallpapersShell isTouchDevice={false} />
    </ReactLenis>
  );
}
