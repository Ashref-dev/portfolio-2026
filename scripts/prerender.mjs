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
const distHtml = path.join(projectRoot, 'dist', 'index.html');
const tmpHtml = `${distHtml}.tmp`;

const ROOT_PLACEHOLDER = '<div id="root"></div>';
const MIN_MARKUP_LENGTH = 20_000;

/**
 * Phrases that must survive into the snapshot. These are load-bearing for both
 * SEO intent (geo + role tokens) and for proving the page rendered in full
 * rather than bailing out partway through the component tree.
 */
const REQUIRED_PHRASES = [
  'Achraf',
  'Software Engineer',
  'Tunisia',
  'Tunis, TN',
  'Building full-stack AI solutions.',
  'HeloSolutions',
  'id="contact"',
];

function fail(message) {
  console.error(`\n[prerender] FAILED: ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!existsSync(ssgEntry)) {
    fail(`missing SSR bundle at ${path.relative(projectRoot, ssgEntry)}. ` +
      'Run `vite build --config vite.ssg.config.ts` first.');
  }
  if (!existsSync(distHtml)) {
    fail(`missing ${path.relative(projectRoot, distHtml)}. Run \`vite build\` first.`);
  }

  let markup;
  try {
    const mod = await import(pathToFileURL(ssgEntry).href);
    if (typeof mod.render !== 'function') {
      fail('SSR bundle does not export a render() function.');
    }
    markup = mod.render();
  } catch (error) {
    fail(`render() threw: ${error?.stack ?? error}`);
  }

  if (typeof markup !== 'string' || markup.length < MIN_MARKUP_LENGTH) {
    fail(`markup too short (${markup?.length ?? 0} chars, expected >= ${MIN_MARKUP_LENGTH}). ` +
      'The component tree probably did not render completely.');
  }

  const missing = REQUIRED_PHRASES.filter((phrase) => !markup.includes(phrase));
  if (missing.length > 0) {
    fail(`snapshot is missing required content: ${missing.join(', ')}`);
  }

  const html = await readFile(distHtml, 'utf8');
  const occurrences = html.split(ROOT_PLACEHOLDER).length - 1;
  if (occurrences !== 1) {
    fail(`expected exactly one \`${ROOT_PLACEHOLDER}\` in dist/index.html, found ${occurrences}.`);
  }

  const injected = html.replace(ROOT_PLACEHOLDER, `<div id="root">${markup}</div>`);

  // Write-then-rename so a crash midway cannot leave a truncated index.html.
  await writeFile(tmpHtml, injected, 'utf8');
  await rename(tmpHtml, distHtml);

  await rm(path.join(projectRoot, '.ssg'), { recursive: true, force: true });

  const before = (html.length / 1024).toFixed(1);
  const after = (injected.length / 1024).toFixed(1);
  console.log(`[prerender] OK  ${before} kB -> ${after} kB  (+${(markup.length / 1024).toFixed(1)} kB of crawlable markup)`);
}

main().catch((error) => fail(error?.stack ?? String(error)));
