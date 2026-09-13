import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { Button, Win } from "@/components/ui/primitives";
import { AdminLogin } from "@/components/admin/admin-login";
import { currentSession } from "@/lib/auth";
import { listForAdmin, TEXTURE_CHOICES } from "@/lib/catalog-db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return <AdminLogin />;

  const rows = await listForAdmin();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <PageShell
      title="Products"
      deck="Price, copy, discount, texture and photos. Designs and SKUs stay in code — this is the commercial side."
      crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Win title="HOW THIS WORKS">
            <div className="space-y-3 p-4 text-[13px] leading-relaxed text-ink-dim">
              <p>
                Leave a field empty to fall back to the built-in value. Nothing
                is lost by clearing it.
              </p>
              <p>
                A <strong>was-price</strong> below or equal to the selling price
                is ignored — that is not a discount.
              </p>
              <p>
                Unticking <strong>Listed</strong> hides a product from the shop
                without deleting anything.
              </p>
            </div>
          </Win>
          <Link
            href="/admin/stock"
            className="plate cut-sm flex h-11 items-center justify-center text-[12px] font-bold uppercase tracking-[0.06em] text-ink"
          >
            Stock
          </Link>
          <Link
            href="/admin"
            className="plate cut-sm flex h-11 items-center justify-center text-[12px] font-bold uppercase tracking-[0.06em] text-ink"
          >
            Orders
          </Link>
        </div>
      }
    >
      {sp.saved && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] p-4 text-[14px]">
          Saved.
        </p>
      )}
      {sp.error === "noblob" && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-edge plate-in p-4 text-[14px] leading-relaxed">
          Photo upload is not configured yet. Add the <strong>Vercel Blob</strong>{" "}
          integration to the project — it sets <code>BLOB_READ_WRITE_TOKEN</code>{" "}
          automatically. Everything else on this page works without it.
        </p>
      )}
      {sp.error === "type" && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-edge plate-in p-4 text-[14px]">
          Only PNG, JPEG, WebP or AVIF.
        </p>
      )}
      {sp.error === "size" && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-edge plate-in p-4 text-[14px]">
          That file is over 8 MB.
        </p>
      )}

      <div className="space-y-4">
        {rows.map(({ base, merged, override, images }) => (
          <section
            key={base.slug}
            id={base.slug}
            className="rounded-[var(--radius-md)] border border-edge glass p-4 sm:p-5"
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-bold">
                {merged.name}
                {merged.hidden && (
                  <span className="ml-2 rounded-full plate-in px-2 py-0.5 text-[11px] font-bold text-ink-mute">
                    hidden
                  </span>
                )}
              </h2>
              <span className="font-mono text-[11.5px] text-ink-mute">{base.slug}</span>
            </div>

            <form action="/api/admin/products" method="post" className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="slug" value={base.slug} />

              <label className="block">
                <span className="mb-1 block text-[12px] font-bold">Name</span>
                <input name="name" defaultValue={override?.name ?? ""} placeholder={base.name}
                  className="h-10 w-full rounded-[var(--radius-sm)] plate-in px-3 text-[14px] text-ink outline-none focus:border-ink"/>
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-bold">Texture</span>
                <select name="texture_id" defaultValue={override?.texture_id ?? base.texture}
                  className="h-10 w-full rounded-[var(--radius-sm)] plate-in px-2 text-[14px] text-ink outline-none focus:border-ink">
                  {TEXTURE_CHOICES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[12px] font-bold">Tagline</span>
                <input name="tagline" defaultValue={override?.tagline ?? ""} placeholder={base.tagline}
                  className="h-10 w-full rounded-[var(--radius-sm)] plate-in px-3 text-[14px] text-ink outline-none focus:border-ink"/>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[12px] font-bold">Description</span>
                <textarea name="summary" rows={3} defaultValue={override?.summary ?? ""} placeholder={base.summary}
                  className="w-full rounded-[var(--radius-sm)] plate-in p-3 text-[14px] leading-relaxed text-ink outline-none focus:border-ink"/>
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-bold">
                  Price <span className="font-normal text-ink-mute">€ · now {money(merged.price)}</span>
                </span>
                <input name="price" inputMode="decimal" defaultValue={override?.price_cents != null ? (override.price_cents / 100).toFixed(2) : ""}
                  placeholder={base.price.toFixed(2)}
                  className="h-10 w-full rounded-[var(--radius-sm)] plate-in px-3 text-[14px] tabular-nums text-ink outline-none focus:border-ink"/>
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-bold">
                  Was-price <span className="font-normal text-ink-mute">€ · shows a discount</span>
                </span>
                <input name="compare_at" inputMode="decimal"
                  defaultValue={override?.compare_at_cents != null ? (override.compare_at_cents / 100).toFixed(2) : ""}
                  placeholder="—"
                  className="h-10 w-full rounded-[var(--radius-sm)] plate-in px-3 text-[14px] tabular-nums text-ink outline-none focus:border-ink"/>
              </label>

              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <label className="tap flex items-center gap-2 text-[13.5px]">
                  <input type="checkbox" name="active" defaultChecked={override?.active ?? true} className="h-4 w-4"/>
                  Listed in the shop
                </label>
                <label className="flex items-center gap-2 text-[13.5px]">
                  Order
                  <input name="sort" type="number" defaultValue={override?.sort ?? 0}
                    className="h-9 w-16 rounded-[var(--radius-sm)] plate-in px-2 text-right text-[13px] tabular-nums text-ink outline-none"/>
                </label>
                <Button type="submit" variant="primary" className="ml-auto">Save</Button>
              </div>
            </form>

            {/* --- photos ------------------------------------------------- */}
            <div className="mt-5 border-t border-[var(--color-plate-edge)] pt-4">
              <p className="label mb-3 text-ink-mute">Photos</p>

              {images.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {images.map((im) => (
                    <li key={im.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.url} alt={im.alt} className="h-24 w-32 rounded-[var(--radius-sm)] object-cover"/>
                      <form action="/api/admin/images" method="post">
                        <input type="hidden" name="slug" value={base.slug}/>
                        <input type="hidden" name="delete_id" value={im.id}/>
                        <button type="submit"
                          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#000]/80 text-[13px] font-bold text-white"
                          aria-label="Remove photo">×</button>
                      </form>
                      <span className="label mt-1 block text-ink-mute">{im.kind}</span>
                    </li>
                  ))}
                </ul>
              )}

              <form action="/api/admin/images" method="post" encType="multipart/form-data"
                className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="slug" value={base.slug}/>
                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold">File</span>
                  <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif"
                    className="text-[12.5px] text-ink-dim file:mr-2 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-plate-hi)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-ink"/>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold">Kind</span>
                  <select name="kind" className="h-9 rounded-[var(--radius-sm)] plate-in px-2 text-[13px] text-ink outline-none">
                    <option value="front">front</option><option value="macro">macro</option>
                    <option value="detail">detail</option><option value="lifestyle">lifestyle</option>
                  </select>
                </label>
                <label className="block min-w-[10rem] flex-1">
                  <span className="mb-1 block text-[12px] font-bold">Alt text</span>
                  <input name="alt" placeholder="What the photo shows"
                    className="h-9 w-full rounded-[var(--radius-sm)] plate-in px-3 text-[13px] text-ink outline-none"/>
                </label>
                <Button type="submit" variant="default" disabled={!blobReady}>Upload</Button>
              </form>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
