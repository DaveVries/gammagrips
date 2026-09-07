import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CAP_HEIGHT,
  KNURL_BAR,
  KNURL_PITCH,
  MONOGRAM_KNURLED,
  MONOGRAM_SOLID,
  MONOGRAM_VIEWBOX,
  MONOGRAM_X,
  MONOGRAM_Y,
  WORDMARK_GAMMA,
  WORDMARK_GRIPS,
  WORDMARK_VIEWBOX,
  WORDMARK_X,
} from "@/lib/logo-mark";

/**
 * The logo is the name. GAMMA is solid; GRIPS carries a 45° knurl, so the word
 * for the product is made of the product's grip texture.
 *
 * On the console-grey UI it also takes the era's text treatment: a hard white
 * offset behind the glyphs, so the type reads as raised off the panel rather
 * than printed on it.
 *
 * Outlines are generated from Geist Black by brand/build.mjs and shared with
 * every brand export, so the header and the social assets cannot drift.
 */

function Knurl({
  id,
  fg,
  bg,
  bar = KNURL_BAR,
}: {
  id: string;
  fg: string;
  bg: string;
  /** Bar width against KNURL_PITCH. Wider = more solid, legible smaller. */
  bar?: number;
}) {
  return (
    <pattern
      id={id}
      width={KNURL_PITCH}
      height={KNURL_PITCH}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width={KNURL_PITCH} height={KNURL_PITCH} fill={bg} />
      <rect width={bar} height={KNURL_PITCH} rx={bar / 2} fill={fg} />
    </pattern>
  );
}

/** Bar and underlay for the mark. The wordmark keeps the finer default: it is
 *  never set below ~15px, where the mark has to survive a 16px favicon. */
const MONO_BAR = KNURL_BAR * 1.42;
const MONO_UNDER = 0.45;

export function Wordmark({
  height = 19,
  className,
  /** Must match what sits behind the logo, or the knurl gaps will not blend. */
  bg = "transparent",
  knurl = "var(--color-ps-red)",
  raised = false,
}: {
  height?: number;
  className?: string;
  bg?: string;
  knurl?: string;
  raised?: boolean;
}) {
  const [, , w, h] = WORDMARK_VIEWBOX.split(" ").map(Number);
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      height={height}
      width={(height * w) / h}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="GammaGrips"
    >
      <defs>
        <Knurl id="wm-knurl" fg={knurl} bg={bg} />
      </defs>
      <g transform={`translate(${WORDMARK_X} ${CAP_HEIGHT})`}>
        {raised && (
          <g transform="translate(1.6 1.6)" opacity="0.85">
            <path d={WORDMARK_GAMMA} fill="#fff" />
            <path d={WORDMARK_GRIPS} fill="#fff" />
          </g>
        )}
        <path d={WORDMARK_GAMMA} fill="currentColor" />
        <path d={WORDMARK_GRIPS} fill="url(#wm-knurl)" />
      </g>
    </svg>
  );
}

/** Square GG mark, for avatars and tight spaces. */
export function Monogram({
  size = 26,
  className,
  bg = "transparent",
  knurl = "var(--color-ps-red)",
}: {
  size?: number;
  className?: string;
  bg?: string;
  knurl?: string;
}) {
  const [, , w, h] = MONOGRAM_VIEWBOX.split(" ").map(Number);
  return (
    <svg
      viewBox={MONOGRAM_VIEWBOX}
      height={size}
      width={(size * w) / h}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <Knurl id="mo-knurl" fg={knurl} bg={bg} bar={MONO_BAR} />
      </defs>
      <g transform={`translate(${MONOGRAM_X} ${MONOGRAM_Y})`}>
        <path d={MONOGRAM_SOLID} fill="currentColor" />
        {/* Bare knurl let the tile through the gaps, so the second G lost its
            silhouette below ~24px. A dim solid underlay holds the letterform
            while the bars still read as grip texture on top. */}
        <path d={MONOGRAM_KNURLED} fill={knurl} opacity={MONO_UNDER} />
        <path d={MONOGRAM_KNURLED} fill="url(#mo-knurl)" />
      </g>
    </svg>
  );
}

