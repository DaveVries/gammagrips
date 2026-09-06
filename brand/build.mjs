/**
 * GammaGrips brand asset builder.
 *   npm run brand
 *
 * THE LOGO
 * A wordmark. GAMMA is solid; GRIPS carries a 45° knurl — the word for the
 * product is made of the product's own grip texture.
 *
 * Why knurl and not the Voronoi cells the grips are actually moulded with:
 * the cells were tried and rejected. A cell is ~1/4 of the tile, so inside a
 * letter stroke you either see one cell (illegible) or hairline webbing that
 * dithers to grey. Knurl keeps a constant, chunky rhythm at every size. The
 * Voronoi stays on the product, where it has room to read.
 *
 * Type is outlined from Geist Black, so exports and the live site are identical
 * and no font has to be installed anywhere. Outlines are baked into
 * src/lib/logo-mark.ts, which the site imports — one source of truth.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import opentype from "opentype.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SVG = join(HERE, "svg");
const PNG = join(HERE, "png");
mkdirSync(SVG, { recursive: true });
mkdirSync(PNG, { recursive: true });

/* The store is a light console-grey UI, so INK is dark. INK_ON_DARK is only
   for the social cards, which stay black. Getting this wrong silently renders
   the wordmark white on grey — it did, once. */
const INK = "#f2f3f7";        /* on dark                                   */
const INK_DIM = "#a7adbd";
const INK_MUTE = "#7d8494";
const VOID = "#0b0c10";
const DEEP = "#131620";
const EDGE = "#262b38";

/* The accent gradient. Anything sitting ON it is inked dark — white cannot
   pass on the cyan stop (1.65:1). */
const YELLOW = "#f0b419";   /* the mark tile                            */
const RED = "#a81f1a";      /* the GRIPS knurl                          */
const ON_YELLOW = "#3a2a00";
const G1 = "#22e0d6";
const G2 = "#5a7bff";
const G3 = "#b44cff";
const ON_GRAD = "#08131c";

/* Console plastic, and the four logo colours. */
const PLATE = "#cfcec9";
const PLATE_HI = "#ffffff";
const PLATE_LO = "#8e8d88";
const PLATE_LO2 = "#46453f";
const ON_PLATE = "#16171b";
const FOUR = ["#1d9b52", "#d83a34", "#2f6fd0", "#f0b419"];

const FONT = opentype.parse(
  readFileSync(join(HERE, "..", "node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf")).buffer,
);

/* ── type ─────────────────────────────────────────────────────────────────
   Everything is drawn at a canonical cap size of 100 and scaled by viewBox.
   ─────────────────────────────────────────────────────────────────────── */
const SIZE = 100;
const TRACK = 2.2;

/* opentype's toPathData(decimals) emits NaN for some contours in this build,
   which silently drops whole glyphs. Serialise from the command list instead —
   deterministic, and it lets us round consistently. */
