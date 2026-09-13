/* Real fracture geometry.
 *
 * Radiating polylines look like a child's drawing of a crack. Glass actually
 * breaks into cells, so this builds a Voronoi diagram with points clustered
 * around the impact — dense shards at the centre, large plates at the edge —
 * and emits each cell as a filled polygon that can be flown apart
 * individually. Same d3-delaunay already used for the grip textures.
 */
import { Delaunay } from "d3-delaunay";
import { writeFileSync } from "node:fs";

const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
let seed = 7331;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

const pts = [];
// Dense ring right at the impact
for (let i = 0; i < 26; i++) {
  const a = rnd() * Math.PI * 2, r = 14 + rnd() * 90;
  pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
}
// Mid field
for (let i = 0; i < 46; i++) {
  const a = rnd() * Math.PI * 2, r = 90 + rnd() * 380;
  pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
}
// Sparse outer plates
for (let i = 0; i < 34; i++) {
  pts.push([rnd() * W, rnd() * H]);
}

const d = Delaunay.from(pts);
const vor = d.voronoi([0, 0, W, H]);

const cells = [];
for (let i = 0; i < pts.length; i++) {
  const poly = vor.cellPolygon(i);
  if (!poly || poly.length < 4) continue;
  const [px, py] = pts[i];
  const dx = px - CX, dy = py - CY;
  const dist = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  cells.push({
    d: "M" + poly.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z",
    dist: Math.round(dist),
    // Shards near the hole leave fast and far; outer plates barely shift.
    tx: Math.round(Math.cos(ang) * (40 + (1 - Math.min(dist, 700) / 700) * 620 + rnd() * 180)),
    ty: Math.round(Math.sin(ang) * (40 + (1 - Math.min(dist, 700) / 700) * 620 + rnd() * 180)),
    rot: Math.round((rnd() - 0.5) * 220),
    rx: Math.round((rnd() - 0.5) * 90),
    ry: Math.round((rnd() - 0.5) * 90),
    delay: +(Math.min(dist, 800) / 800 * 0.16 + rnd() * 0.05).toFixed(3),
    dur: +(0.7 + rnd() * 0.8).toFixed(2),
    // A faint fill so fragments read as glass plates, not outlines
    fill: +(0.03 + rnd() * 0.09).toFixed(3),
    edge: +(0.25 + rnd() * 0.55).toFixed(2),
  });
}
cells.sort((a, b) => a.dist - b.dist);
writeFileSync("brand/video/_shatter.json", JSON.stringify(cells));
console.log("cells:", cells.length, "· nearest", cells[0].dist, "· farthest", cells[cells.length - 1].dist);
