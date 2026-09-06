/* Domain types for the GammaGrips storefront.
   Kept framework-free so the catalogue can move behind an API later without
   touching component code. */

export type PlatformId =
  | "dualsense"
  | "dualsense-edge"
  | "xbox-series"
  | "xbox-elite-2";

export type PlatformFamily = "playstation" | "xbox";

export interface Platform {
  id: PlatformId;
  family: PlatformFamily;
  /** Full, unambiguous controller name — used in compatibility statements. */
  controller: string;
  /** Short form for badges and chips where space is tight. */
  short: string;
  console: string;
  /** Marketing-safe generation label. */
  releasedWith: string;
}

/** Only grips today. Kept as a union so a second line can be introduced
    without reworking the filter and navigation layers. */
export type ProductType = "grips";

export type TextureId =
  | "open-cell"
  | "micro-cell"
  | "ridge"
  | "grid"
  | "matte";

export interface Texture {
  id: TextureId;
  name: string;
  /** One line the customer can actually act on. */
  feel: string;
  /** 1–5, surfaced as a comparison bar on the PDP and the texture guide. */
  grip: number;
  cushion: number;
  profile: string;
}

export type CollectionId = "cellular" | "linear" | "solid";

/** How a design's surface is drawn by the SVG pattern system. */
export type PatternKind =
  | "cell"
  | "cell-fine"
  | "shard"
  | "hex"
  | "lattice"
  | "contour"
  | "scale"
  | "spot"
  | "twill"
  | "diamond"
  | "plain";

export interface Design {
  id: string;
  name: string;
  collection: CollectionId;
  kind: PatternKind;
  /** Shell colour beneath the pattern. */
  base: string;
  /** Pattern ink. Two stops allow a gradient across the grip. */
  ink: string;
  inkAlt?: string;
  /** True when the coloured part is the webbing BETWEEN cells rather than the
      cells themselves — the way the real mouldings read. */
  webbed?: boolean;
  /** Second shell colour; renders the backing as a vertical gradient. */
  baseAlt?: string;
  /** Dominant colour family, for the colour filter. */
  colorFamily:
    | "black"
    | "white"
    | "grey"
    | "violet"
    | "blue"
    | "green"
    | "orange"
    | "cyan"
    | "tan"
    | "multi";
  /** True for iridescent / colour-shifting finishes. */
  iridescent?: boolean;
  limited?: boolean;
  blurb: string;
}

export interface Variant {
  designId: string;
  platformId: PlatformId;
  sku: string;
  /** Units on hand. 0 renders as sold out; <= 8 renders as low stock. */
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  /** Sits directly under the title — one concrete benefit, no slogans. */
  tagline: string;
  type: ProductType;
  price: number;
  /** Set when the item is discounted; must be a genuine prior price. */
  compareAt?: number;
  platforms: PlatformId[];
  /** Grips only. */
  texture?: TextureId;
  /** Designs offered for this product, in merchandising order. */
  designs: string[];
  /** Products with no visual designs (cables, cases) use a flat colourway. */
  flatColor?: string;
  summary: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  inBox: string[];
  installMinutes: number;
  rating: number;
  reviewCount: number;
  /** 5,4,3,2,1 — drives the ratings histogram. */
  ratingBreakdown: [number, number, number, number, number];
  /** Aggregate subscores. "Fit" is the anxiety dimension for this category. */
  subscores: { label: string; score: number }[];
  variants: Variant[];
  /** Slugs recommended as "complete your controller" (supplementary). */
  pairsWith: string[];
  badge?: "new" | "limited" | "bestseller";
  releasedOn: string;
  popularity: number;
}

export interface Collection {
  id: CollectionId;
  name: string;
  tagline: string;
  description: string;
  designIds: string[];
}

export interface Review {
  id: string;
  productSlug: string;
  designId: string;
  platformId: PlatformId;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  ownedWeeks: number;
  /** Brand response — Baymard: responding to criticism lifts perception of
      product, brand and site simultaneously. */
  response?: { from: string; date: string; body: string };
}

export interface Guide {
  slug: string;
  title: string;
  deck: string;
  category: string;
  readMinutes: number;
  date: string;
  body: { heading?: string; paragraphs: string[]; list?: string[] }[];
}

export interface CartLine {
  key: string;
  slug: string;
  designId: string | null;
  platformId: PlatformId | null;
  qty: number;
}
