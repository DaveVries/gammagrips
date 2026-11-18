import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Win } from "@/components/ui/primitives";
import { PARTNERS_TITLE, activePartners, countryName, displayHost, mapsUrl, type Partner } from "@/lib/partners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/partners" },
  title: `${PARTNERS_TITLE} — GammaGrips in store`,
  description: "The shops where you can see, feel and buy GammaGrips controller grips in person.",
};

export default async function PartnersPage() {
  const partners = await activePartners();

  /* Group by city, keeping the database order (country, city, sort). */
  const groups: { key: string; city: string; country: string; items: Partner[] }[] = [];
  for (const p of partners) {
    const key = `${p.country}|${p.city.toLowerCase()}`;
    const g = groups.find((x) => x.key === key);
    if (g) g.items.push(p);
    else groups.push({ key, city: p.city, country: p.country, items: [p] });
  }
  const multiCountry = new Set(partners.map((p) => p.country)).size > 1;

  return (
    <>
      <div className="gutter pt-3">
        <div className="shell">
          <Win title={PARTNERS_TITLE.toUpperCase()} bodyClass="p-4 md:p-6">
            <Breadcrumbs items={[{ label: PARTNERS_TITLE }]} />
            <h1 className="mt-3 max-w-[24ch] text-[26px] font-bold leading-tight md:text-[32px]">
              {PARTNERS_TITLE}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-ink-dim">
              Want to feel the texture before you buy? These shops stock GammaGrips — pick them up,
              try the fit on a controller and take a set home.
            </p>
            {partners.length > 0 && (
              <p className="mt-3 text-[12.5px] text-ink-mute">
                {partners.length} shop{partners.length === 1 ? "" : "s"} in {groups.length}{" "}
                {groups.length === 1 ? "city" : "cities"}
              </p>
            )}
          </Win>
        </div>
      </div>

      <div className="gutter">
        <div className="shell py-4">
          {groups.length === 0 ? (
            <div className="glass p-6 md:p-8">
              <h2 className="text-[18px] font-bold">First shops coming soon</h2>
              <p className="mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-ink-dim">
                We&apos;re lining up our first partners now. Check back soon — or run a shop yourself?
                We&apos;d like to hear from you.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <section key={g.key} aria-labelledby={`city-${g.key}`}>
                  <h2 id={`city-${g.key}`} className="label mb-3 text-ink-mute">
                    {g.city}
                    {multiCountry && ` · ${countryName(g.country)}`}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.items.map((p) => (
                      <li key={p.id}>
                        <PartnerCard p={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div className="glass mt-6 flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
            <div>
              <h2 className="text-[16px] font-bold">Want GammaGrips in your shop?</h2>
              <p className="mt-1 text-[13.5px] text-ink-dim">
                We supply game and accessory stores across the Benelux. Tell us about your shop.
              </p>
            </div>
            <a
              href="mailto:info@gammagrips.com?subject=Becoming%20a%20GammaGrips%20partner"
              className="cut-sm flex h-11 items-center bg-[var(--color-ice)] px-5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]"
            >
              Become a partner
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function PartnerCard({ p }: { p: Partner }) {
  return (
    <article className="glass flex h-full flex-col p-4">
      <div className="flex items-center gap-3">
        {p.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- partner logos are small remote blobs
          <img src={p.logo_url} alt={`${p.name} logo`} loading="lazy"
            className="h-12 w-12 shrink-0 rounded-[var(--radius-xs)] bg-white object-contain p-1.5" />
        ) : (
          <span aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-xs)] plate text-[17px] font-bold text-ink-mute">
            {p.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <h3 className="min-w-0 text-[15.5px] font-bold leading-snug">{p.name}</h3>
      </div>

      <address className="mt-3 text-[13.5px] not-italic leading-relaxed text-ink-dim">
        {p.address && <>{p.address}<br /></>}
        {[p.postcode, p.city].filter(Boolean).join(" ")}
      </address>
      {p.note && <p className="mt-2 text-[13px] text-ink-mute">{p.note}</p>}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <a href={mapsUrl(p)} target="_blank" rel="noopener noreferrer"
          className="plate cut-sm press flex h-10 items-center px-3.5 text-[12.5px] font-bold text-ink">
          Directions ↗
        </a>
        {p.website && (
          <a href={p.website} target="_blank" rel="noopener noreferrer"
            className="cut-sm press flex h-10 min-w-0 items-center px-3 text-[12.5px] font-bold text-ps-blue">
            <span className="truncate">{displayHost(p.website)} ↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
