import Link from "next/link";
import {
  DESIGNS,
  PLATFORMS,
  PRODUCTS,
  TEXTURES,
  designById,
  productBySlug,
} from "@/data/catalog";
import { GUIDES } from "@/data/guides";
import { GripPhoto, DesignSwatch } from "@/components/product/grip-photo";
import { ControllerIcon } from "@/components/site/controller-icon";
import { ProductGrid } from "@/components/product/product-card";
import {
  Badge,
  ButtonLink,
  Section,
  SectionHead,
  Well,
} from "@/components/ui/primitives";
import { RETURN_DAYS, cn } from "@/lib/utils";

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
      designId: "nebula",
      platformId: "dualsense" as const,
    },
    {
      family: "xbox" as const,
      href: "/xbox",
      title: "Xbox",
      controllers: PLATFORMS.filter((p) => p.family === "xbox"),
      designId: "venom",
      platformId: "xbox-series" as const,
    },
  ];

  return (
    <Section className="py-9 md:py-20">
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
      <div className="rail mt-6 no-bar gap-4 sm:mt-9 sm:grid md:grid-cols-2">
        {cards.map((c, i) => (
          <Link
            key={c.family}
            href={c.href}
            data-reveal
            data-reveal-delay={i * 70}
            className="group lift sheen relative flex flex-col overflow-hidden border border-edge glass drop transition-colors hover:border-edge"
          >
            {/* We only photograph the DualSense today, so the Xbox card leads
                with the surface rather than a controller it is not. */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#14181c] to-[#0b0e11]">
              <GripPhoto
                design={designById(c.designId)!}
                platformId={c.platformId}
                view={c.family === "xbox" ? "macro" : "full"}
                className={cn(
                  "mx-auto h-full w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]",
                  c.family === "xbox" ? "object-cover" : "object-contain",
                )}
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
  const picks = ["nebula-grips", "venom-grips", "cyber-grips"]
    .map((s) => productBySlug(s)!)
    .filter(Boolean);

  return (
    <Section className="py-9 md:py-20">
      <SectionHead
        eyebrow="The range"
        title="Start with one of these"
        copy="Three of the six colourways. The shell is the same in all of them — pick the one you want to look at."
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
   Two sides — the editorial moment

   The store has two shots of every grip and was only ever spending one. The
   back is the more persuasive of the two: it is the face you look at while you
   play, and it is where the wrap and the branding actually read. Full bleed,
   no panel, no frame — the renders are cut out, so the page itself is the
   backdrop.
   ========================================================================= */

export function TwoSides() {
  const design = designById("venom")!;
  const product = PRODUCTS.find((p) => p.designs[0] === design.id)!;

  return (
    <Section className="py-12 md:py-24">
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 inset-y-[-20%] z-0"
          style={{
            background:
              "radial-gradient(34% 40% at 28% 34%, rgba(255,255,255,0.05), transparent 70%), radial-gradient(32% 38% at 74% 32%, rgba(255,255,255,0.045), transparent 72%)",
          }}
        />

        <div className="relative z-[1] grid items-center gap-8 lg:grid-cols-12 lg:gap-4">
          <figure className="min-w-0 lg:col-span-4" data-reveal>
            <GripPhoto
              design={design}
              view="full"
              sizes="(max-width: 1024px) 70vw, 30vw"
              className="mx-auto h-auto w-[70%] lg:w-full"
            />
            <figcaption className="label mt-3 text-center text-ink-mute">
              Fitted — front
            </figcaption>
          </figure>

          <div className="order-first min-w-0 lg:order-none lg:col-span-4" data-reveal data-reveal-delay="80">
            <p className="label mb-4 flex items-center justify-center gap-2.5">
              <span
                className="h-[3px] w-6 rounded-full bg-[var(--color-hot)]"
                aria-hidden="true"
              />
              <span className="text-ink-mute">Both sides</span>
            </p>
            <h2 className="shout text-center text-[32px] leading-[0.95] md:text-[42px]">
              The side you actually look at
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-center text-[15px] leading-relaxed text-ink-dim">
              A grip is not a sticker on the front. The shell wraps the whole
              handle, so the pattern runs round the back where your fingers
              close and where you see it for eight hours a night.
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href={`/products/${product.slug}`} variant="primary">
                See {design.name}
              </ButtonLink>
            </div>
          </div>

          <figure className="min-w-0 lg:col-span-4" data-reveal data-reveal-delay="160">
            <GripPhoto
              design={design}
              view="back"
              sizes="(max-width: 1024px) 70vw, 30vw"
              className="mx-auto h-auto w-[70%] lg:w-full"
            />
            <figcaption className="label mt-3 text-center text-ink-mute">
              Fitted — back
            </figcaption>
          </figure>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   Why our grips — benefits with real diagrams, not icon clip-art
   ========================================================================= */

export function Benefits() {
  return (
    <Section className="py-9 md:py-20">
      <SectionHead
        eyebrow="Why fit grips"
        title="Four things a moulded shell changes"
        copy="Not a sleeve and not a skin. A shell moulded to one controller, which is why it can add texture without adding slop."
      />
      <div className="rail mt-6 no-bar gap-4 sm:mt-9 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Sweat has somewhere to go",
            copy: "The relief leaves channels under your palm. Traction alone stops working once there is a film of moisture on the shell.",
            diagram: <CellSectionDiagram />,
          },
          {
            title: "Pressure spreads out",
            copy: "The shell adds a layer of TPU across the whole handle, so the load moves off the two points where a bare controller digs in.",
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
   The surface

   This block used to be a five-across comparison of Open Cell, Micro Cell,
   Contour Ridge, Grid Emboss and Soft Matte, each with a relief depth and a
   grip/cushion score. One of those exists, and none of the numbers were
   measured. One surface, shown once, at the magnification that makes the
   point.
   ========================================================================= */

export function TextureTech() {
  const lead = designById("nebula")!;

  return (
    <Section className="py-9 md:py-20">
      <div className="glass grid items-center gap-8 p-5 md:p-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-5">
          <p className="label mb-4 flex items-center gap-2.5">
            <span className="h-[3px] w-6 rounded-full bg-[var(--color-hot)]" aria-hidden="true" />
            <span className="text-ink-mute">Surface</span>
          </p>
          <h2 className="shout text-[32px] leading-[0.95] md:text-[42px]">
            The pattern is the relief
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-dim">
            One mould, one surface. The texture is not printed on the shell and
            it is not a coating sprayed over it — it is the shape of the shell,
            so what you see at 8× is exactly what your palm finds.
          </p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-dim">
            That is also why there is one of it. A second surface means a second
            tool, and the first one is still being cut.
          </p>
          <div className="mt-7">
            <ButtonLink href="/controller-grips" variant="primary">
              See the six colourways
            </ButtonLink>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7" data-reveal>
          <Well className="cut relative aspect-[16/10]" scan={false}>
            <GripPhoto
              design={lead}
              platformId="dualsense"
              view="macro"
              sizes="(max-width: 1024px) 92vw, 52vw"
              className="absolute inset-0 z-[1] h-full w-full object-cover"
            />
            <span className="label absolute bottom-3 right-3 z-[2] rounded-full bg-black/60 px-2.5 py-1.5 text-ink backdrop-blur">
              8× magnification
            </span>
          </Well>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   Colourways

   Was "Six grips, three families", grouping the range by surface geometry
   into collections that no longer exist. Same six products, described as what
   they are: one shell, finished six ways.
   ========================================================================= */

export function CollectionsShowcase() {
  return (
    <Section className="py-9 md:py-20">
      <SectionHead
        eyebrow="Colourways"
        title="One shell, six finishes"
        copy="The geometry is identical across all six. Pick the one you want to look at for the next few thousand hours."
        action={
          <ButtonLink href="/controller-grips" variant="default" size="sm">
            All six
          </ButtonLink>
        }
      />
      <div className="rail mt-6 no-bar gap-3 sm:mt-9 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {DESIGNS.map((d, i) => {
          const product = PRODUCTS.find((p) => p.designs[0] === d.id);
          if (!product) return null;
          return (
            <Link
              key={d.id}
              href={`/products/${product.slug}`}
              data-reveal
              data-reveal-delay={(i % 6) * 50}
              className="group lift sheen glass cut-sm flex flex-col p-[3px]"
            >
              <Well className="relative aspect-square" scan={false}>
                <GripPhoto
                  design={d}
                  platformId="dualsense"
                  view="macro"
                  sizes="(max-width: 640px) 46vw, 16vw"
                  className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </Well>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="text-[13.5px] font-bold">{d.name}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
                  {d.blurb}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}


/* ============================================================================
   What we can honestly say

   This slot used to be a wall of five-star testimonials and an aggregate of
   4,666 reviews. Not one of them was real — nothing has shipped. Inventing
   reviews is illegal here (the EU Omnibus Directive; the ACM enforces it), and
   it is the fastest way to lose the only thing a new brand has. Until there
   are customers, the honest version of social proof is the terms we will
   actually be held to.
   ========================================================================= */

export function Assurance() {
  const items = [
    {
      k: "No reviews yet",
      v: "Nobody has one",
      copy: "The first production run is still being moulded. When grips ship, reviews will appear here — written by people who bought them, good and bad, unedited.",
    },
    {
      k: `${RETURN_DAYS} days`,
      v: "To change your mind",
      copy: `Fitted, used, washed — it does not matter. Send them back inside ${RETURN_DAYS} days and we refund the order.`,
    },
    {
      k: "No adhesive",
      v: "Nothing to undo",
      copy: "The shell is a friction fit moulded to one controller. It comes off as cleanly as it went on, leaving no residue on the plastic.",
    },
  ];

  return (
    <Section className="py-9 md:py-20">
      <SectionHead
        eyebrow="Straight answers"
        title="What we can honestly tell you"
        copy="We are a first run with no customers yet, so there is nothing to quote. Here is what we will be held to instead."
      />
      <ul className="mt-9 grid gap-3 md:grid-cols-3" data-reveal>
        {items.map((it) => (
          <li key={it.k} className="glass flex flex-col p-6">
            <p className="display text-[26px] leading-none text-ink">{it.k}</p>
            <p className="label mt-2.5 text-ink-mute">{it.v}</p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-dim">
              {it.copy}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}


/* ============================================================================
   Compatibility
   ========================================================================= */

export function CompatibilityStrip() {
  return (
    <Section className="py-9 md:py-20">
      <div className="glass p-[3px]">
        <div className="grid gap-8 p-5 md:p-7 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
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
          <ul className="min-w-0 grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {PLATFORMS.map((p) => (
              <li
                key={p.id}
                className="glass flex min-w-0 items-center gap-3 p-2.5"
              >
                <span className="border border-edge shrink-0 bg-transparent p-1 text-ink-dim">
                  <ControllerIcon family={p.family} className="h-12 w-16" />
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
    <Section className="py-9 md:py-20">
      <SectionHead
        eyebrow="Guides"
        title="Before you buy"
        action={
          <ButtonLink href="/guides" variant="default" size="sm">
            All guides
          </ButtonLink>
        }
      />
      <div className="rail mt-6 no-bar gap-4 sm:mt-9 sm:grid sm:grid-cols-2 xl:grid-cols-4">
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
