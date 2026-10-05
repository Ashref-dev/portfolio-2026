import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';

import { useIsCoarsePointer } from './lib/useIsCoarsePointer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Reveal } from './components/Reveal';
import { TrafficPanel } from './components/tools/TrafficPanel';
import { ToolEntry } from './components/tools/ToolEntry';
import { Updates } from './components/tools/Updates';
import { tools } from './components/tools/data';

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

function ToolsShell({ isTouchDevice }: { isTouchDevice: boolean }) {
  return (
    <div className='min-h-screen bg-[#fafafa]'>
      <Header anchorBase='/' current='tools' />

      <main
        className={`relative z-10 bg-[#fafafa] shadow-2xl ${isTouchDevice ? '' : 'mb-[85vh]'}`}
      >
        <section className='px-6 pb-14 pt-36 md:pb-20 md:pt-48'>
          <div className='landing-shell'>
            <Reveal>
              <h1 className='text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900'>
                Tools I
                <span className='mt-2 block font-serif font-normal italic text-amber-600 md:mt-0 md:inline md:pl-5'>
                  Built.
                </span>
              </h1>
            </Reveal>
            <Reveal delay='100'>
              <p className='mt-8 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg'>
                Small tools I built for my own workflow and use every day. All of them are free
                and open source.
              </p>
            </Reveal>
          </div>
        </section>

        <TrafficPanel />

        <section id='tools' aria-label='Tools' className='px-6 pb-24 md:pb-32'>
          <div className='landing-shell'>
            {tools.map((tool, index) => (
              <ToolEntry key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </section>

        <Updates />
      </main>

      <div
        className={
          isTouchDevice ? 'relative z-0 min-h-[85dvh]' : 'fixed bottom-0 left-0 z-0 h-[85vh] w-full'
        }
      >
        <Footer />
      </div>
    </div>
  );
}

export default function ToolsApp() {
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
    return <ToolsShell isTouchDevice />;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, anchors: true }}>
      <LenisScrollTriggerSync />
      <ToolsShell isTouchDevice={false} />
    </ReactLenis>
  );
}
