import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';

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
 * pointer-type branching in App.tsx.
 */
export function render(): string {
  return renderToStaticMarkup(<App />);
}
