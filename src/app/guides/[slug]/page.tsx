import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, guideBySlug } from "@/data/guides";
import { PageShell, AsideCard } from "@/components/site/page-shell";
import { Badge } from "@/components/ui/primitives";
import { GlyphMarker } from "@/components/ui/glyphs";
import { dateLabel } from "@/lib/utils";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  return g
    ? {
        title: g.title,
        description: g.deck,
        alternates: { canonical: `/guides/${g.slug}` },
        openGraph: { title: g.title, description: g.deck, type: "article" },
      }
    : { title: "Guide" };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <PageShell
      title={g.title}
      deck={g.deck}
      crumbs={[{ label: "Guides", href: "/guides" }, { label: g.title }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <AsideCard title="Still deciding?">
            <p>
              The finder asks two questions about how your hands behave and names
              one grip. <Link href="/customize">Open the finder</Link>.
            </p>
          </AsideCard>
          <AsideCard title="More guides">
            <ul className="space-y-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/guides/${o.slug}`}>{o.title}</Link>
                </li>
              ))}
            </ul>
          </AsideCard>
        </div>
      }
    >
      <div className="mb-8 flex items-center gap-2">
        <Badge>{g.category}</Badge>
        <span className="label text-ink-mute">{g.readMinutes} min read</span>
        <span className="label text-ink-mute">Updated {dateLabel(g.date)}</span>
      </div>

      {g.body.map((block, i) => (
        <section key={i}>
          {block.heading && <h2>{block.heading}</h2>}
          {block.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {block.list && (
            <ul>
              {block.list.map((li, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-[5px] shrink-0">
                    <GlyphMarker index={j} size={12} />
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </PageShell>
  );
}
