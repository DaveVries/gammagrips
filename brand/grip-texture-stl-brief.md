# Brief: six textured grip-shell variants from the base STL

Hand this whole file to the chat that produced the base model.

---

## What exists and what is wanted

You already generated the **base grip shell STL** — the untextured pair of
shells (left + right) for the PS5 DualSense. That base is the datum and must
not change.

I need **six textured variants** of it, one per product in the GammaGrips
range. Each variant differs **only in the relief applied to the outer
surface**. Everything else is identical across all six.

### Hard constraints (apply to every variant)

1. **The inner surface is frozen.** The controller-facing face, its draft, its
   registration lips and every snap/retention feature stay bit-identical to the
   base. Do not offset, re-mesh or smooth it.
2. **Texture is added outward.** Treat the base outer surface as the datum
   plane at 0.0 mm. Pattern valleys sit at 0.0 mm; peaks rise to the stated
   relief height. Nominal wall thickness at a valley must not drop below the
   base wall thickness.
3. **Same origin, same orientation, same units** (millimetres) as the base STL,
   so all six drop into one fixture without re-alignment.
4. **Exclusion zones — leave smooth, on every variant:**
   - 3 mm band along every outer edge and around every cutout (buttons, ports,
     paddles, battery bay, trigger relief)
   - the full parting line, plus 1.5 mm either side
   - the trigger-facing inner radius
   - the existing "G" logo emboss on the left shell — texture must fade out
     into a 4 mm smooth margin around it, not run over it
5. **Fade, do not cut.** Where a pattern meets an exclusion zone, ramp the
   relief to zero over 5–8 mm. No sheared-off walls at a boundary.
6. **Conformal mapping.** The pattern pitch is measured *along the curved
   surface*, not projected from a plane. A cell near the tip of the handle must
   be the same size as one at the palm. No stretching at high curvature.
7. **Injection-mouldable geometry** (these are tooled parts, not prints):
   - ≥ 5° draft on every pattern flank
   - no undercuts relative to the existing pull direction
   - crown radius ≥ 0.3 mm on every peak — no knife edges
   - fillet ≥ 0.3 mm where a wall meets a floor
8. **Watertight and manifold.** Zero non-manifold edges, zero self-intersections,
   zero inverted normals. Each variant must pass a mesh-integrity check before
   you hand it over.

---

## The six variants

Relief heights and Shore values below come from the published product specs,
so the physical part must match them.

| # | File name | Texture family | Relief above datum | Added weight/pair | Shore (see note) |
|---|-----------|----------------|--------------------|-------------------|------------------|
| 1 | `gg-dualsense-nebula.stl`  | Open Cell — Voronoi, coarse   | **2.4 mm** | 18 g | 65A |
| 2 | `gg-dualsense-venom.stl`   | Micro Cell — Voronoi, fine    | **1.8 mm** | 15 g | 68A |
| 3 | `gg-dualsense-ember.stl`   | Open Cell — angular shard     | **2.4 mm** | 18 g | 65A |
| 4 | `gg-dualsense-cyber.stl`   | Grid Emboss — diagonal mesh   | **1.4 mm** | 12 g | 72A |
| 5 | `gg-dualsense-jungle.stl`  | Contour Ridge — transverse    | **3.1 mm** | 22 g | 60A |
| 6 | `gg-dualsense-glacier.stl` | Soft Matte — dimpled palm     | **1.1 mm shell, 0.6 mm dimple** | 10 g | 75A |

### 1. Nebula — Open Cell, coarse Voronoi
The deepest surface in the range, aimed at **hands that sweat**: the cells are
open drainage channels, so moisture goes somewhere instead of filming between
palm and shell.

- Voronoi cell field, Lloyd-relaxed so cell areas are even (no slivers).
- Cell pitch (centre to centre): **9–10 mm**.
- **The wall is the raised feature**, the cell floor sits at the datum.
- Wall width at the crown: **1.6 mm**, widening to ~2.4 mm at the base with the
  5° draft.
- Wall height: **2.4 mm**.
- Crown radius 0.4 mm; wall-to-floor fillet 0.3 mm.
- Cell floors flat and continuous — they are the drainage path, so no isolated
  pockets: every cell must connect to at least one neighbour via a 0.8 mm deep
  notch through the wall, and the network must drain toward the handle tip.
- Coverage: the whole handle wrap. Fade out at the exclusion zones.

### 2. Venom — Micro Cell, fine Voronoi
Same topology as Nebula at roughly **half the pitch**. Most of the traction,
without the edge people notice on Nebula in the first week. For players who
found Nebula too aggressive, and for long sessions.

- Identical Voronoi construction, pitch **4.5–5 mm**.
- Wall crown width **1.1 mm**, height **1.8 mm**.
- Crown radius 0.3 mm.
- Same drainage-notch rule, notch depth 0.6 mm.

