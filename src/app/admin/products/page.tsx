import type { Metadata } from "next";
import Link from "next/link";
import { listForAdmin } from "@/lib/catalog-db";
import { stockMap } from "@/lib/inventory";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

/**
 * A list, not an editor.
 *
 * The previous version put every product's form on one page — six forms open
 * at once, which is neither a list nor an edit screen. List and detail are
 * separate for the same reason every catalogue tool separates them: scanning
 * and editing are different jobs.
 */
export default async function ProductList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [rows, stock] = await Promise.all([listForAdmin(), stockMap()]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-[19px] font-bold">Products</h1>
        <span className="text-[12.5px] text-ink-mute">{rows.length} products</span>
        <Link
          href="/admin/products/new"
          className="ml-auto rounded-[var(--radius-sm)] bg-[var(--color-ice)] px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]"
        >
          + New product
        </Link>
      </div>

      {sp.saved && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
          Saved.
        </p>
      )}
      {sp.deleted && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2 text-[13px]">
          Product deleted.
        </p>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-edge">
        <table className="atable min-w-[720px]">
          <thead>
            <tr>
              <th style={{ width: 52 }}></th>
              <th>Product</th>
              <th style={{ width: 96 }}>Status</th>
              <th style={{ width: 110 }}>Source</th>
              <th className="num" style={{ width: 96 }}>Price</th>
              <th className="num" style={{ width: 80 }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ base, merged, override, images }) => {
              const qty = base.variants.reduce((s, v) => s + (stock.get(v.sku) ?? 0), 0);
              const discounted = merged.compareAt && merged.compareAt > merged.price;
              return (
                <tr key={base.slug}>
                  <td>
                    {images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[0].url} alt="" className="h-9 w-11 rounded-[3px] object-cover" />
                    ) : (
                      <div className="h-9 w-11 rounded-[3px] border border-edge plate-in" />
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/products/${base.slug}`} className="font-bold hover:underline">
                      {merged.name}
                    </Link>
                    <span className="mt-0.5 block font-mono text-[10.5px] text-ink-mute">{base.slug}</span>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        merged.hidden ? "plate-in text-ink-mute" : "bg-[var(--color-hot)] text-[var(--color-hot-ink)]"
                      }`}
                    >
                      {merged.hidden ? "hidden" : "listed"}
                    </span>
                  </td>
                  <td className="text-[12px] text-ink-mute">
                    {override?.is_custom ? "created here" : "in code"}
                  </td>
                  <td className="num">
                    <span className="font-bold">{money(merged.price)}</span>
                    {discounted && (
                      <span className="ml-1.5 text-[11.5px] text-ink-mute line-through">
                        {money(merged.compareAt!)}
                      </span>
                    )}
                  </td>
                  <td className={`num font-bold ${qty === 0 ? "text-ink-mute" : ""}`}>{qty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
