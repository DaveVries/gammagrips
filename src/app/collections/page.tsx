import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS, designById } from "@/data/catalog";
import { ControllerRender, DesignSwatch } from "@/components/product/controller-render";
import { Rule } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  title: "Designs & collections",
  description:
    "Six grip designs across three families — cellular, linear and solid. The pattern is the moulded relief, not print.",
};

export default function CollectionsIndex() {
  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-7 md:py-9">
          <Breadcrumbs items={[{ label: "Designs" }]} />
          <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
            Six grips, three families
          </h1>
          <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-ink-dim">
            Each grip is a single mould, so the pattern you see is the relief
            your hand feels. Choosing the look and choosing the feel are the same
            decision here.
          </p>
        </div>
      </div>

      <div className="gutter">
        <div className="shell space-y-16 py-12">
          {COLLECTIONS.map((c) => (
            <section key={c.id} aria-labelledby={`c-${c.id}`} data-reveal>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-3 flex items-center gap-2">
                    <p className="label text-ink-mute">{c.designIds.length} designs</p>
                  </div>
                  <h2
                    id={`c-${c.id}`}
                    className="text-[24px] font-semibold tracking-tight md:text-[28px]"
                  >
                    <Link href={`/collections/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">
                    {c.description}
                  </p>
                </div>
                <Link
                  href={`/collections/${c.id}`}
                  className="label shrink-0 text-ink-mute transition-colors hover:text-ink"
                >
                  Shop {c.name} →
                </Link>
              </div>

              <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.designIds.map((id) => {
                  const d = designById(id)!;
                  return (
                    <li key={id}>
                      <Link
                        href={`/collections/${c.id}?design=${id}`}
                        className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-edge plate transition-colors hover:border-edge"
                      >
                        <span className="block overflow-hidden bg-gradient-to-b from-[#14181c] to-[#0b0e11]">
                          <ControllerRender
                            design={d}
                            platformId="dualsense"
                            className="w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                          />
                        </span>
                        <span className="flex flex-1 items-start gap-3 border-t border-edge p-4">
                          <DesignSwatch
                            design={d}
                            size={36}
                            className="shrink-0 rounded-[5px] ring-1 ring-bev-3"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold">{d.name}</span>
                            <span className="mt-1 block text-[13px] leading-relaxed text-ink-dim">
                              {d.blurb}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Rule className="mt-14" />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
