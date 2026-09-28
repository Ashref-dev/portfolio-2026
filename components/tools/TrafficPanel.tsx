import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Monitor } from 'lucide-react';

import { traffic } from './data';
import {
  WORLD_COLS,
  WORLD_LAT_MAX,
  WORLD_LON_MIN,
  WORLD_ROWS,
  WORLD_RUNS,
  WORLD_STEP,
} from './worldDots';

gsap.registerPlugin(ScrollTrigger);

const LABEL =
  'font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400';

/** Cloudflare's brand orange, used only for the metric Cloudflare itself reports. */
const CLOUDFLARE_ORANGE = '#f38020';

type Country = (typeof traffic.countries)[number];

const COORDS: Record<Country, readonly [lat: number, lon: number]> = {
  Tunisia: [34.0, 9.5],
  'United States': [39.5, -98.0],
  Netherlands: [52.2, 5.3],
  Singapore: [1.35, 103.8],
  Italy: [42.8, 12.5],
};

interface Point {
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

// Equirectangular: one grid unit per WORLD_STEP degrees; dot centres sit half a unit into each row.
const project = (lat: number, lon: number): Point => ({
  x: (lon - WORLD_LON_MIN) / WORLD_STEP,
  y: (WORLD_LAT_MAX - lat) / WORLD_STEP + 0.5,
});

const formatCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;

const MARKERS = traffic.countries.map((name, index) => {
  const [lat, lon] = COORDS[name];
  return {
    name,
    rank: String(index + 1).padStart(2, '0'),
    coord: formatCoord(lat, lon),
    point: project(lat, lon),
    primary: index === 0,
  };
});

const ORIGIN = project(...COORDS[traffic.countries[0]]);

// Quadratic bezier lifted off the chord along its upward normal, so routes read as great-circle arcs.
const arcPath = (from: Point, to: Point) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const flip = -dx / length > 0 ? -1 : 1;
  const nx = (dy / length) * flip;
  const ny = (-dx / length) * flip;
  const lift = length * 0.24;
  const cx = (from.x + to.x) / 2 + nx * lift;
  const cy = (from.y + to.y) / 2 + ny * lift;
  return `M${round(from.x)} ${round(from.y)}Q${round(cx)} ${round(cy)} ${round(to.x)} ${round(to.y)}`;
};

const ARCS = MARKERS.slice(1).map((marker) => ({
  name: marker.name,
  d: arcPath(ORIGIN, marker.point),
}));

const BAND_COUNT = 18;

/**
 * Land cells grouped into concentric distance bands around the origin. Each
 * band is a single path of zero-length round-capped segments: identical to
 * circles on screen, but 18 nodes instead of ~3,100.
 */
const BAND_PATHS = (() => {
  const cells: { c: number; r: number; distance: number }[] = [];
  WORLD_RUNS.forEach((runs, r) => {
    for (let i = 0; i < runs.length; i += 2) {
      const start = runs[i];
      const span = runs[i + 1];
      for (let c = start; c < start + span; c++) {
        cells.push({ c, r, distance: Math.hypot(c + 0.5 - ORIGIN.x, r + 0.5 - ORIGIN.y) });
      }
    }
  });
  const max = cells.reduce((acc, cell) => Math.max(acc, cell.distance), 1);
  const bands: string[] = Array.from({ length: BAND_COUNT }, () => '');
  for (const cell of cells) {
    const band = Math.min(BAND_COUNT - 1, Math.floor((cell.distance / max) * BAND_COUNT));
    bands[band] += `M${cell.c} ${cell.r}h0`;
  }
  return bands.filter(Boolean);
})();

type CounterKey = 'visitors' | 'requests' | 'cache';

const COUNTERS: Record<CounterKey, { to: number; final: string; format: (value: number) => string }> = {
  visitors: {
    to: 3900,
    final: traffic.visitors,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))),
  },
  requests: {
    to: 238000,
    final: traffic.requests,
    format: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))),
  },
  cache: {
    to: traffic.cacheHit,
    final: `${traffic.cacheHit}%`,
    format: (v) => `${Math.round(v)}%`,
  },
};

const isCounterKey = (value: string | undefined): value is CounterKey =>
  value === 'visitors' || value === 'requests' || value === 'cache';

const CountValue = ({ id }: { id: CounterKey }) => (
  <>
    <span aria-hidden='true' data-count={id}>
      {COUNTERS[id].final}
    </span>
    <span className='sr-only'>{COUNTERS[id].final}</span>
  </>
);

const VALUE = 'text-3xl font-bold tabular-nums tracking-tighter text-neutral-900 md:text-4xl';

