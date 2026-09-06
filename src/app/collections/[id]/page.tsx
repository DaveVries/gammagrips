import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COLLECTIONS, PRODUCTS, collectionById, designById } from "@/data/catalog";
import { ControllerRender, DesignSwatch } from "@/components/product/controller-render";
import { ProductGrid } from "@/components/product/product-card";
import { ButtonLink, Rule, SectionHead } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { sortProducts } from "@/lib/shop";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const c = collectionById((await params).id);
  if (!c) return { title: "Collection" };
  return {
    alternates: { canonical: `/collections/${c.id}` },
    title: `${c.name} — ${c.tagline}`,
    description: c.description,
  };
}

export default async function CollectionDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const collection = collectionById(id);
  if (!collection) notFound();

  const wanted = Array.isArray(sp.design) ? sp.design[0] : sp.design;
  const active =
    (wanted && collection.designIds.includes(wanted) ? wanted : null) ??
    collection.designIds[0];
  const design = designById(active)!;

  // Products that actually offer at least one design from this collection
  const products = sortProducts(
    PRODUCTS.filter((p) => p.designs.some((d) => collection.designIds.includes(d))),
    "popular",
  );

  const others = COLLECTIONS.filter((c) => c.id !== collection.id);

  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-7">
          <Breadcrumbs
            items={[{ label: "Designs", href: "/collections" }, { label: collection.name }]}
          />
        </div>
      </div>

      {/* --- design showcase --------------------------------------------- */}
      <div className="gutter border-b border-edge">
        <div className="shell grid gap-10 py-10 lg:grid-cols-12 lg:py-14">
          <div className="lg:col-span-5">
            <div className="mb-4 flex items-center gap-2">
              <p className="label text-ink-mute">{collection.name} collection</p>
            </div>
            <h1 className="text-[32px] font-semibold leading-[1.05] tracking-tight md:text-[42px]">
              {collection.tagline}
            </h1>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-dim">
              {collection.description}
            </p>

            <div className="mt-8">
              <p className="label mb-3 text-ink-mute">Designs in this collection</p>
              <ul className="flex flex-wrap gap-2">
                {collection.designIds.map((d) => {
                  const item = designById(d)!;
                  const on = d === active;
                  return (
                    <li key={d}>
                      <Link
                        href={`/collections/${collection.id}?design=${d}`}
                        scroll={false}
                        aria-current={on ? "true" : undefined}
                        className={`flex items-center gap-2.5 rounded-[var(--radius-md)] border py-2 pl-2 pr-3.5 transition-colors ${
                          on
                            ? "border-ink plate-in"
                            : "border-edge hover:border-edge"
                        }`}
                      >
                        <DesignSwatch design={item} size={28} className="rounded-[4px]" />
                        <span className="text-[13.5px] font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8 rounded-[var(--radius-md)] border border-edge plate p-4">
              <p className="text-[14px] font-medium">{design.name}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
                {design.blurb}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/customize?design=${design.id}`}>
                Build with {design.name}
              </ButtonLink>
              <ButtonLink href="/controller-grips" variant="default">
                All grips
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ControllerRender
              design={design}
              platformId="dualsense"
              className="mx-auto w-full max-w-[620px]"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-edge">
                <ControllerRender
                  design={design}
                  platformId="dualsense"
                  view="macro"
                  className="aspect-[4/3] w-full"
                />
              </div>
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-edge bg-gradient-to-b from-[#14181c] to-[#0b0e11]">
                <ControllerRender
                  design={design}
                  platformId="xbox-series"
                  className="w-full"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-[12.5px] text-ink-mute">
              Surface at 8× magnification, and the same design on an Xbox Wireless Controller.
            </p>
          </div>
        </div>
      </div>

      {/* --- products ----------------------------------------------------- */}
      <div className="gutter">
        <div className="shell py-12">
          <SectionHead
            eyebrow="Available on"
            title={`Products offered in ${collection.name}`}
            copy="Choose your design on the product page — the swatch you pick carries through to the cart."
          />
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>

          <Rule className="my-14" />

          <SectionHead eyebrow="Keep looking" title="Other collections" />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/collections/${c.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-edge plate transition-colors hover:border-edge"
                >
                  <span className="block aspect-[16/10] overflow-hidden">
                    <ControllerRender
                      design={designById(c.designIds[0])!}
                      platformId="dualsense"
                      view="macro"
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="p-3">
                    <span className="block text-[13.5px] font-medium">{c.name}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-mute">
                      {c.designIds.length} design{c.designIds.length > 1 ? "s" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
