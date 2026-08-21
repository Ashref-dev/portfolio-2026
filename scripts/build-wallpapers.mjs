/**
 * Wallpaper asset pipeline.
 *
 * The artwork is the product, so the download is the ORIGINAL file copied
 * byte-for-byte under its original name. Nothing is re-encoded, resized or
 * stripped on that path — a wallpaper pack that ships recompressed JPEGs is
 * a worse pack, and the metadata and filenames are part of the artefact.
 *
 * Only the page's own UI imagery is derived:
 *
 *   public/wallpapers/wall N.jpg              verbatim original  (download)
 *   public/wallpapers/preview/NN.webp         grid preview       (~45 kB)
 *   components/wallpapers/blur.generated.ts   inline LQIP placeholders
 *
 * The LQIP is a 16px-wide WebP inlined as a data URI. At that size it costs
 * ~250 bytes per image — cheaper than a network round-trip for a placeholder —
 * and it removes the grey-box flash on slow connections entirely, so the grid
 * fades in from the wallpaper's own colour instead of from nothing.
 *
 * Run: node scripts/build-wallpapers.mjs [sourceDir]
 * Idempotent. Only needs re-running when the source pack changes.
 */

import { execFile } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

const sourceDir =
  process.argv[2] ??
  path.join(os.homedir(), 'Desktop', 'achraf-iphone16-wallpapers');

const outFull = path.join(projectRoot, 'public', 'wallpapers');
const outPreview = path.join(outFull, 'preview');
const blurFile = path.join(
  projectRoot,
  'components',
  'wallpapers',
  'blur.generated.ts'
);

const NATIVE_WIDTH = 1572;
const NATIVE_HEIGHT = 3408;
const PREVIEW_WIDTH = 620;
const PREVIEW_WIDTH_2X = 1240;
const LQIP_WIDTH = 16;

