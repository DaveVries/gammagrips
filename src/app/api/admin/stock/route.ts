import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { setStock } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.redirect(new URL("/admin/stock", req.url), 303);

  /* One submit for the whole table: every field named qty:<sku>. */
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("qty:")) continue;
    const sku = key.slice(4);
    const n = Number(String(value));
    if (Number.isFinite(n)) await setStock(sku, n);
  }
  return NextResponse.redirect(new URL("/admin/stock?saved=1", req.url), 303);
}
