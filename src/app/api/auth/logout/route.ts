import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await endSession();
  return NextResponse.redirect(new URL("/account", req.url), 303);
}
