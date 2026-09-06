import type {
  Collection,
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
   Textures
   Each grip is moulded with one surface. Texture is coupled to the design
   because the pattern IS the relief — the visual and the physical are the
   same tooling.
   ========================================================================= */

export const TEXTURES: Texture[] = [
  {
    id: "open-cell",
    name: "Open Cell",
    feel: "Deep cell walls channel sweat away from your palm.",
    grip: 5,
    cushion: 4,
    profile: "+2.4 mm",
  },
  {
    id: "micro-cell",
    name: "Micro Cell",
    feel: "A tighter cell field. Consistent bite without the sharp edges.",
    grip: 4,
    cushion: 3,
    profile: "+1.8 mm",
  },
  {
    id: "ridge",
    name: "Contour Ridge",
    feel: "Raised ridges follow your finger wrap for a positive index.",
    grip: 4,
    cushion: 5,
    profile: "+3.1 mm",
  },
  {
    id: "grid",
    name: "Grid Emboss",
    feel: "A precise raised lattice. The lowest-profile texture we make.",
    grip: 4,
    cushion: 2,
    profile: "+1.4 mm",
  },
  {
    id: "matte",
    name: "Soft Matte",
    feel: "Smooth soft-touch with a dimpled palm patch. Barely changes the shape.",
    grip: 3,
    cushion: 3,
    profile: "+1.1 mm",
  },
];

export const textureById = (id?: string) => TEXTURES.find((t) => t.id === id);

/* ============================================================================
   Designs
   Six, matching the six moulds we tool. Each maps to a pattern renderer in
   src/lib/patterns.tsx.
   ========================================================================= */

export const DESIGNS: Design[] = [
  {
    id: "dark-matter",
    name: "Dark Matter",
    collection: "cellular",
    kind: "cell",
    // light webbing over dark cells — the webbing is the raised wall you feel
    base: "#181428",
    ink: "#e2d8ff",
    inkAlt: "#b9a6f5",
    webbed: true,
    colorFamily: "violet",
    blurb: "Open Voronoi cells with a raised violet-white wall. The mould the range was built around.",
  },
  {
    id: "volt",
    name: "Volt",
    collection: "cellular",
    kind: "cell-fine",
    base: "#0b0d08",
    ink: "#d6f96a",
    inkAlt: "#a8dc3c",
    webbed: true,
    colorFamily: "green",
    blurb: "A tighter cell field with a high-visibility lime wall over a black shell.",
  },
  {
    id: "ember",
    name: "Ember",
    collection: "cellular",
    kind: "shard",
    base: "#0b0805",
    ink: "#ffc48c",
    inkAlt: "#ff8a34",
    webbed: true,
    colorFamily: "orange",
    blurb: "A coarser, more angular cell with the wall running hot through the palm.",
  },
  {
    id: "vapor",
    name: "Vapor",
    collection: "linear",
    kind: "lattice",
    // fine raised grid, magenta at the top cooling to cyan at the tips
    base: "#8a5aa6",
    baseAlt: "#3f7fae",
    ink: "#ffe0f6",
    inkAlt: "#d8f5ff",
    colorFamily: "multi",
    blurb: "A fine raised mesh, magenta through the palm cooling to cyan at the tips.",
  },
  {
    id: "venom",
    name: "Venom",
    collection: "linear",
    kind: "contour",
    // dark bands on a light green shell
    base: "#b9e7ae",
    baseAlt: "#7fc98f",
    ink: "#17512c",
    inkAlt: "#0e3a1f",
    colorFamily: "green",
    blurb: "Deep topographic bands that track the curve of the handle.",
  },
  {
    id: "ice-froyo",
    name: "Ice Froyo",
    collection: "solid",
    kind: "plain",
    base: "#f4f8fb",
    baseAlt: "#a4c9e2",
    ink: "#cfe2ef",
    colorFamily: "white",
    blurb: "No pattern. A soft-touch shell that cools to ice blue at the tips, with a dimpled palm patch.",
  },
];

export const designById = (id?: string | null) => DESIGNS.find((d) => d.id === id);

/* ============================================================================
   Collections — how the six group by surface geometry
   ========================================================================= */

export const COLLECTIONS: Collection[] = [
  {
    id: "cellular",
    name: "Cellular",
    tagline: "Voronoi cell structures.",
    description:
      "Generated cell geometry moulded as real relief. The walls are what you feel and what you see — deeper cells grip harder and give sweat somewhere to go.",
    designIds: ["dark-matter", "volt", "ember"],
  },
  {
    id: "linear",
    name: "Linear",
    tagline: "Drawn geometry, held to a pitch.",
    description:
      "Grids and contours at a fixed spacing, mirrored so the left and right grips are symmetric rather than two random crops of the same texture.",
    designIds: ["vapor", "venom"],
  },
  {
    id: "solid",
    name: "Solid",
    tagline: "Texture without a pattern.",
    description:
      "For setups where the controller should disappear. Soft-touch shells that add traction without adding graphics.",
    designIds: ["ice-froyo"],
  },
];

export const collectionById = (id?: string) => COLLECTIONS.find((c) => c.id === id);

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
   Products — one per design. Six moulds, six products.
   ========================================================================= */

const SHARED_SPECS = [
  { label: "Material", value: "Medical-grade TPU" },
  { label: "Adhesive", value: "None — friction fit" },
  { label: "Finish", value: "UV-cured, dishwasher safe" },
  { label: "Operating range", value: "5 °C – 45 °C" },
  { label: "Warranty", value: "2 years" },
];

const SHARED_IN_BOX = [
  "2 × grip shells (left and right)",
  "1 × microfibre prep cloth",
  "1 × fitting card",
];

export const PRODUCTS: Product[] = [
  {
    slug: "dark-matter-grips",
    name: "Dark Matter Grips",
    tagline: "Our deepest texture, for hands that sweat.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "open-cell",
    designs: ["dark-matter"],
    summary:
      "Dark Matter is the grip we tooled first and the one most of our sponsored players still use. The open-cell wall structure is 2.4 mm deep, so sweat drains into the cells instead of pooling between your palm and the shell. It is the most aggressive surface in the range.",
    highlights: [
      "2.4 mm open-cell wall depth channels sweat away from the palm",
      "Medical-grade TPU shell, Shore 65A — flexible from 5 °C to 45 °C",
      "Moulded per controller, not a universal stretch sleeve",
      "Full access to every button, port, paddle and the battery bay",
      "Removable and re-fittable without adhesive or residue",
    ],
    specs: [
      { label: "Texture", value: "Open Cell" },
      { label: "Wall depth", value: "2.4 mm" },
      { label: "Added thickness", value: "+2.4 mm per handle" },
      { label: "Added weight", value: "18 g per pair" },
      { label: "Shore hardness", value: "65A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.8,
    reviewCount: 1247,
    ratingBreakdown: [981, 187, 45, 18, 16],
    subscores: [
      { label: "Fit", score: 4.9 },
      { label: "Grip", score: 4.9 },
      { label: "Comfort", score: 4.7 },
      { label: "Durability", score: 4.6 },
    ],
    variants: buildVariants("dark-matter", { low: ["dualsense-edge"] }),
    pairsWith: ["volt-grips", "vapor-grips", "ember-grips"],
    badge: "bestseller",
    releasedOn: "2025-03-04",
    popularity: 100,
  },

  {
    slug: "volt-grips",
    name: "Volt Grips",
    tagline: "Tight cell crackle. Reads from across the room.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "micro-cell",
    designs: ["volt"],
    summary:
      "Volt uses the same cell geometry as Dark Matter at roughly half the pitch. The finer walls give you most of the traction with none of the sharp edges people notice on Dark Matter in the first week — and the lime reads clearly on a streaming camera.",
    highlights: [
      "1.8 mm micro-cell field, tuned for sessions over four hours",
      "Most of Dark Matter's grip without the break-in period",
      "High-visibility lime on a near-black shell",
      "Moulded per controller — no stretching, no bunching",
      "Removable and re-fittable without adhesive",
    ],
    specs: [
      { label: "Texture", value: "Micro Cell" },
      { label: "Wall depth", value: "1.8 mm" },
      { label: "Added thickness", value: "+1.8 mm per handle" },
      { label: "Added weight", value: "15 g per pair" },
      { label: "Shore hardness", value: "68A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.7,
    reviewCount: 863,
    ratingBreakdown: [634, 154, 43, 18, 14],
    subscores: [
      { label: "Fit", score: 4.8 },
      { label: "Grip", score: 4.6 },
      { label: "Comfort", score: 4.8 },
      { label: "Durability", score: 4.6 },
    ],
    variants: buildVariants("volt", { low: ["dualsense"] }),
    pairsWith: ["dark-matter-grips", "ember-grips", "venom-grips"],
    releasedOn: "2025-01-21",
    popularity: 88,
  },

  {
    slug: "ember-grips",
    name: "Ember Grips",
    tagline: "Angular shard web with a hot gradient.",
    type: "grips",
    price: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "open-cell",
    designs: ["ember"],
    summary:
      "Ember runs the same 2.4 mm open-cell depth as Dark Matter on a coarser, more angular cell — fewer walls, wider channels, and the colour inverted so the webbing between the cells is what you see. Identical grip performance, a very different object.",
    highlights: [
      "2.4 mm open-cell depth with a wider channel pitch",
      "Inverted colourway — the webbing is the graphic, not the cells",
      "Gradient runs hot through the centre of the palm",
      "Moulded per controller, full port and trigger clearance",
      "Removable and re-fittable without adhesive",
    ],
    specs: [
      { label: "Texture", value: "Open Cell" },
      { label: "Wall depth", value: "2.4 mm" },
      { label: "Added thickness", value: "+2.4 mm per handle" },
      { label: "Added weight", value: "18 g per pair" },
      { label: "Shore hardness", value: "65A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.6,
    reviewCount: 512,
    ratingBreakdown: [352, 96, 31, 18, 15],
    subscores: [
      { label: "Fit", score: 4.8 },
      { label: "Grip", score: 4.9 },
      { label: "Comfort", score: 4.5 },
      { label: "Durability", score: 4.4 },
    ],
    variants: buildVariants("ember", { soldOut: ["xbox-elite-2"], low: ["xbox-series"] }),
    pairsWith: ["dark-matter-grips", "volt-grips", "ice-froyo-grips"],
    releasedOn: "2025-06-10",
    popularity: 74,
  },

  {
    slug: "vapor-grips",
    name: "Vapor Grips",
    tagline: "Lowest profile. A raised mesh, not a coating.",
    type: "grips",
    price: 32.95,
    platforms: [...ALL_PLATFORMS],
    texture: "grid",
    designs: ["vapor"],
    summary:
      "Vapor is the one to buy if you do not want your controller to get noticeably thicker. A 1.4 mm raised mesh with a node at every intersection — enough to lock your hand in place, close enough to stock that muscle memory carries over.",
    highlights: [
      "1.4 mm profile — the smallest change to the controller's shape",
      "Node points at every intersection add bite without added bulk",
      "Mesh mirrors across the two grips rather than repeating",
      "Best choice if you have small hands or thousands of hours on bare",
      "Removable and re-fittable without adhesive",
    ],
    specs: [
      { label: "Texture", value: "Grid Emboss" },
      { label: "Relief height", value: "1.4 mm" },
      { label: "Added thickness", value: "+1.4 mm per handle" },
      { label: "Added weight", value: "12 g per pair" },
      { label: "Shore hardness", value: "72A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.7,
    reviewCount: 694,
    ratingBreakdown: [498, 138, 34, 14, 10],
    subscores: [
      { label: "Fit", score: 4.9 },
      { label: "Grip", score: 4.4 },
      { label: "Comfort", score: 4.8 },
      { label: "Durability", score: 4.7 },
    ],
    variants: buildVariants("vapor"),
    pairsWith: ["ice-froyo-grips", "venom-grips", "dark-matter-grips"],
    badge: "new",
    releasedOn: "2026-05-14",
    popularity: 81,
  },

  {
    slug: "venom-grips",
    name: "Venom Grips",
    tagline: "Most cushioned. Ridges that index your finger wrap.",
    type: "grips",
    price: 32.95,
    platforms: [...ALL_PLATFORMS],
    texture: "ridge",
    designs: ["venom"],
    summary:
      "Venom is the comfort-first grip. Topographic ridges run across the handle where your middle and ring fingers wrap, giving you a physical index you can find without looking — on a softer 60A compound with 3.1 mm of cushion under the knuckle.",
    highlights: [
      "3.1 mm ridge profile — the most cushioned grip we make",
      "Ridge pitch set to the natural finger spacing of an adult hand",
      "Softer Shore 60A compound absorbs haptic buzz on long sessions",
      "Recommended for players with joint pain or larger hands",
      "Removable and re-fittable without adhesive",
    ],
    specs: [
      { label: "Texture", value: "Contour Ridge" },
      { label: "Ridge height", value: "3.1 mm" },
      { label: "Added thickness", value: "+3.1 mm per handle" },
      { label: "Added weight", value: "22 g per pair" },
      { label: "Shore hardness", value: "60A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.6,
    reviewCount: 412,
    ratingBreakdown: [281, 84, 24, 12, 11],
    subscores: [
      { label: "Fit", score: 4.7 },
      { label: "Grip", score: 4.4 },
      { label: "Comfort", score: 4.9 },
      { label: "Durability", score: 4.5 },
    ],
    variants: buildVariants("venom"),
    pairsWith: ["vapor-grips", "ice-froyo-grips", "volt-grips"],
    releasedOn: "2025-08-27",
    popularity: 63,
  },

  {
    slug: "ice-froyo-grips",
    name: "Ice Froyo Grips",
    tagline: "Traction without changing how it looks.",
    type: "grips",
    price: 29.95,
    compareAt: 34.95,
    platforms: [...ALL_PLATFORMS],
    texture: "matte",
    designs: ["ice-froyo"],
    summary:
      "The entry point. A 1.1 mm soft-touch shell in ice white, with a dimpled patch under the palm where the contact pressure actually is. Start here if you have never used grips and do not want the feel of your controller to change.",
    highlights: [
      "1.1 mm profile — the closest thing to a stock controller",
      "Dimpled palm patch, smooth everywhere else",
      "Matches a stock white DualSense closely",
      "Best first grip if you are unsure about added bulk",
      "Removable and re-fittable without adhesive",
    ],
    specs: [
      { label: "Texture", value: "Soft Matte" },
      { label: "Dimple depth", value: "0.6 mm" },
      { label: "Added thickness", value: "+1.1 mm per handle" },
      { label: "Added weight", value: "10 g per pair" },
      { label: "Shore hardness", value: "75A" },
      ...SHARED_SPECS,
    ],
    inBox: SHARED_IN_BOX,
    installMinutes: 2,
    rating: 4.4,
    reviewCount: 938,
    ratingBreakdown: [554, 251, 78, 31, 24],
    subscores: [
      { label: "Fit", score: 4.7 },
      { label: "Grip", score: 4.0 },
      { label: "Comfort", score: 4.6 },
      { label: "Durability", score: 4.3 },
    ],
    variants: buildVariants("ice-froyo"),
    pairsWith: ["vapor-grips", "venom-grips", "dark-matter-grips"],
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
