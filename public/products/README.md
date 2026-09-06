# Product imagery

Save your renders here, then run:

    npm run media:scan

That is the whole workflow. The scanner reads the filenames, measures each
image, and regenerates `src/data/media.generated.ts`. Anything registered is
used automatically everywhere the product appears — product cards, the PDP
gallery, the configurator preview, the cart. Anything missing keeps using the
built-in SVG renderer, so partial coverage is fine.

## Filenames

    <design>[-<platform>][-<kind>].<ext>

| part     | values                                                             |
|----------|--------------------------------------------------------------------|
| design   | `fracture` `volt` `magma` `lattice` `contour` `glacier`            |
| platform | `dualsense` `dualsense-edge` `xbox-series` `xbox-elite-2` (optional) |
| kind     | `front` `angle` `macro` `installed` `lifestyle` `inbox` (optional)  |

Omit the platform and the image is used for every controller. Omit the kind and
it is treated as `front` — the lead image.

### For the six renders

Saving them as these six names is enough:

    fracture.png
    volt.png
    magma.png
    lattice.png
    contour.png
    glacier.png

Add per-controller or detail shots later as `fracture-dualsense-macro.webp`
and so on.

## Export settings

- PNG or WebP, 2000 px on the long edge
- Keep the controller centred with ~8% padding so cards crop predictably
- Transparent, or the near-black page background `#0a0c0e`
- One consistent camera angle across all six, or the grid will look uneven
