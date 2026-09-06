import type { Design, PlatformId } from "@/lib/types";
import { PatternDefs, baseFill, pid, shadeFill, surfaceFill } from "@/lib/patterns";
import { platformById } from "@/data/catalog";

/* ============================================================================
   ControllerRender

   The product "photography" for the whole store. A resolution-independent
   controller with the grip zones filled by the pattern engine, so:
     • product cards, the PDP gallery and the configurator share one renderer
     • changing a design is a fill swap — no image request, no layout shift
     • it is a server component, so a 40-card grid ships zero extra JS

   Views:
     full   — controller with grips fitted (the default merchandising shot)
     grips  — the two shells alone, no controller (what is actually in the box)
     macro  — extreme close-up of the surface (texture detail shot)
   ========================================================================= */

type View = "full" | "grips" | "macro";

interface Props {
  design: Design;
  platformId: PlatformId;
  view?: View;
  className?: string;
  /** Rendered into <title> for assistive tech. */
  label?: string;
  /** Drop the contact shadow when the render sits on a busy background. */
  flat?: boolean;
  priority?: boolean;
}

/* --- parametric silhouette -------------------------------------------------
   The outline is built from tangent hulls of circle pairs ("capsules"), unioned
   by emitting them as subpaths of a single path with fill-rule: nonzero. This
   is far more controllable than hand-authored beziers: the shape is described
   by joint positions and radii, so proportions can be tuned numerically.
   Computed once at module load — the strings are constants at render time.
   -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;

/** Convex hull of two circles, sampled as a smooth closed polygon. */
function capsule(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
  steps = 40,
): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const d = Math.hypot(x2 - x1, y2 - y1);
  const b = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)));
  const pts: string[] = [];
  const push = (cx: number, cy: number, r: number, t: number) =>
    pts.push(`${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`);
  // far side of circle 1, then tangent across to circle 2, then far side of 2
  for (let i = 0; i <= steps; i++) push(x1, y1, r1, a + b + (i / steps) * (TAU - 2 * b));
  for (let i = 0; i <= steps; i++) push(x2, y2, r2, a - b + (i / steps) * (2 * b));
  return "M" + pts.join("L") + "Z";
}

const BODY = {
  playstation: [
    capsule(240, 220, 178, 760, 220, 178),   // upper shell
    capsule(370, 300, 215, 630, 300, 215),   // lower shell, closes the crotch
    capsule(360, 380, 165, 268, 620, 140),   // left handle
    capsule(640, 380, 165, 732, 620, 140),   // right handle
  ].join(" "),
  xbox: [
    capsule(232, 226, 186, 768, 226, 186),
    capsule(376, 306, 218, 624, 306, 218),
    capsule(366, 386, 170, 262, 616, 146),
    capsule(634, 386, 170, 738, 616, 146),
  ].join(" "),
} as const;

/* The grip shells: a half-plane with a shallow diagonal top edge. The body clip
   trims them to the exact handle contour, so one pair of shapes works for both
   controller families. */
const GRIP_L =
  "M-40 424C110 416 288 474 442 580L494 664L494 920L-40 920Z";
const GRIP_R =
  "M1040 424C890 416 712 474 558 580L506 664L506 920L1040 920Z";

/* --- component ------------------------------------------------------------ */

