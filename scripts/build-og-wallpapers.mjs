/**
 * Builds public/og-wallpapers.png — the social card for /wallpapers.
 *
 * Composited rather than screenshotted so the card stays legible at the ~500px
 * width most feeds actually render: a screenshot of the page would reduce to
 * unreadable grey. The artwork is fanned from a shared pivot, which reads as
 * "a set" at thumbnail size where a flat grid would not.
 *
 * Fonts are fetched into a scratch dir; Instrument Serif and Inter are the
 * site's own faces, so the card matches the page it links to.
 *
 * Run: node scripts/build-og-wallpapers.mjs
 */

import { execFile } from 'node:child_process';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import os from 'node:os';

const run = promisify(execFile);

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const previewDir = path.join(projectRoot, 'public', 'wallpapers', 'preview');
const outFile = path.join(projectRoot, 'public', 'og-wallpapers.png');

const W = 1200;
const H = 630;

const CARD_W = 208;
const CARD_H = Math.round((CARD_W * 3408) / 1572);
const RADIUS = 26;

const FONTS = {
  serif: {
    file: 'InstrumentSerif-Regular.ttf',
    url: 'https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf',
  },
  serifItalic: {
    file: 'InstrumentSerif-Italic.ttf',
    url: 'https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Italic.ttf',
  },
  sans: {
    file: 'Inter.ttf',
    url: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf',
  },
};

/** Fanned from a shared pivot: back cards first so the centre card lands on top. */
const FAN = [
  { id: '14', angle: -18, cx: 668, cy: 344 },
  { id: '02', angle: -9, cx: 774, cy: 318 },
  { id: '05', angle: 18, cx: 1092, cy: 344 },
  { id: '19', angle: 9, cx: 986, cy: 318 },
  { id: '01', angle: 0, cx: 880, cy: 308 },
];

function fail(message) {
  console.error(`\n[og] FAILED: ${message}\n`);
  process.exit(1);
}

async function ensureFonts(dir) {
  await mkdir(dir, { recursive: true });
  const resolved = {};

  for (const [key, font] of Object.entries(FONTS)) {
    const target = path.join(dir, font.file);
    if (!existsSync(target)) {
      const response = await fetch(font.url);
      if (!response.ok) fail(`could not download ${font.file}: HTTP ${response.status}`);
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
    }
    resolved[key] = target;
  }

  return resolved;
}

async function buildCard(id, angle, scratch) {
  const source = path.join(previewDir, `${id}.webp`);
  if (!existsSync(source)) {
    fail(`missing preview ${source}. Run \`node scripts/build-wallpapers.mjs\` first.`);
  }

  const mask = path.join(scratch, `mask-${id}.png`);
  const card = path.join(scratch, `card-${id}.png`);
  const shadow = path.join(scratch, `shadow-${id}.png`);

  await run('magick', [
    '-size', `${CARD_W}x${CARD_H}`,
    'xc:none',
    '-fill', 'white',
    '-draw', `roundrectangle 0,0 ${CARD_W - 1},${CARD_H - 1} ${RADIUS},${RADIUS}`,
    mask,
  ]);

  await run('magick', [
    source,
    '-resize', `${CARD_W}x${CARD_H}^`,
    '-gravity', 'center',
    '-extent', `${CARD_W}x${CARD_H}`,
    // Lift before masking: the artwork is intentionally dim, and at card size
    // on a dark field it collapses to mud without a little exposure. Kept low
    // enough that the card still reads as the wallpaper you actually download.
    '-modulate', '111,110,100',
    mask, '-alpha', 'off', '-compose', 'CopyOpacity', '-composite',
    // Hairline rim so adjacent cards separate against each other in the fan.
    '-fill', 'none',
    '-stroke', 'rgba(255,255,255,0.34)',
    '-strokewidth', '1.4',
    '-draw', `roundrectangle 0.7,0.7 ${CARD_W - 1.7},${CARD_H - 1.7} ${RADIUS},${RADIUS}`,
    '-background', 'none',
    '-rotate', String(angle),
    card,
  ]);

  await run('magick', [
    card,
    '-channel', 'A', '-separate', '+channel',
    '-background', 'black', '-alpha', 'shape',
    '-fill', 'black', '-colorize', '100',
    '-channel', 'A', '-evaluate', 'multiply', '0.42', '+channel',
    '-blur', '0x16',
    shadow,
  ]);

  const { stdout } = await run('magick', ['identify', '-format', '%w %h', card]);
  const [w, h] = stdout.trim().split(/\s+/).map(Number);

  return { card, shadow, w, h };
}

