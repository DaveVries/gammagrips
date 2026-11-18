import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { COUNTRIES, PARTNERS_TITLE, countryName, displayHost, type Partner } from "@/lib/partners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partners", robots: { index: false, follow: false } };

const field = "h-10 w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 text-[13.5px] text-ink outline-none focus:border-ink-mute";
const lbl = "mb-1.5 block text-[12px] font-bold";
const btn = "rounded-[var(--radius-sm)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em]";

const ERRORS: Record<string, string> = {
  missing: "A partner needs at least a name and a city.",
  type: "Logo must be a PNG, JPG, WebP or SVG.",
  size: "Logo is too large — keep it under 4 MB.",
  noblob: "Image storage isn't configured (BLOB_READ_WRITE_TOKEN), so the logo wasn't saved.",
  failed: "Something went wrong saving that. Try again.",
};

export default async function AdminPartners({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const partners = (await db()`
    select id, name, address, postcode, city, country, website, note, logo_url, active, sort
      from partners order by active desc, country, city, sort, name
  `) as Partner[];
  const live = partners.filter((p) => p.active).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-[19px] font-bold">Partners</h1>
        <p className="text-[12.5px] text-ink-mute">
          Shops that stock GammaGrips. {live} shown on{" "}
          <Link href="/partners" className="text-ps-blue hover:underline">{PARTNERS_TITLE}</Link>
          {partners.length > live && `, ${partners.length - live} hidden`}.
        </p>
      </div>

      {(sp.created || sp.saved || sp.deleted) && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
          {sp.created ? "Partner added." : sp.deleted ? "Partner deleted." : "Saved."}
        </p>
      )}
      {typeof sp.error === "string" && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/50 px-3 py-2 text-[13px]">
          {ERRORS[sp.error] ?? ERRORS.failed}
        </p>
      )}

      <details className="mb-4 rounded-[var(--radius-sm)] border border-edge plate-in" open={partners.length === 0}>
        <summary className="cursor-pointer select-none px-4 py-3 text-[13.5px] font-bold">+ Add partner</summary>
        <div className="px-4 pb-4">
          <PartnerForm />
        </div>
      </details>

      {partners.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] border border-edge plate-in p-5 text-[14px] text-ink-dim">
          No partners yet. The public page shows a &ldquo;coming soon&rdquo; note until you add one.
        </p>
      ) : (
        <ul className="space-y-2">
          {partners.map((p) => (
            <li key={p.id} id={`p${p.id}`} className="rounded-[var(--radius-sm)] border border-edge plate-in">
              <div className="flex items-center gap-3 px-3 py-3">
                <Logo p={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[14px] font-bold ${p.active ? "" : "text-ink-mute"}`}>{p.name}</span>
                    {!p.active && (
                      <span className="rounded-full plate px-2 py-0.5 text-[10.5px] font-bold text-ink-mute">hidden</span>
                    )}
                  </div>
                  <div className="truncate text-[12.5px] text-ink-dim">
                    {[p.address, [p.postcode, p.city].filter(Boolean).join(" "), countryName(p.country)]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {p.website && <div className="truncate text-[12px] text-ink-mute">{displayHost(p.website)}</div>}
                </div>
                <form action="/api/admin/partners" method="post">
                  <input type="hidden" name="action" value="toggle" />
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="rounded-full plate px-3 py-1.5 text-[11.5px] font-bold text-ink-dim hover:text-ink">
                    {p.active ? "Hide" : "Show"}
                  </button>
                </form>
              </div>
              <details className="border-t border-[var(--color-plate-edge)]">
                <summary className="cursor-pointer select-none px-3 py-2 text-[12.5px] font-bold text-ink-dim">Edit</summary>
                <div className="px-3 pb-3">
                  <PartnerForm p={p} />
                  <details className="mt-3 text-right">
                    <summary className="cursor-pointer list-none text-[12px] text-ink-mute underline hover:text-ink">
                      Delete partner
                    </summary>
                    <form action="/api/admin/partners" method="post" className="mt-2">
                      <input type="hidden" name="action" value="delete" />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className={`${btn} border border-[var(--color-hot)]/60 text-ink`}>
                        Delete {p.name} for good
                      </button>
                    </form>
                  </details>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Logo({ p }: { p: Partner }) {
  return p.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote blob, small, admin only
    <img src={p.logo_url} alt="" className="h-11 w-11 shrink-0 rounded-[var(--radius-xs)] bg-white object-contain p-1" />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-xs)] plate text-[15px] font-bold text-ink-mute">
      {p.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function PartnerForm({ p }: { p?: Partner }) {
  return (
    <form action="/api/admin/partners" method="post" encType="multipart/form-data" className="grid gap-3 sm:grid-cols-6">
      <input type="hidden" name="action" value={p ? "edit" : "create"} />
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className="block sm:col-span-6">
        <span className={lbl}>Shop name</span>
        <input name="name" required maxLength={120} defaultValue={p?.name} className={field} placeholder="Game Mania Amsterdam" />
      </label>
      <label className="block sm:col-span-4">
        <span className={lbl}>Street and number</span>
        <input name="address" maxLength={160} defaultValue={p?.address} className={field} placeholder="Kalverstraat 1" />
      </label>
      <label className="block sm:col-span-2">
        <span className={lbl}>Postcode</span>
        <input name="postcode" maxLength={16} defaultValue={p?.postcode} className={field} placeholder="1012 AB" />
      </label>
      <label className="block sm:col-span-3">
        <span className={lbl}>City</span>
        <input name="city" required maxLength={80} defaultValue={p?.city} className={field} placeholder="Amsterdam" />
      </label>
      <label className="block sm:col-span-3">
        <span className={lbl}>Country</span>
        <select name="country" defaultValue={p?.country ?? "NL"} className={field}>
          {Object.entries(COUNTRIES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-4">
        <span className={lbl}>Website <span className="font-normal text-ink-mute">(optional)</span></span>
        <input name="website" maxLength={300} defaultValue={p?.website} className={field} placeholder="gamemania.nl" />
      </label>
      <label className="block sm:col-span-2">
        <span className={lbl}>Order <span className="font-normal text-ink-mute">(lower first)</span></span>
        <input name="sort" type="number" defaultValue={p?.sort ?? 0} className={field} />
      </label>
      <label className="block sm:col-span-6">
        <span className={lbl}>Short note <span className="font-normal text-ink-mute">(optional, shown on the site)</span></span>
        <input name="note" maxLength={200} defaultValue={p?.note} className={field} placeholder="Full range in store · try them on a demo controller" />
      </label>
      <label className="block sm:col-span-4">
        <span className={lbl}>Logo <span className="font-normal text-ink-mute">(optional · PNG, JPG, WebP or SVG)</span></span>
        <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="block w-full text-[12.5px] text-ink-dim file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-plate-hi)] file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-ink" />
      </label>
      {p?.logo_url && (
        <label className="flex items-end gap-2 pb-2 text-[12.5px] text-ink-dim sm:col-span-2">
          <input type="checkbox" name="remove_logo" value="1" /> Remove current logo
        </label>
      )}
      <div className="sm:col-span-6">
        <button type="submit" className={`${btn} bg-[var(--color-ice)] text-[var(--color-on-ice)]`}>
          {p ? "Save changes" : "Add partner"}
        </button>
      </div>
    </form>
  );
}