/* --- the mark ---------------------------------------------------------------
   Console plastic, not a coloured chip: a bevelled grey key with the cut
   corner, the first G in ink and the second carrying the four logo colours.
   Drawn as one SVG rather than a clipped <span> because the bevel needs four
   separate stroked edges, which CSS borders cannot do on a chamfer. */

const PLATE_T = "#cfcec9";
const PLATE_T_HI = "#ffffff";
const PLATE_T_LO = "#8e8d88";
const PLATE_T_LO2 = "#46453f";
const ON_PLATE_T = "#16171b";
/** Green, red, blue, yellow — the four, coarse enough to survive the mark. */
const FOUR = ["#1d9b52", "#d83a34", "#2f6fd0", "#f0b419"];
const FOUR_PITCH = 30;
const FOUR_BAR = 18;

/** Below this the four colour bars stop reading as a letterform and turn to
 *  confetti — verified by rendering the mark natively at 26/30/34/40/48px.
 *  Small marks get a solid second G; the colours return on brand assets. */
const FOUR_MIN_PX = 56;

export function KeyMark({ size = 34, className }: { size?: number; className?: string }) {
  const four = size >= FOUR_MIN_PX;
  const box = 120;
  const c = box * 0.22;
  const inner = box * 0.56;
  const [, , mw, mh] = MONOGRAM_VIEWBOX.split(" ").map(Number);
  const k = Math.min(inner / mw, inner / mh);
  const b = box * 0.018;
  const tile = `M${c} 0H${box}V${box - c}L${box - c} ${box}H0V${c}Z`;
  const id = "km-grey";

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`${id}-four`}
          width={FOUR_PITCH * 4}
          height={FOUR_PITCH}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          {FOUR.map((col, i) => (
            <rect
              key={col}
              x={i * FOUR_PITCH}
              width={FOUR_BAR}
              height={FOUR_PITCH}
              rx={FOUR_BAR / 2}
              fill={col}
            />
          ))}
        </pattern>
        <clipPath id={`${id}-clip`}>
          <path d={tile} />
        </clipPath>
      </defs>

      <path d={tile} fill={PLATE_T} />
      {/* Four stroked edges: lit top-left, shadowed bottom-right, twice. */}
      <g clipPath={`url(#${id}-clip)`} fill="none" strokeWidth={b * 2}>
        <path d={`M0 ${box}V${c}L${c} 0H${box}`} stroke={PLATE_T_HI} />
        <path d={`M${box} 0V${box - c}L${box - c} ${box}H0`} stroke={PLATE_T_LO2} />
        <path d={`M${b * 2} ${box}V${c + b}L${c + b} ${b * 2}H${box}`} stroke="rgba(255,255,255,0.6)" />
        <path d={`M${box} ${b * 2}V${box - c - b}L${box - c - b} ${box - b * 2}H0`} stroke={PLATE_T_LO} />
      </g>

      <g transform={`translate(${(box - mw * k) / 2} ${(box - mh * k) / 2}) scale(${k})`}>
        <g transform={`translate(${MONOGRAM_X} ${MONOGRAM_Y})`}>
          <path d={MONOGRAM_SOLID} fill={ON_PLATE_T} />
          {four ? (
            <>
              {/* Underlay holds the letterform where the bars leave gaps. */}
              <path d={MONOGRAM_KNURLED} fill={ON_PLATE_T} opacity={0.42} />
              <path d={MONOGRAM_KNURLED} fill={`url(#${id}-four)`} />
            </>
          ) : (
            <path d={MONOGRAM_KNURLED} fill={ON_PLATE_T} />
          )}
        </g>
      </g>
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
  bg,
}: {
  className?: string;
  compact?: boolean;
  bg?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-85",
        className,
      )}
      aria-label="GammaGrips — home"
    >
      <KeyMark size={30} className="!h-[26px] !w-[26px] sm:!h-[30px] sm:!w-[30px]" />
      {!compact && (
        <Wordmark height={17} bg={bg} className="h-[13.5px] w-auto sm:h-[17px]" />
      )}
    </Link>
  );
}