async function main() {
  try {
    await run('magick', ['-version']);
  } catch {
    fail('ImageMagick (`magick`) is not on PATH. Install with `brew install imagemagick`.');
  }

  // Only the 1x previews are one-per-wallpaper; @2x would double the count.
  const count = (await readdir(previewDir)).filter((name) =>
    /^\d+\.webp$/.test(name)
  ).length;
  if (count === 0) {
    fail(`no previews in ${previewDir}. Run \`node scripts/build-wallpapers.mjs\` first.`);
  }

  const scratch = path.join(os.tmpdir(), `og-wallpapers-${process.pid}`);
  await mkdir(scratch, { recursive: true });
  const fonts = await ensureFonts(path.join(os.tmpdir(), 'achraf-og-fonts'));

  const base = path.join(scratch, 'base.png');
  const gridTile = path.join(scratch, 'grid.png');

  // Drafting grid, matching the artwork's own 30px rule.
  await run('magick', [
    '-size', '30x30', 'xc:none',
    '-fill', 'none', '-stroke', 'rgba(255,255,255,0.055)', '-strokewidth', '1',
    '-draw', 'line 0,0 0,30', '-draw', 'line 0,0 30,0',
    gridTile,
  ]);

  await run('magick', [
    '-size', `${W}x${H}`,
    'xc:#080a0e',
    // Cool bloom behind the fan, so the cards sit in light instead of on flat black.
    '(', '-size', `${W}x${H}`, 'radial-gradient:#1b3c86-#080a0e', ')',
    '-compose', 'screen', '-composite',
    '(', gridTile, '-write', 'mpr:grid', '+delete',
    '-size', `${W}x${H}`, 'tile:mpr:grid', ')', '-compose', 'over', '-composite',
    // Left scrim, applied to the field only. Applying it over the finished
    // composite would dim the artwork, which is the one thing that must stay lit.
    '(', '-size', `${H}x${W}`, 'gradient:rgba(8,10,14,0.92)-rgba(8,10,14,0)',
    '-rotate', '90', '-resize', `${W}x${H}!`, ')',
    '-compose', 'over', '-composite',
    base,
  ]);

  const composite = ['magick', base];
  for (const { id, angle, cx, cy } of FAN) {
    const { card, shadow, w, h } = await buildCard(id, angle, scratch);
    const x = Math.round(cx - w / 2);
    const y = Math.round(cy - h / 2);
    composite.push(
      shadow, '-geometry', `+${x}+${y + 26}`, '-compose', 'over', '-composite',
      card, '-geometry', `+${x}+${y}`, '-compose', 'over', '-composite'
    );
  }

  const stacked = path.join(scratch, 'stacked.png');
  await run(composite[0], [...composite.slice(1), stacked]);

  await run('magick', [
    stacked,
    '-gravity', 'northwest',
    '-font', fonts.sans, '-pointsize', '17', '-kerning', '4.2',
    '-fill', 'rgba(250,250,250,0.46)',
    '-annotate', '+74+150', 'ACHRAF.TN / WALLPAPERS',

    '-font', fonts.serif, '-pointsize', '78', '-kerning', '-1',
    '-fill', '#fafafa',
    '-annotate', '+72+236', `${count} wallpapers,`,

    '-font', fonts.serifItalic, '-pointsize', '78', '-kerning', '-1',
    '-fill', '#7ba4ff',
    '-annotate', '+72+318', 'one line each.',

    '-font', fonts.sans, '-pointsize', '20', '-kerning', '0.2',
    '-fill', 'rgba(250,250,250,0.72)',
    '-annotate', '+74+394', '1572 \u00d7 3408  \u00b7  Made for iPhone  \u00b7  Free',

    '-font', fonts.sans, '-pointsize', '15', '-kerning', '3',
    '-fill', 'rgba(250,250,250,0.40)',
    '-annotate', '+74+468', 'SAVE STRAIGHT TO PHOTOS',

    // Social scrapers refetch this constantly; the grain in the artwork makes
    // truecolour PNG enormous, and 256 colours is indistinguishable at the
    // ~500px width feeds actually render.
    '-strip',
    '-dither', 'FloydSteinberg',
    '-colors', '256',
    '-define', 'png:compression-level=9',
    outFile,
  ]);

  await rm(scratch, { recursive: true, force: true });

  const { stdout } = await run('magick', ['identify', '-format', '%w %h %b', outFile]);
  console.log(`[og] OK  ${path.relative(projectRoot, outFile)}  ${stdout.trim()}`);
}

main().catch((error) => fail(error?.stack ?? String(error)));
