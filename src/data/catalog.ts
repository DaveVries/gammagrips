import type {

  Design,
  Platform,
  Product,
  Texture,
  Variant,
} from "@/lib/types";

/* ============================================================================
   Platforms
   Every compatibility statement in the UI resolves through this table, so a
   controller is never described two different ways in two different places.
   ========================================================================= */

export const PLATFORMS: Platform[] = [
  {
    id: "dualsense",
    family: "playstation",
    controller: "DualSense Wireless Controller",
    short: "DualSense",
    console: "PlayStation 5",
    releasedWith: "PS5",
  },
  {
    id: "dualsense-edge",
    family: "playstation",
    controller: "DualSense Edge Wireless Controller",
    short: "DualSense Edge",
    console: "PlayStation 5",
    releasedWith: "PS5 Pro",
  },
  {
    id: "xbox-series",
    family: "xbox",
    controller: "Xbox Wireless Controller",
    short: "Xbox Wireless",
    console: "Xbox Series X|S",
    releasedWith: "Series X|S",
  },
  {
    id: "xbox-elite-2",
    family: "xbox",
    controller: "Xbox Elite Wireless Controller Series 2",
    short: "Elite Series 2",
    console: "Xbox Series X|S",
    releasedWith: "Series X|S",
  },
];

export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id);

/* ============================================================================
   The surface

   There is one. Earlier versions of this file advertised five — Open Cell,
   Micro Cell, Contour Ridge, Grid Emboss and Soft Matte — each with its own
   relief depth, added weight and Shore hardness. One mould exists, so one
   surface exists, and none of those numbers had been measured. Everything the
   six products share now lives here, and the six differ only in colour.
   ========================================================================= */

export const TEXTURES: Texture[] = [
  {
    id: "moulded",
    name: "Moulded relief",
    feel: "The pattern is the relief. What you see on the shell is what your palm finds, because it is moulded in rather than printed on.",
    profile: "Moulded relief",
  },
];

export const textureById = (id?: string) => TEXTURES.find((t) => t.id === id);

/* ============================================================================
   Colourways

   Six of them, one shell. These used to be described as six separate moulds
   with six different surfaces; they are one moulded shell finished six ways.
   Imagery comes from the renders in public/products/, resolved through
   src/data/media.ts.
   ========================================================================= */

export const DESIGNS: Design[] = [
  {
    id: "nebula",
    name: "Nebula",
    // light webbing over dark cells — the webbing is the raised wall you feel
    base: "#181428",
    ink: "#e2d8ff",
    inkAlt: "#b9a6f5",
    webbed: true,
    colorFamily: "violet",
    blurb: "Violet-white over a near-black shell. The first colourway we tooled.",
  },
  {
    id: "venom",
    name: "Venom",
    base: "#0b0d08",
    ink: "#d6f96a",
    inkAlt: "#a8dc3c",
    webbed: true,
    colorFamily: "green",
    blurb: "High-visibility lime over black. The one that reads on a streaming camera.",
  },
  {
    id: "ember",
    name: "Ember",
    base: "#0b0805",
    ink: "#ffc48c",
    inkAlt: "#ff8a34",
    webbed: true,
    colorFamily: "orange",
    blurb: "Orange running hot through the palm and cooling toward the tips.",
  },
  {
    id: "cyber",
    name: "Cyber",
    // fine raised grid, magenta at the top cooling to cyan at the tips
    base: "#8a5aa6",
    baseAlt: "#3f7fae",
    ink: "#ffe0f6",
    inkAlt: "#d8f5ff",
    colorFamily: "multi",
    blurb: "Magenta through the palm, cooling to cyan at the fingertips.",
  },
  {
    id: "jungle",
    name: "Jungle",
    // dark bands on a light green shell
    base: "#b9e7ae",
    baseAlt: "#7fc98f",
    ink: "#17512c",
    inkAlt: "#0e3a1f",
    colorFamily: "green",
    blurb: "Deep green over a light shell.",
  },
  {
    id: "glacier",
    name: "Glacier",
    base: "#f4f8fb",
    baseAlt: "#a4c9e2",
    ink: "#cfe2ef",
    colorFamily: "white",
    blurb: "White through the palm, cooling to ice blue at the tips.",
  },
];

export const designById = (id?: string | null) => DESIGNS.find((d) => d.id === id);

/* ============================================================================
   Variants
   Stock is deterministic (hashed from the SKU) so server and client render the
   same value — no hydration mismatch, and no invented urgency.
   ========================================================================= */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const ALL_PLATFORMS = [
  "dualsense",
  "dualsense-edge",
  "xbox-series",
  "xbox-elite-2",
] as const;

