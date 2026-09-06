/**
 * Scans public/products/ and writes src/data/media.generated.ts.
 *
 *   npm run media:scan
 *
 * FILE NAMING  <design>[-<platform>][-<kind>].<ext>
 *
 *   dark-matter.png                     → Dark Matter, all controllers, front
 *   dark-matter-dualsense.png           → Dark Matter on DualSense, front
 *   dark-matter-dualsense-macro.webp    → Dark Matter on DualSense, surface detail
 *   volt-xbox-series-front.png          → Volt on Xbox Wireless, front
 *
 * design    any design id from src/data/catalog.ts (read automatically)
 * platform  dualsense | dualsense-edge | xbox-series | xbox-elite-2   (optional)
 * kind      front | angle | macro | installed | lifestyle | inbox     (optional)
 *
 * Anything not matched is skipped with a warning; anything not registered
 * falls back to the built-in SVG renderer, so partial coverage is fine.
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../public/products/", import.meta.url).pathname;
const OUT = new URL("../src/data/media.generated.ts", import.meta.url).pathname;

/* Read the design ids straight out of the catalogue so this list can never
   drift from the products. Longest first, so "dark-matter" wins over "dark". */
const CATALOG = readFileSync(
  new URL("../src/data/catalog.ts", import.meta.url).pathname,
  "utf8",
);
const DESIGN_BLOCK = CATALOG.slice(
  CATALOG.indexOf("export const DESIGNS"),
  CATALOG.indexOf("export const designById"),
);
const DESIGNS = [...DESIGN_BLOCK.matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)]
  .map((m) => m[1])
  .sort((a, b) => b.length - a.length);
const NAMES = Object.fromEntries(
  [...DESIGN_BLOCK.matchAll(/^\s{4}id: "([a-z0-9-]+)",\n\s{4}name: "([^"]+)",$/gm)].map(
    (m) => [m[1], m[2]],
  ),
);
const PLATFORMS = ["dualsense-edge", "dualsense", "xbox-elite-2", "xbox-series"];
const KINDS = ["front", "angle", "macro", "installed", "lifestyle", "inbox"];
const EXT = /\.(png|jpe?g|webp|avif)$/i;

const CONTROLLERS = {
  dualsense: "DualSense Wireless Controller",
  "dualsense-edge": "DualSense Edge Wireless Controller",
  "xbox-series": "Xbox Wireless Controller",
  "xbox-elite-2": "Xbox Elite Wireless Controller Series 2",
};

/** PNG/JPEG/WebP intrinsic size, read from the header — no image dependency. */
function dimensions(path) {
  const b = readFileSync(path);
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") {
    const fmt = b.subarray(12, 16).toString("ascii");
    if (fmt === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (fmt === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (fmt === "VP8L") {
      const n = b.readUInt32LE(21);
      return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
    }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m))
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null; // AVIF and anything exotic: fall through to a sane default
}

let files = [];
try {
  files = readdirSync(DIR).filter((f) => EXT.test(f) && statSync(join(DIR, f)).isFile());
} catch {
  console.error(`No such directory: ${DIR}`);
  process.exit(1);
}

const manifest = {};
let matched = 0;

for (const file of files.sort()) {
  const stem = file.replace(EXT, "").toLowerCase();
  const design = DESIGNS.find((d) => stem === d || stem.startsWith(d + "-"));
  if (!design) {
    console.warn(`skip  ${file}  (no design prefix — expected one of ${DESIGNS.join(", ")})`);
    continue;
  }
  let rest = stem.slice(design.length).replace(/^-/, "");
  const platform = PLATFORMS.find((p) => rest === p || rest.startsWith(p + "-")) ?? "*";
  if (platform !== "*") rest = rest.slice(platform.length).replace(/^-/, "");
  const kind = KINDS.includes(rest) ? rest : "front";

  const dim = dimensions(join(DIR, file)) ?? { w: 2000, h: 1600 };
  const key = `${design}|${platform}`;
  (manifest[key] ??= []).push({
    src: `/products/${file}`,
    w: dim.w,
    h: dim.h,
    kind,
    alt:
      kind === "macro"
        ? `Close-up of the ${NAMES[design]} grip surface`
        : `${NAMES[design]} Grips fitted to a ${platform === "*" ? "controller" : CONTROLLERS[platform]}`,
  });
  matched++;
  console.log(`ok    ${file}  →  ${design} / ${platform} / ${kind}  ${dim.w}×${dim.h}`);
}

// front first, then macro, then the rest — this order drives the PDP gallery
const rank = { front: 0, angle: 1, macro: 2, installed: 3, lifestyle: 4, inbox: 5 };
for (const list of Object.values(manifest)) list.sort((a, b) => rank[a.kind] - rank[b.kind]);

writeFileSync(
  OUT,
  `// GENERATED by scripts/scan-media.mjs — run \`npm run media:scan\` after
// adding or removing files in public/products/. Do not edit by hand.
import type { MediaAsset } from "@/data/media";

export const GENERATED_MEDIA: Record<string, MediaAsset[]> = ${JSON.stringify(manifest, null, 2)};
`,
);

console.log(`\n${matched} file${matched === 1 ? "" : "s"} registered across ${Object.keys(manifest).length} key(s).`);
if (!matched) console.log("Nothing matched — the SVG renderer stays in use.");
