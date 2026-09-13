import { PRODUCTS, TEXTURES, textureById } from "@/data/catalog";
import type { Product } from "@/lib/types";
import { db } from "@/lib/db";

/**
 * Merges the code catalogue with the editable overrides.
 *
 * The split is deliberate: src/data/catalog.ts keeps everything that is really
 * code — which design a grip renders with, the pattern geometry, the platform
 * variants and their SKUs. The database keeps what a shopkeeper changes:
 * price, copy, discount, texture claim, photos, and whether it is listed.
 *
 * Every override column is nullable and null means "use the catalogue value",
 * so a product with no row behaves exactly as it always did. That also means
 * the site still renders if the database is unreachable.
 */

export type Override = {
  slug: string;
  name: string | null;
  tagline: string | null;
  summary: string | null;
  price_cents: number | null;
  compare_at_cents: number | null;
  texture_id: string | null;
  active: boolean;
  sort: number | null;
  is_custom: boolean;
  platforms: string[];
};

export type ProductImage = { id: number; slug: string; url: string; alt: string; kind: string; sort: number };

export async function overrides(): Promise<Map<string, Override>> {
  try {
    const rows = (await db()`select * from product_overrides`) as Override[];
    return new Map(rows.map((r) => [r.slug, r]));
  } catch {
    return new Map();
  }
}

export async function imagesBySlug(): Promise<Map<string, ProductImage[]>> {
  try {
    const rows = (await db()`
      select id, slug, url, alt, kind, sort from product_images order by slug, sort, id
    `) as ProductImage[];
    const m = new Map<string, ProductImage[]>();
    for (const r of rows) (m.get(r.slug) ?? m.set(r.slug, []).get(r.slug)!).push(r);
    return m;
  } catch {
    return new Map();
  }
}

/** A product with its overrides applied. */
export function apply(p: Product, o?: Override): Product & { hidden: boolean } {
  if (!o) return { ...p, hidden: false };
  return {
    ...p,
    name: o.name ?? p.name,
    tagline: o.tagline ?? p.tagline,
    summary: o.summary ?? p.summary,
    price: o.price_cents != null ? o.price_cents / 100 : p.price,
    compareAt: o.compare_at_cents != null ? o.compare_at_cents / 100 : p.compareAt,
    texture: (o.texture_id ?? p.texture) as Product["texture"],
    hidden: !o.active,
  };
}

/**
 * A product created in the dashboard, shaped like a catalogue one.
 *
 * The fields the catalogue fills by hand — highlights, specs, subscores — are
 * empty rather than invented. The PDP already handles a product with none of
 * them; making some up here would put claims on the page that nobody wrote.
 */
export function customToProduct(o: Override): Product {
  const platforms = (o.platforms?.length ? o.platforms : ["dualsense"]) as Product["platforms"];
  return {
    slug: o.slug,
    name: o.name ?? o.slug,
    tagline: o.tagline ?? "",
    type: "grips",
    price: (o.price_cents ?? 0) / 100,
    compareAt: o.compare_at_cents != null ? o.compare_at_cents / 100 : undefined,
    platforms,
    texture: (o.texture_id ?? undefined) as Product["texture"],
    designs: [],
    summary: o.summary ?? "",
    highlights: [],
    specs: [],
    inBox: [],
    installMinutes: 2,
    rating: 0,
    reviewCount: 0,
    ratingBreakdown: [0, 0, 0, 0, 0],
    subscores: [],
    // SKUs are derived, so a created product can be stocked and sold like any
    // other without a second table to keep in step.
    variants: platforms.map((p) => ({
      sku: `${o.slug}-${p}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
      designId: "",
      platformId: p,
      stock: 0,
    })) as Product["variants"],
    pairsWith: [],
    releasedOn: new Date().toISOString().slice(0, 10),
    popularity: 0,
  };
}

/** Catalogue products plus anything created in the dashboard. */
export async function allProducts(o?: Map<string, Override>) {
  const ov = o ?? (await overrides());
  const custom = [...ov.values()].filter((x) => x.is_custom).map(customToProduct);
  return [...PRODUCTS, ...custom];
}

/** Every product, overrides applied, hidden ones dropped. */
export async function listProducts() {
  const o = await overrides();
  return (await allProducts(o)).map((p) => apply(p, o.get(p.slug)))
    .filter((p) => !p.hidden)
    .sort((a, b) => {
      const sa = o.get(a.slug)?.sort ?? 0;
      const sb = o.get(b.slug)?.sort ?? 0;
      return sa - sb;
    });
}

/** Everything, including hidden — for the admin. */
export async function listForAdmin() {
  const [o, imgs] = await Promise.all([overrides(), imagesBySlug()]);
  return (await allProducts(o)).map((p) => ({
    base: p,
    merged: apply(p, o.get(p.slug)),
    override: o.get(p.slug) ?? null,
    images: imgs.get(p.slug) ?? [],
  }));
}

export const TEXTURE_CHOICES = TEXTURES.map((t) => ({
  id: t.id,
  label: `${t.name} · grip ${t.grip}/5 · cushion ${t.cushion}/5`,
}));

export { textureById };
