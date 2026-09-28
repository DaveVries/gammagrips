import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, designById } from "@/data/catalog";
import { CollectionPage } from "@/components/plp/collection-page";
import { GripPhoto } from "@/components/product/grip-photo";

export const metadata: Metadata = {
  alternates: { canonical: "/controller-grips" },
  title: "Controller grips",
  description:
    "One moulded controller grip shell for DualSense, DualSense Edge, Xbox Wireless and Elite Series 2, in six colourways. The pattern is the relief, not a print.",
};

export default async function GripsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pool = PRODUCTS.filter((p) => p.type === "grips");
  return (
    <CollectionPage
      pool={pool}
      eyebrow="Controller grips"
      title="All six grips"
      intro="One moulded shell, six colourways. The pattern you see is the relief you feel — it is moulded into the shell rather than printed on it, so every colourway grips the same and the only thing you are choosing is the look."
      crumbs={[{ label: "Grips" }]}
      searchParams={await searchParams}
      lockedFacets={["type"]}
    >
      {/* Intermediary-page navigation leads, promotions do not. This rail used
          to jump to one of five surfaces. There is one surface, so it jumps to
          a colourway instead — the only choice on this page. */}
      <div className="gutter">
        <div className="shell py-5">
          <p className="label mb-4 text-ink-mute">Jump to a colourway</p>
          <ul className="no-bar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {PRODUCTS.filter((p) => p.type === "grips").map((p) => {
              const d = designById(p.designs[0]);
              if (!d) return null;
              return (
                <li key={p.slug} className="shrink-0">
                  <Link
                    href={`/products/${p.slug}`}
                    className="group cut-sm plate flex w-[170px] flex-col overflow-hidden transition-colors hover:bg-[var(--color-plate-hi)]"
                  >
                    <span className="plate-in relative block aspect-square overflow-hidden">
                      <GripPhoto
                        design={d}
                        platformId="dualsense"
                        view="macro"
                        sizes="170px"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <span className="truncate text-[13px] font-semibold text-ink">
                        {d.name}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </CollectionPage>
  );
}
