"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PLATFORMS,
  PRODUCTS,
  designById,
  platformById,
  productBySlug,
  textureById,
} from "@/data/catalog";
import { ControllerRender } from "@/components/product/controller-render";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge, Button, Groove, Price, Well, Win, WinDots } from "@/components/ui/primitives";
import { GlyphMarker } from "@/components/ui/glyphs";
import { useCart } from "@/lib/cart";
import { stockLabel, variantFor } from "@/lib/shop";
import { cn, money } from "@/lib/utils";
import type { PlatformId } from "@/lib/types";

/* ============================================================================
   The configurator earns its place by removing a real failure mode, not by
   being a novelty: nearly every grip return is someone who bought for the look
   and got the surface wrong. So it asks what their hands actually do, names one
   grip, explains why, and still lets them override it.
   ========================================================================= */

const NEEDS = [
  {
    id: "sweat",
    label: "My hands get sweaty",
    detail: "Grip fades an hour in and gets worse",
    pick: "dark-matter-grips",
    why: "Only the open-cell moulds have channels deep enough to move moisture. Traction alone stops working once there is a film of sweat on the shell.",
  },
  {
    id: "long",
    label: "I play very long sessions",
    detail: "Four hours or more at a time",
    pick: "volt-grips",
    why: "Same cell geometry as Dark Matter at half the pitch — most of the grip, without the hard edges that press into the same spots over six hours.",
  },
  {
    id: "pain",
    label: "My hands or joints ache",
    detail: "Pressure and fatigue, not slipping",
    pick: "venom-grips",
    why: "The softest compound we use, 3.1 mm of cushion, and ridges that spread load across more of the palm instead of two contact points.",
  },
  {
    id: "minimal",
    label: "I want almost nothing to change",
    detail: "Muscle memory matters more than grip",
    pick: "vapor-grips",
    why: "1.4 mm is the smallest change to the controller's shape we can make while still adding real bite. Note it is a dry-hand surface.",
  },
  {
    id: "first",
    label: "I have never used grips",
    detail: "Not sure I will like the extra bulk",
    pick: "ice-froyo-grips",
    why: "The gentlest introduction: 1.1 mm, soft-touch, with a dimpled patch only where your palm actually presses. Easy to live with.",
  },
  {
    id: "look",
    label: "I just want a specific look",
    detail: "Skip the recommendation",
    pick: null,
    why: "",
  },
] as const;

