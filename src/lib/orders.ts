import { randomBytes } from "node:crypto";
import { designById, platformById } from "@/data/catalog";
import { allProducts } from "@/lib/catalog-db";
import type { PlatformId } from "@/lib/types";
import { variantFor } from "@/lib/shop";
import { db } from "@/lib/db";

export const SHIPPING_CENTS = 495;
export const FREE_SHIPPING_FROM_CENTS = 5000;

export type CartLineInput = {
  slug: string;
  designId?: string | null;
  platformId?: string | null;
  qty: number;
};

export type PricedLine = {
  sku: string;
  slug: string;
  designId: string | null;
  platformId: string | null;
  name: string;
  unitCents: number;
  qty: number;
  lineCents: number;
};

/**
 * Prices a cart from the catalog on the server.
 *
 * The browser sends slugs and quantities and nothing else. It never sends
 * prices — if it did, anyone could post a €0.01 order. Same reason the
 * shipping threshold is applied here rather than trusted from the client.
 */
export async function priceCart(input: CartLineInput[]): Promise<{
  lines: PricedLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}> {
  const lines: PricedLine[] = [];
  const catalogue = await allProducts();

  for (const raw of input) {
    const qty = Math.floor(Number(raw.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) continue;

    const product = catalogue.find((p) => p.slug === raw.slug);
    if (!product) continue;

    const designId = raw.designId && designById(raw.designId) ? raw.designId : product.designs[0];
    const platformId = (
      raw.platformId && platformById(raw.platformId as PlatformId)
        ? raw.platformId
        : product.platforms[0]
    ) as PlatformId;

    const variant = variantFor(product, designId, platformId);
    if (!variant || variant.stock === 0) continue;

    const unitCents = Math.round(product.price * 100);
    lines.push({
      sku: variant.sku,
      slug: product.slug,
      designId,
      platformId,
      name: product.name,
      unitCents,
      qty,
      lineCents: unitCents * qty,
    });
  }

  const subtotalCents = lines.reduce((s, l) => s + l.lineCents, 0);
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;

  return { lines, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export type Customer = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  city: string;
};

export async function createOrder(customer: Customer, priced: Awaited<ReturnType<typeof priceCart>>) {
  const sql = db();
  const token = randomBytes(24).toString("base64url");

  const [order] = (await sql`
    insert into orders (
      token, email, first_name, last_name, address, postcode, city,
      subtotal_cents, shipping_cents, total_cents
    ) values (
      ${token}, ${customer.email}, ${customer.firstName}, ${customer.lastName},
      ${customer.address}, ${customer.postcode}, ${customer.city},
      ${priced.subtotalCents}, ${priced.shippingCents}, ${priced.totalCents}
    )
    returning id, token, number, total_cents
  `) as { id: string; token: string; number: string; total_cents: number }[];

  for (const l of priced.lines) {
    await sql`
      insert into order_lines (order_id, sku, product_slug, design_id, platform_id, name, unit_cents, qty, line_cents)
      values (${order.id}, ${l.sku}, ${l.slug}, ${l.designId}, ${l.platformId}, ${l.name},
              ${l.unitCents}, ${l.qty}, ${l.lineCents})
    `;
  }

  return order;
}

export async function attachPayOrder(orderId: string, payOrderId: string) {
  const sql = db();
  await sql`update orders set pay_order_id = ${payOrderId}, updated_at = now() where id = ${orderId}`;
}

export async function orderByToken(token: string) {
  const sql = db();
  const [order] = (await sql`
    select id, token, number, status, email, total_cents, currency, created_at, paid_at
    from orders where token = ${token} limit 1
  `) as Record<string, unknown>[];
  if (!order) return null;
  const lines = (await sql`
    select name, design_id, platform_id, qty, unit_cents, line_cents
    from order_lines where order_id = ${order.id} order by id
  `) as Record<string, unknown>[];
  return { order, lines };
}
