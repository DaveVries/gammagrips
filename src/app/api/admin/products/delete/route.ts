import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");

  /* Only ever deletes a product created here. A catalogue product's row is an
     override — dropping it would silently restore the code defaults rather
     than remove anything, which is not what "delete" should mean. */
  const gone = (await db()`
    delete from product_overrides where slug = ${slug} and is_custom = true returning slug
  `) as { slug: string }[];

  if (gone.length) await db()`delete from product_images where slug = ${slug}`;

  return NextResponse.redirect(
    new URL(gone.length ? "/admin/products?deleted=1" : `/admin/products/${slug}`, req.url),
    303,
  );
}
