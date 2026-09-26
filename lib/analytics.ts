import type { PostHog } from 'posthog-js';

/**
 * Analytics façade.
 *
 * Everything here is deliberately fire-and-forget: `track` never throws, never
 * awaits, and silently no-ops when PostHog failed to load (blocked, offline,
 * or still importing). Analytics must never be able to break the page.
 *
 * PostHog is code-split and loaded on idle rather than imported at the module
 * top, so the ~60 kB SDK cannot delay first paint or LCP on either route.
 */

/**
 * Write-only ingest key. Public by design — it can only submit events, never
 * read them — which is why it is committed rather than injected at build time.
 */
const PROJECT_KEY = 'phc_nTm3eQzsLMcA9DRYunyUtxcmxvup7pz2Jba9FHQoX3JV';

/**
 * Same-origin ingest path, rewritten to PostHog by vercel.json. Calling
 * us.i.posthog.com directly loses roughly a third of traffic to blocklists.
 */
const INGEST_PATH = '/ingest';
const UI_HOST = 'https://us.posthog.com';

export type AnalyticsEvent =
  | 'cta_clicked'
  | 'wallpaper_downloaded'
  | 'wallpaper_pack_downloaded'
  | 'wallpaper_opened'
  | 'scroll_depth'
  | 'section_viewed';

type Properties = Record<string, string | number | boolean | undefined>;

let client: PostHog | null = null;
let booted = false;
let loading = false;
const queue: Array<[AnalyticsEvent, Properties | undefined]> = [];

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Tagged rather than suppressed on localhost, so the same code path can be
 * verified in development and then filtered out inside PostHog.
 */
const environment = (): 'development' | 'production' => {
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
    ? 'development'
    : 'production';
};

const whenIdle = (run: () => void): void => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 3000 });
    return;
  }
  window.setTimeout(run, 1200);
};

const classifyCta = (anchor: HTMLAnchorElement): string | null => {
  const href = anchor.getAttribute('href') ?? '';
  const label = anchor.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';

  if (href === '/wallpapers' || href === '/wallpapers/') return 'open_wallpapers';
  if (href === '#grid') return 'browse_wallpapers';
  if (href.endsWith('#work')) return 'view_portfolio';
  if (href.endsWith('#tools')) return 'view_tools';
  if (href.includes('resume_ashref.pdf')) return 'download_cv';
  if (href.startsWith('mailto:')) return 'lets_talk';
  if (href.endsWith('#contact')) return label.includes('resume') ? 'view_resume' : 'lets_talk';
  if (anchor.closest('#work')) return 'open_project';
  if (anchor.closest('#tools')) return 'open_tool';
  if (anchor.closest('footer') && /^https?:/.test(href)) return 'open_outbound_profile';
  return null;
};

const ctaLocation = (anchor: HTMLAnchorElement): string => {
  const href = anchor.getAttribute('href') ?? '';
  if (anchor.closest('.mobile-link')) return 'header_mobile';
  if (anchor.closest('header')) return 'header_desktop';
  if (anchor.closest('footer')) return 'footer';
  if (href === '#grid') return 'wallpapers_hero';
  if (href === '/wallpapers' || href === '/wallpapers/') return 'homepage_teaser';
  return anchor.closest<HTMLElement>('section[id]')?.id ?? 'page';
};

const ctaLabel = (anchor: HTMLAnchorElement): string | undefined =>
  anchor.getAttribute('aria-label') ??
  anchor.getAttribute('title') ??
  anchor.querySelector('img')?.alt ??
  anchor.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim() ??
  anchor.querySelector('span')?.textContent?.trim() ??
  anchor.textContent?.replace(/\s+/g, ' ').trim();

const loadAnalytics = (): void => {
  if (loading || client) return;
  loading = true;

  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(PROJECT_KEY, {
          api_host: INGEST_PATH,
          ui_host: UI_HOST,
          defaults: '2026-05-30',
          autocapture: true,
          capture_heatmaps: true,
          capture_pageview: true,
          // Engagement metrics — time on page and max scroll depth — are
          // derived from this event, so retention reporting depends on it.
          capture_pageleave: true,
          disable_session_recording: false,
          persistence: 'localStorage+cookie',
          person_profiles: 'identified_only',
          session_recording: { maskAllInputs: true },
      });
      posthog.register({ environment: environment() });

      client = posthog;
      for (const [event, properties] of queue) {
        posthog.capture(event, properties);
      }
      queue.length = 0;
    })
    .catch(() => {
      // Blocked or offline. The site does not depend on analytics.
    });
};

export function initAnalytics(): void {
  if (!isBrowser() || booted) return;
  booted = true;
  whenIdle(loadAnalytics);
}

export function track(event: AnalyticsEvent, properties?: Properties): void {
  if (!isBrowser()) return;

  if (!client) {
    // Bounded so a blocked SDK cannot grow this array without limit.
    if (queue.length < 50) queue.push([event, properties]);
    loadAnalytics();
    return;
  }

  try {
    client.capture(event, properties);
  } catch {
    // Never let instrumentation surface as a user-visible failure.
  }
}

/**
 * Reports 25/50/75/100% milestones once each per page load.
 *
 * Reads layout inside `requestAnimationFrame` and never during the scroll
 * event itself, so it cannot cause forced synchronous layout while Lenis is
 * driving the scroll.
 */
export function trackScrollDepth(pageName: string): () => void {
  if (!isBrowser()) return () => {};

  const milestones = [25, 50, 75, 100];
  const reached = new Set<number>();
  let queued = false;

  const measure = (): void => {
    queued = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const percent = Math.min(100, ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);

    for (const milestone of milestones) {
      if (percent >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        track('scroll_depth', { page: pageName, depth: milestone });
      }
    }
  };

  const onScroll = (): void => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(measure);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * Fires once per section the visitor actually reaches, which is what makes
 * "where do people drop off" answerable without session replay.
 */
export function trackSectionViews(pageName: string): () => void {
  if (!isBrowser() || typeof IntersectionObserver === 'undefined') return () => {};

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id], div[id]'))
    .filter((element) => element.id.length > 0);
  if (sections.length === 0) return () => {};

  const seen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!entry.isIntersecting || seen.has(id)) continue;
        seen.add(id);
        track('section_viewed', { page: pageName, section: id });
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );

  for (const section of sections) observer.observe(section);

  return () => observer.disconnect();
}

export function startPageAnalytics(pageName: string): () => void {
  initAnalytics();
  const stopScroll = trackScrollDepth(pageName);
  const stopSections = trackSectionViews(pageName);
  const onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return;

    const target = event.target.closest<HTMLAnchorElement>('a[href]');
    if (!target) return;
    const action = classifyCta(target);
    if (!action) return;

    track('cta_clicked', {
      action,
      destination: target.href,
      label: ctaLabel(target),
      location: ctaLocation(target),
      page: pageName,
    });
  };

  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    stopScroll();
    stopSections();
  };
}
