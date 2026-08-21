import { assets, NATIVE_HEIGHT, NATIVE_WIDTH } from './blur.generated';

export { NATIVE_HEIGHT, NATIVE_WIDTH };

/**
 * A quote is stored split rather than as one string because the emphasised
 * span is set in italic on the artwork itself. Keeping the three parts
 * separate lets the page reproduce that exact typographic rhythm instead of
 * approximating it with markup parsing.
 *
 * `em` is empty for the wallpapers set entirely in roman; renderers must skip
 * the `<em>` in that case rather than emit an empty one.
 */
export interface Quote {
  readonly before: string;
  readonly em: string;
  readonly after: string;
}

export interface Wallpaper {
  /** Zero-padded index; matches the asset filenames on disk. */
  readonly id: string;
  readonly quote: Quote;
  /** Human name for the colourway, used in the detail view and alt text. */
  readonly colorway: string;
  /** Signature hue, hand-picked from the artwork. Drives glow and detail UI. */
  readonly accent: string;
  /** Untouched original. URL-encoded: the preserved filenames contain a space. */
  readonly full: string;
  /** Original filename, used as the download target name. */
  readonly filename: string;
  /** 620px WebP used by the grid. Page chrome only, never the download. */
  readonly preview: string;
  /** Double-density preview, offered to retina displays via srcSet. */
  readonly preview2x: string;
  /** 16px inline placeholder, painted until the preview decodes. */
  readonly blur: string;
  /** Byte size of the full-resolution file. */
  readonly bytes: number;
}

interface WallpaperSeed {
  readonly id: string;
  readonly quote: Quote;
  readonly colorway: string;
  readonly accent: string;
}

const seeds: readonly WallpaperSeed[] = [
  {
    id: '01',
    quote: { before: 'Every better decision builds a ', em: 'better', after: ' you' },
    colorway: 'Royal',
    accent: '#0b44e0',
  },
  {
    id: '02',
    quote: { before: 'Direction matters ', em: 'more', after: ' than speed' },
    colorway: 'Emerald',
    accent: '#0a9b57',
  },
  {
    id: '03',
    quote: { before: 'Discipline will always ', em: 'outlast', after: ' motivation' },
    colorway: 'Sand',
    accent: '#c09257',
  },
  {
    id: '04',
    quote: { before: 'Begin before you feel ', em: 'ready', after: '' },
    colorway: 'Teal',
    accent: '#0c7e78',
  },
  {
    id: '05',
    quote: { before: 'Consistency succeeds where ', em: 'intensity', after: ' fails' },
    colorway: 'Gold',
    accent: '#c08a10',
  },
  {
    id: '06',
    quote: { before: 'Action ', em: 'reveals', after: ' what thought cannot' },
    colorway: 'Violet',
    accent: '#7c5bd4',
  },
  {
    id: '07',
    quote: { before: 'Done today beats ', em: 'perfect', after: ' someday' },
    colorway: 'Rust',
    accent: '#c2521a',
  },
  {
    id: '08',
    quote: { before: 'Elite mindset creates ', em: 'elite', after: ' outcomes' },
    colorway: 'Graphite',
    accent: '#3c4855',
  },
  {
    id: '09',
    quote: { before: 'Character is built through ', em: 'choices', after: '' },
    colorway: 'Azure',
    accent: '#0a72d8',
  },
  {
    id: '10',
    quote: { before: 'We look often, but ', em: 'rarely', after: ' see' },
    colorway: 'Olive',
    accent: '#6e8c13',
  },
  {
    id: '11',
    quote: { before: 'Simplicity is the ', em: 'utmost', after: ' sophistication' },
    colorway: 'Indigo',
    accent: '#2e3170',
  },
  {
    id: '12',
    quote: { before: 'Doubt can ', em: 'sharpen', after: ' an honest mind' },
    colorway: 'Moss',
    accent: '#5f6b1e',
  },
  {
    id: '13',
    quote: { before: 'Wisdom begins when ', em: 'certainty', after: ' ends' },
    colorway: 'Denim',
    accent: '#5486b8',
  },
  {
    id: '14',
    quote: { before: 'Fortune favors the ', em: 'bold', after: '' },
    colorway: 'Crimson',
    accent: '#9e1c1c',
  },
  {
    id: '15',
    quote: { before: 'Never ', em: 'venture', after: ', never win!' },
    colorway: 'Carbon',
    accent: '#4a4a4a',
  },
  {
    id: '16',
    quote: { before: 'Becoming is ', em: 'superior', after: ' to being' },
    colorway: 'Cobalt',
    accent: '#0b54d6',
  },
  {
    id: '17',
    quote: { before: 'Creativity takes ', em: 'courage', after: '' },
    colorway: 'Steel',
    accent: '#3c6ea5',
  },
  {
    id: '18',
    quote: { before: 'I do not seek. I ', em: 'find', after: '.' },
    colorway: 'Slate',
    accent: '#4a5a6e',
  },
  {
    id: '19',
    quote: { before: 'Engage ', em: 'deeply', after: ' or remain unchanged' },
    colorway: 'Jade',
    accent: '#14a07a',
  },
  {
    id: '20',
    quote: { before: "Circumstances don't ", em: 'define', after: ' your limits' },
    colorway: 'Amethyst',
    accent: '#5322b8',
  },
  {
    id: '21',
    quote: { before: 'Learn the rules well, then break them', em: '', after: '' },
    colorway: 'Sapphire',
    accent: '#2f6fd0',
  },
];

/**
 * Fails at module load rather than rendering a broken tile: a seed without a
 * generated asset means the pipeline and the copy have drifted apart, and a
 * missing image is far harder to notice in review than a build that stops.
 */
export const wallpapers: readonly Wallpaper[] = seeds.map((seed) => {
  const asset = assets[seed.id];
  if (!asset) {
    throw new Error(
      `Wallpaper ${seed.id} has no generated asset. ` +
        'Run `node scripts/build-wallpapers.mjs` to regenerate.'
    );
  }

  return {
    ...seed,
    full: encodeURI(`/wallpapers/${asset.filename}`),
    filename: asset.filename,
    preview: `/wallpapers/preview/${seed.id}.webp`,
    preview2x: `/wallpapers/preview/${seed.id}@2x.webp`,
    blur: asset.blur,
    bytes: asset.bytes,
  };
});

export const WALLPAPER_COUNT = wallpapers.length;

export const plainQuote = (quote: Quote): string =>
  `${quote.before}${quote.em}${quote.after}`;

export const altTextFor = (wallpaper: Wallpaper): string =>
  `${wallpaper.colorway} iPhone wallpaper reading "${plainQuote(wallpaper.quote)}" ` +
  'over a blueprint grid and soft gradient';
