/**
 * Bundles the 20 untouched originals into a single downloadable archive.
 *
 * Written by hand rather than with a zip dependency for three reasons: the
 * archive must contain the originals byte-for-byte, JPEG is already entropy
 * coded so DEFLATE buys nothing (measured: <0.5%), and a build step that runs
 * on Vercel should not need a native toolchain. STORE (method 0) copies bytes
 * straight through, which makes this both faster and provably lossless.
 *
 * The output is gitignored and regenerated at build time, so the ~120 MB
 * archive never enters git history — the sources it is built from are already
 * committed.
 *
 * ZIP64 is deliberately not implemented: it is only required past 4 GB or
 * 65535 entries, and the script refuses to run if either bound is approached
 * rather than silently emitting a corrupt archive.
 *
 * Run: node scripts/build-wallpaper-zip.mjs
 */

import { createWriteStream } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const sourceDir = path.join(projectRoot, 'public', 'wallpapers');
const outFile = path.join(sourceDir, 'achraf-wallpaper-pack.zip');

const MAX_TOTAL_BYTES = 0xffffffff;
const MAX_ENTRIES = 0xffff;

/**
 * Fixed timestamp (2026-01-01 12:00) instead of file mtimes, so repeated
 * builds produce byte-identical archives and CDNs keep their cached copy.
 */
const DOS_TIME = (12 << 11) | (0 << 5) | 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

function fail(message) {
  console.error(`\n[zip] FAILED: ${message}\n`);
  process.exit(1);
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function localHeader(nameBytes, crc, size) {
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0);
  head.writeUInt16LE(20, 4);
  // Bit 11 marks the filename as UTF-8. The originals contain a space and we
  // preserve their names exactly, so this must not be left to guesswork.
  head.writeUInt16LE(0x0800, 6);
  head.writeUInt16LE(0, 8);
  head.writeUInt16LE(DOS_TIME, 10);
  head.writeUInt16LE(DOS_DATE, 12);
  head.writeUInt32LE(crc, 14);
  head.writeUInt32LE(size, 18);
  head.writeUInt32LE(size, 22);
  head.writeUInt16LE(nameBytes.length, 26);
  head.writeUInt16LE(0, 28);
  return Buffer.concat([head, nameBytes]);
}

function centralHeader(nameBytes, crc, size, offset) {
  const head = Buffer.alloc(46);
  head.writeUInt32LE(0x02014b50, 0);
  head.writeUInt16LE(20, 4);
  head.writeUInt16LE(20, 6);
  head.writeUInt16LE(0x0800, 8);
  head.writeUInt16LE(0, 10);
  head.writeUInt16LE(DOS_TIME, 12);
  head.writeUInt16LE(DOS_DATE, 14);
  head.writeUInt32LE(crc, 16);
  head.writeUInt32LE(size, 20);
  head.writeUInt32LE(size, 24);
  head.writeUInt16LE(nameBytes.length, 28);
  head.writeUInt16LE(0, 30);
  head.writeUInt16LE(0, 32);
  head.writeUInt16LE(0, 34);
  head.writeUInt16LE(0, 36);
  head.writeUInt32LE(0, 38);
  head.writeUInt32LE(offset, 42);
  return Buffer.concat([head, nameBytes]);
}

function endOfCentralDirectory(count, size, offset) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(size, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return end;
}

async function collectSources() {
  if (!existsSync(sourceDir)) {
    fail(`missing ${path.relative(projectRoot, sourceDir)}. ` +
      'Run `node scripts/build-wallpapers.mjs` first.');
  }

  const names = (await readdir(sourceDir))
    .filter((name) => name.toLowerCase().endsWith('.jpg'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (names.length === 0) fail(`no .jpg files in ${sourceDir}`);
  if (names.length > MAX_ENTRIES) fail(`${names.length} entries exceeds the non-ZIP64 limit`);

  return names;
}

async function isUpToDate(names) {
  if (!existsSync(outFile)) return false;

  const zipStat = await stat(outFile);
  for (const name of names) {
    const source = await stat(path.join(sourceDir, name));
    if (source.mtimeMs > zipStat.mtimeMs) return false;
  }
  return true;
}

async function main() {
  const names = await collectSources();

  if (await isUpToDate(names)) {
    const { size } = await stat(outFile);
    console.log(
      `[zip] up to date  ${path.relative(projectRoot, outFile)}  ` +
        `${(size / 1024 / 1024).toFixed(1)} MB`
    );
    return;
  }

  const chunks = [];
  const central = [];
  let offset = 0;

  for (const name of names) {
    const nameBytes = Buffer.from(name, 'utf8');
    const data = await readFile(path.join(sourceDir, name));
    const crc = crc32(data);

    const head = localHeader(nameBytes, crc, data.length);
    chunks.push(head, data);
    central.push(centralHeader(nameBytes, crc, data.length, offset));
    offset += head.length + data.length;

    if (offset > MAX_TOTAL_BYTES) {
      fail('archive exceeds 4 GB; ZIP64 support would be required');
    }
  }

  const centralBuffer = Buffer.concat(central);
  chunks.push(centralBuffer, endOfCentralDirectory(names.length, centralBuffer.length, offset));

  await pipeline(Readable.from(chunks), createWriteStream(outFile));

  const { size } = await stat(outFile);
  console.log(
    `[zip] OK  ${path.relative(projectRoot, outFile)}  ` +
      `${names.length} originals  ${(size / 1024 / 1024).toFixed(1)} MB`
  );
}

main().catch((error) => fail(error?.stack ?? String(error)));
