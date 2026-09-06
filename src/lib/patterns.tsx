import type { Design } from "@/lib/types";
import { voronoiCoarse, voronoiFine, voronoiShard } from "@/lib/tiles";

/* ============================================================================
   Grip surface pattern engine

   Every design is drawn as an SVG <pattern>. This keeps the "product
   photography" resolution-independent, a few KB in total, and — crucially —
   lets the configurator swap a design by swapping a fill, with no image
   loading and therefore no layout shift.

   ID strategy: ids are derived deterministically from the design, so two
   instances of the same design emit byte-identical <defs>. Duplicate ids
   across SVGs resolve to the first match, which is identical content, so the
   render is always correct — and because every SVG carries its own <defs>,
   unmounting one instance cannot break another. This is what allows the
   renderer to stay a server component: no useId, no client JS on a page of
   40 product cards.
   ========================================================================= */

export const pid = (design: Design, key: string) => `k-${design.id}-${key}`;

const cellSet = (kind: Design["kind"]) =>
  kind === "cell" ? voronoiCoarse : kind === "cell-fine" ? voronoiFine : voronoiShard;



interface DefsProps {
  design: Design;
  /** Multiplies the tile size. >1 for macro shots, <1 for small thumbnails. */
  scale?: number;
}

/**
 * Emits the <pattern> and gradients for one design. Must be placed inside a
 * <defs> element. Fill any shape with `fill={surfaceFill(design)}`.
 */
