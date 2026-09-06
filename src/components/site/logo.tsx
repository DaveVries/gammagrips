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

/** The monogram on a raised console key — the site's square mark. */
export function KeyMark({ size = 34, className }: { size?: number; className?: string }) {
  const u = size / 120;
  const b = (n: number) => n * u;
  return (
    <span
      className={cn(
        "cut-sm inline-flex items-center justify-center bg-[var(--color-blk-yellow)]",
        className,
      )}
      style={{ width: size, height: size, padding: b(16) }}
      aria-hidden="true"
    >
      <Monogram
        size={size * 0.42}
        knurl="var(--color-on-yellow)"
        bg="transparent"
        className="text-[var(--color-on-yellow)]"
      />
    </span>
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
