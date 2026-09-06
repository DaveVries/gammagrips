import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, TEXTURES, designById } from "@/data/catalog";
import { CollectionPage } from "@/components/plp/collection-page";
import { ControllerRender } from "@/components/product/controller-render";

export const metadata: Metadata = {
  alternates: { canonical: "/controller-grips" },
  title: "Controller grips",
  description:
    "Six moulded controller grip shells for DualSense, DualSense Edge, Xbox Wireless and Elite Series 2. Five surfaces from soft matte to deep open cell.",
};

const MACRO: Record<string, string> = {
  "open-cell": "dark-matter",
  "micro-cell": "volt",
  ridge: "venom",
  grid: "vapor",
  matte: "ice-froyo",
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
      intro="Six moulds, each with its own surface. The pattern you see is the relief you feel, so choosing how it looks and choosing how it grips is one decision — work out the feel you need and the look follows."
      crumbs={[{ label: "Grips" }]}
      searchParams={await searchParams}
      lockedFacets={["type"]}
    >
      {/* Intermediary-page navigation leads, promotions do not. */}
      <div className="gutter">
        <div className="shell py-5">
          <p className="label mb-4 text-ink-mute">Jump to a surface</p>
          <ul className="no-bar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {TEXTURES.map((t) => (
              <li key={t.id} className="shrink-0">
                <Link
                  href={`/controller-grips?texture=${t.id}`}
                  className="group cut-sm plate flex w-[190px] flex-col overflow-hidden transition-colors hover:bg-[var(--color-plate-hi)]"
                >
                  <span className="plate-in relative block aspect-[16/9] overflow-hidden border-0 border-b border-edge">
                    <ControllerRender
                      design={designById(MACRO[t.id])!}
                      platformId="dualsense"
                      view="macro"
                      className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="truncate text-[13px] font-semibold text-ink">{t.name}</span>
                    <span className="label shrink-0 text-ink-mute">{t.profile}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CollectionPage>
  );
}