export function PatternDefs({ design, scale = 1 }: DefsProps) {
  const inkId = pid(design, "ink");
  const shadeId = pid(design, "shade");
  const patId = pid(design, "pat");
  const ink = design.ink;
  const inkAlt = design.inkAlt ?? design.ink;

  return (
    <>
      {/* Ink gradient — gives every pattern a colour shift down the grip so a
          flat tile never reads as flat plastic. */}
      <linearGradient id={inkId} x1="0" y1="0" x2="0.45" y2="1">
        <stop offset="0%" stopColor={ink} />
        <stop offset="100%" stopColor={inkAlt} />
      </linearGradient>

      {/* Iridescent overlay for colour-shifting finishes */}
      {design.iridescent && (
        <linearGradient id={pid(design, "irid")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7af5d0" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#5aa8ff" stopOpacity="0.55" />
          <stop offset="65%" stopColor="#c86bff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff8ad4" stopOpacity="0.8" />
        </linearGradient>
      )}

      {/* Form shading — darkens the outer edges of a grip so the shell reads
          as a curved surface rather than a decal. */}
      {/* Shell colour. Declared outside the pattern so it spans the whole
          grip rather than repeating once per tile. */}
      {design.baseAlt && (
        <linearGradient id={pid(design, "base")} x1="0.1" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={design.base} />
          <stop offset="100%" stopColor={design.baseAlt} />
        </linearGradient>
      )}

      <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0.25">
        <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
        <stop offset="28%" stopColor="#000" stopOpacity="0.05" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0.14" />
        <stop offset="82%" stopColor="#000" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
      </linearGradient>

      <PatternBody
        design={design}
        scale={scale}
        patId={patId}
        inkRef={`url(#${inkId})`}
        baseRef="none"
      />
    </>
  );
}

/** The fill to apply to a grip shape for a given design. */
/** The relief layer. Plain shells have none — the base layer is the product. */
export const surfaceFill = (design: Design) =>
  design.kind === "plain" ? "none" : `url(#${pid(design, "pat")})`;

/** The shell colour beneath the relief. Painted as its own layer. */
export const baseFill = (design: Design) =>
  design.baseAlt ? `url(#${pid(design, "base")})` : design.base;

export const shadeFill = (design: Design) => `url(#${pid(design, "shade")})`;

/* ------------------------------------------------------------------------ */

function PatternBody({
  design,
  scale,
  patId,
  inkRef,
  baseRef,
}: {
  design: Design;
  scale: number;
  patId: string;
  inkRef: string;
  /** Always "none": the shell colour is painted underneath, not in the tile. */
  baseRef: string;
}) {
  const s = (n: number) => n * scale;

  switch (design.kind) {
    /* --- organic Voronoi families ---------------------------------------- */
    case "cell":
    case "cell-fine":
    case "shard": {
      const cells = cellSet(design.kind);
      const webbed = design.webbed === true;
      const tile = design.kind === "cell-fine" ? 150 : 200;
      const k = tile / 200;
      return (
        <pattern
          id={patId}
          width={s(tile)}
          height={s(tile)}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 200 200"
        >
          {/* Backing plate: in webbed designs this is the bright ink, and the
              cells sit on top in the dark shell colour. */}
          <rect
            width="200"
            height="200"
            fill={webbed ? inkRef : baseRef}
          />
          <g
            fill={webbed ? design.base : inkRef}
            transform={k === 1 ? undefined : `scale(${1 / k})`}
          >
            {cells.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {/* Bevel: a hairline highlight on the cell edge so the walls read
              as raised rather than printed. */}
          <g
            fill="none"
            stroke="#fff"
            strokeOpacity={webbed ? 0.1 : 0.16}
            strokeWidth="1"
            transform={k === 1 ? undefined : `scale(${1 / k})`}
          >
            {cells.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </pattern>
      );
    }

    /* --- hexagonal grid --------------------------------------------------- */
    case "hex": {
      const R = 30;
      const w = Math.sqrt(3) * R; // 51.96
      const hex = (cx: number, cy: number) => {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i - 90);
          pts.push(`${(cx + R * Math.cos(a)).toFixed(2)},${(cy + R * Math.sin(a)).toFixed(2)}`);
        }
        return pts.join(" ");
      };
      const centres: [number, number][] = [
        [0, 0], [w, 0], [0, 90], [w, 90],
        [w / 2, 45], [w / 2, -45], [w / 2, 135],
      ];
      return (
        <pattern
          id={patId}
          width={s(w)}
          height={s(90)}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${w} 90`}
        >
          <rect width={w} height="90" fill={baseRef} />
          <g fill="none" stroke={inkRef} strokeWidth="3.2" strokeLinejoin="round">
            {centres.map(([cx, cy], i) => (
              <polygon key={i} points={hex(cx, cy)} />
            ))}
          </g>
          <g fill={inkRef} opacity="0.18">
            {centres.map(([cx, cy], i) => (
              <polygon key={i} points={hex(cx, cy)} transform={`translate(0 0)`} />
            ))}
          </g>
        </pattern>
      );
    }

    /* --- square lattice with nodes ---------------------------------------
       Drawn with rects rather than strokes: an objectBoundingBox gradient on a
       straight <line> has a zero-area bounding box and does not paint. */
    case "lattice": {
      const p = 26;
      const t = 3.4; // rib thickness
      const c = (p - t) / 2;
      return (
        <pattern
          id={patId}
          width={s(p)}
          height={s(p)}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${p} ${p}`}
        >
          <rect width={p} height={p} fill={baseRef} />
          <g fill={inkRef}>
            <rect x={c} y="0" width={t} height={p} rx={t / 2} />
            <rect x="0" y={c} width={p} height={t} rx={t / 2} />
            <rect x={c - 1.6} y={c - 1.6} width={t + 3.2} height={t + 3.2} rx={(t + 3.2) / 2} />
          </g>
          {/* raised-edge highlight along the top of each rib */}
          <g fill="#fff" opacity="0.22">
            <rect x={c} y="0" width={t} height="1" />
            <rect x="0" y={c} width={p} height="1" />
          </g>
        </pattern>
      );
    }

    /* --- topographic contour lines ---------------------------------------- */
    case "contour": {
      const rows = [8, 28, 48, 68];
      return (
        <pattern
          id={patId}
          width={s(160)}
          height={s(80)}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 160 80"
        >
          <rect width="160" height="80" fill={baseRef} />
          <g fill="none" stroke={inkRef} strokeWidth="9" strokeLinecap="round">
            {rows.map((y, i) => (
              <path
                key={i}
                d={`M0 ${y} C 26 ${y - (i % 2 ? 7 : 10)}, 54 ${y + (i % 2 ? 9 : 6)}, 80 ${y} S 134 ${y - (i % 2 ? 8 : 5)}, 160 ${y}`}
              />
            ))}
          </g>
          <g fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="2">
            {rows.map((y, i) => (
              <path
                key={i}
                d={`M0 ${y - 2} C 26 ${y - 2 - (i % 2 ? 7 : 10)}, 54 ${y - 2 + (i % 2 ? 9 : 6)}, 80 ${y - 2} S 134 ${y - 2 - (i % 2 ? 8 : 5)}, 160 ${y - 2}`}
              />
            ))}
          </g>
        </pattern>
      );
    }

    /* --- overlapping scale relief ----------------------------------------- */
    case "scale": {
      const r = 22;
      return (
        <pattern
          id={patId}
          width={s(2 * r)}
          height={s(r)}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${2 * r} ${r}`}
        >
          <rect width={2 * r} height={r} fill={baseRef} />
          <g fill={inkRef}>
            <path d={`M0 ${r} A ${r} ${r} 0 0 1 ${2 * r} ${r} Z`} />
            <path d={`M${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z`} />
            <path d={`M${r} 0 A ${r} ${r} 0 0 1 ${3 * r} 0 Z`} />
          </g>
          <g fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="2">
            <path d={`M0 ${r} A ${r} ${r} 0 0 1 ${2 * r} ${r}`} />
            <path d={`M${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`} />
            <path d={`M${r} 0 A ${r} ${r} 0 0 1 ${3 * r} 0`} />
          </g>
          <g fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.4">
            <path d={`M2 ${r} A ${r - 2} ${r - 2} 0 0 1 ${2 * r - 2} ${r}`} />
          </g>
        </pattern>
      );
    }

    /* --- broken rosette spotting ------------------------------------------ */
    case "spot": {
      const blobs = [
        "M22 14 c9 -6 22 -2 24 8 c2 9 -8 17 -18 15 c-9 -2 -14 -17 -6 -23 Z",
        "M64 30 c11 -4 21 6 18 15 c-3 10 -18 13 -24 5 c-6 -8 -3 -17 6 -20 Z",
        "M30 62 c10 -5 21 3 20 13 c-1 10 -14 15 -21 9 c-8 -6 -8 -18 1 -22 Z",
        "M76 74 c9 -3 18 5 16 13 c-3 9 -15 11 -20 4 c-5 -6 -3 -15 4 -17 Z",
        "M8 88 c7 -4 16 1 16 8 c0 8 -10 12 -16 7 c-6 -4 -6 -12 0 -15 Z",
        "M52 96 c8 -5 18 1 18 9 c0 8 -11 12 -17 7 c-6 -5 -7 -13 -1 -16 Z",
      ];
      return (
        <pattern
          id={patId}
          width={s(100)}
          height={s(110)}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 100 110"
        >
          <rect width="100" height="110" fill={baseRef} />
          {/* soft mid-tone halo under each rosette */}
          <g fill={design.inkAlt ?? design.ink} opacity="0.5">
            {blobs.map((d, i) => (
              <path key={i} d={d} transform="scale(1.28) translate(-8 -9)" />
            ))}
          </g>
          <g fill={inkRef}>
            {blobs.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </pattern>
      );
    }

    /* --- carbon twill weave ------------------------------------------------ */
    case "twill": {
      return (
        <pattern
          id={patId}
          width={s(24)}
          height={s(24)}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 24 24"
        >
          <rect width="24" height="24" fill={baseRef} />
          <g fill={design.ink} opacity="0.85">
            <rect x="0" y="0" width="12" height="12" rx="1.5" />
            <rect x="12" y="12" width="12" height="12" rx="1.5" />
          </g>
          <g stroke="#fff" strokeOpacity="0.07" strokeWidth="1">
            <line x1="0" y1="0" x2="24" y2="24" />
            <line x1="24" y1="0" x2="0" y2="24" />
          </g>
          <g stroke="#000" strokeOpacity="0.35" strokeWidth="0.8">
            <line x1="0" y1="12" x2="24" y2="12" />
            <line x1="12" y1="0" x2="12" y2="24" />
          </g>
        </pattern>
      );
    }

    /* --- machined diamond knurl -------------------------------------------- */
    case "diamond": {
      const p = 26;
      return (
        <pattern
          id={patId}
          width={s(p)}
          height={s(p)}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${p} ${p}`}
        >
          <rect width={p} height={p} fill={baseRef} />
          {/* pyramid faces: lit top-left, shaded bottom-right */}
          <path d={`M${p / 2} 0 L${p} ${p / 2} L${p / 2} ${p} L0 ${p / 2} Z`} fill={design.ink} opacity="0.9" />
          <path d={`M${p / 2} 0 L${p} ${p / 2} L${p / 2} ${p / 2} Z`} fill="#fff" opacity="0.16" />
          <path d={`M${p / 2} ${p} L0 ${p / 2} L${p / 2} ${p / 2} Z`} fill="#000" opacity="0.3" />
          <g stroke={design.inkAlt ?? "#000"} strokeOpacity="0.55" strokeWidth="1">
            <path d={`M${p / 2} 0 L${p} ${p / 2} L${p / 2} ${p} L0 ${p / 2} Z`} fill="none" />
          </g>
        </pattern>
      );
    }

    /* --- solid shell --------------------------------------------------------
       Ice Froyo is not flat: it is an ice-white shell that cools toward the tips.
       Rendered as an objectBoundingBox pattern so the gradient spans the whole
       grip rather than repeating per tile. */
    default:
      return (
        <pattern
          id={patId}
          width="1"
          height="1"
          patternUnits="objectBoundingBox"
          patternContentUnits="objectBoundingBox"
        >
          <rect width="1" height="1" fill={baseRef} />
        </pattern>
      );
  }
}
