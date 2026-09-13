import { NextResponse } from "next/server";
import { consumeLoginToken, startSession, isAdminEmail } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const email = token ? await consumeLoginToken(token) : null;

  if (!email) {
    return NextResponse.redirect(new URL("/admin?error=link", req.url), 303);
  }

  await startSession(email);
  return NextResponse.redirect(
    new URL(isAdminEmail(email) ? "/admin" : "/account", req.url),
    303,
  );
}
