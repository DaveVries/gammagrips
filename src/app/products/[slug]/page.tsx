import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PRODUCTS,
  PRODUCT_TYPES,
  productBySlug,
} from "@/data/catalog";
import { reviewsFor } from "@/data/reviews";
import { ProductPurchase } from "@/components/product/product-purchase";
import { Reviews } from "@/components/product/reviews";
import { ProductGrid } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { GlyphMarker } from "@/components/ui/glyphs";
import { Rule, SectionHead } from "@/components/ui/primitives";
import { compatibilityFull } from "@/lib/shop";
import type { PlatformId } from "@/lib/types";
import { RETURN_DAYS, money } from "@/lib/utils";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return { title: "Product" };
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.summary.slice(0, 155),
    openGraph: { title: p.name, description: p.tagline },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = productBySlug(slug);
  if (!product) notFound();

  const wantDesign = Array.isArray(sp.design) ? sp.design[0] : sp.design;
  const wantPlatform = Array.isArray(sp.platform) ? sp.platform[0] : sp.platform;

  const initialDesign = product.designs.length
    ? (wantDesign && product.designs.includes(wantDesign) ? wantDesign : product.designs[0])
    : null;
  const initialPlatform = (
    wantPlatform && product.platforms.includes(wantPlatform as PlatformId)
      ? wantPlatform
      : product.platforms[0]
  ) as PlatformId;

  const reviews = reviewsFor(product.slug);
  const typeMeta = PRODUCT_TYPES.find((t) => t.id === product.type)!;
  const related = product.pairsWith
    .map((s) => productBySlug(s)!)
    .filter(Boolean);

  const faqs = buildFaqs(product);

  return (
    <>
      <div className="gutter pt-3">
        <div className="shell card px-3 py-2">
          <Breadcrumbs
            items={[
              { label: typeMeta.plural, href: typeMeta.href },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <ProductPurchase
        product={product}
        initialDesign={initialDesign}
        initialPlatform={initialPlatform}
      />

      {/* ================= DETAIL ================= */}
      <div className="gutter pb-4">
        <div className="shell glass p-[3px]">
          <div className="titlebar flex h-[22px] items-center px-2">
            <span className="label text-[10px]">
              PRODUCT DETAIL — {product.name.toUpperCase()}
            </span>
          </div>
          <div className="px-5 md:px-8">

          {/* --- overview + highlights ---------------------------------- */}
          <section className="grid gap-10 py-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-[20px] font-bold">
                What it is
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
                {product.summary}
              </p>
            </div>
            <div className="lg:col-span-7">
              {/* Highlights before prose — a spec wall is skipped, a short
                  scannable list is read. */}
              <h2 className="label mb-4 text-ink-mute">Key points</h2>
              <ul className="space-y-3">
                {product.highlights.map((h, i) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-[3px] shrink-0">
                      <GlyphMarker index={i} size={13} />
                    </span>
                    <span className="text-[14px] leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Rule />

          {/* --- specs + in the box + install --------------------------- */}
          <section className="grid gap-10 py-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-[20px] font-bold">
                Specification
              </h2>
              {/* Single column, grouped, alternating shading: a spec sheet that
                  can be traced across without losing the row. */}
              <dl className="plate-in mt-4 p-[3px]">
                {product.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-baseline justify-between gap-6 px-3 py-2 ${
                      i % 2 ? "bg-[#c6c5c0]" : "bg-[#d4d3ce]"
                    }`}
                  >
                    <dt className="text-[12.5px] text-ink-dim">{s.label}</dt>
                    <dd className="text-right text-[12.5px] font-bold tabular-nums">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-5">
              <h2 className="text-[20px] font-bold">In the box</h2>
              <ul className="mt-5 space-y-2.5">
                {product.inBox.map((b) => (
                  <li key={b} className="flex gap-3 text-[14px]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-mute" />
                    {b}
                  </li>
                ))}
              </ul>

              {product.installMinutes > 0 && (
                <>
                  <h2 className="mt-9 text-[22px] font-semibold tracking-tight">
                    Fitting
                  </h2>
                  <ol className="mt-5 space-y-3">
                    {[
                      "Wipe the handles clean and let them dry — skin oil is why grips work loose.",
                      "Hook the lower lip over the base of the handle first.",
                      "Roll the shell upward with your thumbs, keeping the edge seated.",
                      "Check the USB-C port, both triggers and the headphone jack are clear.",
                    ].map((s, i) => (
                      <li key={s} className="flex gap-3">
                        <span className="mt-[2px] shrink-0">
                          <GlyphMarker index={i} size={13} />
                        </span>
                        <span className="text-[13.5px] leading-relaxed text-ink-dim">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href="/guides/dualsense-grip-installation"
                    className="label mt-4 inline-block text-ink-mute transition-colors hover:text-ink"
                  >
                    Full fitting guide →
                  </Link>
                </>
              )}
            </div>
          </section>

          <Rule />

          {/* --- compatibility ------------------------------------------ */}
          <section className="grid gap-10 py-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-[20px] font-bold">
                Compatibility
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-dim">
                Moulded per controller, not a universal sleeve. Choosing the
                wrong mould means it will not seat — our {RETURN_DAYS}-day return
                window covers that mistake.
              </p>
              <Link
                href="/compatibility"
                className="label mt-4 inline-block text-ink-mute transition-colors hover:text-ink"
              >
                Identify my controller →
              </Link>
            </div>
            <div className="lg:col-span-8">
              <ul className="grid gap-2 sm:grid-cols-2">
                {compatibilityFull(product).map((c) => (
                  <li
                    key={c}
                    className="glass flex items-center gap-2.5 glass px-3 py-2.5"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" className="shrink-0 text-ps-green" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <path d="m4.8 8.2 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <span className="text-[13.5px]">{c}</span>
                  </li>
                ))}
                {["DualShock 4", "Switch Pro Controller", "Xbox One (pre-2016)"].map((c) => (
                  <li
                    key={c}
                    className="border border-edge flex items-center gap-2.5 plate-in px-3 py-2.5 opacity-70"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" className="shrink-0 text-ink-mute" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5.4 5.4 10.6 10.6M10.6 5.4 5.4 10.6" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <span className="text-[13.5px] text-ink-mute">Does not fit — {c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Rule />

          {/* --- shipping & returns ------------------------------------- */}
          <section className="grid gap-3 py-12 md:grid-cols-3">
            {[
              {
                h: "Delivery",
                b: `€4.95 flat inside the EU, free over ${money(50)}. Orders placed before 16:00 on a weekday leave Rotterdam the same day. Tracked as standard.`,
                href: "/shipping",
                cta: "Delivery details",
              },
              {
                h: `${RETURN_DAYS}-day returns`,
                b: "Send it back for any reason, including that the texture was not right for you. We pay return postage inside the EU and refund to the original payment method within 5 working days.",
                href: "/returns",
                cta: "How returns work",
              },
              {
                h: "Warranty",
                b: `${product.specs.find((s) => s.label === "Warranty")?.value ?? "2 years"} against manufacturing faults — splitting, lifting edges or a shell that will not stay seated on a clean controller.`,
                href: "/faq",
                cta: "What is covered",
              },
            ].map((c) => (
              <div key={c.h} className="glass p-4">
                <h2 className="text-[14px] font-bold">{c.h}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{c.b}</p>
                <Link
                  href={c.href}
                  className="label mt-4 inline-block text-ink-mute transition-colors hover:text-ink"
                >
                  {c.cta} →
                </Link>
              </div>
            ))}
          </section>

          <Rule />

          {/* --- reviews -------------------------------------------------- */}
          <div className="py-12">
            <Reviews product={product} reviews={reviews} />
          </div>

          <Rule />

          {/* --- FAQ ------------------------------------------------------ */}
          <section className="grid gap-10 py-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-[20px] font-bold">
                Questions we get
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-dim">
                Still stuck?{" "}
                <Link href="/contact" className="text-ink underline underline-offset-2">
                  Email support
                </Link>{" "}
                — we answer within one working day.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="card divide-y divide-edge glass px-3">
                {faqs.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[13.5px] font-bold marker:hidden">
                      {f.q}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                        className="shrink-0 text-ink-mute transition-transform group-open:rotate-45"
                      >
                        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </summary>
                    <p className="pb-4 pr-8 text-[13.5px] leading-relaxed text-ink-dim">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <Rule />

          {/* --- related: supplementary, clearly labelled ---------------- */}
          {related.length > 0 && (
            <section className="py-12">
              <SectionHead
                eyebrow="Other designs"
                title="The other five"
                copy="Same moulding, same fit, a different surface. Compatibility and installation are identical across the range."
              />
              <div className="mt-6">
                <ProductGrid products={related} platformId={initialPlatform} />
              </div>
            </section>
          )}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.summary,
            brand: { "@type": "Brand", name: "GammaGrips" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
            offers: {
              "@type": "Offer",
              price: product.price.toFixed(2),
              priceCurrency: "EUR",
              availability: product.variants.some((v) => v.stock > 0)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
    </>
  );
}

function buildFaqs(p: (typeof PRODUCTS)[number]) {
  const base = [
    {
      q: "Will it come off and leave marks on my controller?",
      a: "No. There is no adhesive anywhere in the product — it is a friction fit, held by the shape of the mould. You can remove and refit it as often as you like. If a grip does work loose, it is almost always skin oil on the controller rather than a fault: clean both surfaces with warm water and washing-up liquid, dry completely, and refit.",
    },
    {
      q: "Does it block the USB-C port, triggers or the headphone jack?",
      a: "No. Each shell is cut around the port, the triggers, the headphone jack and — on the DualSense Edge and Elite Series 2 — the rear module, so you can still swap stick modules and paddles with the grips fitted.",
    },
    {
      q: "Can I put it in the dishwasher?",
      a: "The UV-coated TPU shells are dishwasher safe on a normal cycle, top rack. Silicone thumb grips and rings are as well. Warm water and washing-up liquid with a brush is faster and does the same job.",
    },
  ];

  {
    base.unshift({
      q: "How much bigger will my controller feel?",
      a: `${p.specs.find((s) => s.label === "Added thickness")?.value ?? "A few millimetres"} on each handle, and ${p.specs.find((s) => s.label === "Added weight")?.value ?? "under 25 g"} in total. If you have small hands or thousands of hours of muscle memory on a bare controller, start with Matte Essential at +0.9 mm.`,
    });
  }
  if (p.texture === "open-cell") {
    base.push({
      q: "The cells feel sharp — is that normal?",
      a: "Yes, for about a week. Freshly moulded cell walls have a crisp edge that rounds off with use. If it is still uncomfortable after a fortnight, the texture is genuinely too aggressive for you — Vector's micro-hex is the one to switch to, and our 60-day window covers the swap.",
    });
  }
  return base;
}
