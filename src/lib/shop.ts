import {
  COLLECTIONS,
  DESIGNS,
  PLATFORMS,
  PRODUCTS,
  TEXTURES,
  designById,
  platformById,
} from "@/data/catalog";
import type { Design, PlatformId, Product } from "@/lib/types";

/* ============================================================================
   Catalogue queries: filtering, sorting and facet counts.
   Pure functions over the static catalogue so pages can stay server-rendered.
   ========================================================================= */

export interface Filters {
  platform: string[];
  type: string[];
  collection: string[];
  color: string[];
  texture: string[];
  price: string[];
  availability: string[];
}

export const EMPTY_FILTERS: Filters = {
  platform: [],
  type: [],
  collection: [],
  color: [],
  texture: [],
  price: [],
  availability: [],
};

export const PRICE_BANDS = [
  { id: "u15", label: "Under €15", test: (p: number) => p < 15 },
  { id: "15-25", label: "€15 – €25", test: (p: number) => p >= 15 && p < 25 },
  { id: "25-35", label: "€25 – €35", test: (p: number) => p >= 25 && p < 35 },
  { id: "o35", label: "€35 and over", test: (p: number) => p >= 35 },
];

export const SORTS = [
  { id: "popular", label: "Most popular" },
  { id: "rating", label: "Highest rated" },
  { id: "new", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "discount", label: "Biggest discount" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

/** Parse repeated query params into a Filters object. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const get = (k: keyof Filters) => {
    const v = sp[k];
    if (!v) return [];
    return (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
  };
  return {
    platform: get("platform"),
    type: get("type"),
    collection: get("collection"),
    color: get("color"),
    texture: get("texture"),
    price: get("price"),
    availability: get("availability"),
  };
}

export const activeFilterCount = (f: Filters) =>
  Object.values(f).reduce((n, arr) => n + arr.length, 0);

const designsOf = (p: Product) =>
  p.designs.map((id) => designById(id)).filter(Boolean) as Design[];

export const inStock = (p: Product) => p.variants.some((v) => v.stock > 0);

/** A product matches a facet group if it matches ANY value in that group;
    groups are ANDed together. */
export function matches(p: Product, f: Filters): boolean {
  if (f.platform.length && !f.platform.some((x) => p.platforms.includes(x as PlatformId)))
    return false;
  if (f.type.length && !f.type.includes(p.type)) return false;
  if (f.texture.length && (!p.texture || !f.texture.includes(p.texture))) return false;

  const ds = designsOf(p);
  if (f.collection.length && !ds.some((d) => f.collection.includes(d.collection)))
    return false;
  if (f.color.length && !ds.some((d) => f.color.includes(d.colorFamily))) return false;

  if (f.price.length) {
    const band = PRICE_BANDS.filter((b) => f.price.includes(b.id));
    if (!band.some((b) => b.test(p.price))) return false;
  }
  if (f.availability.includes("in-stock") && !inStock(p)) return false;
  if (f.availability.includes("sale") && !p.compareAt) return false;
  return true;
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const out = [...list];
  switch (sort) {
    case "rating":
      return out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "new":
      return out.sort((a, b) => b.releasedOn.localeCompare(a.releasedOn));
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "discount":
      return out.sort(
        (a, b) =>
          (b.compareAt ? (b.compareAt - b.price) / b.compareAt : 0) -
          (a.compareAt ? (a.compareAt - a.price) / a.compareAt : 0),
      );
    default:
      return out.sort((a, b) => b.popularity - a.popularity);
  }
}

export interface FacetOption {
  value: string;
  label: string;
  /** Result count if this value were added to the current selection. */
  count: number;
  swatch?: string;
}

export interface FacetGroup {
  key: keyof Filters;
  label: string;
  /** Shown as an explainer tooltip — Baymard: always explain industry terms. */
  hint?: string;
  options: FacetOption[];
}

/**
 * Facet counts are computed against the selection with THIS group cleared, so
 * counts behave the way users expect when refining within a single group.
 */
export function buildFacets(pool: Product[], f: Filters): FacetGroup[] {
  const countFor = (key: keyof Filters, value: string) => {
    const probe: Filters = { ...f, [key]: [value] };
    return pool.filter((p) => matches(p, probe)).length;
  };

  const colorLabels: Record<string, string> = {
    black: "Black",
    white: "White",
    grey: "Grey",
    violet: "Violet",
    blue: "Blue",
    green: "Green",
    orange: "Orange",
    cyan: "Cyan",
    tan: "Tan",
    multi: "Multi-colour",
  };
  const colorSwatch: Record<string, string> = {
    black: "#14171b",
    white: "#e9eef3",
    grey: "#6b7480",
    violet: "#b79cff",
    blue: "#6d8cff",
    green: "#3fd98b",
    orange: "#ff8a3d",
    cyan: "#3fd6ea",
    tan: "#d9a05b",
    multi: "linear-gradient(135deg,#43e8ff,#c86bff,#ff8ad4)",
  };

  const usedColors = Array.from(
    new Set(
      pool.flatMap((p) => designsOf(p).map((d) => d.colorFamily)),
    ),
  );

  const groups: FacetGroup[] = [
    {
      key: "platform",
      label: "Controller",
      options: PLATFORMS.map((pl) => ({
        value: pl.id,
        label: pl.short,
        count: countFor("platform", pl.id),
      })),
    },
    {
      key: "type",
      label: "Product type",
      options: Array.from(new Set(pool.map((p) => p.type))).map((t) => ({
        value: t,
        label:
          t === "grips"
            ? "Controller grips"
            : t === "thumb-grips"
              ? "Thumb grips"
              : t === "stick-accessories"
                ? "Stick accessories"
                : t === "protection"
                  ? "Cases & cables"
                  : t === "care"
                    ? "Care"
                    : "Bundles",
        count: countFor("type", t),
      })),
    },
    {
      key: "texture",
      label: "Texture",
      hint: "How the surface feels. Texture is separate from the design — most designs are available in several textures.",
      options: TEXTURES.map((t) => ({
        value: t.id,
        label: t.name,
        count: countFor("texture", t.id),
      })).filter((o) => o.count > 0),
    },
    {
      key: "collection",
      label: "Design collection",
      options: COLLECTIONS.map((c) => ({
        value: c.id,
        label: c.name,
        count: countFor("collection", c.id),
      })).filter((o) => o.count > 0),
    },
    {
      key: "color",
      label: "Colour",
      options: usedColors.map((c) => ({
        value: c,
        label: colorLabels[c] ?? c,
        count: countFor("color", c),
        swatch: colorSwatch[c],
      })),
    },
    {
      key: "price",
      label: "Price",
      options: PRICE_BANDS.map((b) => ({
        value: b.id,
        label: b.label,
        count: countFor("price", b.id),
      })),
    },
    {
      key: "availability",
      label: "Availability",
      options: [
        { value: "in-stock", label: "In stock", count: countFor("availability", "in-stock") },
        { value: "sale", label: "On sale", count: countFor("availability", "sale") },
      ],
    },
  ];
  return groups.filter((g) => g.options.length > 1);
}

/* --- variant helpers ------------------------------------------------------ */

export function variantFor(p: Product, designId: string | null, platformId: PlatformId) {
  const key = p.designs.length ? (designId ?? p.designs[0]) : "default";
  return p.variants.find((v) => v.designId === key && v.platformId === platformId);
}

export function stockLabel(stock: number | undefined) {
  if (stock === undefined) return { text: "Unavailable", tone: "out" as const };
  if (stock === 0) return { text: "Sold out", tone: "out" as const };
  if (stock <= 8) return { text: `Only ${stock} left`, tone: "low" as const };
  return { text: "In stock", tone: "ok" as const };
}

/** Human compatibility sentence — one source of truth, used everywhere. */
export function compatibilityLine(p: Product): string {
  const fams = new Set(p.platforms.map((id) => platformById(id)?.family));
  if (fams.size === 2 && p.platforms.length === 4) return "DualSense / Xbox Wireless";
  return p.platforms.map((id) => platformById(id)?.short).join(" / ");
}

export function compatibilityFull(p: Product): string[] {
  return p.platforms.map((id) => {
    const pl = platformById(id)!;
    return `${pl.controller} (${pl.console})`;
  });
}

/* --- search --------------------------------------------------------------- */

/** Abbreviations and alternate spellings people actually type. */
const SYNONYMS: Record<string, string[]> = {
  ps5: ["dualsense", "playstation"],
  ps: ["playstation"],
  playstation: ["dualsense"],
  dual: ["dualsense"],
  ds: ["dualsense"],
  edge: ["dualsense-edge"],
  xbox: ["xbox-series", "xbox-elite-2"],
  elite: ["xbox-elite-2"],
  series: ["xbox-series"],
  grip: ["grips"],
  cover: ["grips"],
  covers: ["grips"],
  skin: ["grips"],
  purple: ["violet", "dark", "matter"],
  violet: ["dark", "matter"],
  dark: ["dark-matter"],
  matter: ["dark-matter"],
  lime: ["volt"],
  yellow: ["volt"],
  orange: ["ember"],
  red: ["ember"],
  fire: ["ember"],
  magma: ["ember"],
  blue: ["vapor"],
  pink: ["vapor"],
  green: ["venom", "volt"],
  snake: ["venom"],
  white: ["ice-froyo"],
  ice: ["ice-froyo"],
  froyo: ["ice-froyo"],
  plain: ["ice-froyo"],
  honeycomb: ["dark-matter", "volt"],
  hex: ["dark-matter", "volt"],
  cell: ["dark-matter", "ember", "volt"],
  voronoi: ["dark-matter", "ember"],
  grid: ["vapor"],
  mesh: ["vapor"],
  wave: ["venom"],
  waves: ["venom"],
  topo: ["venom"],
  sweat: ["dark-matter", "ember", "open-cell"],
  sweaty: ["dark-matter", "ember", "open-cell"],
  slippery: ["dark-matter", "ember"],
  thin: ["vapor", "ice-froyo"],
  thick: ["venom"],
  comfort: ["venom"],
  pain: ["venom"],
};

export interface SearchHit {
  kind: "product" | "collection" | "design" | "help";
  title: string;
  meta: string;
  href: string;
  slug?: string;
  designId?: string;
}

const HELP_PAGES: SearchHit[] = [
  { kind: "help", title: "Shipping", meta: "Delivery times and costs", href: "/shipping" },
  { kind: "help", title: "Returns & refunds", meta: "60-day returns", href: "/returns" },
  { kind: "help", title: "Compatibility checker", meta: "Will these fit my controller?", href: "/compatibility" },
  { kind: "help", title: "Fitting guide", meta: "How to install grips", href: "/guides/dualsense-grip-installation" },
  { kind: "help", title: "Contact support", meta: "Get help with an order", href: "/contact" },
  { kind: "help", title: "FAQ", meta: "Common questions", href: "/faq" },
];

export function search(raw: string): SearchHit[] {
  const q = raw.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).flatMap((w) => {
    const clean = w.replace(/[^a-z0-9]/g, "");
    return [clean, ...(SYNONYMS[clean] ?? [])];
  });

  const score = (haystack: string) => {
    const h = haystack.toLowerCase();
    let s = 0;
    for (const w of words) {
      if (!w) continue;
      if (h.includes(w)) s += w.length >= 3 ? 3 : 1;
    }
    if (h.startsWith(q)) s += 6;
    return s;
  };

  const hits: (SearchHit & { s: number })[] = [];

  for (const p of PRODUCTS) {
    const hay = [
      p.name,
      p.tagline,
      p.type,
      p.texture ?? "",
      ...p.platforms,
      ...p.designs,
      ...p.platforms.map((id) => platformById(id)?.short ?? ""),
    ].join(" ");
    const s = score(p.name) * 2 + score(hay);
    if (s > 0)
      hits.push({
        kind: "product",
        title: p.name,
        meta: compatibilityLine(p),
        href: `/products/${p.slug}`,
        slug: p.slug,
        s,
      });
  }

  for (const d of DESIGNS) {
    const s = score(`${d.name} ${d.collection} ${d.colorFamily} ${d.blurb}`) + score(d.name) * 2;
    if (s > 0)
      hits.push({
        kind: "design",
        title: d.name,
        meta: `${d.collection[0].toUpperCase()}${d.collection.slice(1)} design`,
        href: `/collections/${d.collection}?design=${d.id}`,
        designId: d.id,
        s,
      });
  }

  for (const c of COLLECTIONS) {
    const s = score(`${c.name} ${c.tagline}`) * 2;
    if (s > 0)
      hits.push({
        kind: "collection",
        title: `${c.name} collection`,
        meta: c.tagline,
        href: `/collections/${c.id}`,
        s,
      });
  }

  for (const h of HELP_PAGES) {
    const s = score(`${h.title} ${h.meta}`);
    if (s > 0) hits.push({ ...h, s });
  }

  return hits.sort((a, b) => b.s - a.s).slice(0, 9);
}

/** Suggestions shown when a query returns nothing — never a bare dead end. */
export const relaxedSuggestions = () =>
  PRODUCTS.filter((p) => p.popularity > 70).slice(0, 4);
