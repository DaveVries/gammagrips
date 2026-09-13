import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { Button, Win } from "@/components/ui/primitives";
import { currentSession } from "@/lib/auth";
import { PRODUCTS, designById, platformById } from "@/data/catalog";
import { stockMap } from "@/lib/inventory";
import { AdminLogin } from "@/components/admin/admin-login";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stock", robots: { index: false, follow: false } };

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return <AdminLogin />;

  const stock = await stockMap();

  /* Every sellable combination, from the catalogue rather than the database —
     a SKU that has never had a stock row still needs a field to type into. */
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

  return (
    <PageShell
      title="Stock"
      deck={`${rows.length} sellable combinations · ${total} units in total.`}
      crumbs={[{ label: "Admin", href: "/admin" }, { label: "Stock" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Win title="HOW THIS WORKS">
            <div className="space-y-3 p-4 text-[13px] leading-relaxed text-ink-dim">
              <p>
                A grip is sold per controller, so each design has one row per
                mould. Zero means the checkout refuses it.
              </p>
              <p>
                Stock drops automatically when a payment lands, not when
                something is added to a cart.
              </p>
            </div>
          </Win>
          <Link
            href="/admin"
            className="plate cut-sm flex h-11 items-center justify-center text-[12px] font-bold uppercase tracking-[0.06em] text-ink"
          >
            Back to orders
          </Link>
        </div>
      }
    >
      {sp.saved && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] p-4 text-[14px]">
          Stock saved.
        </p>
      )}

      <form action="/api/admin/stock" method="post">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13.5px]">
            <thead>
              <tr className="border-b border-[var(--color-plate-edge)] text-left">
                <th className="label py-2 text-ink-mute">Grip</th>
                <th className="label py-2 text-ink-mute">Controller</th>
                <th className="label py-2 text-ink-mute">SKU</th>
                <th className="label py-2 text-right text-ink-mute">Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku} className="border-b border-[var(--color-edge)]">
                  <td className="py-2 font-bold">{r.product}</td>
                  <td className="py-2 text-ink-dim">{r.platform}</td>
                  <td className="py-2 font-mono text-[11.5px] text-ink-mute">{r.sku}</td>
                  <td className="py-2 text-right">
                    <label className="sr-only" htmlFor={`qty-${r.sku}`}>
                      Stock for {r.product} {r.platform}
                    </label>
                    <input
                      id={`qty-${r.sku}`}
                      name={`qty:${r.sku}`}
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={r.qty}
                      inputMode="numeric"
                      className="h-10 w-20 rounded-[var(--radius-sm)] plate-in px-2 text-right text-[14px] tabular-nums text-ink outline-none focus:border-ink"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="submit" variant="primary" className="mt-6">
          Save stock
        </Button>
      </form>
    </PageShell>
  );
}