const WorldMap = () => (
  <svg
    aria-hidden='true'
    viewBox={`0 0 ${WORLD_COLS} ${WORLD_ROWS}`}
    className='block h-auto w-full overflow-visible'
  >
    <g
      transform='translate(0.5 0.5)'
      fill='none'
      strokeWidth={0.62}
      strokeLinecap='round'
      className='stroke-neutral-300'
    >
      {BAND_PATHS.map((d, index) => (
        <path key={index} className='tp-band' d={d} />
      ))}
    </g>

    <g fill='none' strokeWidth={0.28}>
      {ARCS.map((arc) => (
        <path
          key={arc.name}
          className='tp-arc stroke-amber-600/60'
          d={arc.d}
          pathLength={1}
          strokeDasharray='1'
          strokeDashoffset={0}
        />
      ))}
    </g>

    {MARKERS.map((marker) => (
      <g key={marker.name} transform={`translate(${round(marker.point.x)} ${round(marker.point.y)})`}>
        <circle
          className={`tp-ring opacity-0 ${marker.primary ? 'fill-amber-600' : 'fill-amber-500'}`}
          r={marker.primary ? 1 : 0.8}
        />
        <circle
          className={`tp-marker ${marker.primary ? 'fill-amber-600' : 'fill-amber-500/80'}`}
          r={marker.primary ? 1 : 0.8}
        />
      </g>
    ))}
  </svg>
);

