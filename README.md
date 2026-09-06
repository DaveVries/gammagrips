# GammaGrips

Storefront for GammaGrips — six moulded controller grips for the PS5 DualSense
and the Xbox Wireless Controller.

Next.js (App Router) + TypeScript + Tailwind v4. No database and no runtime
environment variables: the catalog is data in the repo, so the whole site
builds static.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run media:scan   # re-read public/products/ and rebuild the media manifest
npm run brand        # regenerate logo geometry, SVGs and PNGs from Geist Black
```

## Layout

- `src/data/catalog.ts` — the six grips, their designs, textures and platforms.
  The single source of truth; `media:scan` reads design ids straight out of it.
- `src/data/media.generated.ts` — generated. Drop renders in `public/products/`
  named after the design id and run `npm run media:scan`.
- `src/lib/tiles.ts` — generated Voronoi geometry, baked at build time by
  `scripts/gen-tiles.mjs` so the pattern engine costs nothing at runtime.
- `src/lib/logo-mark.ts` — generated glyph outlines, so the header and the
  exported brand assets cannot drift apart.
- `src/lib/patterns.tsx` / `src/components/product/controller-render.tsx` —
  the SVG product renderer. Server components; no client JS on a card grid.
- `src/app/globals.css` — the design system. Two surfaces only: `.glass` for
  panels, `.tile` for the dark screens product media sits in.

## Deployment

Vercel. `NEXT_PUBLIC_SITE_URL` sets the canonical origin for OG tags, the
sitemap and robots.txt; without it, production falls back to the Vercel
project URL and then to `https://gammagrips.com`.