function buildVariants(
  designId: string,
  opts: { soldOut?: string[]; low?: string[] } = {},
): Variant[] {
  return ALL_PLATFORMS.map((platformId) => {
    const sku = `GG-${designId}-${platformId}`.toUpperCase();
    let stock = 14 + (hash(sku) % 170);
    if (opts.soldOut?.includes(platformId)) stock = 0;
    if (opts.low?.includes(platformId)) stock = 2 + (hash(sku) % 5);
    return { designId, platformId, sku, stock };
  });
}

/* ============================================================================
   Products — one per colourway. One mould, six finishes.
   ========================================================================= */

/* The measured numbers this table used to carry — wall depth, added thickness,
   added weight, Shore hardness, operating range, "medical-grade" — were never
   measured or sourced. They are out until the first run comes off the tool. */
const SHARED_SPECS = [
  { label: "Surface", value: "Moulded relief" },
  { label: "Material", value: "TPU" },
  { label: "Adhesive", value: "None — friction fit" },
  { label: "Fit", value: "Moulded to one controller" },
  { label: "Thickness, weight, hardness", value: "Published once the first run is measured" },
  { label: "Warranty", value: "2 years" },
];

const SHARED_IN_BOX = [
  "2 × grip shells (left and right)",
  "1 × microfibre prep cloth",
  "1 × fitting card",
];

export const PRODUCTS: Product[] = [
  {
    slug: "nebula-grips",
    name: "Nebula Grips",
    tagline: "Violet-white over near-black.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["nebula"],
    summary:
      "Nebula is the colourway we tooled first: a violet-white relief over a near-black shell. The surface is the same moulded relief on every grip we make — the colour is what changes.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("nebula", { low: ["dualsense-edge"] }),
    pairsWith: ["venom-grips", "cyber-grips", "ember-grips"],
    releasedOn: "2025-03-04",
    popularity: 100,
  },

  {
    slug: "venom-grips",
    name: "Venom Grips",
    tagline: "Lime that reads on camera.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["venom"],
    summary:
      "Venom is the loud one. Lime over a black shell, bright enough to hold up under a streaming light where darker colourways go muddy. Same moulded shell as the rest of the range.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("venom", { low: ["dualsense"] }),
    pairsWith: ["nebula-grips", "ember-grips", "jungle-grips"],
    releasedOn: "2025-01-21",
    popularity: 88,
  },

  {
    slug: "ember-grips",
    name: "Ember Grips",
    tagline: "Orange, hot through the palm.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["ember"],
    summary:
      "Ember runs hot orange through the palm and cools toward the tips. Same moulded shell as the rest of the range, finished in the warmest colour we make.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("ember", { soldOut: ["xbox-elite-2"], low: ["xbox-series"] }),
    pairsWith: ["nebula-grips", "venom-grips", "glacier-grips"],
    releasedOn: "2025-06-10",
    popularity: 74,
  },

  {
    slug: "cyber-grips",
    name: "Cyber Grips",
    tagline: "Magenta to cyan, palm to tip.",
    type: "grips",
    price: 32.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["cyber"],
    summary:
      "Cyber shifts along the handle — magenta where your palm sits, cyan at the fingertips. Same moulded shell as the rest of the range.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("cyber"),
    pairsWith: ["glacier-grips", "jungle-grips", "nebula-grips"],
    badge: "new",
    releasedOn: "2026-05-14",
    popularity: 81,
  },

  {
    slug: "jungle-grips",
    name: "Jungle Grips",
    tagline: "Deep green on a light shell.",
    type: "grips",
    price: 32.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["jungle"],
    summary:
      "Jungle is the quietest of the coloured options: deep green over a light shell, closer to stock than the saturated colourways. Same moulded shell as the rest of the range.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("jungle"),
    pairsWith: ["cyber-grips", "glacier-grips", "venom-grips"],
    releasedOn: "2025-08-27",
    popularity: 63,
  },

  {
    slug: "glacier-grips",
    name: "Glacier Grips",
    tagline: "White, cooling to ice blue.",
    type: "grips",
    price: 29.95,
    compareAt: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "moulded",
    designs: ["glacier"],
    summary:
      "Glacier is the one that barely changes how the controller looks. White through the palm, cooling to ice blue at the tips. Same moulded shell as the rest of the range.",
    highlights: [
      "The texture is moulded relief, not a printed or sprayed coating",
      "Moulded to one controller — not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
      "Fits in about two minutes with no tools",
    ],
    specs: [...SHARED_SPECS],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    variants: buildVariants("glacier"),
    pairsWith: ["cyber-grips", "jungle-grips", "nebula-grips"],
    releasedOn: "2024-09-02",
    popularity: 70,
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** Kept as a single-entry list so the nav and PLP headers stay data-driven and
    a second product type can be added later without touching components. */
export const PRODUCT_TYPES: {
  id: Product["type"];
  name: string;
  plural: string;
  href: string;
  blurb: string;
}[] = [
  {
    id: "grips",
    name: "Controller Grip",
    plural: "Controller Grips",
    href: "/controller-grips",
    blurb: "Moulded shells that change how the handles feel.",
  },
];
