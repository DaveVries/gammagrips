"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";
import { PRODUCTS, designById, platformById, productBySlug } from "@/data/catalog";
import { ProductVisual } from "@/components/product/product-visual";
import { ProductMini } from "@/components/product/product-card";
import { QtyStepper } from "@/components/cart/cart-drawer";
import {
  ButtonLink,
  CompatibilityBadge,
  Rule,
} from "@/components/ui/primitives";
import { FREE_SHIPPING_THRESHOLD, RETURN_DAYS, deliveryWindow, money } from "@/lib/utils";
import type { PlatformId } from "@/lib/types";

export function CartView() {
  const cart = useCart();
  const eta = deliveryWindow(new Date("2026-09-04T00:00:00Z"));

  const crossSell = useMemo(() => {
    const inCart = new Set(cart.lines.map((l) => l.slug));
    return PRODUCTS.filter((p) => !inCart.has(p.slug)).slice(0, 3);
  }, [cart.lines]);

  if (!cart.ready) {
    return (
      <div className="gutter">
        <div className="shell py-20">
          <div className="h-6 w-40 animate-pulse rounded glass" />
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="gutter">
        <div className="shell py-20 text-center">
          <h1 className="text-[26px] font-semibold tracking-tight">Your cart is empty</h1>
          <p className="mx-auto mt-3 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-dim">
            Six grips, four controllers. If you are not sure which surface suits
            your hands, the finder asks two questions and names one.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/customize" size="lg">
              Find my grip
            </ButtonLink>
            <ButtonLink href="/controller-grips" size="lg" variant="default">
              Browse all six
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gutter">
      <div className="shell py-8">
        <h1 className="text-[28px] font-semibold tracking-tight md:text-[34px]">
          Cart
          <span className="ml-3 text-[18px] font-normal text-ink-mute tabular-nums">
            {cart.count} item{cart.count === 1 ? "" : "s"}
          </span>
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* --- lines ---------------------------------------------------- */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-edge border-y border-edge">
              {cart.lines.map((line) => {
                const p = productBySlug(line.slug);
                if (!p) return null;
                const d = designById(line.designId);
                const pl = platformById(line.platformId as PlatformId);
                return (
                  <li key={line.key} className="flex gap-4 py-5">
                    <Link
                      href={`/products/${p.slug}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-edge glass"
                    >
                      <ProductVisual
                        product={p}
                        design={d}
                        platformId={line.platformId as PlatformId}
                        className="w-full"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${p.slug}`}
                            className="text-[15.5px] font-semibold leading-tight hover:underline"
                          >
                            {p.name}
                          </Link>
                          <p className="mt-1 text-[13px] text-ink-dim">
                            {d ? `${d.name} · ` : ""}
                            {pl?.short}
                          </p>
                          {/* Exact fit restated at the last checkpoint before
                              payment — a wrong mould is unusable. */}
                          <CompatibilityBadge className="mt-1.5">
                            Fits {pl?.controller}
                          </CompatibilityBadge>
                        </div>
                        <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                          {money(p.price * line.qty)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <QtyStepper
                          qty={line.qty}
                          onChange={(n) => cart.setQty(line.key, n)}
                          label={`Quantity for ${p.name}`}
                        />
                        <button
                          onClick={() => cart.remove(line.key)}
                          className="text-[13px] text-ink-mute underline underline-offset-2 transition-colors hover:text-ink"
                        >
                          Remove
                        </button>
                        <span className="ml-auto text-[12.5px] text-ink-mute">
                          {money(p.price)} each
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              <p className="label mb-3 text-ink-mute">Add another surface</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {crossSell.map((p) => (
                  <ProductMini
                    key={p.slug}
                    product={p}
                    platformId={cart.lines[0].platformId as PlatformId}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- summary --------------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="rounded-[var(--radius-lg)] border border-edge glass p-5 lg:sticky lg:top-24">
              <h2 className="text-[16px] font-semibold">Summary</h2>

              {/* No cost is revealed later than this point. */}
              <dl className="mt-4 space-y-2.5 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-ink-dim">Subtotal</dt>
                  <dd className="tabular-nums">{money(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-dim">
                    Delivery
                    <span className="ml-1.5 text-ink-mute">(EU, tracked)</span>
                  </dt>
                  <dd className="tabular-nums">
                    {cart.shipping === 0 ? "Free" : money(cart.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between text-ink-mute">
                  <dt>VAT (21%)</dt>
                  <dd className="tabular-nums">
                    included · {money(cart.total - cart.total / 1.21)}
                  </dd>
                </div>
                <Rule className="my-3" />
                <div className="flex justify-between text-[18px] font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(cart.total)}</dd>
                </div>
              </dl>

              {cart.toFreeShipping > 0 && (
                <div className="mt-4 rounded-[var(--radius-md)] plate-in p-3">
                  <p className="text-[12.5px] text-ink-dim">
                    Add{" "}
                    <span className="font-semibold text-ink">
                      {money(cart.toFreeShipping)}
                    </span>{" "}
                    for free delivery
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full plate-in">
                    <div
                      className="h-full rounded-full bg-ink transition-[width] duration-300"
                      style={{
                        width: `${Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <ButtonLink href="/checkout" size="lg" full className="mt-5">
                Checkout
              </ButtonLink>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {["Apple Pay", "PayPal"].map((m) => (
                  <Link
                    key={m}
                    href="/checkout?express=1"
                    className="flex h-11 items-center justify-center rounded-[var(--radius-md)] plate-in text-[13.5px] font-medium text-ink transition-colors hover:bg-[#1f242a]"
                  >
                    {m}
                  </Link>
                ))}
              </div>

              <ul className="mt-5 space-y-2 border-t border-edge pt-4 text-[12.5px] text-ink-mute">
                <li>Arrives {eta.earliest} – {eta.latest}</li>
                <li>{RETURN_DAYS}-day returns, return postage paid inside the EU</li>
                <li>No account required to order</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
