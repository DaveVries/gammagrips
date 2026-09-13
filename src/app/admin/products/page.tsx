import type { Metadata } from "next";
import { listForAdmin, TEXTURE_CHOICES } from "@/lib/catalog-db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

/**
 * One row per product, editable in place.
 *
 * A card per product looked tidy in isolation and was useless in practice: six
 * screens of scrolling to compare two prices. A table puts every price, every
 * discount and every listed flag in one glance, which is the actual job.
 * Each row is its own form, so saving one product never touches another.
 */
export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rows = await listForAdmin();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-[19px] font-bold">Products</h1>
        <p className="text-[12.5px] text-ink-mute">
          Empty field = use the built-in value. A was-price at or below the price is ignored.
        </p>
      </div>

      {sp.saved && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
          Saved {String(sp.saved)}.
        </p>
      )}
      {sp.error === "noblob" && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2 text-[13px]">
          Photo upload needs the Vercel Blob store. Everything else works without it.
        </p>
      )}
      {(sp.error === "type" || sp.error === "size") && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2 text-[13px]">
          {sp.error === "type" ? "PNG, JPEG, WebP or AVIF only." : "That file is over 8 MB."}
        </p>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-edge">
        <table className="atable min-w-[1080px]">
          <thead>
            <tr>
              <th style={{ width: 34 }}>On</th>
              <th style={{ minWidth: 190 }}>Name</th>
              <th style={{ minWidth: 210 }}>Tagline</th>
              <th style={{ width: 150 }}>Texture</th>
              <th className="num" style={{ width: 96 }}>Price</th>
              <th className="num" style={{ width: 96 }}>Was</th>
              <th className="num" style={{ width: 64 }}>Order</th>
              <th style={{ width: 88 }}>Photos</th>
              <th style={{ width: 70 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ base, merged, override, images }) => (
              <tr key={base.slug} id={base.slug}>
                <td colSpan={9} style={{ padding: 0, borderBottom: "1px solid var(--color-edge)" }}>
                  <form action="/api/admin/products" method="post">
                    <input type="hidden" name="slug" value={base.slug} />
                    <table className="atable" style={{ borderSpacing: 0 }}>
                      <tbody>
                        <tr style={{ borderBottom: "none" }}>
                          <td style={{ width: 34, borderBottom: "none" }}>
                            <input type="checkbox" name="active" defaultChecked={override?.active ?? true}
                              aria-label={`List ${merged.name}`} style={{ width: 16, height: 16 }} />
                          </td>
                          <td style={{ minWidth: 190, borderBottom: "none" }}>
                            <input name="name" defaultValue={override?.name ?? ""} placeholder={base.name} />
                            <span className="mt-0.5 block font-mono text-[10.5px] text-ink-mute">{base.slug}</span>
                          </td>
                          <td style={{ minWidth: 210, borderBottom: "none" }}>
                            <input name="tagline" defaultValue={override?.tagline ?? ""} placeholder={base.tagline} />
                          </td>
                          <td style={{ width: 150, borderBottom: "none" }}>
                            <select name="texture_id" defaultValue={override?.texture_id ?? base.texture}>
                              {TEXTURE_CHOICES.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="num" style={{ width: 96, borderBottom: "none" }}>
                            <input name="price" inputMode="decimal" placeholder={base.price.toFixed(2)}
                              defaultValue={override?.price_cents != null ? (override.price_cents / 100).toFixed(2) : ""} />
                            <span className="mt-0.5 block text-[10.5px] text-ink-mute">{money(merged.price)}</span>
                          </td>
                          <td className="num" style={{ width: 96, borderBottom: "none" }}>
                            <input name="compare_at" inputMode="decimal" placeholder="—"
                              defaultValue={override?.compare_at_cents != null ? (override.compare_at_cents / 100).toFixed(2) : ""} />
                          </td>
                          <td className="num" style={{ width: 64, borderBottom: "none" }}>
                            <input name="sort" type="number" defaultValue={override?.sort ?? 0} />
                          </td>
                          <td style={{ width: 88, borderBottom: "none" }}>
                            <div className="flex flex-wrap gap-1">
                              {images.length === 0 && <span className="text-[11.5px] text-ink-mute">none</span>}
                              {images.map((im) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={im.id} src={im.url} alt={im.alt}
                                  className="h-8 w-10 rounded-[3px] object-cover" />
                              ))}
                            </div>
                          </td>
                          <td className="num" style={{ width: 70, borderBottom: "none" }}>
                            <button type="submit"
                              className="rounded-[var(--radius-xs)] bg-[var(--color-ice)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--color-on-ice)]">
                              Save
                            </button>
                          </td>
                        </tr>
                        <tr className="aform-row">
                          <td colSpan={9} style={{ borderBottom: "none", paddingTop: 4 }}>
                            <label className="block">
                              <span className="label mb-1 block text-ink-mute">Description</span>
                              <textarea name="summary" rows={2} defaultValue={override?.summary ?? ""} placeholder={base.summary}
                                className="w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] p-2 text-[12.5px] leading-relaxed text-ink outline-none focus:border-ink-mute" />
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>

                  {/* Photos: a second form, so uploading never re-submits the row above. */}
                  <div className="flex flex-wrap items-end gap-2 border-t border-[var(--color-edge)] bg-[var(--color-plate-lo)] px-2.5 py-2">
                    {images.map((im) => (
                      <form key={im.id} action="/api/admin/images" method="post" className="relative">
                        <input type="hidden" name="slug" value={base.slug} />
                        <input type="hidden" name="delete_id" value={im.id} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={im.url} alt={im.alt} className="h-12 w-16 rounded-[3px] object-cover" />
                        <button type="submit" aria-label="Remove photo"
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#000]/85 text-[11px] font-bold text-white">
                          ×
                        </button>
                      </form>
                    ))}
                    <form action="/api/admin/images" method="post" encType="multipart/form-data"
                      className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="slug" value={base.slug} />
                      <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif"
                        className="text-[11.5px] text-ink-dim file:mr-2 file:rounded-[3px] file:border-0 file:bg-[var(--color-plate-hi)] file:px-2 file:py-1 file:text-[11px] file:font-bold file:text-ink" />
                      <select name="kind" className="h-8 rounded-[3px] border border-edge bg-[var(--color-plate-lo)] px-1.5 text-[11.5px] text-ink outline-none">
                        <option value="front">front</option><option value="macro">macro</option>
                        <option value="detail">detail</option><option value="lifestyle">lifestyle</option>
                      </select>
                      <input name="alt" placeholder="alt text"
                        className="h-8 w-40 rounded-[3px] border border-edge bg-[var(--color-plate-lo)] px-2 text-[11.5px] text-ink outline-none" />
                      <button type="submit" disabled={!blobReady}
                        className="rounded-[3px] plate px-2.5 py-1.5 text-[11.5px] font-bold text-ink disabled:opacity-40">
                        Upload
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