function fail(message) {
  console.error(`\n[wallpapers] FAILED: ${message}\n`);
  process.exit(1);
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Discovers `wall N.jpg` and orders by N, not lexically — plain sorting would
 * put "wall 10" before "wall 2" and silently scramble ids against the quotes.
 */
async function discoverSources() {
  const entries = await readdir(sourceDir);
  const found = [];

  for (const name of entries) {
    const match = /^wall (\d+)\.jpg$/i.exec(name);
    if (match) found.push({ index: Number(match[1]), name });
  }

  if (found.length === 0) fail(`no "wall N.jpg" files found in ${sourceDir}`);

  found.sort((a, b) => a.index - b.index);

  const expected = found.map((_, i) => i + 1);
  const actual = found.map((entry) => entry.index);
  if (expected.some((value, i) => value !== actual[i])) {
    fail(
      `source indices are not a contiguous 1..N run: got ${actual.join(', ')}. ` +
        'Renumber the exports so ids stay stable.'
    );
  }

  return found;
}

async function assertSource(file) {
  const { stdout } = await run('magick', ['identify', '-format', '%w %h', file]);
  const [w, h] = stdout.trim().split(/\s+/).map(Number);
  if (w !== NATIVE_WIDTH || h !== NATIVE_HEIGHT) {
    fail(
      `${path.basename(file)} is ${w}x${h}, expected ${NATIVE_WIDTH}x${NATIVE_HEIGHT}. ` +
        'Mixed dimensions would break the fixed aspect-ratio grid.'
    );
  }
}

async function main() {
  if (!existsSync(sourceDir)) fail(`source directory not found: ${sourceDir}`);

  try {
    await run('magick', ['-version']);
  } catch {
    fail('ImageMagick (`magick`) is not on PATH. Install with `brew install imagemagick`.');
  }

  const scratch = path.join(os.tmpdir(), `wallpapers-${process.pid}`);
  await mkdir(scratch, { recursive: true });
  await mkdir(outPreview, { recursive: true });

  const sources = await discoverSources();
  const entries = [];
  let totalBytes = 0;

  for (const source of sources) {
    const src = path.join(sourceDir, source.name);
    await assertSource(src);

    const id = pad(source.index);
    const filename = source.name;
    const fullOut = path.join(outFull, filename);
    const previewOut = path.join(outPreview, `${id}.webp`);
    const preview2xOut = path.join(outPreview, `${id}@2x.webp`);
    const lqipOut = path.join(scratch, `${id}.webp`);

    // Verbatim copy. Deliberately not `magick` — the download must be the
    // artist's file, identical bytes, identical name.
    await copyFile(src, fullOut);

    await run('magick', [
      src,
      '-strip',
      '-resize', `${PREVIEW_WIDTH}x`,
      '-quality', '78',
      '-define', 'webp:method=6',
      previewOut,
    ]);

    // Retina variant. Lower quality than the 1x on purpose: at double the
    // pixel density webp artefacts are invisible, so the extra resolution
    // costs far less than the quality drop saves.
    await run('magick', [
      src,
      '-strip',
      '-resize', `${PREVIEW_WIDTH_2X}x`,
      '-quality', '70',
      '-define', 'webp:method=6',
      preview2xOut,
    ]);

    await run('magick', [
      src,
      '-strip',
      '-resize', `${LQIP_WIDTH}x`,
      '-quality', '45',
      lqipOut,
    ]);

    const blur = `data:image/webp;base64,${(await readFile(lqipOut)).toString('base64')}`;
    const { size } = await stat(fullOut);
    const preview = await stat(previewOut);
    totalBytes += size;

    entries.push({ id, filename, blur, bytes: size });
    process.stdout.write(
      `[wallpapers] ${id}  ${filename}  ${(size / 1024 / 1024).toFixed(1)} MB original  ` +
        `+ ${(preview.size / 1024).toFixed(0)} kB preview\n`
    );
  }

  await rm(scratch, { recursive: true, force: true });

  // Drop derivatives of wallpapers that no longer exist upstream. The zip step
  // globs this directory, so a stale file would silently ship inside the pack.
  const keptOriginals = new Set(entries.map((entry) => entry.filename));
  const keptPreviews = new Set(
    entries.flatMap((entry) => [`${entry.id}.webp`, `${entry.id}@2x.webp`])
  );

  for (const name of await readdir(outFull)) {
    if (name.toLowerCase().endsWith('.jpg') && !keptOriginals.has(name)) {
      await rm(path.join(outFull, name), { force: true });
      console.log(`[wallpapers] pruned ${name}`);
    }
  }
  for (const name of await readdir(outPreview)) {
    if (!keptPreviews.has(name)) {
      await rm(path.join(outPreview, name), { force: true });
      console.log(`[wallpapers] pruned preview/${name}`);
    }
  }

  const body = entries
    .map(
      (e) =>
        `  '${e.id}': {\n` +
        `    filename: ${JSON.stringify(e.filename)},\n` +
        `    bytes: ${e.bytes},\n` +
        `    blur:\n      '${e.blur}',\n` +
        `  },`
    )
    .join('\n');

  const file = `// GENERATED by scripts/build-wallpapers.mjs — do not edit by hand.
// Regenerate with: node scripts/build-wallpapers.mjs [sourceDir]

export interface WallpaperAsset {
  /** Original filename, preserved exactly as exported. Contains a space. */
  readonly filename: string;
  /** Byte size of the untouched original, shown on the download control. */
  readonly bytes: number;
  /** 16px WebP data URI painted underneath the preview until it decodes. */
  readonly blur: string;
}

export const NATIVE_WIDTH = ${NATIVE_WIDTH};
export const NATIVE_HEIGHT = ${NATIVE_HEIGHT};

export const assets: Readonly<Record<string, WallpaperAsset>> = {
${body}
};
`;

  await mkdir(path.dirname(blurFile), { recursive: true });
  await writeFile(blurFile, file, 'utf8');

  console.log(
    `[wallpapers] OK  ${entries.length} originals  ${(totalBytes / 1024 / 1024).toFixed(1)} MB untouched  ` +
      `-> ${path.relative(projectRoot, blurFile)}`
  );
}

main().catch((error) => fail(error?.stack ?? String(error)));
