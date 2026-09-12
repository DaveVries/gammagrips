import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate on /admin/*. Named proxy.ts: Next 16 deprecated the middleware file
 * convention.
 *
 * The cookie name is inlined rather than imported from @/lib/auth on purpose.
 * Importing it dragged node:crypto into the Edge Runtime, which does not
 * support it — the build warned, and the whole auth module would have been
 * bundled for the edge for the sake of one string.
 *
 * This only checks that a session cookie is present. The edge cannot reach
 * Postgres, so /admin re-checks the session and the admin flag against the
 * database. That is the real authorisation; this is a cheap early redirect.
 */
const SESSION_COOKIE = "gg_session";

export function proxy(req: NextRequest) {
  if (!req.cookies.get(SESSION_COOKIE)) {
    const url = new URL("/account", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