### 3. Ember — Open Cell, angular shard
Nebula's depth on a **coarser, more angular** cell. Fewer walls, wider
channels. Same grip performance, different object.

- Straight-edged shard cells (no relaxation — keep the irregular, angular
  polygons), pitch **11–13 mm**.
- Wall crown width **2.0 mm**, height **2.4 mm**.
- Corners where three walls meet: radius 0.8 mm so the junction is not a point.
- Same drainage-notch rule as Nebula.

### 4. Cyber — Grid Emboss, diagonal mesh
**The lowest-profile grip.** For players who do not want the controller to get
noticeably thicker and want stock muscle memory to carry over — and for
smaller hands, where added girth costs more than it gains.

- Diagonal lattice at **45° to the handle axis** (reads as a diamond quilt).
- Rib pitch **4.0 mm** measured perpendicular to the rib.
- Rib width **1.2 mm** at the crown, height **1.4 mm**, crown radius 0.4 mm
  (half-round rib profile is fine).
- **Node at every intersection:** spherical cap, Ø 2.2 mm, rising to 1.6 mm —
  i.e. 0.2 mm proud of the ribs.
- Diamond floors flat at the datum.

### 5. Jungle — Contour Ridge, transverse
**The comfort-first grip, most cushion.** Ridges run across the handle where
the middle and ring fingers wrap, giving a physical index you can find without
looking. Also the pick for **large hands**, where the extra girth is wanted.

- Ridge crests run **transverse to the handle axis**, following the natural
  finger-wrap line — not straight rings. Each crest should follow a constant
  geodesic offset from the previous one.
- Ridge pitch **7.0 mm**.
- Ridge height **3.1 mm**, crown radius **2.0 mm** (full round-over, no flat).
- Valley radius **1.5 mm**; valleys bottom out at the datum.
- **Zoning:** full 3.1 mm height across the finger-wrap band only. Ramp to zero
  over 8 mm toward the palm heel and over 8 mm toward the handle tip. The palm
  contact patch stays smooth.

### 6. Glacier — Soft Matte, dimpled palm
**The entry point.** Traction without changing how the controller looks or
feels. For a first-time grip buyer.

- **No macro pattern** over most of the shell. The 1.1 mm figure is the shell
  thickness itself, not a relief — so the outer surface here is the base
  surface, unmodified.
- **One palm patch only:** an ellipse roughly 38 × 26 mm centred on the palm
  contact point of each handle, carrying hemispherical **dimples recessed
  0.6 mm** (recessed, not raised), Ø 3.0 mm, on a **5.0 mm hexagonal pitch**.
- Dimple rim radius 0.3 mm. Ramp dimple depth to zero over the outer 6 mm of
  the patch so there is no hard edge to the field.
- Everything else smooth. The matte feel comes from the **mould finish**, not
  geometry — call out a texture spec (e.g. Mold-Tech MT-11020 or equivalent
  fine stipple) in the drawing rather than modelling it.

---

## Deliverables

For each of the six:

1. `gg-dualsense-<design>.stl` — binary STL, millimetres, left and right shell
   in one file, same origin and orientation as the base.
2. A **3MF or STEP master** alongside it if you can produce one. Fine relief
   tessellates into very large STLs; a parametric or 3MF master is far more
   useful for tooling than a 150 MB triangle soup.
3. Tessellation: chord tolerance ≤ **0.02 mm**, angular tolerance ≤ **1°**.
4. A short check report per file: triangle count, bounding box, watertight
   yes/no, non-manifold edge count, minimum wall thickness found, minimum
   draft angle found.
5. Confirm the **added thickness per handle** measured at a pattern peak
   matches the table (Nebula +2.4, Venom +1.8, Ember +2.4, Cyber +1.4,
   Jungle +3.1, Glacier +1.1). If your geometry lands elsewhere, tell me the
   real number — I will change the published spec rather than have the part
   disagree with the site.

## Please flag rather than silently solve

- Any place where the stated relief height cannot be held without violating the
  5° draft or the minimum wall.
- Any pattern that cannot map conformally at a high-curvature area (the tip of
  the handle and the trigger shoulder are the tight spots).
- Whether Jungle's 3.1 mm ridges clear the DualSense's own trigger travel when
  a hand is wrapped — that is the one dimension most likely to be wrong.

## Two numbers that are NOT yet verified

Treat these as provisional; do not design to them as if they were confirmed:

- **The Shore A values in the table are placeholders**, not supplier-confirmed.
  The material conversation so far only established that the TPU range on offer
  is roughly 60A–98A. Confirm with the supplier before tooling.
- **"Medical-grade TPU"** appears in the site copy and has not been
  substantiated. Do not carry that claim into any spec sheet.
