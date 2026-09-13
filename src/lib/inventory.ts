import { db } from "@/lib/db";

/**
 * Stock and the shop switch.
 *
 * Stock used to be a hash of the SKU — deterministic filler for the build.
 * It lives in Postgres now so it can be edited, and so the checkout can
 * refuse an order the moment something runs out.
 *
 * `shop_open` is a separate kill switch on purpose: setting every SKU to zero
 * and closing the shop are different intentions, and conflating them means a
 * restock silently reopens the store.
 */

export async function shopOpen(): Promise<boolean> {
  try {
    const rows = (await db()`select value from settings where key = 'shop_open' limit 1`) as {
      value: string;
    }[];
    return rows[0]?.value === "true";
  } catch {
    // If the setting cannot be read, stay closed. Failing open would take
    // orders we cannot fulfil.
    return false;
  }
}

export async function setShopOpen(open: boolean) {
  await db()`
    insert into settings (key, value, updated_at) values ('shop_open', ${open ? "true" : "false"}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

export async function stockMap(): Promise<Map<string, number>> {
  try {
    const rows = (await db()`select sku, qty from stock`) as { sku: string; qty: number }[];
    return new Map(rows.map((r) => [r.sku, Number(r.qty)]));
  } catch {
    return new Map();
  }
}

export async function stockFor(sku: string): Promise<number> {
  try {
    const rows = (await db()`select qty from stock where sku = ${sku} limit 1`) as {
      qty: number;
    }[];
    return Number(rows[0]?.qty ?? 0);
  } catch {
    return 0;
  }
}

export async function setStock(sku: string, qty: number) {
  const n = Math.max(0, Math.floor(qty));
  await db()`
    insert into stock (sku, qty, updated_at) values (${sku}, ${n}, now())
    on conflict (sku) do update set qty = excluded.qty, updated_at = now()
  `;
}

/** Decrements on a paid order. Never below zero, even if two orders race. */
export async function drawDown(lines: { sku: string; qty: number }[]) {
  for (const l of lines) {
    await db()`
      update stock set qty = greatest(0, qty - ${l.qty}), updated_at = now()
       where sku = ${l.sku}
    `;
  }
}
