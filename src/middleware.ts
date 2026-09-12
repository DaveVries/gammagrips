import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Gate on /admin/*.
 *
 * Only checks that a session cookie is present — middleware runs on the edge
 * and cannot reach the database. The page itself re-checks the session and the
 * admin flag against Postgres, which is the real authorisation. This is a
 * cheap early redirect, never the security boundary.
 */
export function middleware(req: NextRequest) {
  if (!req.cookies.get(SESSION_COOKIE)) {
    const url = new URL("/account", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
