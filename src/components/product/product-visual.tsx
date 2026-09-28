import Image from "next/image";
import type { Design, PlatformId, Product } from "@/lib/types";
import { ColourPlate } from "@/components/product/grip-photo";
import { designById } from "@/data/catalog";
import { mediaFor } from "@/data/media";

/**
 * One entry point for every product image in the store.
 *
 * Imagery comes from the media manifest — real renders in public/products/,
 * registered by `npm run media:scan` or hand-registered in src/data/media.ts.
 * A product with no asset yet falls back to a plain colour plate; the store
 * never draws a fake controller.
 */
export function ProductVisual({
  product,
  design,
  platformId = "dualsense",
  className,
  view = "full",
}: {
  product: Product;
  design?: Design | null;
  platformId?: PlatformId;
  className?: string;
  view?: "full" | "macro";
}) {
  const d = design ?? designById(product.designs[0])!;

  const assets = mediaFor(product.slug, d.id, platformId);
  const lead =
    assets.find((a) => (view === "macro" ? a.kind === "macro" : a.kind === "front")) ??
    assets[0];

  if (!lead) return <ColourPlate design={d} className={className} />;

  return (
    <Image
      src={lead.src}
      alt={lead.alt}
      width={lead.w}
      height={lead.h}
      className={className}
      sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 30vw"
    />
  );
}
