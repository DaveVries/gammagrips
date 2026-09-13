import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cents = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};
const text = (v: FormDataEntryValue | null, max = 500) => {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
};

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  if (!slug) return NextResponse.redirect(new URL("/admin/products", req.url), 303);

  const price = cents(form.get("price"));
  let compare = cents(form.get("compare_at"));
  /* A "was" price at or below the selling price is not a discount, it is a
     lie the shopper can see through. Drop it rather than display it. */
  if (price != null && compare != null && compare <= price) compare = null;

  await db()`
    insert into product_overrides (slug, name, tagline, summary, price_cents, compare_at_cents, texture_id, active, sort, updated_at)
    values (
      ${slug}, ${text(form.get("name"), 120)}, ${text(form.get("tagline"), 200)},
      ${text(form.get("summary"), 1200)}, ${price}, ${compare},
      ${text(form.get("texture_id"), 40)}, ${form.get("active") === "on"},
      ${Number(form.get("sort") ?? 0) || 0}, now()
    )
    on conflict (slug) do update set
      name = excluded.name, tagline = excluded.tagline, summary = excluded.summary,
      price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents,
      texture_id = excluded.texture_id, active = excluded.active, sort = excluded.sort,
      updated_at = now()
  `;

  return NextResponse.redirect(new URL(`/admin/products?saved=${encodeURIComponent(slug)}`, req.url), 303);
}