export function ControllerRender({
  design,
  platformId,
  view = "full",
  className,
  label,
  flat = false,
}: Props) {
  const platform = platformById(platformId);
  const family = platform?.family ?? "playstation";
  const body = BODY[family];
  const clipId = `clip-${family}`;
  const title =
    label ??
    `${design.name} grips fitted to a ${platform?.controller ?? "controller"}`;

  if (view === "macro") {
    return <MacroRender design={design} className={className} title={title} />;
  }

  const showBody = view === "full";

  return (
    <svg
      viewBox="12 -6 976 848"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <PatternDefs design={design} />
        <clipPath id={clipId} clipRule="nonzero">
          <path d={body} />
        </clipPath>

        {/* Controller shell — a cool neutral white with a soft top light */}
        <linearGradient id="shell" x1="0.3" y1="0" x2="0.62" y2="1">
          <stop offset="0%" stopColor="#fbfcfd" />
          <stop offset="34%" stopColor="#e6eaee" />
          <stop offset="72%" stopColor="#c2c9d1" />
          <stop offset="100%" stopColor="#9ea7b1" />
        </linearGradient>
        <radialGradient id="shellGlow" cx="0.5" cy="0.12" r="0.75">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wellGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0f12" />
          <stop offset="100%" stopColor="#272c33" />
        </linearGradient>
        <radialGradient id="stickTop" cx="0.38" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#4a525b" />
          <stop offset="60%" stopColor="#22272d" />
          <stop offset="100%" stopColor="#111418" />
        </radialGradient>

        {/* Ambient occlusion along the seam where a grip meets the shell */}
        <linearGradient id="seam" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Contact shadow: sells the object as sitting in a space */}
      {!flat && (
        <ellipse
          cx="500"
          cy="774"
          rx="304"
          ry="18"
          fill="#000"
          opacity="0.5"
          style={{ filter: "blur(16px)" }}
        />
      )}

      {showBody && (
        <>
          <path
            d={body}
            fillRule="nonzero"
            fill="url(#shell)"
            style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
          />
          <path d={body} fillRule="nonzero" fill="url(#shellGlow)" />
        </>
      )}

      {/* --- grip shells -------------------------------------------------- */}
      <g clipPath={`url(#${clipId})`}>
        {[GRIP_L, GRIP_R].map((d, i) => (
          <g key={i}>
            <path d={d} fill={baseFill(design)} />
            <path d={d} fill={surfaceFill(design)} />
            {design.iridescent && (
              <path
                d={d}
                fill={`url(#${pid(design, "irid")})`}
                style={{ mixBlendMode: "overlay" }}
              />
            )}
            {/* curvature shading */}
            <path d={d} fill={shadeFill(design)} />
            {/* seam shadow at the top edge of the shell */}
            <path d={d} fill="url(#seam)" opacity="0.9" />
          </g>
        ))}
      </g>

      {/* Crisp outline so the shell edge stays legible on dark backgrounds */}
      <g clipPath={`url(#${clipId})`} fill="none" strokeLinejoin="round">
        <path d={GRIP_L} stroke="#000" strokeOpacity="0.55" strokeWidth="4" />
        <path d={GRIP_R} stroke="#000" strokeOpacity="0.55" strokeWidth="4" />
        <path d={GRIP_L} stroke="#fff" strokeOpacity="0.22" strokeWidth="1.6" />
        <path d={GRIP_R} stroke="#fff" strokeOpacity="0.22" strokeWidth="1.6" />
      </g>

      {showBody && (
        <>
          {family === "playstation" ? <DualSenseFace /> : <XboxFace />}
        </>
      )}
    </svg>
  );
}

/* --- face detail ---------------------------------------------------------- */

function Stick({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="62" fill="#000" opacity="0.16" />
      <circle cx={x} cy={y} r="56" fill="url(#wellGrad)" />
      <circle cx={x} cy={y} r="46" fill="url(#stickTop)" />
      <circle
        cx={x}
        cy={y}
        r="46"
        fill="none"
        stroke="#000"
        strokeOpacity="0.55"
        strokeWidth="3"
      />
      <circle cx={x} cy={y} r="29" fill="#171b20" />
      <ellipse cx={x - 12} cy={y - 16} rx="17" ry="10" fill="#fff" opacity="0.14" />
    </g>
  );
}

