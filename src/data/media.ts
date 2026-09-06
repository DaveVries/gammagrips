/* ============================================================================
   Product media manifest
   ----------------------------------------------------------------------------
   The store renders product imagery from ONE place: `mediaFor()`. If a real
   asset is registered here it is used; otherwise the built-in SVG renderer
   draws the product. That means real photography or 3D renders can be dropped
   in per product / design / controller, incrementally, without touching a
   single component.

   HOW TO ADD REAL RENDERS
   1. Put the files in  public/products/
   2. Register them below, keyed  "<product-slug>|<design-id>|<platform-id>"
      Use "*" as a wildcard for design or platform.
   3. Order matters — the first entry is the lead image on cards and the PDP.

   Recommended exports: 2000px on the long edge, WebP or AVIF, transparent or
   near-black background, square (1:1) or 5:4. Keep the controller centred with
   ~8% padding so it crops predictably inside cards.

   Example:
     "dark-matter-grips|dark-matter|dualsense": [
       { src: "/products/dark-matter-dualsense.png", w: 2000, h: 1540,
         alt: "Dark Matter Grips fitted to a DualSense", kind: "front" },
     ],

   In practice you will not write this by hand — `npm run media:scan` generates
   the equivalent from the filenames in public/products/.
   ========================================================================= */

export interface MediaAsset {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Drives ordering and which slot the asset fills in the PDP gallery. */
  kind: "front" | "angle" | "macro" | "installed" | "lifestyle" | "inbox";
}

import { GENERATED_MEDIA } from "@/data/media.generated";

/** Hand-registered overrides. Anything here wins over the scanned manifest. */
export const PRODUCT_MEDIA: Record<string, MediaAsset[]> = {};

/** Most specific key wins, hand-registered before scanned. */
export function mediaFor(
  slug: string,
  designId: string | null,
  platformId: string,
): MediaAsset[] {
  const d = designId ?? "*";
  return (
    PRODUCT_MEDIA[`${slug}|${d}|${platformId}`] ??
    PRODUCT_MEDIA[`${slug}|${d}|*`] ??
    PRODUCT_MEDIA[`${slug}|*|${platformId}`] ??
    PRODUCT_MEDIA[`${slug}|*|*`] ??
    GENERATED_MEDIA[`${d}|${platformId}`] ??
    GENERATED_MEDIA[`${d}|*`] ??
    []
  );
}

export const hasMedia = (slug: string, designId: string | null, platformId: string) =>
  mediaFor(slug, designId, platformId).length > 0;
