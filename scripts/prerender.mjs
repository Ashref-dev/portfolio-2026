/**
 * Build-time prerender step.
 *
 * Renders the React tree to static markup and injects it into the empty
 * `<div id="root"></div>` that Vite emits, so that crawlers which do not
 * execute JavaScript (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and
 * every other AI fetcher) receive the full page text in the initial response.
 *
 * Design constraint: FAIL CLOSED. If anything is wrong we exit non-zero and
 * leave `dist/index.html` untouched. Silently shipping an empty root would be
 * worse than a failed build, because the regression would be invisible.
 */

import { rm, readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssgEntry = path.join(projectRoot, '.ssg', 'entry-server.mjs');

const ROOT_PLACEHOLDER = '<div id="root"></div>';

/**
 * One entry per HTML document emitted by the MPA build.
 *
 * `requiredPhrases` are load-bearing for both SEO intent and for proving the
 * page rendered in full rather than bailing out partway through the component
 * tree. `minLength` guards against a tree that renders but collapses.
 */
const PAGES = [
  {
    label: 'home',
    exportName: 'render',
    html: path.join(projectRoot, 'dist', 'index.html'),
    minLength: 20_000,
    requiredPhrases: [
      'Achraf',
      'Software Engineer',
      'Tunisia',
      'Tunis, TN',
      'Building full-stack AI solutions.',
      'HeloSolutions',
      'id="contact"',
    ],
  },
  {
    label: 'wallpapers',
    exportName: 'renderWallpapers',
    html: path.join(projectRoot, 'dist', 'wallpapers', 'index.html'),
    minLength: 8_000,
    requiredPhrases: [
      'Achraf',
      'Wallpapers',
      '1572',
      '3408',
      'Every better decision builds a',
      "Circumstances don't",
      'Save',
    ],
  },
  {
    label: 'tools',
    exportName: 'renderTools',
    html: path.join(projectRoot, 'dist', 'tools', 'index.html'),
    minLength: 8_000,
    requiredPhrases: [
      'Achraf',
      'Tools I',
      'remi.achraf.tn',
      'excel.achraf.tn',
      'github.com/Ashref-dev',
      'Unique visitors',
      'Cloudflare',
    ],
  },
];

function fail(message) {
  console.error(`\n[prerender] FAILED: ${message}\n`);
  process.exit(1);
}

async function prerenderPage(mod, page) {
  const rel = path.relative(projectRoot, page.html);

  if (!existsSync(page.html)) {
    fail(`missing ${rel}. Run \`vite build\` first.`);
  }
  if (typeof mod[page.exportName] !== 'function') {
    fail(`SSR bundle does not export ${page.exportName}().`);
  }

  let markup;
  try {
    markup = mod[page.exportName]();
  } catch (error) {
    fail(`${page.exportName}() threw: ${error?.stack ?? error}`);
  }

  if (typeof markup !== 'string' || markup.length < page.minLength) {
    fail(`[${page.label}] markup too short (${markup?.length ?? 0} chars, expected >= ${page.minLength}). ` +
      'The component tree probably did not render completely.');
  }

  const missing = page.requiredPhrases.filter((phrase) => !markup.includes(phrase));
  if (missing.length > 0) {
    fail(`[${page.label}] snapshot is missing required content: ${missing.join(', ')}`);
  }

  const html = await readFile(page.html, 'utf8');
  const occurrences = html.split(ROOT_PLACEHOLDER).length - 1;
  if (occurrences !== 1) {
    fail(`[${page.label}] expected exactly one \`${ROOT_PLACEHOLDER}\` in ${rel}, found ${occurrences}.`);
  }

  const injected = html.replace(ROOT_PLACEHOLDER, `<div id="root">${markup}</div>`);

  // Write-then-rename so a crash midway cannot leave a truncated document.
  const tmpHtml = `${page.html}.tmp`;
  await writeFile(tmpHtml, injected, 'utf8');
  await rename(tmpHtml, page.html);

  const before = (html.length / 1024).toFixed(1);
  const after = (injected.length / 1024).toFixed(1);
  console.log(
    `[prerender] OK  ${rel}  ${before} kB -> ${after} kB  ` +
      `(+${(markup.length / 1024).toFixed(1)} kB of crawlable markup)`
  );
}

const SITE = 'https://achraf.tn';

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Emitted from the same typed data the page renders, so the image sitemap can
 * never fall out of step with the pack.
 */
async function writeSitemap(wallpapers) {
  if (!Array.isArray(wallpapers) || wallpapers.length === 0) {
    fail('SSR bundle exported no wallpapers; refusing to emit an empty sitemap.');
  }

  const today = new Date().toISOString().slice(0, 10);

  const images = wallpapers
    .map((wallpaper) => {
      const quote = `${wallpaper.quote.before}${wallpaper.quote.em}${wallpaper.quote.after}`;
      const title = `${wallpaper.colorway} iPhone wallpaper — "${quote}"`;
      const caption =
        `Free 1572 x 3408 iPhone wallpaper by Achraf Ben Abdallah: a blueprint drafting grid ` +
        `over a soft ${wallpaper.colorway.toLowerCase()} gradient, reading "${quote}".`;
      return (
        '    <image:image>\n' +
        `      <image:loc>${SITE}${wallpaper.full}</image:loc>\n` +
        `      <image:title>${escapeXml(title)}</image:title>\n` +
        `      <image:caption>${escapeXml(caption)}</image:caption>\n` +
        '    </image:image>'
      );
    })
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    `  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
    `  <url>\n    <loc>${SITE}/wallpapers</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n' +
    images +
    '\n  </url>\n' +
    `  <url>\n    <loc>${SITE}/tools</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n' +
    `  <url>\n    <loc>${SITE}/assets/resume_ashref.pdf</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>yearly</changefreq>\n    <priority>0.5</priority>\n  </url>\n' +
    '</urlset>\n';

  const target = path.join(projectRoot, 'dist', 'sitemap.xml');
  await writeFile(target, xml, 'utf8');
  console.log(
    `[prerender] OK  dist/sitemap.xml  ${wallpapers.length} wallpaper images indexed`
  );
}

async function main() {
  if (!existsSync(ssgEntry)) {
    fail(`missing SSR bundle at ${path.relative(projectRoot, ssgEntry)}. ` +
      'Run `vite build --config vite.ssg.config.ts` first.');
  }

  let mod;
  try {
    mod = await import(pathToFileURL(ssgEntry).href);
  } catch (error) {
    fail(`could not load SSR bundle: ${error?.stack ?? error}`);
  }

  for (const page of PAGES) {
    await prerenderPage(mod, page);
  }

  await writeSitemap(mod.wallpapers);

  await rm(path.join(projectRoot, '.ssg'), { recursive: true, force: true });
}

main().catch((error) => fail(error?.stack ?? String(error)));
