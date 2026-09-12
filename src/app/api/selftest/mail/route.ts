import { NextResponse } from "next/server";
import { mailConfigured, sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY. Verifies SMTP in isolation so a failed end-to-end payment test
 * cannot be blamed on the mail layer. Delete once the real flow is proven.
 *
 * Note for future me: this first lived at api/_selftest/, which never routed —
 * a leading underscore marks a private folder in the App Router and excludes
 * it from routing entirely. It returned the 404 page, not an error.
 *
 * Two limits keep it from being an open relay: it only ever sends to the
 * configured mailbox itself, and it needs a key that exists only in this file.
 */
const KEY = "f818fd37125d4c1cd8";

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== KEY) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!mailConfigured()) {
    return NextResponse.json({ ok: false, reason: "SMTP_USER / SMTP_PASS not set" }, { status: 503 });
  }
  const to = process.env.SMTP_USER!;
  try {
    const r = await sendMail({
      to,
      subject: "GammaGrips SMTP self-test",
      text: "If you are reading this, TransIP SMTP works from production.",
      html: "<p>If you are reading this, TransIP SMTP works from production.</p>",
    });
    return NextResponse.json({ ok: true, to, ...r });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
