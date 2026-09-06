import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/data/guides";
import { Badge } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  alternates: { canonical: "/guides" },
  title: "Guides",
  description:
    "Choosing a grip surface, fitting grips to a DualSense, comparing textures, and which controllers we fit.",
};

export default function GuidesIndex() {
  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-7 md:py-9">
          <Breadcrumbs items={[{ label: "Guides" }]} />
          <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
            Guides
          </h1>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-dim">
            Four things worth reading before you order. Written from the returns
            and support inbox, not from marketing.
          </p>
        </div>
      </div>
      <div className="gutter">
        <div className="shell grid gap-4 py-12 md:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex flex-col rounded-[var(--radius-lg)] border border-edge plate p-6 transition-colors hover:border-edge"
            >
              <div className="flex items-center gap-2">
                <Badge>{g.category}</Badge>
                <span className="label text-ink-mute">{g.readMinutes} min read</span>
              </div>
              <h2 className="mt-4 text-[19px] font-semibold leading-snug tracking-tight">
                {g.title}
              </h2>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-dim">
                {g.deck}
              </p>
              <span className="label mt-6 inline-flex items-center gap-1.5 text-ink-mute transition-colors group-hover:text-ink">
                Read
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
