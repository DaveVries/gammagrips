import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { createLoginToken } from "@/lib/auth";
import { sendLoginLink } from "@/lib/emails";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase().slice(0, 254);

  /* Return the visitor to the page they signed in from. Only same-site paths
     are honoured — taking an absolute URL here would turn the login form into
     an open redirect. */
  const raw = String(form?.get("next") ?? "");
  const next = /^\/[A-Za-z0-9/_-]*$/.test(raw) ? raw : "/account";
  const done = () => NextResponse.redirect(new URL(`${next}?sent=1`, req.url), 303);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.redirect(new URL(`${next}?error=email`, req.url), 303);
  }

  try {
    const sql = db();
    /* Only send to an address that has actually ordered, or an admin. But the
       response is identical either way — "check your inbox" regardless — so
       this cannot be used to find out who has ordered here. */
    const known = (await sql`
      select 1 from orders where lower(email) = ${email} limit 1
    `) as unknown[];
    const isAdmin = (process.env.ADMIN_EMAILS ?? "").toLowerCase().includes(email);

    if (known.length > 0 || isAdmin) {
      const { raw } = await createLoginToken(email);
      const url = `${SITE_URL}/api/auth/callback?token=${encodeURIComponent(raw)}`;
      await sendLoginLink({ to: email, url, isAdmin });
    }
  } catch (err) {
    console.error("[auth/login]", err);
  }

  return done();
}
