import type { Metadata } from "next";
import Link from "next/link";
import { TEXTURE_CHOICES } from "@/lib/catalog-db";
import { PLATFORMS } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New product", robots: { index: false, follow: false } };

const field = "h-10 w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 text-[13.5px] text-ink outline-none focus:border-ink-mute";
const lbl = "mb-1.5 block text-[12px] font-bold";

export default async function NewProduct({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="text-[13px] text-ps-blue hover:underline">← Products</Link>
        <h1 className="text-[19px] font-bold">New product</h1>
      </div>

      {sp.error === "slug" && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2 text-[13px]">
          That handle is already taken, or it is not a valid handle.
        </p>
      )}
      {sp.error === "fields" && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2 text-[13px]">
          A name, a handle and a price are required.
        </p>
      )}

      <form action="/api/admin/products/create" method="post" className="max-w-2xl">
        <div className="space-y-4 rounded-[var(--radius-sm)] border border-edge plate-in p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={lbl}>Name</span>
              <input name="name" required className={field} placeholder="Nebula Grips" />
            </label>

            <label className="block sm:col-span-2">
              <span className={lbl}>Handle</span>
              <input name="slug" required pattern="[a-z0-9-]+" className={field} placeholder="nebula-grips" />
              <span className="mt-1 block text-[11.5px] text-ink-mute">
                Lower case, dashes only. This becomes the URL and cannot be changed later —
                it is what orders and stock reference.
              </span>
            </label>

            <label className="block sm:col-span-2">
              <span className={lbl}>Tagline</span>
              <input name="tagline" className={field} placeholder="One concrete benefit, no slogans" />
            </label>

            <label className="block sm:col-span-2">
              <span className={lbl}>Description</span>
              <textarea name="summary" rows={4}
                className="w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] p-3 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink-mute" />
            </label>

            <label className="block">
              <span className={lbl}>Price €</span>
              <input name="price" required inputMode="decimal" className={field} placeholder="34.95" />
            </label>
            <label className="block">
              <span className={lbl}>Was-price €</span>
              <input name="compare_at" inputMode="decimal" className={field} placeholder="optional" />
            </label>

            <label className="block sm:col-span-2">
              <span className={lbl}>Texture</span>
              <select name="texture_id" className={field} defaultValue="open-cell">
                {TEXTURE_CHOICES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <span className="mt-1 block text-[11.5px] text-ink-mute">
                Drives the grip and cushion figures shown on the product page.
              </span>
            </label>

            <fieldset className="sm:col-span-2">
              <legend className={lbl}>Fits which controllers</legend>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" name="platforms" value={p.id}
                      defaultChecked={p.id === "dualsense"} className="h-4 w-4" />
                    {p.short}
                  </label>
                ))}
              </div>
              <span className="mt-1.5 block text-[11.5px] text-ink-mute">
                One SKU is created per controller, so each can be stocked separately.
              </span>
            </fieldset>

            <label className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
              <input type="checkbox" name="active" className="h-4 w-4" />
              List it in the shop straight away
            </label>
          </div>

          <div className="border-t border-edge pt-4">
            <button type="submit"
              className="rounded-[var(--radius-sm)] bg-[var(--color-ice)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]">
              Create product
            </button>
            <p className="mt-2 text-[11.5px] text-ink-mute">
              You add photos and stock on the next screen.
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
