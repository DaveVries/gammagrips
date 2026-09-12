import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapStatus } from "@/lib/pay";

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
export async function POST(req: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    const form = await req.formData().catch(() => null);
    if (form) payload = Object.fromEntries(form.entries());
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

    await sql`
      update orders
         set status = ${status},
             pay_status_code = ${Number.isFinite(code) ? code : null},
             paid_at = case when ${status} = 'paid' and paid_at is null then now() else paid_at end,
             updated_at = now()
       where pay_order_id = ${payOrderId}
    `;

    return NextResponse.json({ result: true });
  } catch (err) {
    // Non-200 so Pay.nl retries rather than considering this delivered.
    console.error("[pay-webhook]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
