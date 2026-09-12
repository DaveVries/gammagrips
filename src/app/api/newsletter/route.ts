import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendNewsletterWelcome } from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Newsletter signup. Posted from the footer form, which previously targeted
 * /newsletter — a page with no POST handler, so it answered 405 and rendered
 * a blank screen.
 *
 * Re-subscribing is a no-op rather than an error: telling a stranger "you are
 * already on this list" leaks who is on it.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().slice(0, 254);

  const back = (status: "ok" | "invalid") =>
    NextResponse.redirect(new URL(`/newsletter?s=${status}`, req.url), 303);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return back("invalid");

  try {
    const sql = db();
    /* RETURNING is empty on conflict, so a re-subscribe sends nothing. */
    const fresh = (await sql`
      insert into subscribers (email, source) values (${email}, 'footer')
      on conflict (email) do nothing
      returning id
    `) as unknown[];
    if (fresh.length > 0) {
      try {
        await sendNewsletterWelcome({ to: email });
      } catch (mailErr) {
        console.error("[newsletter] welcome mail failed", mailErr);
      }
    }
  } catch (err) {
    console.error("[newsletter]", err);
  }
  return back("ok");
}
