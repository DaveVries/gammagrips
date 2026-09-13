import type { Metadata } from "next";
import { PRODUCTS, designById, platformById } from "@/data/catalog";
import { stockMap } from "@/lib/inventory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stock", robots: { index: false, follow: false } };

export default async function AdminStock({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const stock = await stockMap();

  /* Every sellable combination comes from the catalogue, not the stock table —
     a SKU that has never had a row still needs a field to type into. */
  const rows = PRODUCTS.flatMap((p) =>
    p.variants.map((v) => ({
      sku: v.sku,
      product: p.name,
      design: designById(v.designId)?.name ?? v.designId,
      platform: platformById(v.platformId)?.short ?? v.platformId,
      qty: stock.get(v.sku) ?? 0,
    })),
  );
  const total = rows.reduce((s, r) => s + r.qty, 0);
  const out = rows.filter((r) => r.qty === 0).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-[19px] font-bold">Stock</h1>
        <p className="text-[12.5px] text-ink-mute">
          {rows.length} SKUs · {total} units · {out} at zero. Stock drops when a
          payment lands, not when something is added to a cart.
        </p>
      </div>

      {sp.saved && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
          Stock saved.
        </p>
      )}

      <form action="/api/admin/stock" method="post">
        <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-edge">
          <table className="atable min-w-[560px]">
            <thead>
              <tr>
                <th>Grip</th><th>Controller</th><th>SKU</th>
                <th className="num" style={{ width: 110 }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku}>
                  <td className="font-bold">{r.product}</td>
                  <td className="text-ink-dim">{r.platform}</td>
                  <td className="font-mono text-[11.5px] text-ink-mute">{r.sku}</td>
                  <td className="num" style={{ width: 110 }}>
                    <label className="sr-only" htmlFor={`q-${r.sku}`}>
                      Stock for {r.product} {r.platform}
                    </label>
                    <input id={`q-${r.sku}`} name={`qty:${r.sku}`} type="number" min={0} step={1}
                      inputMode="numeric" defaultValue={r.qty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit"
          className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-ice)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]">
          Save stock
        </button>
      </form>
    </>
  );
}
