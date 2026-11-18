import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { COUNTRIES, cleanWebsite } from "@/lib/partners";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Add, edit, hide/show and delete partner shops. Form POSTs, redirect back. */
export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const back = (q = "") => NextResponse.redirect(new URL(`/admin/partners${q}`, req.url), 303);
  const form = await req.formData().catch(() => null);
  if (!form) return back();

  const sql = db();
  const action = String(form.get("action") ?? "");
  const id = Number(form.get("id"));
  const text = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

  /* Like the image upload: anything below can throw, and a bare 500 on a form
     post leaves the browser on a blank API URL. Always come back with a reason. */
  try {
    if (action === "delete" && id > 0) {
      const [row] = (await sql`delete from partners where id = ${id} returning logo_url`) as {
        logo_url: string | null;
      }[];
      if (row?.logo_url) await del(row.logo_url).catch(() => {});
      return back("?deleted=1");
    }

    if (action === "toggle" && id > 0) {
      await sql`update partners set active = not active, updated_at = now() where id = ${id}`;
      return back(`?saved=1#p${id}`);
    }

    if (action !== "create" && action !== "edit") return back();

    const name = text("name", 120);
    const city = text("city", 80);
    if (!name || !city) return back("?error=missing");
    const country = Object.hasOwn(COUNTRIES, text("country", 2)) ? text("country", 2) : "NL";
    const fields = {
      name,
      city,
      country,
      address: text("address", 160),
      postcode: text("postcode", 16),
      website: cleanWebsite(text("website", 300)),
      note: text("note", 200),
      sort: Number.isFinite(Number(form.get("sort"))) ? Math.trunc(Number(form.get("sort"))) : 0,
    };

    /* Optional logo. */
    let logoUrl: string | null | undefined; // undefined = leave as is
    const file = form.get("logo");
    if (file instanceof File && file.size > 0) {
      if (!OK_TYPES.includes(file.type)) return back("?error=type");
      if (file.size > MAX_BYTES) return back("?error=size");
      if (!process.env.BLOB_READ_WRITE_TOKEN) return back("?error=noblob");
      const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1].replace("jpeg", "jpg");
      const blob = await put(`partners/logo-${Date.now()}.${ext}`, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: true,
      });
      logoUrl = blob.url;
    } else if (form.get("remove_logo") === "1") {
      logoUrl = null;
    }

    if (action === "create") {
      const [row] = (await sql`
        insert into partners (name, address, postcode, city, country, website, note, sort, logo_url)
        values (${fields.name}, ${fields.address}, ${fields.postcode}, ${fields.city}, ${fields.country},
                ${fields.website}, ${fields.note}, ${fields.sort}, ${logoUrl ?? null})
        returning id
      `) as { id: number }[];
      return back(`?created=1#p${row.id}`);
    }

    if (!(id > 0)) return back();
    const [old] = (await sql`select logo_url from partners where id = ${id}`) as { logo_url: string | null }[];
    if (!old) return back();
    await sql`
      update partners set
        name = ${fields.name}, address = ${fields.address}, postcode = ${fields.postcode},
        city = ${fields.city}, country = ${fields.country}, website = ${fields.website},
        note = ${fields.note}, sort = ${fields.sort},
        logo_url = ${logoUrl === undefined ? old.logo_url : logoUrl},
        updated_at = now()
      where id = ${id}
    `;
    if (logoUrl !== undefined && old.logo_url) await del(old.logo_url).catch(() => {});
    return back(`?saved=1#p${id}`);
  } catch (err) {
    console.error("[admin/partners] failed", err);
    return back("?error=failed");
  }
}