const n2 = (v) => Number(v.toFixed(2));
function serialise(path) {
  let out = "";
  for (const c of path.commands) {
    if (c.type === "M") out += `M${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "L") out += `L${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "C")
      out += `C${n2(c.x1)} ${n2(c.y1)} ${n2(c.x2)} ${n2(c.y2)} ${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "Q") out += `Q${n2(c.x1)} ${n2(c.y1)} ${n2(c.x)} ${n2(c.y)}`;
    else out += "Z";
  }
  return out;
}

function outline(str, x, size = SIZE, track = TRACK) {
  let cx = x;
  const parts = [];
  const s = size / FONT.unitsPerEm;
  /* Track the INK bounding box, not the advance box — centring on advances
     leaves the mark visibly off-centre inside a badge. */
  let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
  for (const ch of str) {
    const g = FONT.charToGlyph(ch);
    const path = g.getPath(cx, 0, size);
    for (const c of path.commands) {
      for (const key of ["y", "y1", "y2"]) {
        const v = c[key];
        if (typeof v === "number") {
          if (v < top) top = v;
          if (v > bottom) bottom = v;
        }
      }
      for (const key of ["x", "x1", "x2"]) {
        const v = c[key];
        if (typeof v === "number") {
          if (v < left) left = v;
          if (v > right) right = v;
        }
      }
    }
    parts.push(serialise(path));
    cx += g.advanceWidth * s + track;
  }
  return { d: parts.join(""), w: cx - x - track, top, bottom, left, right };
}

const A = outline("GAMMA", 0);
const B = outline("GRIPS", A.w + TRACK);
const WORD_L = A.left;
const WORD_R = B.right;
const WORD_W = WORD_R - WORD_L;
const CAP = -Math.min(A.top, B.top); // baseline to cap line

const M1 = outline("G", 0);
const M2 = outline("G", M1.w + SIZE * 0.012, SIZE, 0);
/* Ink extents of the pair, used for centring and for the viewBox. */
const MONO_L = Math.min(M1.left, M2.left);
const MONO_R = Math.max(M1.right, M2.right);
const MONO_T = Math.min(M1.top, M2.top);
const MONO_B = Math.max(M1.bottom, M2.bottom);
const MONO_W = MONO_R - MONO_L;
const MONO_H = MONO_B - MONO_T;

/* Knurl pitch is expressed in the same 100-cap space, so it scales with the
   type and never drifts relative to the letterforms.

   The bars cycle through the four palette colours. That is the one place the
   full four-colour set appears together, and it means the grip texture in the
   logo is literally made of the colours the interface uses. */
const KNURL_PITCH = 11.5;
const KNURL_BAR = 5.8;
const KNURL_SPAN = KNURL_PITCH;


/** Four-colour knurl. Reads as colour layering at mark scale; it was tried on
    the wordmark and rejected there, where it looked like confetti. */
const FOUR_PITCH = 17;
const FOUR_BAR = 9.5;
const knurlFour = (id) => `
    <pattern id="${id}" width="${FOUR_PITCH * 4}" height="${FOUR_PITCH}"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      ${FOUR.map(
        (c, i) =>
          `<rect x="${i * FOUR_PITCH}" width="${FOUR_BAR}" height="${FOUR_PITCH}" rx="${FOUR_BAR / 2}" fill="${c}"/>`,
      ).join("")}
    </pattern>`;

const MONO_BAR = KNURL_BAR * 1.42;   /* see logo.tsx — mark survives 16px */
const MONO_UNDER = 0.45;

const knurl = (id, mono = RED, bg = "none", bar = KNURL_BAR) => `
    <pattern id="${id}" width="${KNURL_SPAN}" height="${KNURL_PITCH}"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      ${bg === "none" ? "" : `<rect width="${KNURL_SPAN}" height="${KNURL_PITCH}" fill="${bg}"/>`}
      <rect width="${bar}" height="${KNURL_PITCH}" rx="${bar / 2}" fill="${mono}"/>
    </pattern>`;

/** The era's text treatment: a hard white offset behind the glyphs, so type
    reads as raised off a grey panel instead of printed on it. */
const emboss = (d, dx = 1.6, dy = 1.6, colour = "#ffffff") =>
  `<g transform="translate(${dx} ${dy})" opacity="0.85"><path d="${d}" fill="${colour}"/></g>`;

/** Wordmark, baseline-shifted so the box starts at 0,0.
    `mono` forces a single knurl colour, for one-colour reproduction. */
const wordmark = (id, fg = INK, bg = "none", { mono = RED, raise = false } = {}) => `
  <defs>${knurl(`kn-${id}`, mono, bg)}</defs>
  <g transform="translate(${-WORD_L} ${CAP})">
    ${raise ? emboss(A.d) + emboss(B.d) : ""}
    <path d="${A.d}" fill="${fg}"/>
    <path d="${B.d}" fill="url(#kn-${id})"/>
  </g>`;
const WORD_VB = `0 0 ${WORD_W.toFixed(1)} ${CAP.toFixed(1)}`;

/** GG monogram: same idea as the wordmark, compressed to a square. */
const monogram = (id, fg = INK, bg = "none", { mono = RED, raise = false } = {}) => `
  <defs>${knurl(`km-${id}`, mono, bg, MONO_BAR)}</defs>
  <g transform="translate(${-MONO_L} ${-MONO_T})">
    ${raise ? emboss(M1.d) + emboss(M2.d) : ""}
    <path d="${M1.d}" fill="${fg}"/>
    <path d="${M2.d}" fill="${mono}" opacity="${MONO_UNDER}"/>
    <path d="${M2.d}" fill="url(#km-${id})"/>
  </g>`;
const MONO_VB = `0 0 ${MONO_W.toFixed(1)} ${MONO_H.toFixed(1)}`;

/**
 * Grey variant: console-plastic tile, bevelled, with the second G carrying the
 * four logo colours. This is the "hardware" mark; the gradient one is the
 * "interface" mark. Same geometry, same cut corner.
 */
function keyMarkGrey(id, box) {
  const c = box * 0.22;
  const inner = box * 0.56;
  const k = Math.min(inner / MONO_W, inner / MONO_H);
  const w = MONO_W * k;
  const h = MONO_H * k;
  const b = box * 0.018;
  const tile = `M${c} 0H${box}V${box - c}L${box - c} ${box}H0V${c}Z`;
  return `
  <defs>
    ${knurlFour(`kf-${id}`)}
    <clipPath id="kc-${id}"><path d="${tile}"/></clipPath>
  </defs>
  <path d="${tile}" fill="${PLATE}"/>
  <g clip-path="url(#kc-${id})" fill="none" stroke-width="${b * 2}">
    <path d="M0 ${box}V${c}L${c} 0H${box}" stroke="${PLATE_HI}"/>
    <path d="M${box} 0V${box - c}L${box - c} ${box}H0" stroke="${PLATE_LO2}"/>
    <path d="M${b * 2} ${box}V${c + b}L${c + b} ${b * 2}H${box}" stroke="rgba(255,255,255,0.6)"/>
    <path d="M${box} ${b * 2}V${box - c - b}L${box - c - b} ${box - b * 2}H0" stroke="${PLATE_LO}"/>
  </g>
  <g transform="translate(${(box - w) / 2} ${(box - h) / 2}) scale(${k})">
    <g transform="translate(${-MONO_L} ${-MONO_T})">
      <path d="${M1.d}" fill="${ON_PLATE}"/>
      <path d="${M2.d}" fill="url(#kf-${id})"/>
    </g>
  </g>`;
}

/**
 * The mark: the GG monogram on a cut-corner gradient tile. The cut corner and
 * the cyan→blue→violet ramp are the same two devices the interface uses, so
 * the logo is built out of the site rather than bolted onto it.
 */
function keyMark(id, box) {
  const c = box * 0.22;
  const inner = box * 0.56;
  const k = Math.min(inner / MONO_W, inner / MONO_H);
  const w = MONO_W * k;
  const h = MONO_H * k;
  return `
  <path d="M${c} 0H${box}V${box - c}L${box - c} ${box}H0V${c}Z" fill="${YELLOW}"/>
  <g transform="translate(${(box - w) / 2} ${(box - h) / 2}) scale(${k})">${monogram(
    id,
    ON_YELLOW,
    "none",
    { mono: ON_YELLOW },
  )}</g>`;
}

/* ── files ────────────────────────────────────────────────────────────────── */
const files = {};

/* --- 1. the loose mark ---------------------------------------------------- */
files["mark.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <title>GammaGrips</title>${keyMark("mk", 240)}
</svg>`;

files["mark-on-dark.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
  <title>GammaGrips</title>
  <rect width="320" height="320" fill="${VOID}"/>
  <g transform="translate(40 40)">${keyMark("mkd", 240)}</g>
</svg>`;

files["mark-grey.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <title>GammaGrips</title>${keyMarkGrey("mg", 240)}
</svg>`;

files["mark-grey-on-dark.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
  <title>GammaGrips</title>
  <rect width="320" height="320" fill="${VOID}"/>
  <g transform="translate(40 40)">${keyMarkGrey("mgd", 240)}</g>
</svg>`;

/* --- 2. the lockup: mark + wordmark --------------------------------------- */
const lockup = (id, bg, grey = false, ink = INK) => {
  const key = 96;
  const s2 = (key * 0.62) / CAP;
  const gap = 34;
  const w = key + gap + WORD_W * s2 + (bg ? 120 : 0);
  const h = bg ? 200 : key;
  const x0 = bg ? 60 : 0;
  const y0 = bg ? (h - key) / 2 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(0)} ${h}">
  <title>GammaGrips</title>
  ${bg ? `<rect width="${w.toFixed(0)}" height="${h}" fill="${bg}"/>` : ""}
  <g transform="translate(${x0} ${y0})">${(grey ? keyMarkGrey : keyMark)(id + "k", key)}</g>
  <g transform="translate(${x0 + key + gap} ${y0 + (key - CAP * s2) / 2}) scale(${s2})">${wordmark(
    id,
    ink,
    "none",
    { mono: ink === INK ? "#e0524a" : RED },
  )}</g>
</svg>`;
};
files["lockup.svg"] = lockup("lk", null);
files["lockup-on-dark.svg"] = lockup("lkd", VOID);
files["lockup-grey.svg"] = lockup("lkg", null, true);
files["lockup-grey-on-dark.svg"] = lockup("lkgd", VOID, true);
/* For grey / light backgrounds: dark type, deeper cyan so it holds on plastic. */
files["lockup-grey-ink.svg"] = lockup("lkgi", null, true, ON_PLATE);
/* Primary lockup: yellow tile, dark type, red knurl — matches the header. */
files["lockup-ink.svg"] = lockup("lki", null, false, ON_PLATE);
files["lockup-ink-on-grey.svg"] = lockup("lkig", "#d3d2ce", false, ON_PLATE);
files["lockup-grey-ink-on-plate.svg"] = lockup("lkgip", PLATE, true, ON_PLATE);

/* --- 3. wordmark alone ----------------------------------------------------- */
files["wordmark.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORD_VB}">
  <title>GammaGrips</title>${wordmark("wm", INK, "none")}
</svg>`;

files["monogram.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MONO_VB}">
  <title>GammaGrips</title>${monogram("mo", INK, "none")}
</svg>`;

/* --- 4. avatars + favicon --------------------------------------------------- */
files["avatar-dark.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <title>GammaGrips</title>
  <rect width="512" height="512" fill="${VOID}"/>
  <g transform="translate(96 96)">${keyMark("avd", 320)}</g>
</svg>`;

files["avatar-gradient.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <title>GammaGrips</title>
  <rect width="512" height="512" fill="${YELLOW}"/>
  <g transform="translate(150 168) scale(${(212 / MONO_W).toFixed(4)})">${monogram(
    "avg2",
    ON_YELLOW,
    "none",
    { mono: ON_YELLOW },
  )}</g>
</svg>`;

/* Tab icon. Full-bleed yellow so the mark is as large as the canvas allows —
   the old version sat the tile on a black square, which spent a third of a
   16px favicon on padding. The cut corner survives; the knurl does not, so
   below 48px the second G goes solid. */
const faviconSvg = (knurled) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <title>GammaGrips</title>
  <path d="M22 0H120V98L98 120H0V22Z" fill="${YELLOW}"/>
  <g transform="translate(${(60 - (MONO_W * 0.66) / 2).toFixed(2)} ${(60 - (MONO_H * 0.66) / 2).toFixed(2)}) scale(0.66)">
    ${
      knurled
        ? monogram("fv", ON_YELLOW, "none", { mono: ON_YELLOW })
        : `<g transform="translate(${-MONO_L} ${-MONO_T})">
             <path d="${M1.d}" fill="${ON_YELLOW}"/>
             <path d="${M2.d}" fill="${ON_YELLOW}"/>
           </g>`
    }
  </g>
</svg>`;

files["favicon.svg"] = faviconSvg(true);
/* The 16/32 rungs of the .ico — knurl dropped, letterforms kept. */
files["favicon-small.svg"] = faviconSvg(false);

/* --- 5. social chrome ------------------------------------------------------- */
files["og-layer.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <g transform="translate(62 50)">${keyMark("ogk", 62)}</g>
  <g transform="translate(148 66) scale(0.30)">${wordmark("og", INK, "none")}</g>
  <text x="62" y="300" font-family="sans-serif" font-size="86" font-weight="800" letter-spacing="-3.5" fill="${INK}">More grip.</text>
  <text x="62" y="388" font-family="sans-serif" font-size="86" font-weight="800" letter-spacing="-3.5" fill="#e0524a">Your controller.</text>
  <text x="62" y="452" font-family="sans-serif" font-size="25" fill="${INK_DIM}">Moulded grip shells for DualSense and Xbox.</text>
  <text x="62" y="488" font-family="sans-serif" font-size="25" fill="${INK_DIM}">Six surfaces. No adhesive. Two minutes.</text>
  <rect x="62" y="548" width="1076" height="2" fill="${EDGE}"/>
  <text x="62" y="592" font-family="sans-serif" font-size="20" letter-spacing="3" fill="${INK_MUTE}">GAMMAGRIPS.COM</text>
</svg>`;

files["banner-layer.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500">
  <g transform="translate(90 142)">${keyMark("bnk", 72)}</g>
  <text x="90" y="292" font-family="sans-serif" font-size="60" font-weight="800" letter-spacing="-2.5" fill="${INK}">More grip. <tspan fill="#e0524a">Your controller.</tspan></text>
  <text x="90" y="338" font-family="sans-serif" font-size="24" fill="${INK_DIM}">Moulded controller grips · Rotterdam</text>
</svg>`;

for (const [name, body] of Object.entries(files)) {
  writeFileSync(join(SVG, name), body.trim() + "\n");
}

/* ── bake for the app ─────────────────────────────────────────────────────── */
writeFileSync(
  join(HERE, "..", "src", "lib", "logo-mark.ts"),
  `// GENERATED by brand/build.mjs — run \`npm run brand\` after changing the
// logo. Do not edit by hand.
//
// Geist Black, outlined. Shared by the site header and every brand export so
// the logo cannot drift between them, and so no font needs to load for the
// wordmark to render correctly.
export const WORDMARK_VIEWBOX = ${JSON.stringify(WORD_VB)};
export const WORDMARK_GAMMA = ${JSON.stringify(A.d)};
export const WORDMARK_GRIPS = ${JSON.stringify(B.d)};

export const MONOGRAM_VIEWBOX = ${JSON.stringify(MONO_VB)};
export const MONOGRAM_SOLID = ${JSON.stringify(M1.d)};
export const MONOGRAM_KNURLED = ${JSON.stringify(M2.d)};

/** Baseline offset applied to both, so each box starts at 0,0. */
export const CAP_HEIGHT = ${CAP.toFixed(2)};
export const WORDMARK_X = ${(-WORD_L).toFixed(2)};
export const MONOGRAM_X = ${(-MONO_L).toFixed(2)};
export const MONOGRAM_Y = ${(-MONO_T).toFixed(2)};
/** Knurl geometry, in the same 100-cap space as the outlines. */
export const KNURL_PITCH = ${KNURL_PITCH};
export const KNURL_BAR = ${KNURL_BAR};
`,
);

/* ── rasterise ────────────────────────────────────────────────────────────── */
const raster = [
  ["mark.svg", "mark-1024.png", 1024, 1024],
  ["mark-grey.svg", "mark-grey-1024.png", 1024, 1024],
  ["mark-grey.svg", "mark-grey-512.png", 512, 512],
  ["mark-grey-on-dark.svg", "mark-grey-on-dark-1024.png", 1024, 1024],
  ["lockup-grey.svg", "lockup-grey-1800.png", 1800, null],
  ["lockup-grey-on-dark.svg", "lockup-grey-on-dark-1800.png", 1800, null],
  ["lockup-grey-ink.svg", "lockup-grey-ink-1800.png", 1800, null],
  ["lockup-ink.svg", "lockup-ink-1800.png", 1800, null],
  ["lockup-ink-on-grey.svg", "lockup-ink-on-grey-1800.png", 1800, null],
  ["lockup-grey-ink-on-plate.svg", "lockup-grey-ink-on-plate-1800.png", 1800, null],
  ["mark.svg", "mark-512.png", 512, 512],
  ["mark-on-dark.svg", "mark-on-dark-1024.png", 1024, 1024],
  ["lockup.svg", "lockup-1800.png", 1800, null],
  ["lockup-on-dark.svg", "lockup-on-dark-1800.png", 1800, null],
  ["wordmark.svg", "wordmark-1800.png", 1800, null],
  ["avatar-dark.svg", "avatar-dark-1024.png", 1024, 1024],
  ["avatar-dark.svg", "avatar-dark-512.png", 512, 512],
  ["avatar-gradient.svg", "avatar-gradient-1024.png", 1024, 1024],
  ["favicon.svg", "icon-512.png", 512, 512],
  ["favicon.svg", "apple-touch-icon.png", 180, 180],
  ["favicon.svg", "favicon-48.png", 48, 48],
  ["favicon-small.svg", "favicon-32.png", 32, 32],
  ["favicon-small.svg", "favicon-16.png", 16, 16],
];
for (const [src, out, w, h] of raster) {
  const img = sharp(join(SVG, src), { density: 600 });
  await (h ? img.resize(w, h, { fit: "fill" }) : img.resize({ width: w }))
    .png({ compressionLevel: 9 })
    .toFile(join(PNG, out));
  console.log(`png  ${out.padEnd(24)} ${w}${h ? "×" + h : " wide"}`);
}

/* ── social cards: real render + chrome ───────────────────────────────────── */
const SHOT = join(HERE, "..", "public", "products", "dark-matter.png");
async function card(layer, w, h, shotW, shotX, out) {
  const layers = [];
  if (existsSync(SHOT)) {
    layers.push({
      input: await sharp(SHOT).resize(shotW, h, { fit: "cover", position: "centre" }).toBuffer(),
      left: shotX,
      top: 0,
    });
    layers.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
           <defs><linearGradient id="f" x1="0" x2="1">
             <stop offset="0" stop-color="${VOID}"/>
             <stop offset="${(shotX + shotW * 0.04) / w}" stop-color="${VOID}"/>
             <stop offset="${(shotX + shotW * 0.38) / w}" stop-color="${VOID}" stop-opacity="0"/>
           </linearGradient></defs><rect width="${w}" height="${h}" fill="url(#f)"/></svg>`,
      ),
      left: 0,
      top: 0,
    });
  }
  layers.push({
    input: await sharp(join(SVG, layer), { density: 600 }).resize(w, h, { fit: "fill" }).toBuffer(),
    left: 0,
    top: 0,
  });
  await sharp({ create: { width: w, height: h, channels: 4, background: VOID } })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toFile(join(PNG, out));
  console.log(`png  ${out.padEnd(24)} ${w}×${h}${existsSync(SHOT) ? " (real render)" : ""}`);
}
await card("og-layer.svg", 1200, 630, 760, 440, "og-1200x630.png");
await card("banner-layer.svg", 1500, 500, 840, 660, "banner-1500x500.png");

console.log("png  wordmark-white-1800.png   1800 wide (transparent)");
console.log(`\n${Object.keys(files).length} SVG sources → brand/svg/`);
