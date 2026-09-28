import Image from "next/image";
import type { Design, PlatformId } from "@/lib/types";
import { designMedia } from "@/data/media";

/* ============================================================================
   Product photography
   ----------------------------------------------------------------------------
   Every grip image in the store comes from a real render in public/products/,
   resolved through the media manifest. There is no drawn stand-in: when a
   design has no photo yet we show an honest colour plate rather than a fake
   controller.
   ========================================================================= */

type View = "full" | "macro" | "back";

const KIND = { full: "front", macro: "macro", back: "back" } as const;

export function GripPhoto({
  design,
  platformId = "dualsense",
  view = "full",
  className,
  label,
  sizes = "(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 30vw",
  priority,
}: {
  design: Design;
  platformId?: PlatformId;
  view?: View;
  className?: string;
  label?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const asset = designMedia(design.id, platformId, KIND[view]);
  if (!asset) return <ColourPlate design={design} className={className} />;

  return (
    <Image
      src={asset.src}
      alt={label ?? asset.alt}
      width={asset.w}
      height={asset.h}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

/** Honest placeholder: the design's own colours, no invented hardware. */
export function ColourPlate({
  design,
  className,
  size,
}: {
  design: Design;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label={`${design.name} — photography coming soon`}
      style={{
        display: "block",
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${design.base} 0%, ${
          design.baseAlt ?? design.ink
        } 100%)`,
      }}
    />
  );
}

/* --- small swatch, used by variant selectors and filters ------------------- */

export function DesignSwatch({
  design,
  className,
  size = 44,
}: {
  design: Design;
  className?: string;
  size?: number;
}) {
  const asset = designMedia(design.id, "*", "macro");
  const shape = className ?? "rounded-[6px]";

  if (!asset) {
    return (
      <ColourPlate design={design} size={size} className={`${shape} shrink-0`} />
    );
  }

  return (
    <Image
      src={asset.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`${shape} shrink-0 object-cover`}
      style={{ width: size, height: size }}
    />
  );
}