function DPad({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const a = 16 * s;
  const b = 42 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M${-a} ${-b} h${2 * a} v${b - a} h${b - a} v${2 * a} h${-(b - a)} v${b - a} h${-2 * a} v${-(b - a)} h${-(b - a)} v${-2 * a} h${b - a} Z`}
        fill="#2b3037"
        stroke="#0e1114"
        strokeWidth="2.5"
      />
    </g>
  );
}

function FaceButtons({ x, y, xbox }: { x: number; y: number; xbox?: boolean }) {
  const r = 27;
  const o = 51;
  const fills = xbox
    ? ["#3f7d3f", "#a83c3c", "#3760a8", "#b8a03a"]
    : ["#2b3037", "#2b3037", "#2b3037", "#2b3037"];
  return (
    <g>
      {[
        [x, y - o],
        [x + o, y],
        [x, y + o],
        [x - o, y],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={fills[i]} stroke="#0e1114" strokeWidth="2.5" />
          <ellipse cx={cx - 5} cy={cy - 6} rx={r * 0.5} ry={r * 0.3} fill="#fff" opacity="0.12" />
        </g>
      ))}
    </g>
  );
}

function DualSenseFace() {
  return (
    <g>
      {/* touchpad */}
      <rect x="374" y="110" width="252" height="124" rx="15" fill="#e8ecf0" />
      <rect x="374" y="110" width="252" height="124" rx="15" fill="none" stroke="#a8b0b9" strokeWidth="2.5" />
      <rect x="374" y="110" width="252" height="40" rx="15" fill="#fff" opacity="0.5" />
      {/* light bar flanking the touchpad */}
      <rect x="356" y="118" width="10" height="108" rx="4.5" fill="#5b7fd4" opacity="0.45" />
      <rect x="634" y="118" width="10" height="108" rx="4.5" fill="#5b7fd4" opacity="0.45" />
      {/* create / options */}
      <rect x="334" y="116" width="14" height="36" rx="4" fill="#2b3037" />
      <rect x="652" y="116" width="14" height="36" rx="4" fill="#2b3037" />
      <DPad x={252} y={258} s={1.16} />
      <FaceButtons x={748} y={258} />
      <Stick x={372} y={388} />
      <Stick x={628} y={388} />
      {/* speaker + PS button */}
      <g fill="#aeb6bf" opacity="0.7">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={486 + i * 14} cy={452} r="2.8" />
        ))}
      </g>
      <circle cx="500" cy="486" r="16" fill="#2b3037" stroke="#0e1114" strokeWidth="2" />
      {/* shoulder buttons over the top edge */}
      <path d="M158 118C196 68 268 46 336 58L330 90C278 82 232 96 200 138Z" fill="#ccd3da" />
      <path d="M842 118C804 68 732 46 664 58L670 90C722 82 768 96 800 138Z" fill="#ccd3da" />
    </g>
  );
}

function XboxFace() {
  return (
    <g>
      {/* guide button */}
      <circle cx="500" cy="150" r="36" fill="#eef1f4" stroke="#a8b0b9" strokeWidth="2.5" />
      <circle cx="500" cy="150" r="23" fill="#f8fafb" />
      <path
        d="M500 134c-6 0-12 4-12 4 6-8 12-9 12-9s6 1 12 9c0 0-6-4-12-4Zm-17 8c-7 8-7 20 0 27 5-9 12-17 17-21-5-3-11-5-17-6Zm34 0c-6 1-12 3-17 6 5 4 12 12 17 21 7-7 7-19 0-27Z"
        fill="#4a525b"
      />
      {/* view / menu */}
      <circle cx="446" cy="330" r="13" fill="#2b3037" />
      <circle cx="554" cy="330" r="13" fill="#2b3037" />
      {/* asymmetric: stick high-left, ABXY high-right */}
      <Stick x={300} y={254} />
      <FaceButtons x={706} y={254} xbox />
      {/* d-pad low-left, stick low-right */}
      <DPad x={388} y={412} s={1.0} />
      <Stick x={586} y={410} />
      {/* bumpers */}
      <path d="M150 128C190 76 262 52 332 64L326 96C272 88 226 104 194 148Z" fill="#ccd3da" />
      <path d="M850 128C810 76 738 52 668 64L674 96C728 88 774 104 806 148Z" fill="#ccd3da" />
    </g>
  );
}

/* --- macro texture shot ---------------------------------------------------- */

function MacroRender({
  design,
  className,
  title,
}: {
  design: Design;
  className?: string;
  title: string;
}) {
  return (
    <svg
      viewBox="0 0 800 600"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{`${design.name} — surface detail`}</title>
      <defs>
        <PatternDefs design={design} scale={2.6} />
        {/* Barrel curvature: the macro shot reads as a curved handle, not a
            flat swatch, because of this light falloff. */}
        <linearGradient id="macroCurve" x1="0" y1="0" x2="1" y2="0.1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.78" />
          <stop offset="18%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="62%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="86%" stopColor="#000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="macroTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="14%" stopColor="#000" stopOpacity="0" />
          <stop offset="86%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <clipPath id="macroClip">
          <path d="M0 96C140 40 300 8 420 8C560 8 690 44 800 104L800 500C690 558 560 592 420 592C300 592 140 560 0 504Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#macroClip)">
        <rect width="800" height="600" fill={baseFill(design)} />
        <rect width="800" height="600" fill={surfaceFill(design)} />
        {design.iridescent && (
          <rect
            width="800"
            height="600"
            fill={`url(#${pid(design, "irid")})`}
            style={{ mixBlendMode: "overlay" }}
          />
        )}
        <rect width="800" height="600" fill="url(#macroCurve)" />
        <rect width="800" height="600" fill="url(#macroTop)" />
      </g>
    </svg>
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
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <PatternDefs design={design} scale={0.34} />
        <linearGradient id={`sw-${design.id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="14" fill={baseFill(design)} />
      <rect width="100" height="100" rx="14" fill={surfaceFill(design)} />
      {design.iridescent && (
        <rect
          width="100"
          height="100"
          rx="14"
          fill={`url(#${pid(design, "irid")})`}
          style={{ mixBlendMode: "overlay" }}
        />
      )}
      <rect width="100" height="100" rx="14" fill={`url(#sw-${design.id})`} />
    </svg>
  );
}