export function TrafficPanel() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', (context) => {
      const q = gsap.utils.selector(root);
      const panel = q('.tp-panel');
      const bands = q('.tp-band');
      const arcs = q('.tp-arc');
      const markers = q('.tp-marker');
      const rings = q('.tp-ring');
      const legend = q('.tp-legend-item');
      const gauge = q('.tp-gauge');
      const bars = q('.tp-bar');
      const counters = Array.from(root.querySelectorAll<HTMLElement>('[data-count]'));

      gsap.set(panel, { opacity: 0, y: 24 });
      gsap.set(bands, { opacity: 0 });
      gsap.set(arcs, { strokeDashoffset: 1 });
      gsap.set([...markers, ...rings], { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(legend, { opacity: 0, y: 10 });
      gsap.set(gauge, { strokeDashoffset: 100 });
      gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' });
      counters.forEach((el) => {
        const key = el.dataset.count;
        if (isCounterKey(key)) el.textContent = COUNTERS[key].format(0);
      });

      let started = false;
      let visible = true;
      let pulse: gsap.core.Tween | null = null;

      const startPulse = () =>
        context.add(() => {
          pulse = gsap.fromTo(
            rings,
            { scale: 1, opacity: 0.5 },
            {
              scale: 2.6,
              opacity: 0,
              duration: 2.4,
              ease: 'power1.out',
              paused: !visible,
              stagger: { each: 0.48, repeat: -1 },
            }
          );
        });

      const start = () => {
        if (started) return;
        started = true;

        context.add(() => {
          const wave = 0.25;
          const bandEach = 0.05;
          const arcsAt = wave + bands.length * bandEach * 0.55;

          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: { trigger: root, start: 'top 75%', once: true },
          });

          tl.to(panel, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0)
            .to(bands, { opacity: 1, duration: 0.6, stagger: bandEach, ease: 'power1.out' }, wave)
            .to(markers[0] ?? [], { scale: 1, duration: 0.6, ease: 'back.out(2.4)' }, wave + 0.05);

          arcs.forEach((arc, index) => {
            const at = arcsAt + index * 0.14;
            tl.to(arc, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, at);
            const marker = markers[index + 1];
            if (marker) tl.to(marker, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, at + 0.95);
          });

          tl.to(legend, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, arcsAt);

          counters.forEach((el) => {
            const key = el.dataset.count;
            if (!isCounterKey(key)) return;
            const counter = COUNTERS[key];
            const state = { value: 0 };
            tl.to(
              state,
              {
                value: counter.to,
                duration: 1.8,
                ease: 'power3.out',
                onUpdate: () => {
                  el.textContent = counter.format(state.value);
                },
                onComplete: () => {
                  el.textContent = counter.final;
                },
              },
              0.45
            );
          });

          tl.to(gauge, { strokeDashoffset: 100 - traffic.cacheHit, duration: 1.6, ease: 'power3.out' }, 0.5)
            .to(bars, { scaleX: 1, duration: 1.2, stagger: 0.3, ease: 'power3.inOut' }, 0.55)
            .call(startPulse);

          ScrollTrigger.create({
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              visible = self.isActive;
              if (!pulse) return;
              if (visible) pulse.play();
              else pulse.pause();
            },
          });
        });
      };

      window.addEventListener('app-ready', start);
      const fallback = window.setTimeout(start, 2200);
      if (document.documentElement.dataset.appReady === 'true') start();

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener('app-ready', start);
        counters.forEach((el) => {
          const key = el.dataset.count;
          if (isCounterKey(key)) el.textContent = COUNTERS[key].final;
        });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} aria-labelledby='traffic-title' className='px-6 pb-20 md:pb-28'>
      <div className='landing-shell'>
        <div className='tp-panel overflow-hidden rounded-2xl border border-neutral-200 bg-white'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 md:px-8'>
            <div className='flex items-center gap-2.5'>
              <Globe
                aria-hidden='true'
                strokeWidth={1.75}
                className='size-4 shrink-0 animate-[spin_48s_linear_infinite] text-amber-600 motion-reduce:animate-none'
              />
              <h2
                id='traffic-title'
                className='font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900'
              >
                Traffic across my services
              </h2>
            </div>
            <span className={LABEL}>Last 30 days &middot; Cloudflare</span>
          </div>

          <div className='grid md:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]'>
            <figure className='px-4 pb-5 pt-8 sm:px-6 md:px-8 md:pb-6 md:pt-10'>
              <WorldMap />
              <figcaption className='mt-5 text-[11px] text-neutral-400'>
                Natural Earth land, sampled every 2.2&deg;
              </figcaption>
            </figure>

            <div className='border-t border-neutral-200 px-6 py-6 md:border-l md:border-t-0 md:px-8 md:py-10'>
              <h3 className={LABEL}>Top countries</h3>
              <ol className='mt-4'>
                {MARKERS.map((marker) => (
                  <li
                    key={marker.name}
                    className='tp-legend-item flex items-center gap-3 border-b border-neutral-100 py-3 last:border-b-0'
                  >
                    <span className='w-5 shrink-0 font-mono text-[11px] tabular-nums text-neutral-400'>
                      {marker.rank}
                    </span>
                    <span
                      aria-hidden='true'
                      className={`size-2 shrink-0 rounded-full ${marker.primary ? 'bg-amber-600' : 'bg-amber-500/80'}`}
                    />
                    <span className='min-w-0 flex-1 truncate text-[15px] font-medium tracking-tight text-neutral-900'>
                      {marker.name}
                    </span>
                    <span className='shrink-0 font-mono text-[11px] tabular-nums text-neutral-400'>
                      {marker.coord}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <dl className='grid grid-cols-2 gap-px border-t border-neutral-200 bg-neutral-200 md:grid-cols-5'>
            <div className='flex flex-col bg-white p-6 md:p-7'>
              <dt className={LABEL}>Unique visitors</dt>
              <dd className={`mt-auto flex min-h-10 pt-4 items-end ${VALUE}`}>
                <CountValue id='visitors' />
              </dd>
            </div>

            <div className='flex flex-col bg-white p-6 md:p-7'>
              <dt className={LABEL}>Requests</dt>
              <dd className={`mt-auto flex min-h-10 pt-4 items-end ${VALUE}`}>
                <CountValue id='requests' />
              </dd>
            </div>

            <div className='flex flex-col bg-white p-6 md:p-7'>
              <dt className={LABEL}>Cache hit</dt>
              <dd className='mt-auto flex min-h-10 pt-4 items-end gap-3'>
                <svg aria-hidden='true' viewBox='0 0 36 36' className='size-9 shrink-0 -rotate-90 md:size-10'>
                  <circle cx='18' cy='18' r='15' fill='none' strokeWidth='4' className='stroke-neutral-100' />
                  <circle
                    cx='18'
                    cy='18'
                    r='15'
                    fill='none'
                    strokeWidth='4'
                    strokeLinecap='round'
                    stroke={CLOUDFLARE_ORANGE}
                    pathLength={100}
                    strokeDasharray='100'
                    strokeDashoffset={100 - traffic.cacheHit}
                    className='tp-gauge'
                  />
                </svg>
                <span className={VALUE}>
                  <CountValue id='cache' />
                </span>
              </dd>
            </div>

            <div className='col-span-2 flex flex-col bg-white p-6 max-md:order-last md:col-span-1 md:p-7'>
              <dt className={LABEL}>Devices</dt>
              <dd className='mt-auto flex min-h-10 pt-4 flex-col justify-end'>
                <div className='flex h-1.5 w-full gap-0.5'>
                  <span
                    className='tp-bar h-full rounded-full bg-neutral-900'
                    style={{ width: `${traffic.desktop}%` }}
                  />
                  <span className='tp-bar h-full min-w-1 flex-1 rounded-full bg-amber-500' />
                </div>
                <div className='mt-2.5 flex justify-between gap-3 text-xs tabular-nums text-neutral-500'>
                  <span>Desktop {traffic.desktop}%</span>
                  <span>Mobile {traffic.mobile}%</span>
                </div>
              </dd>
            </div>

            <div className='flex flex-col bg-white p-6 md:p-7'>
              <dt className={LABEL}>Most common OS</dt>
              <dd className='mt-auto flex min-h-10 pt-4 items-end gap-2.5'>
                <Monitor aria-hidden='true' strokeWidth={1.5} className='mb-1 size-5 shrink-0 text-neutral-400' />
                <span className='text-xl font-semibold tracking-tight text-neutral-900'>{traffic.os}</span>
              </dd>
            </div>
          </dl>
        </div>

        <p className='mt-4 max-w-2xl text-xs leading-relaxed text-neutral-400'>
          Measured with Cloudflare Web Analytics across all of my services, including a few that are
          not public yet, such as chat.achraf.tn. Product analytics run on PostHog.
        </p>
      </div>
    </section>
  );
}
