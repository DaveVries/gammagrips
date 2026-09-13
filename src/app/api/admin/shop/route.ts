import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { setShopOpen } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  await setShopOpen(String(form?.get("open")) === "true");
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
