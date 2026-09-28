import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';
import WallpapersApp from '../WallpapersApp';
import ToolsApp from '../ToolsApp';

/**
 * Build-time static snapshot entry.
 *
 * This is intentionally NOT a hydration entry. `renderToStaticMarkup` never
 * executes effects (`useEffect` / `useLayoutEffect`), so no GSAP timeline,
 * ScrollTrigger instance, or Lenis instance is created here. The output is
 * clean React markup, free of runtime-mutated transforms and pin spacers.
 *
 * The client still mounts with `createRoot` and replaces this markup wholesale,
 * so there is no hydration contract to honour and no mismatch risk from the
 * pointer-type branching in the page shells.
 */
export function render(): string {
  return renderToStaticMarkup(<App />);
}

export function renderWallpapers(): string {
  return renderToStaticMarkup(<WallpapersApp />);
}

export function renderTools(): string {
  return renderToStaticMarkup(<ToolsApp />);
}

/**
 * Re-exported so scripts/prerender.mjs can emit the image sitemap from the
 * same typed source the page renders from. A hand-written sitemap silently
 * drifts the moment the pack changes.
 */
export { wallpapers } from '../components/wallpapers/data';
