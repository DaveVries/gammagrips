import Link from "next/link";
import {
  COLLECTIONS,
  PLATFORMS,
  PRODUCTS,
  TEXTURES,
  designById,
  productBySlug,
} from "@/data/catalog";
import { GUIDES } from "@/data/guides";
import { REVIEWS } from "@/data/reviews";
import { ControllerRender, DesignSwatch } from "@/components/product/controller-render";
import { ProductGrid } from "@/components/product/product-card";
import {
  Badge,
  ButtonLink,
  Section,
  SectionHead,
  Stars,
  Well,
} from "@/components/ui/primitives";
import { cn, dateLabel } from "@/lib/utils";

/* ============================================================================
   Shop by platform
   ========================================================================= */

export function PlatformSplit() {
  const cards = [
    {
      family: "playstation" as const,
      href: "/playstation",
      title: "PlayStation",
      controllers: PLATFORMS.filter((p) => p.family === "playstation"),
      designId: "dark-matter",
      platformId: "dualsense" as const,
    },
    {
      family: "xbox" as const,
      href: "/xbox",
      title: "Xbox",
      controllers: PLATFORMS.filter((p) => p.family === "xbox"),
      designId: "volt",
      platformId: "xbox-series" as const,
    },
  ];

  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Shop by controller"
        title="Start with what you own"
        copy="Every grip is moulded to one specific controller shell. Pick yours and you will only see products that physically fit it."
        action={
          <ButtonLink href="/compatibility" variant="default" size="sm">
            Not sure which you have?
          </ButtonLink>
        }
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {cards.map((c, i) => (
          <Link
            key={c.family}
            href={c.href}
            data-reveal
            data-reveal-delay={i * 70}
            className="group lift sheen relative flex flex-col overflow-hidden border border-edge glass drop transition-colors hover:border-edge"
          >
            <div className="relative overflow-hidden bg-gradient-to-b from-[#14181c] to-[#0b0e11] pt-6">
              <ControllerRender
                design={designById(c.designId)!}
                platformId={c.platformId}
                className="mx-auto w-[86%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-edge p-5">
              <div>
                <h3 className="text-[19px] font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-[13px] text-ink-dim">
                  {c.controllers.map((p) => p.short).join(" · ")}
                </p>
              </div>
              <span className="label inline-flex items-center gap-1.5 text-ink-mute transition-colors group-hover:text-ink">
                Shop
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================================
   Featured products
   ========================================================================= */

export function Featured() {
  const picks = ["dark-matter-grips", "volt-grips", "vapor-grips"]
    .map((s) => productBySlug(s)!)
    .filter(Boolean);

  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Best sellers"
        title="What most people buy"
        copy="Three of the six. Dark Matter if your hands sweat, Volt for long sessions, Vapor if you want almost nothing to change."
        action={
          <ButtonLink href="/controller-grips" variant="default" size="sm">
            All six grips
          </ButtonLink>
        }
      />
      <div className="mt-9" data-reveal>
        <ProductGrid products={picks} />
      </div>
    </Section>
  );
}

/* ============================================================================
   Why our grips — benefits with real diagrams, not icon clip-art
   ========================================================================= */

export function Benefits() {
  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Why fit grips"
        title="Four things a moulded shell changes"
        copy="Not a sleeve and not a skin. A shell moulded to one controller, which is why it can add texture without adding slop."
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Sweat has somewhere to go",
            copy: "Open cell walls create drainage channels under your palm. Traction alone stops working once there is a film of moisture on the shell.",
            diagram: <CellSectionDiagram />,
          },
          {
            title: "Pressure spreads out",
            copy: "The shell adds 0.9–3.1 mm of TPU across the whole handle, so the load moves off the two points where a bare controller digs in.",
            diagram: <PressureDiagram />,
          },
          {
            title: "It fits one controller exactly",
            copy: "Each shell is moulded per controller, so every port, trigger, paddle and the battery bay stay fully clear. Nothing is covered.",
            diagram: <FitDiagram />,
          },
          {
            title: "It comes off cleanly",
            copy: "Friction fit, no adhesive. Take it off, wash it, put it back — as many times as you like, with no residue on the controller.",
            diagram: <RemoveDiagram />,
          },
        ].map((b, i) => (
          <div
            key={b.title}
            data-reveal
            data-reveal-delay={i * 60}
            className="glass cut-sm flex flex-col p-[3px]"
          >
            <Well className="h-28 w-full" scan={false}>
              {b.diagram}
            </Well>
            <div className="p-3">
              <h3 className="text-[14px] font-bold leading-snug">{b.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{b.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CellSectionDiagram() {
  return (
    <svg viewBox="0 0 320 112" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8f6dff" />
          <stop offset="100%" stopColor="#4b3a86" />
        </linearGradient>
      </defs>
      {/* controller shell */}
      <rect x="24" y="76" width="272" height="18" rx="4" fill="#3a4149" />
      <text x="24" y="108" className="label" fill="#6c7681" fontSize="8" fontFamily="var(--font-mono)">
        CONTROLLER
      </text>
      {/* cell walls */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={30 + i * 30} y={40} width="17" height="36" rx="2.5" fill="url(#d1)" />
      ))}
      {/* sweat droplets draining between walls */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={55.5 + i * 30} cy={56 + (i % 3) * 8} r="2.6" fill="#5aa8ff" opacity="0.85" />
      ))}
      <path d="M24 32h272" stroke="#23282e" strokeWidth="1" strokeDasharray="3 4" />
      <text x="24" y="26" fill="#6c7681" fontSize="8" fontFamily="var(--font-mono)">
        PALM
      </text>
      <path d="M304 40v36" stroke="#6c7681" strokeWidth="1" />
      <path d="M301 40h6M301 76h6" stroke="#6c7681" strokeWidth="1" />
      <text x="272" y="34" fill="#a3adb8" fontSize="9" fontFamily="var(--font-mono)">
        2.4mm
      </text>
    </svg>
  );
}

function PressureDiagram() {
  return (
    <svg viewBox="0 0 320 112" className="h-full w-full" aria-hidden="true">
      <text x="18" y="18" fill="#6c7681" fontSize="8" fontFamily="var(--font-mono)">BARE</text>
      <text x="182" y="18" fill="#6c7681" fontSize="8" fontFamily="var(--font-mono)">WITH SHELL</text>
      {/* bare: two hot spots */}
      <path d="M28 84c0-30 22-48 52-48s52 18 52 48" fill="none" stroke="#3a4149" strokeWidth="9" strokeLinecap="round" />
      <circle cx="52" cy="52" r="13" fill="#ff4e1a" opacity="0.85" />
      <circle cx="108" cy="52" r="13" fill="#ff4e1a" opacity="0.85" />
      {/* with shell: even band */}
      <path d="M192 84c0-30 22-48 52-48s52 18 52 48" fill="none" stroke="#3a4149" strokeWidth="9" strokeLinecap="round" />
      <path d="M192 84c0-30 22-48 52-48s52 18 52 48" fill="none" stroke="#43c07a" strokeWidth="18" strokeLinecap="round" opacity="0.4" />
      <path d="M18 98h284" stroke="#23282e" strokeWidth="1" />
    </svg>
  );
}

function FitDiagram() {
  return (
    <svg viewBox="0 0 320 112" className="h-full w-full" aria-hidden="true">
      <rect x="86" y="24" width="148" height="64" rx="16" fill="#2b3138" />
      {/* port cut-out */}
      <rect x="146" y="18" width="28" height="12" rx="4" fill="#0a0c0e" stroke="#43c07a" strokeWidth="1.5" />
      {/* trigger clearance */}
      <path d="M96 24c6-12 22-16 34-12" fill="none" stroke="#43c07a" strokeWidth="1.5" />
      <path d="M224 24c-6-12-22-16-34-12" fill="none" stroke="#43c07a" strokeWidth="1.5" />
      {/* jack */}
      <circle cx="160" cy="88" r="6" fill="#0a0c0e" stroke="#43c07a" strokeWidth="1.5" />
      {[
        [150, 12, "USB-C"],
        [40, 60, "TRIGGERS"],
        [136, 104, "3.5MM"],
      ].map(([x, y, t]) => (
        <text key={t as string} x={x as number} y={y as number} fill="#43c07a" fontSize="7.5" fontFamily="var(--font-mono)">
          {t}
        </text>
      ))}
    </svg>
  );
}

function RemoveDiagram() {
  return (
    <svg viewBox="0 0 320 112" className="h-full w-full" aria-hidden="true">
      <rect x="60" y="46" width="200" height="42" rx="8" fill="#2b3138" />
      <path d="M60 46h200v-6a10 10 0 0 0-10-10H70a10 10 0 0 0-10 10Z" fill="#3a4149" />
      {/* peeling shell */}
      <path d="M60 40c40-26 104-30 152-14l-8 16c-44-14-100-10-136 8Z" fill="#8f6dff" />
      <path d="M204 26c14 4 26 10 34 16" stroke="#8f6dff" strokeWidth="7" strokeLinecap="round" fill="none" strokeDasharray="2 8" />
      <text x="60" y="106" fill="#6c7681" fontSize="8" fontFamily="var(--font-mono)">
        NO ADHESIVE · NO RESIDUE
      </text>
    </svg>
  );
}

/* ============================================================================
   Collections showcase
   ========================================================================= */

export function CollectionsShowcase() {
  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Designs"
        title="Six grips, three families"
        copy="Cell structures, drawn geometry, or no pattern at all. Every one is moulded per controller."
        action={
          <ButtonLink href="/collections" variant="default" size="sm">
            Browse designs
          </ButtonLink>
        }
      />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c, i) => {
          const lead = designById(c.designIds[0])!;
          return (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              data-reveal
              data-reveal-delay={(i % 3) * 60}
              className="group lift sheen glass cut-sm flex flex-col p-[3px]"
            >
              <Well className="relative aspect-[16/10]">
                <ControllerRender
                  design={lead}
                  platformId="dualsense"
                  view="macro"
                  className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </Well>
              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-bold">{c.name}</h3>
                  <span className="label text-ink-mute">
                    {c.designIds.length} design{c.designIds.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
                  {c.tagline}
                </p>
                <ul className="mt-3 flex gap-[3px]">
                  {c.designIds.map((d) => (
                    <li key={d} className="border border-edge p-[2px]">
                      <DesignSwatch design={designById(d)!} size={24} />
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================================================================
   Texture / technology — macro detail
   ========================================================================= */

export function TextureTech() {
  const map: Record<string, string> = {
    "open-cell": "dark-matter",
    "micro-cell": "volt",
    ridge: "venom",
    grid: "vapor",
    matte: "ice-froyo",
  };

  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Surface"
        title="The pattern is the relief"
        copy="Each grip is a single mould, so what you see is what you feel. These are the five surfaces, at 8× magnification."
        action={
          <ButtonLink href="/guides/grip-texture-comparison" variant="default" size="sm">
            Full comparison
          </ButtonLink>
        }
      />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-reveal>
        {TEXTURES.map((t) => (
          <Link
            key={t.id}
            href={`/controller-grips?texture=${t.id}`}
            className="group lift sheen glass cut-sm flex flex-col p-[3px]"
          >
            <Well className="relative aspect-[4/3]">
              <ControllerRender
                design={designById(map[t.id])!}
                platformId="dualsense"
                view="macro"
                className="absolute inset-0 z-[1] h-full w-full transition-transform duration-500 group-hover:scale-[1.08]"
              />
              <span className="border border-edge label absolute bottom-1.5 right-1.5 z-[2] glass px-1.5 py-1 text-ink">
                {t.profile}
              </span>
            </Well>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="text-[13.5px] font-bold">{t.name}</h3>
              <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-dim">
                {t.feel}
              </p>
              <dl className="mt-4 space-y-2">
                {[
                  ["Grip", t.grip],
                  ["Cushion", t.cushion],
                ].map(([label, v]) => (
                  <div key={label as string} className="flex items-center gap-2">
                    <dt className="label w-12 shrink-0 text-ink-mute">{label}</dt>
                    <dd className="flex flex-1 gap-[2px]" aria-label={`${v} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={cn(
                            "h-[9px] flex-1",
                            n <= (v as number) ? "bg-[var(--color-blk-green)]" : "bg-[#a8a7a2]",
                          )}
                        />
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* ============================================================================
   Social proof
   ========================================================================= */

export function SocialProof() {
  const picks = ["r1", "r11", "r15", "r18", "r8", "r13"]
    .map((id) => REVIEWS.find((r) => r.id === id)!)
    .filter(Boolean);
  const all = PRODUCTS.reduce(
    (acc, p) => {
      acc.n += p.reviewCount;
      acc.sum += p.rating * p.reviewCount;
      return acc;
    },
    { n: 0, sum: 0 },
  );
  const avg = all.sum / all.n;

  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Reviews"
        title={
          <>
            {avg.toFixed(1)} out of 5, across{" "}
            {new Intl.NumberFormat("en-GB").format(all.n)} reviews
          </>
        }
        copy="We publish every review, including the bad ones, and we reply to the critical ones."
        action={
          <div className="flex items-center gap-3">
            <Stars value={avg} size={16} />
          </div>
        }
      />
      <div className="mt-9 columns-1 gap-4 md:columns-2 xl:columns-3" data-reveal>
        {picks.map((r) => {
          const p = productBySlug(r.productSlug)!;
          const d = designById(r.designId);
          return (
            <figure
              key={r.id}
              className="card mb-3 break-inside-avoid glass p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="label text-ink-mute">{dateLabel(r.date)}</span>
              </div>
              <blockquote className="mt-2.5">
                <p className="text-[13.5px] font-bold leading-snug">{r.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{r.body}</p>
              </blockquote>
              <figcaption className="border-t border-edge mt-3.5 flex items-center gap-2.5 pt-3">
                {d && (
                  <span className="border border-edge shrink-0 p-[2px]">
                    <DesignSwatch design={d} size={24} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-bold text-ink">
                    {r.author}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="block truncate text-[12px] text-ink-mute hover:text-ink"
                  >
                    {p.name}
                    {d ? ` · ${d.name}` : ""}
                  </Link>
                </span>
                {r.verified && (
                  <span className="ml-auto shrink-0">
                    <Badge tone="green">Verified</Badge>
                  </span>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================================================================
   Compatibility
   ========================================================================= */

export function CompatibilityStrip() {
  return (
    <Section className="py-16 md:py-20">
      <div className="glass p-[3px]">
        <div className="titlebar flex h-[22px] items-center px-2">
          <span className="label text-[10px]">COMPATIBILITY CHECK</span>
        </div>
        <div className="grid gap-8 p-5 md:p-7 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label mb-4 text-ink-mute">Compatibility</p>
            <h2 className="text-[24px] font-bold leading-tight md:text-[28px]">
              Four controllers. Nothing ambiguous.
            </h2>
            <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-ink-dim">
              Every product page states the exact controller it fits. If you are
              unsure which revision you own, the checker identifies it from the
              bottom edge of the controller in two questions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/compatibility">Check my controller</ButtonLink>
              <ButtonLink href="/guides/will-these-fit-my-controller" variant="default">
                What we do not fit
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {PLATFORMS.map((p) => (
              <li
                key={p.id}
                className="glass flex items-center gap-3 p-2.5"
              >
                <span className="border border-edge shrink-0 bg-transparent p-1">
                  <ControllerRender
                    design={designById("ice-froyo")!}
                    platformId={p.id}
                    flat
                    className="h-12 w-16"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{p.controller}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-mute">{p.console}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="ml-auto shrink-0 text-ps-green"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <path d="m4.8 8.2 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   Guides
   ========================================================================= */

export function GuidesTeaser() {
  return (
    <Section className="py-16 md:py-20">
      <SectionHead
        eyebrow="Guides"
        title="Before you buy"
        action={
          <ButtonLink href="/guides" variant="default" size="sm">
            All guides
          </ButtonLink>
        }
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {GUIDES.map((g, i) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            data-reveal
            data-reveal-delay={i * 60}
            className="group lift sheen flex flex-col border border-edge glass cut-sm p-5 transition-colors hover:border-edge"
          >
            <div className="flex items-center gap-2">
              <Badge>{g.category}</Badge>
              <span className="label text-ink-mute">{g.readMinutes} min</span>
            </div>
            <h3 className="mt-4 text-[15.5px] font-semibold leading-snug">{g.title}</h3>
            <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{g.deck}</p>
            <span className="label mt-5 inline-flex items-center gap-1.5 text-ink-mute transition-colors group-hover:text-ink">
              Read
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
