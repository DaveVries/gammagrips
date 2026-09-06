import { cn } from "@/lib/utils";

/* ============================================================================
   The four face-button shapes.

   Triangle, circle, cross and square are generic geometry, so they carry the
   console association without lifting anyone's trademark — and they are
   deliberately coloured from our own palette rather than the console's exact
   mapping. Used as list markers, step numbers and the brand accent row.
   ========================================================================= */

export type GlyphName = "tri" | "cir" | "crs" | "sqr";

export const GLYPH_ORDER: GlyphName[] = ["tri", "cir", "crs", "sqr"];

const COLOUR: Record<GlyphName, string> = {
  tri: "var(--color-gl-tri)",
  cir: "var(--color-gl-cir)",
  crs: "var(--color-gl-crs)",
  sqr: "var(--color-gl-sqr)",
};

const LABEL: Record<GlyphName, string> = {
  tri: "triangle",
  cir: "circle",
  crs: "cross",
  sqr: "square",
};

export function Glyph({
  name,
  size = 12,
  colour,
  className,
  title,
}: {
  name: GlyphName;
  size?: number;
  /** Override the palette colour, e.g. to sit on a coloured bar. */
  colour?: string;
  className?: string;
  title?: string;
}) {
  const c = colour ?? COLOUR[name];
  const sw = 2.4;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {title && <title>{title || LABEL[name]}</title>}
      {name === "tri" && <path d="M12 4.4 20.2 19H3.8Z" />}
      {name === "cir" && <circle cx="12" cy="12" r="7.6" />}
      {name === "crs" && <path d="M5.4 5.4 18.6 18.6M18.6 5.4 5.4 18.6" />}
      {name === "sqr" && <rect x="5" y="5" width="14" height="14" />}
    </svg>
  );
}

/** The four in a row — the brand's accent motif. */
export function GlyphRow({
  size = 11,
  gap = 5,
  className,
}: {
  size?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap }}
      aria-hidden="true"
    >
      {GLYPH_ORDER.map((n) => (
        <Glyph key={n} name={n} size={size} />
      ))}
    </span>
  );
}

/** Cycles the four shapes — used as ordered-list markers. */
export function GlyphMarker({ index, size = 13 }: { index: number; size?: number }) {
  return <Glyph name={GLYPH_ORDER[index % 4]} size={size} />;
}
