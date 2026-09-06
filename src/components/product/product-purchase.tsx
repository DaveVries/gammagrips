"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlatformId, Product } from "@/lib/types";
import { PLATFORMS, PRODUCTS, designById, platformById, textureById } from "@/data/catalog";
import { ProductVisual } from "@/components/product/product-visual";
import { ControllerRender, DesignSwatch } from "@/components/product/controller-render";
import { Badge, Button, Price, Rating, Well, Win, WinDots } from "@/components/ui/primitives";
import { QtyStepper } from "@/components/cart/cart-drawer";
import { useCart } from "@/lib/cart";
import { compatibilityLine, stockLabel, variantFor } from "@/lib/shop";
import { RETURN_DAYS, cn, deliveryWindow, money } from "@/lib/utils";

type ViewId = "front" | "macro" | "shells";

export function ProductPurchase({
  product,
  initialDesign,
  initialPlatform,
}: {
  product: Product;
  initialDesign: string | null;
  initialPlatform: PlatformId;
}) {
  const cart = useCart();
  const [designId] = useState(initialDesign);
  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatform);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<ViewId>("front");
  const [added, setAdded] = useState(false);

  const design = designById(designId);
  const platform = platformById(platformId)!;
  const texture = textureById(product.texture);
  const variant = variantFor(product, designId, platformId);
  const stock = stockLabel(variant?.stock);
  const soldOut = !variant || variant.stock === 0;
  const isController = product.type === "grips" || product.type === "bundle";

  const eta = deliveryWindow(new Date("2026-09-04T00:00:00Z"));

  const views = useMemo(() => {
    const list: { id: ViewId; label: string }[] = [{ id: "front", label: "Fitted" }];
    list.push({ id: "macro", label: "Surface" });
    if (isController) list.push({ id: "shells", label: "In the box" });
    return list;
  }, [isController]);

  const onAdd = () => {
    cart.add({ slug: product.slug, designId, platformId, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="gutter">
      <div className="shell grid gap-4 py-3 lg:grid-cols-12 lg:gap-5">
        {/* ================= MEDIA ================= */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-[70px]">
            <Win title={`${product.name.toUpperCase()} — ${platform.short.toUpperCase()}`} right={<WinDots />} bodyClass="p-[3px]">
              <Well>
              {view === "macro" && design ? (
                <ControllerRender
                  design={design}
                  platformId={platformId}
                  view="macro"
                  className="aspect-[4/3] w-full"
                />
              ) : view === "shells" && design ? (
                <ControllerRender
                  design={design}
                  platformId={platformId}
                  view="grips"
                  className="w-full"
                  label={`The pair of ${design.name} shells supplied in the box`}
                />
              ) : (
                <ProductVisual
                  product={product}
                  design={design}
                  platformId={platformId}
                  className="relative z-[1] w-full"
                />
              )}
              </Well>
            </Win>

            {/* thumbnails — never a swipe-only gallery */}
            <div className="plate cut-sm mt-2 flex items-center gap-3 p-2">
              <ul className="flex gap-[3px]">
                {views.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setView(v.id)}
                      aria-pressed={view === v.id}
                      className={cn(
                        "relative h-16 w-20 overflow-hidden rounded-[var(--radius-sm)] border transition-colors",
                        view === v.id
                          ? "border-ink"
                          : "border-edge hover:border-edge",
                      )}
                    >
                      {v.id === "macro" && design ? (
                        <ControllerRender
                          design={design}
                          platformId={platformId}
                          view="macro"
                          className="h-full w-full object-cover"
                        />
                      ) : v.id === "shells" && design ? (
                        <ControllerRender
                          design={design}
                          platformId={platformId}
                          view="grips"
                          flat
                          className="h-full w-full"
                        />
                      ) : (
                        <ProductVisual
                          product={product}
                          design={design}
                          platformId={platformId}
                          className="h-full w-full"
                        />
                      )}
                      <span className="sr-only">{v.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="label text-ink-mute">
                {views.find((v) => v.id === view)?.label}
                {view === "macro" && " — 8× magnification"}
                {view === "shells" && " — left and right shells, actual contents"}
              </p>
            </div>
          </div>
        </div>

        {/* ================= BUY BOX ================= */}
        <div className="lg:col-span-5">
          <div className="glass cut p-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && (
              <Badge tone={product.badge === "limited" ? "red" : "blue"}>
                {product.badge === "new"
                  ? "New"
                  : product.badge === "limited"
                    ? "Limited run"
                    : "Best seller"}
              </Badge>
            )}
            {texture && <Badge>{texture.name}</Badge>}
          </div>

          <h1 className="mt-3 text-[26px] font-bold leading-tight md:text-[30px]">
            {product.name}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
            {product.tagline}
          </p>

          <div className="mt-4">
            <Rating
              value={product.rating}
              count={product.reviewCount}
              href="#reviews"
              size={14}
            />
          </div>

          <div className="plate-in mt-4 px-3 py-2.5">
            <Price value={product.price} compareAt={product.compareAt} size="lg" />
            {product.compareAt && (
              <p className="mt-1.5 text-[13px] text-ps-red">
                You save {money(product.compareAt - product.price)}
              </p>
            )}
            <p className="mt-1 text-[11.5px] text-ink-mute">
              VAT included. {product.price >= 50 ? "Free delivery." : `Delivery €4.95, free over €50.`}
            </p>
          </div>

          {/* Compatibility above the selectors, never buried in specs */}
          <div className="cut-sm mt-4 border border-ps-green/35 border-l-[3px] border-l-ps-green bg-[#dcece1] p-3">
            <div className="flex items-start gap-2.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-ps-green"
              >
                <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="m6 10.3 2.6 2.6L14.2 7.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-snug">
                  Compatible with the {platform.controller}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
                  {platform.console}. Also made for {compatibilityLine(product)}.{" "}
                  <Link
                    href="/compatibility"
                    className="text-ink-dim underline underline-offset-2 hover:text-ink"
                  >
                    Check my controller
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* --- controller selector: buttons, unavailable shown disabled --- */}
          <fieldset className="mt-6">
            <legend className="label mb-2.5 text-ink-mute">
              Controller<span className="ml-2 text-ink">{platform.short}</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => {
                const supported = product.platforms.includes(p.id);
                const v = variantFor(product, designId, p.id);
                const out = supported && (!v || v.stock === 0);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!supported}
                    onClick={() => setPlatformId(p.id)}
                    aria-pressed={platformId === p.id}
                    className={cn(
                      "cut-sm relative px-3 py-2.5 text-left transition-colors",
                      platformId === p.id
                        ? "plate-in ring-1 ring-ink"
                        : "plate hover:bg-[var(--color-plate-hi)]",
                      !supported && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <span className="block text-[12.5px] font-bold">{p.short}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-mute">
                      {out ? "Sold out" : !supported ? "Not made" : p.console}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* One design per grip, so this is cross-navigation rather than a
              variant picker: the sibling surfaces, previewed on the controller
              the visitor has already selected. */}
          <fieldset className="mt-6">
            <legend className="mb-2.5 flex w-full items-baseline justify-between">
              <span className="label text-ink-mute">
                Surface<span className="ml-2 text-ink">{design?.name}</span>
              </span>
              <Link href="/controller-grips" className="label text-ink-mute hover:text-ink">
                Compare all 6 →
              </Link>
            </legend>
            <ul className="flex flex-wrap gap-2">
              {PRODUCTS.map((g) => {
                const d = designById(g.designs[0])!;
                const on = g.slug === product.slug;
                const v = variantFor(g, g.designs[0], platformId);
                const out = !v || v.stock === 0;
                return (
                  <li key={g.slug}>
                    <Link
                      href={`/products/${g.slug}?platform=${platformId}`}
                      aria-current={on ? "page" : undefined}
                      title={`${g.name} — ${textureById(g.texture)?.name}${out ? " (sold out)" : ""}`}
                      className={cn(
                        "relative block h-12 w-12 overflow-hidden rounded-[var(--radius-sm)] ring-offset-2 ring-offset-void transition-all",
                        on ? "ring-2 ring-ink" : "ring-1 ring-bev-3 hover:ring-ink-mute",
                      )}
                    >
                      <DesignSwatch design={d} size={42} />
                      {out && (
                        <span className="absolute inset-0 bg-black/70" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-full w-full text-ink-dim">
                            <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        </span>
                      )}
                      <span className="sr-only">{g.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {design && (
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-mute">
                {design.blurb}
              </p>
            )}
          </fieldset>

          {/* --- texture cross-reference ---------------------------------- */}
          {texture && (
            <div className="plate-in mt-4 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13.5px] font-medium">Texture: {texture.name}</p>
                <Link
                  href="/guides/grip-texture-comparison"
                  className="label shrink-0 text-ink-mute transition-colors hover:text-ink"
                >
                  Compare all 5 →
                </Link>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">
                {texture.feel}
              </p>
              <dl className="mt-3 space-y-2">
                {[
                  ["Grip", texture.grip],
                  ["Cushion", texture.cushion],
                ].map(([label, v]) => (
                  <div key={label as string} className="flex items-center gap-3">
                    <dt className="label w-14 shrink-0 text-ink-mute">{label}</dt>
                    <dd className="flex flex-1 gap-[2px]" aria-label={`${v} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={cn(
                            "h-[10px] flex-1",
                            n <= (v as number) ? "bg-[var(--color-blk-green)]" : "bg-[#a8a7a2]",
                          )}
                        />
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* --- stock + add ----------------------------------------------- */}
          <div className="plate-in mt-4 flex items-center gap-2 px-3 py-2">
            <span
              className={cn(
                "h-2.5 w-2.5",
                stock.tone === "ok" && "bg-[var(--color-blk-green)]",
                stock.tone === "low" && "bg-[var(--color-blk-yellow)]",
                stock.tone === "out" && "bg-[#a8a7a2]",
              )}
              aria-hidden="true"
            />
            <p
              className={cn(
                "text-[12px] font-bold",
                stock.tone === "ok" && "text-ps-green",
                stock.tone === "low" && "text-ps-yellow",
                stock.tone === "out" && "text-ink-mute",
              )}
            >
              {stock.text}
            </p>
            {variant && (
              <span className="label ml-auto text-ink-mute">SKU {variant.sku}</span>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <QtyStepper
              qty={qty}
              onChange={(n) => setQty(Math.max(1, n))}
              label="Quantity"
              size="md"
            />
            <Button
              size="lg"
              variant={added ? "go" : "primary"}
              className="flex-1"
              disabled={soldOut}
              onClick={onAdd}
              aria-live="polite"
            >
              {soldOut ? "SOLD OUT" : added ? "ADDED ✓" : "ADD TO CART"}
            </Button>
          </div>

          {soldOut && (
            <p className="plate-in cut-sm mt-3 p-3 text-[13px] leading-relaxed text-ink-dim">
              This design is sold out for the {platform.short}. Pick another
              design above, or another controller — the same design is usually in
              stock for a different mould.
            </p>
          )}

          {/* Express checkout above the fold of the payment step; on mobile it
              collapses the whole form to one biometric tap. */}
          {!soldOut && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Apple Pay", "PayPal"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={onAdd}
                  className="plate cut-sm h-10 text-[12.5px] font-bold text-ink hover:bg-[var(--color-plate-hi)]"
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* --- reassurance ------------------------------------------------ */}
          <ul className="border-t border-edge mt-5 space-y-2.5 pt-4">
            {[
              {
                t: `Arrives ${eta.earliest} – ${eta.latest}`,
                s: "Ordered before 16:00 on a weekday ships the same day from Rotterdam.",
              },
              {
                t: `${RETURN_DAYS}-day returns, worn or not`,
                s: "If the texture is wrong for you, send it back. We pay return postage inside the EU.",
              },
              {
                t: `Fitted in ${product.installMinutes || 1} minute${product.installMinutes > 1 ? "s" : ""}`,
                s: "Friction fit. No adhesive, no tools, no residue on the controller.",
              },
            ].map((r) => (
              <li key={r.t} className="flex gap-2.5">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-mute"
                >
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="m4.8 8.2 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-ink">{r.t}</span>
                  <span className="block text-ink-mute">{r.s}</span>
                </p>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      {/* Sticky mobile buy bar — the PDP is long, the CTA must stay reachable */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 px-3 py-2 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{product.name}</p>
            <p className="truncate text-[12px] text-ink-mute">
              {design ? `${design.name} · ` : ""}
              {platform.short}
            </p>
          </div>
          <Price value={product.price} compareAt={product.compareAt} size="sm" />
          <Button size="md" variant="primary" disabled={soldOut} onClick={onAdd} className="shrink-0">
            {soldOut ? "SOLD OUT" : added ? "ADDED ✓" : "ADD"}
          </Button>
        </div>
      </div>
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
}
