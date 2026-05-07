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
│   └── ui/              # Low-level primitives
├── lib/                 # Shared utilities (cn, etc.)
├── public/
│   └── assets/          # Static assets (images, resume, OG image)
├── App.tsx              # Root component and layout
├── index.tsx            # React DOM entry point
├── index.html           # HTML shell with SEO and OG meta tags
└── index.css            # Global styles and Tailwind base
```

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
