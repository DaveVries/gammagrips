import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { createLoginToken } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase().slice(0, 254);

  const done = () => NextResponse.redirect(new URL("/account?sent=1", req.url), 303);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.redirect(new URL("/account?error=email", req.url), 303);
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
      await sendMail({
        to: email,
        subject: "Je inloglink voor GammaGrips",
        text: `Klik om in te loggen (15 minuten geldig, eenmalig bruikbaar):\n\n${url}\n\nNiet aangevraagd? Dan kun je deze mail negeren.`,
        html:
          `<p>Klik om in te loggen. De link is 15 minuten geldig en werkt één keer.</p>` +
          `<p><a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:700;">Inloggen</a></p>` +
          `<p style="font-size:12px;color:#666;word-break:break-all;">Of plak deze link: ${url}</p>` +
          `<p style="font-size:12px;color:#666;">Niet aangevraagd? Dan kun je deze mail negeren.</p>`,
      });
    }
  } catch (err) {
    console.error("[auth/login]", err);
  }

  return done();
}
