import Image from "next/image";
import type { Design, PlatformId, Product } from "@/lib/types";
import { ControllerRender } from "@/components/product/controller-render";
import { designById } from "@/data/catalog";
import { mediaFor } from "@/data/media";

/**
 * One entry point for every product image in the store.
 *
 * Registered assets in src/data/media.ts win; otherwise the SVG renderer draws
 * the product. That means real renders can be dropped in per product, design
 * and controller, incrementally, without touching a single component.
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

  if (lead) {
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

  return (
    <ControllerRender
      design={d}
      platformId={platformId}
      view={view}
      className={className}
      label={`${product.name} fitted to a controller`}
    />
  );
}
