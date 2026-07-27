import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Server bundle used only to generate the build-time HTML snapshot.
 *
 * Output goes to `.ssg/` (a scratch directory removed by scripts/prerender.mjs)
 * and never ships to the browser. Tailwind is deliberately absent: the client
 * build already emits the stylesheet, and running it twice would be wasted work.
 *
 * `ssr.noExternal: true` bundles every dependency instead of leaving them as
 * bare Node imports. That sidesteps ESM/CJS resolution differences in GSAP,
 * Lenis, Motion and Lucide, which is the main portability risk in this step.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'ssg/entry-server.tsx',
    outDir: '.ssg',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-server.mjs',
        format: 'es',
      },
    },
  },
});
