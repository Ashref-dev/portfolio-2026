# achraf.tn

Personal portfolio of Achraf Ben Abdallah — AI Engineer and Full-stack Developer based in Tunis, Tunisia.

## Stack

- **Framework:** React 19 + Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + custom CSS
- **Animation:** GSAP (ScrollTrigger) + Lenis smooth scroll
- **Package manager:** Bun
- **Deployment:** Vercel

## Project Structure

```
.
├── components/          # All UI components
│   ├── ui/              # Low-level primitives
│   └── wallpapers/      # /wallpapers route sections and data
├── lib/                 # Shared utilities (cn, pointer detection)
├── public/
│   ├── assets/          # Static assets (images, resume, OG image)
│   └── wallpapers/      # Wallpaper originals + webp previews
├── scripts/             # Build-time asset and prerender steps
├── ssg/                 # Server entry used for the static snapshot
├── wallpapers/          # /wallpapers HTML shell and entry point
├── App.tsx              # Home route component and layout
├── WallpapersApp.tsx    # /wallpapers route component and layout
├── index.tsx            # React DOM entry point (home)
├── index.html           # HTML shell with SEO and OG meta tags
└── index.css            # Global styles and Tailwind base
```

Routing is a Vite **multi-page** build, not a client-side router: `/` and
`/wallpapers` are separate HTML documents, each with its own canonical URL,
Open Graph tags and structured data. Both are prerendered to static markup at
build time by `scripts/prerender.mjs`, which fails the build if either page
renders empty.

## Wallpaper assets

The downloadable wallpapers are the **original exports, copied byte-for-byte**.
Only the on-page previews are recompressed — a 620px `NN.webp` and a 1240px
`NN@2x.webp`, offered to the browser as a `srcSet` density pair. The scripts
discover however many `wall N.jpg` files exist, so adding to the pack only
requires a re-run plus a matching entry in `components/wallpapers/data.ts`.

To regenerate after changing the source pack:

```bash
node scripts/build-wallpapers.mjs [sourceDir]   # originals + 1x/2x webp previews + LQIP
node scripts/build-og-wallpapers.mjs            # social card for /wallpapers
```

Both require ImageMagick (`brew install imagemagick`). They are deliberately
**not** part of `bun run build` — the outputs are committed, so deploys never
depend on a local image toolchain.

## Local Development

**Prerequisites:** Bun (https://bun.sh)

```bash
bun install
bun run dev
```

## Production Build

```bash
bun run build
```

Output is placed in `dist/`. Deployed automatically on push to `main` via Vercel.

## Contact

hi@achraf.tn  
https://achraf.tn
