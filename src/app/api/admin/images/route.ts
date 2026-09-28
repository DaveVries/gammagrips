import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  const back = (q = "") =>
    NextResponse.redirect(new URL(`/admin/products/${slug}${q}`, req.url), 303);

  /* Delete */
  const removeId = form.get("delete_id");
  if (removeId) {
    let rows: { url: string }[] = [];
    try {
      rows = (await db()`delete from product_images where id = ${Number(removeId)} returning url`) as {
        url: string;
      }[];
    } catch (err) {
      console.error("[admin/images] delete failed", err);
      return back("?error=upload");
    }
    // Blob deletion is best-effort: the row is gone either way, and an orphan
    // blob is cheaper than a dead reference in the page.
    if (rows[0]?.url) await del(rows[0].url).catch(() => {});
    return back("?saved=1");
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return back("?error=nofile");
  if (!OK_TYPES.includes(file.type)) return back("?error=type");
  if (file.size > MAX_BYTES) return back("?error=size");
  if (!process.env.BLOB_READ_WRITE_TOKEN) return back("?error=noblob");

  /* Everything past this point can throw — a rejected blob upload, a database
     timeout — and an unhandled throw in a route handler is a bare 500 with no
     body. Posting a form to that lands the browser on the API URL showing a
     blank page, with nothing to tell the user what went wrong. Always come
     back to the page, always with a reason. */
  try {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const blob = await put(`products/${slug}-${Date.now()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });

    await db()`
      insert into product_images (slug, url, alt, kind, sort)
      values (${slug}, ${blob.url}, ${String(form.get("alt") ?? "").slice(0, 200)},
              ${String(form.get("kind") ?? "front")},
              coalesce((select max(sort) + 1 from product_images where slug = ${slug}), 0))
    `;
  } catch (err) {
    console.error("[admin/images] upload failed", err);
    return back("?error=upload");
  }
  return back("?saved=1");
}
