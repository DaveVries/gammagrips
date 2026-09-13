import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listForAdmin, TEXTURE_CHOICES } from "@/lib/catalog-db";
import { PLATFORMS } from "@/data/catalog";
import { stockMap } from "@/lib/inventory";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product", robots: { index: false, follow: false } };

const field = "h-10 w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 text-[13.5px] text-ink outline-none focus:border-ink-mute";
const lbl = "mb-1.5 block text-[12px] font-bold";

export default async function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [rows, stock] = await Promise.all([listForAdmin(), stockMap()]);
  const row = rows.find((r) => r.base.slug === slug);
  if (!row) notFound();

  const { base, merged, override, images } = row;
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const custom = Boolean(override?.is_custom);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="text-[13px] text-ps-blue hover:underline">← Products</Link>
        <h1 className="text-[19px] font-bold">{merged.name}</h1>
        <span className="font-mono text-[11.5px] text-ink-mute">{base.slug}</span>
        <span className="ml-auto text-[12px] text-ink-mute">
          {custom ? "created in the dashboard" : "defined in code — fields here override it"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <form action="/api/admin/products" method="post" className="lg:col-span-2">
          <input type="hidden" name="slug" value={base.slug} />
          <div className="space-y-4 rounded-[var(--radius-sm)] border border-edge plate-in p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={lbl}>Name</span>
                <input name="name" className={field} defaultValue={override?.name ?? ""} placeholder={base.name} />
              </label>
              <label className="block sm:col-span-2">
                <span className={lbl}>Tagline</span>
                <input name="tagline" className={field} defaultValue={override?.tagline ?? ""} placeholder={base.tagline} />
              </label>
              <label className="block sm:col-span-2">
                <span className={lbl}>Description</span>
                <textarea name="summary" rows={4} defaultValue={override?.summary ?? ""} placeholder={base.summary}
                  className="w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] p-3 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink-mute" />
              </label>

              <label className="block">
                <span className={lbl}>Price €</span>
                <input name="price" inputMode="decimal" className={field} placeholder={base.price.toFixed(2)}
                  defaultValue={override?.price_cents != null ? (override.price_cents / 100).toFixed(2) : ""} />
                <span className="mt-1 block text-[11.5px] text-ink-mute">Now {money(merged.price)}</span>
              </label>
              <label className="block">
                <span className={lbl}>Was-price €</span>
                <input name="compare_at" inputMode="decimal" className={field} placeholder="—"
                  defaultValue={override?.compare_at_cents != null ? (override.compare_at_cents / 100).toFixed(2) : ""} />
                <span className="mt-1 block text-[11.5px] text-ink-mute">
                  Shown struck through. Ignored if it is not above the price.
                </span>
              </label>

              <label className="block">
                <span className={lbl}>Texture</span>
                <select name="texture_id" className={field} defaultValue={override?.texture_id ?? base.texture ?? ""}>
                  {TEXTURE_CHOICES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={lbl}>Sort order</span>
                <input name="sort" type="number" className={field} defaultValue={override?.sort ?? 0} />
              </label>

              <label className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={override?.active ?? true} className="h-4 w-4" />
                Listed in the shop
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-edge pt-4">
              <button type="submit"
                className="rounded-[var(--radius-sm)] bg-[var(--color-ice)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]">
                Save changes
              </button>
              <Link href={`/products/${base.slug}`} className="text-[13px] text-ps-blue hover:underline">
                View on the shop →
              </Link>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-edge plate-in p-4">
            <p className="label mb-3 text-ink-mute">Photos</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {images.length === 0 && <p className="text-[12.5px] text-ink-mute">None yet.</p>}
              {images.map((im) => (
                <form key={im.id} action="/api/admin/images" method="post" className="relative">
                  <input type="hidden" name="slug" value={base.slug} />
                  <input type="hidden" name="delete_id" value={im.id} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={im.alt} className="h-16 w-20 rounded-[3px] object-cover" />
                  <button type="submit" aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#000]/85 text-[11px] font-bold text-white">×</button>
                </form>
              ))}
            </div>
            <form action="/api/admin/images" method="post" encType="multipart/form-data" className="space-y-2">
              <input type="hidden" name="slug" value={base.slug} />
              <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif"
                className="w-full text-[12px] text-ink-dim file:mr-2 file:rounded-[3px] file:border-0 file:bg-[var(--color-plate-hi)] file:px-2.5 file:py-1.5 file:text-[11.5px] file:font-bold file:text-ink" />
              <div className="flex gap-2">
                <select name="kind" className="h-9 flex-1 rounded-[3px] border border-edge bg-[var(--color-plate-lo)] px-2 text-[12px] text-ink outline-none">
                  <option value="front">front</option><option value="macro">macro</option>
                  <option value="detail">detail</option><option value="lifestyle">lifestyle</option>
                </select>
                <button type="submit" disabled={!blobReady}
                  className="rounded-[3px] plate px-3 text-[12px] font-bold text-ink disabled:opacity-40">Upload</button>
              </div>
              <input name="alt" placeholder="Alt text — what the photo shows"
                className="h-9 w-full rounded-[3px] border border-edge bg-[var(--color-plate-lo)] px-2 text-[12px] text-ink outline-none" />
              {!blobReady && <p className="text-[11.5px] text-ink-mute">Blob store not configured.</p>}
            </form>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-edge plate-in p-4">
            <p className="label mb-3 text-ink-mute">Stock</p>
            <ul className="space-y-1.5 text-[13px]">
              {base.variants.map((v) => (
                <li key={v.sku} className="flex items-baseline justify-between gap-3">
                  <span className="text-ink-dim">
                    {PLATFORMS.find((p) => p.id === v.platformId)?.short ?? v.platformId}
                  </span>
                  <span className="font-bold tabular-nums">{stock.get(v.sku) ?? 0}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/stock" className="mt-3 block text-[12.5px] text-ps-blue hover:underline">
              Edit stock →
            </Link>
          </div>

          {custom && (
            <form action="/api/admin/products/delete" method="post"
              className="rounded-[var(--radius-sm)] border border-edge plate-in p-4">
              <input type="hidden" name="slug" value={base.slug} />
              <p className="mb-3 text-[12.5px] leading-relaxed text-ink-mute">
                Only products created here can be deleted. Ones defined in code
                can be hidden instead.
              </p>
              <button type="submit"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hot)]/50 px-3 py-2 text-[12px] font-bold text-[var(--color-hot-text)]">
                Delete product
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