export function Configurator({
  initialDesign,
  initialPlatform,
}: {
  initialDesign?: string;
  initialPlatform?: string;
}) {
  const cart = useCart();

  const [platformId, setPlatformId] = useState<PlatformId>(
    (PLATFORMS.some((p) => p.id === initialPlatform)
      ? initialPlatform
      : "dualsense") as PlatformId,
  );
  const [need, setNeed] = useState<string | null>(initialDesign ? "look" : null);
  const [slug, setSlug] = useState<string>(
    PRODUCTS.find((p) => p.designs[0] === initialDesign)?.slug ?? "dark-matter-grips",
  );
  const [qty] = useState(1);
  const [done, setDone] = useState(false);

  const recommended = useMemo(
    () => NEEDS.find((n) => n.id === need) ?? null,
    [need],
  );

  const product = productBySlug(slug)!;
  const design = designById(product.designs[0])!;
  const texture = textureById(product.texture)!;
  const platform = platformById(platformId)!;
  const variant = variantFor(product, product.designs[0], platformId);
  const stock = stockLabel(variant?.stock);
  const soldOut = !variant || variant.stock === 0;

  const chooseNeed = (id: string) => {
    setNeed(id);
    const n = NEEDS.find((x) => x.id === id);
    if (n?.pick) setSlug(n.pick);
  };

  const add = () => {
    cart.add({ slug: product.slug, designId: product.designs[0], platformId, qty });
    setDone(true);
    window.setTimeout(() => setDone(false), 2400);
  };

  return (
    <div className="gutter">
      <div className="shell grid gap-4 py-3 lg:grid-cols-12 lg:gap-5">
        {/* ============ live preview ============ */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-[70px]">
            <Win title="LIVE PREVIEW" right={<WinDots />} bodyClass="p-[3px]">
              <Well>
              <ProductVisual
                product={product}
                design={design}
                platformId={platformId}
                className="relative z-[1] w-full"
              />
              </Well>
            </Win>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Well className="col-span-2 aspect-[16/9]">
                <ControllerRender
                  design={design}
                  platformId={platformId}
                  view="macro"
                  className="relative z-[1] h-full w-full"
                />
              </Well>
              <Groove className="flex flex-col justify-center p-3">
                <p className="label text-ink-mute">YOUR BUILD</p>
                <p className="mt-1.5 text-[13px] font-bold leading-snug">
                  {product.name.replace(" Grips", "")}
                </p>
                <p className="text-[11.5px] leading-snug text-ink-dim">
                  {texture.name} · {platform.short}
                </p>
              </Groove>
            </div>
            <p className="mt-2 text-[12px] text-ink-mute">
              Surface shown at 8× magnification. The pattern is moulded relief,
              not print — it is what you feel.
            </p>
          </div>
        </div>

        {/* ============ steps ============ */}
        <div className="lg:col-span-5">
          <div className="glass cut p-5">
          <h1 className="text-[24px] font-bold md:text-[28px]">Find your grip</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
            Two questions. Nothing is added to your cart until you say so, and no
            account is needed.
          </p>

          {/* --- step 1 --- */}
          <Step n={1} title="Your controller" value={platform.short}>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatformId(p.id)}
                  aria-pressed={platformId === p.id}
                  className={cn(
                    "cut-sm px-3 py-2.5 text-left transition-colors",
                    platformId === p.id
                      ? "plate-in ring-1 ring-ink"
                      : "plate hover:bg-[var(--color-plate-hi)]",
                  )}
                >
                  <span className="block text-[13.5px] font-medium">{p.short}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-mute">
                    {p.console}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[12.5px] text-ink-mute">
              Not sure which you own?{" "}
              <Link
                href="/compatibility"
                className="text-ink-dim underline underline-offset-2 hover:text-ink"
              >
                Identify it in two questions
              </Link>
              .
            </p>
          </Step>

          {/* --- step 2 --- */}
          <Step
            n={2}
            title="What are your hands doing?"
            value={recommended ? recommended.label : "Not answered"}
          >
            <ul className="space-y-2">
              {NEEDS.map((n) => {
                const on = need === n.id;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => chooseNeed(n.id)}
                      aria-pressed={on}
                      className={cn(
                        "cut-sm flex w-full items-start gap-3 p-3 text-left transition-colors",
                        on ? "plate-in ring-1 ring-ink" : "plate hover:bg-[var(--color-plate-hi)]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "plate-in mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        )}
                      >
                        {on && <span className="h-2 w-2 rounded-full bg-[var(--color-blk-blue)]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium">{n.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-mute">
                          {n.detail}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {recommended?.pick && (
              <div className="cut-sm mt-3 border border-ps-green/35 border-l-[3px] border-l-ps-green bg-[#dcece1] p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="green">Recommended</Badge>
                  <p className="text-[13.5px] font-semibold">
                    {productBySlug(recommended.pick)!.name}
                  </p>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-dim">
                  {recommended.why}
                </p>
              </div>
            )}
          </Step>

          {/* --- step 3 --- */}
          <Step n={3} title="Confirm the grip" value={product.name.replace(" Grips", "")}>
            <ul className="space-y-2">
              {PRODUCTS.map((g) => {
                const d = designById(g.designs[0])!;
                const t = textureById(g.texture)!;
                const on = g.slug === slug;
                const isRec = recommended?.pick === g.slug;
                const v = variantFor(g, g.designs[0], platformId);
                const out = !v || v.stock === 0;
                return (
                  <li key={g.slug}>
                    <button
                      onClick={() => setSlug(g.slug)}
                      aria-pressed={on}
                      className={cn(
                        "cut-sm flex w-full items-center gap-3 p-2.5 text-left transition-colors",
                        on ? "plate-in ring-1 ring-ink" : "plate hover:bg-[var(--color-plate-hi)]",
                        out && "opacity-55",
                      )}
                    >
                      <span className="border border-edge relative h-12 w-12 shrink-0 overflow-hidden bg-transparent">
                        <ControllerRender
                          design={d}
                          platformId={platformId}
                          view="macro"
                          className="h-full w-full"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[13.5px] font-medium">
                            {g.name.replace(" Grips", "")}
                          </span>
                          {isRec && <span className="label shrink-0 text-ps-green">Pick</span>}
                          {out && <span className="label shrink-0 text-ink-mute">Sold out</span>}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-ink-mute">
                          {t.name} · {t.profile} · grip {t.grip}/5
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                        {money(g.price)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Step>

          {/* --- summary --- */}
          <div className="plate-in cut-sm mt-7 p-4">
            <dl className="space-y-2 text-[12.5px]">
              <Row label="Controller" value={platform.controller} />
              <Row label="Grip" value={product.name} />
              <Row label="Surface" value={`${texture.name} · ${texture.profile}`} />
            </dl>
            <div className="border-t border-edge mt-3 flex items-center justify-between pt-3">
              <span className="text-[13px] font-bold">Total</span>
              <Price value={product.price} compareAt={product.compareAt} size="md" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5",
                  stock.tone === "ok" && "bg-[var(--color-blk-green)]",
                  stock.tone === "low" && "bg-[var(--color-blk-yellow)]",
                  stock.tone === "out" && "bg-[#a8a7a2]",
                )}
                aria-hidden="true"
              />
              <p className="text-[12.5px] text-ink-mute">{stock.text}</p>
              {product.price < 50 && (
                <p className="ml-auto text-[12px] text-ink-mute">
                  {money(50 - product.price)} to free delivery
                </p>
              )}
            </div>
            <Button
              size="lg"
              variant={done ? "go" : "primary"}
              full
              className="mt-4"
              disabled={soldOut}
              onClick={add}
              aria-live="polite"
            >
              {soldOut ? "SOLD OUT FOR THIS CONTROLLER" : done ? "ADDED ✓" : "ADD TO CART"}
            </Button>
            {soldOut && (
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-dim">
                {product.name} is out of stock for the {platform.short}. It is
                available for the other controllers, and the surface closest to
                it is{" "}
                <button
                  onClick={() => setSlug(product.pairsWith[0])}
                  className="text-ink underline underline-offset-2"
                >
                  {productBySlug(product.pairsWith[0])!.name}
                </button>
                .
              </p>
            )}
            <p className="mt-3 text-center text-[12px] text-ink-mute">
              VAT included · 60-day returns · fitted in two minutes
            </p>
            <Link
              href={`/products/${product.slug}?platform=${platformId}`}
              className="label mt-3 block text-center text-ink-mute transition-colors hover:text-ink"
            >
              See the full product page →
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  value,
  children,
}: {
  n: number;
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-edge mt-6 pt-5">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <GlyphMarker index={n - 1} size={15} />
        </span>
        <h2 className="text-[14px] font-bold">{title}</h2>
        <span className="ml-auto truncate text-[12.5px] text-ink-mute">{value}</span>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-ink-mute">{label}</dt>
      <dd className="truncate text-right font-medium">{value}</dd>
    </div>
  );
}
