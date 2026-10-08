export interface Tool {
  id: string;
  name: string;
  domain: string;
  repo: string;
  runsOn: string;
  description: string;
}

/**
 * Order is deliberate: the OG artwork alternates light and dark down the
 * single mobile column, and lands one dark tile per column on the two-column
 * grid.
 */
export const tools: readonly Tool[] = [
  {
    id: 'remi',
    name: 'Remi',
    domain: 'remi.achraf.tn',
    repo: 'Ashref-dev/remi-notes-project',
    runsOn: 'macOS 26 Tahoe',
    description:
      'Liquid Glass notes that live in the macOS menu bar, one keystroke away. Written in Swift, free and open source, and the project I am proudest of. It is open on my Mac every day.',
  },
  {
    id: 'ots',
    name: 'OTS',
    domain: 'ots.achraf.tn',
    repo: 'Ashref-dev/one-time-secret',
    runsOn: 'Any browser, served from Tunisia',
    description:
      'One-time secret links, encrypted in your browser and burned after a single read. Fully sovereign and self-hosted in Tunisia, it is how I share anything sensitive.',
  },
  {
    id: 'blank',
    name: 'blank.',
    domain: 'blank.achraf.tn',
    repo: 'Ashref-dev/blank-notes',
    runsOn: 'Any browser',
    description:
      'A clutter-free page for quick notes that lives in your browser, no account needed. I use it to stage prompts and screenshots before handing them to my agents.',
  },
  {
    id: 'diff',
    name: 'diff',
    domain: 'diff.achraf.tn',
    repo: 'Ashref-dev/diff.ashref.tn',
    runsOn: 'Any browser',
    description:
      'Paste two texts and see every change instantly, split or unified, with word-level highlights and syntax colors. It stays fast at ten thousand lines and never leaves your browser.',
  },
  {
    id: 'md',
    name: 'md.',
    domain: 'md.achraf.tn',
    repo: 'Ashref-dev/md',
    runsOn: 'Any browser',
    description:
      'Paste Markdown, get a clean, print-ready PDF with tables, code, Mermaid and LaTeX. Everything renders in the browser and nothing is uploaded. It is how my agents’ output becomes documents I can send.',
  },
  {
    id: 'excel',
    name: 'excel.',
    domain: 'excel.achraf.tn',
    repo: 'Ashref-dev/excel-to-md',
    runsOn: 'Any browser',
    description:
      'Drop in .xlsx, .xls or .csv files and get clean Markdown tables, one sheet or every sheet at once. The quickest way to turn a spreadsheet into something a doc or a prompt can use.',
  },
  {
    id: 'daystack',
    name: 'Daystack',
    domain: 'daystack.achraf.tn',
    repo: 'Ashref-dev/daystack',
    runsOn: 'Any browser, installable on your phone',
    description:
      'Build your routine once, then open it and check off today. Repeating tasks come back fresh the next morning, so nothing stays checked forever. Mobile-first and local-first, it works offline and keeps everything on your device.',
  },
];

/** Cloudflare Web Analytics, last 30 days, across every service I run. */
export const traffic = {
  visitors: '3.9k',
  requests: '238k+',
  cacheHit: 43,
  desktop: 98,
  mobile: 2,
  countries: ['Tunisia', 'United States', 'Netherlands', 'Singapore', 'Italy'],
  os: 'Windows',
} as const;
