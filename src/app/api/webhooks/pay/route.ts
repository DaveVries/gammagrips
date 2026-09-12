import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeSecret, mapStatus } from "@/lib/pay";
import { sendOrderConfirmation } from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pay.nl exchange endpoint — the only thing that may mark an order paid.
 *
 * The shopper's redirect back from the bank is not proof of payment: it can be
 * closed, replayed, or typed by hand. This callback is server-to-server and is
 * the source of truth.
 *
 * Pay.nl retries unless the response is exactly {"result": true} with HTTP 200,
 * so failures here must return non-200 to earn a retry — and successes must
 * return the magic body even when there is nothing to do.
 */
/**
 * Verifies the HMAC in the `signature` header against the raw body.
 *
 * Must run on the raw text, before any parse: JSON.parse followed by
 * re-stringify can reorder keys, and the signature is over the exact bytes
 * Pay.nl sent. Compared in constant time so the check cannot be probed by
 * timing it.
 */
function verifySignature(raw: string, req: Request): boolean {
  const secret = exchangeSecret();
  if (!secret) return false;

  const provided = req.headers.get("signature");
  if (!provided) return false;

  const algo = (req.headers.get("signature-algorithm") ?? "SHA256").toLowerCase();
  const digest = algo.includes("512") ? "sha512" : "sha256";

  const expected = createHmac(digest, secret).update(raw, "utf8").digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided.trim().toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();

  /* Signed exchanges are the only ones accepted. Without this anyone who
     guesses the URL can mark an order paid, which is the whole risk this
     endpoint carries. Rejected with 401 rather than a retry-worthy 500 —
     a bad signature will not get better on the third attempt. */
  if (!verifySignature(raw, req)) {
    console.error("[pay-webhook] rejected: signature invalid or missing");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    payload = Object.fromEntries(new URLSearchParams(raw).entries());
  }

  const order = (payload.order ?? {}) as Record<string, unknown>;
  const statusObj = (order.status ?? payload.status ?? {}) as Record<string, unknown>;

  const payOrderId = String(order.orderId ?? order.id ?? payload.orderId ?? payload.order_id ?? "");
  const code = Number(statusObj.code ?? payload.statusCode ?? NaN);
  const name = String(statusObj.name ?? payload.statusName ?? "");

  if (!payOrderId) {
    console.error("[pay-webhook] no order id in payload", payload);
    return NextResponse.json({ error: "missing order id" }, { status: 400 });
  }

  try {
    const sql = db();

    // Idempotency: a repeat delivery of the same (order, status) is recorded
    // once. Pay.nl retries aggressively, and paying an order twice is worse
    // than missing a retry.
    const inserted = (await sql`
      insert into payment_events (pay_order_id, status_code, status_name, payload)
      values (${payOrderId}, ${Number.isFinite(code) ? code : null}, ${name}, ${JSON.stringify(payload)}::jsonb)
      on conflict (pay_order_id, status_code) do nothing
      returning id
    `) as { id: string }[];

    if (inserted.length === 0) {
      return NextResponse.json({ result: true, note: "duplicate" });
    }

    const status = mapStatus(Number.isFinite(code) ? code : undefined);

    /* `paid_at is null` in the WHERE is what makes the mail send once: a
       later exchange for the same order updates the row but returns nothing,
       so a retry or a follow-up status cannot trigger a second confirmation. */
    const justPaid = (await sql`
      update orders
         set status = ${status},
             pay_status_code = ${Number.isFinite(code) ? code : null},
             paid_at = case when ${status} = 'paid' and paid_at is null then now() else paid_at end,
             updated_at = now()
       where pay_order_id = ${payOrderId}
         and ${status} = 'paid'
         and paid_at is null
      returning id, token, number, email, first_name, subtotal_cents, shipping_cents, total_cents
    `) as Record<string, string | number>[];

    if (justPaid.length === 0 && status !== "paid") {
      await sql`
        update orders
           set status = ${status},
               pay_status_code = ${Number.isFinite(code) ? code : null},
               updated_at = now()
         where pay_order_id = ${payOrderId}
      `;
    }

    if (justPaid.length > 0) {
      const o = justPaid[0];
      const lines = (await sql`
        select name, qty, line_cents from order_lines where order_id = ${o.id} order by id
      `) as { name: string; qty: number; line_cents: number }[];

      /* A mail failure must never fail the webhook: Pay.nl would retry, and
         the order is already paid. Log it and still acknowledge. */
      try {
        await sendOrderConfirmation({
          to: String(o.email),
          firstName: String(o.first_name),
          orderNumber: o.number,
          token: String(o.token),
          lines,
          subtotalCents: Number(o.subtotal_cents),
          shippingCents: Number(o.shipping_cents),
          totalCents: Number(o.total_cents),
        });
      } catch (mailErr) {
        console.error("[pay-webhook] confirmation mail failed", mailErr);
      }
    }

    return NextResponse.json({ result: true });
  } catch (err) {
    // Non-200 so Pay.nl retries rather than considering this delivered.
    console.error("[pay-webhook]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
