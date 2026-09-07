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
   Same shape as before — cut-corner key, GG, a rule across the foot — but the
   four console colours are gone with the rest of the palette.

   On a near-black page the strongest thing a small mark can be is the page
   inverted, so the key is ice and the monogram is the page colour. One hot
   rule at the foot carries the accent. That is 17.6:1 against the background,
   which is why it stays crisp at 26px where the coloured version could not.

   Drawn as one SVG because the bevel needs separately stroked edges, which
   CSS borders cannot do on a chamfer. */

const ICE = "#eef2f8";
const ICE_HI = "#ffffff";
const ICE_LO = "#9aa3b2";
const ICE_LO2 = "#5b6472";
const ON_ICE = "#0d0e12";
const HOT = "#ff3b30";

export function KeyMark({ size = 34, className }: { size?: number; className?: string }) {
  const box = 120;
  const c = box * 0.22;
  const b = box * 0.018;
  const bar = box * 0.115;
  const inner = box * 0.58;
  const [, , mw, mh] = MONOGRAM_VIEWBOX.split(" ").map(Number);
  const k = Math.min(inner / mw, (box * 0.46) / mh);
  const tile = `M${c} 0H${box}V${box - c}L${box - c} ${box}H0V${c}Z`;
  const id = "km";

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={tile} />
        </clipPath>
      </defs>

      <path d={tile} fill={ICE} />

      <g clipPath={`url(#${id}-clip)`}>
        {/* the accent, as one run rather than four segments */}
        <rect x={0} y={box - bar} width={box - c} height={bar} fill={HOT} />
        <rect x={box - c - box * 0.055} y={box - bar} width={box * 0.02} height={bar} fill={ON_ICE} />
        <g fill="none" strokeWidth={b * 2}>
          <path d={`M0 ${box}V${c}L${c} 0H${box}`} stroke={ICE_HI} />
          <path d={`M${box} 0V${box - c}L${box - c} ${box}H0`} stroke={ICE_LO2} />
          <path d={`M${box} ${b * 2}V${box - c - b}L${box - c - b} ${box - b * 2}H0`} stroke={ICE_LO} />
        </g>
      </g>

      <g transform={`translate(${(box - mw * k) / 2} ${(box - bar - mh * k) / 2 + b}) scale(${k})`}>
        <g transform={`translate(${MONOGRAM_X} ${MONOGRAM_Y})`}>
          <path d={MONOGRAM_SOLID} fill={ON_ICE} />
          <path d={MONOGRAM_KNURLED} fill={ON_ICE} />
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
