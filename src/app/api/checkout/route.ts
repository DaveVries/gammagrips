import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { createOrder, priceCart, attachPayOrder, type CartLineInput } from "@/lib/orders";
import { createPayOrder, payConfigured } from "@/lib/pay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const customer = {
    email: str(body.email, 254),
    firstName: str(body.firstName, 80),
    lastName: str(body.lastName, 80),
    address: str(body.address, 200),
    postcode: str(body.postcode, 16),
    city: str(body.city, 80),
  };

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  for (const [k, v] of Object.entries(customer)) {
    if (!v) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? (body.items as CartLineInput[]) : [];
  // Priced from the catalog, server-side. The browser sends slugs and
  // quantities only — a client that could send prices could send its own.
  const priced = priceCart(items);
  if (!priced.lines.length || priced.totalCents <= 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  try {
    const order = await createOrder(customer, priced);

    if (!payConfigured()) {
      // Lets the whole flow be exercised before the ING credentials land.
      return NextResponse.json(
        { orderNumber: order.number, token: order.token, redirectUrl: null, pending: true },
        { status: 201 },
      );
    }

    const pay = await createPayOrder({
      amountCents: priced.totalCents,
      reference: String(order.number),
      description: `GammaGrips order ${order.number}`,
      returnUrl: `${SITE_URL}/order/${order.token}`,
      exchangeUrl: `${SITE_URL}/api/webhooks/pay`,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    });

    await attachPayOrder(order.id, pay.id);

    return NextResponse.json(
      { orderNumber: order.number, token: order.token, redirectUrl: pay.redirectUrl },
      { status: 201 },
    );
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "We could not start the payment. Nothing has been charged." },
      { status: 502 },
    );
  }
}
