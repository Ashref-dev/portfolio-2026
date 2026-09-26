import path from 'path';
import { defineConfig, type Plugin, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * In dev, `/wallpapers` has no trailing slash and so never resolves to
 * `wallpapers/index.html`. Static hosts issue this redirect themselves;
 * without it the dev server 404s on the exact URL that ships to production.
 */
function trailingSlashForMpaRoutes(): Plugin {
  return {
    name: 'trailing-slash-for-mpa-routes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/wallpapers') {
          res.writeHead(301, { Location: '/wallpapers/' });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig((): UserConfig => {
  return {
    /*
     * MPA, not SPA. Each route is a real HTML document with its own <head>,
     * so per-page canonical, Open Graph and structured data are static and
     * readable by crawlers that never execute JavaScript.
     */
    appType: 'mpa',
    server: {
      port: 3000,
      host: '0.0.0.0',
      /*
       * Mirrors the /ingest rewrite in vercel.json. Without it analytics 404s
       * in development, which both floods the console and hides real errors.
       */
      proxy: {
        '/ingest/static': {
          target: 'https://us-assets.i.posthog.com',
          changeOrigin: true,
          secure: true,
          rewrite: (incoming) => incoming.replace(/^\/ingest/, ''),
        },
        '/ingest': {
          target: 'https://us.i.posthog.com',
          changeOrigin: true,
          secure: true,
          rewrite: (incoming) => incoming.replace(/^\/ingest/, ''),
        },
      },
    },
    plugins: [trailingSlashForMpaRoutes(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          wallpapers: path.resolve(import.meta.dirname, 'wallpapers/index.html'),
        },
      },
    },
  };
});
