import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/catalog";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const bad = (why: string) =>
    NextResponse.redirect(new URL(`/admin/products/new?error=${why}`, req.url), 303);

  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").replace(",", ".");
  const price = Number(priceRaw);

  if (!name || !Number.isFinite(price) || price < 0) return bad("fields");
  /* The handle is the URL and the SKU stem, and orders reference both. It has
     to be unique against the code catalogue too, not just the table. */
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(slug)) return bad("slug");
  if (PRODUCTS.some((p) => p.slug === slug)) return bad("slug");

  const platforms = form.getAll("platforms").map(String).filter(Boolean);
  const compareRaw = String(form.get("compare_at") ?? "").replace(",", ".");
  const compare = compareRaw ? Number(compareRaw) : NaN;
  const compareCents =
    Number.isFinite(compare) && compare > price ? Math.round(compare * 100) : null;

  try {
    const inserted = (await db()`
      insert into product_overrides
        (slug, name, tagline, summary, price_cents, compare_at_cents, texture_id,
         active, sort, is_custom, platforms)
      values (
        ${slug}, ${name},
        ${String(form.get("tagline") ?? "").trim() || null},
        ${String(form.get("summary") ?? "").trim() || null},
        ${Math.round(price * 100)}, ${compareCents},
        ${String(form.get("texture_id") ?? "open-cell")},
        ${form.get("active") === "on"}, 0, true,
        ${platforms.length ? platforms : ["dualsense"]}
      )
      on conflict (slug) do nothing
      returning slug
    `) as { slug: string }[];
    if (inserted.length === 0) return bad("slug");
  } catch (err) {
    console.error("[products/create]", err);
    return bad("fields");
  }

  return NextResponse.redirect(new URL(`/admin/products/${slug}?saved=1`, req.url), 303);
}
