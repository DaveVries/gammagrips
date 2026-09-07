"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";
import { designById, platformById, productBySlug } from "@/data/catalog";
import { ProductVisual } from "@/components/product/product-visual";
import { Button, ButtonLink, CompatibilityBadge, Groove } from "@/components/ui/primitives";
import { FREE_SHIPPING_THRESHOLD, cn, deliveryWindow, money } from "@/lib/utils";
import type { PlatformId } from "@/lib/types";

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = cart.open ? "hidden" : "";
    if (cart.open) closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [cart.open]);

  // Escape to close, Tab trapped inside the panel
  useEffect(() => {
    if (!cart.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return cart.setOpen(false);
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart.open, cart]);

  const eta = deliveryWindow(new Date("2026-09-04T00:00:00Z"));
  const pct = Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!cart.open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        className="absolute inset-0 cursor-default bg-[#000]/45"
        onClick={() => cart.setOpen(false)}
        aria-label="Close cart"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-[min(440px,100vw)] flex-col glass p-[3px] shadow-[-18px_0_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="titlebar flex h-[26px] shrink-0 items-center justify-between px-2">
          <h2 className="label text-[10px]">
            SHOPPING CART — {cart.count} ITEM{cart.count === 1 ? "" : "S"}
          </h2>
          <button
            ref={closeRef}
            onClick={() => cart.setOpen(false)}
            className="border border-edge flex h-[18px] w-[19px] items-center justify-center glass text-ink active:border border-edge-hi"
            aria-label="Close cart"
          >
            <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2 14 14M14 2 2 14" stroke="currentColor" strokeWidth="2.4" />
            </svg>
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-[15px] font-medium text-ink">Your cart is empty</p>
            <p className="max-w-[26ch] text-[13.5px] leading-relaxed text-ink-dim">
              Not sure which grip you need? The configurator walks you through
              controller, texture and design in three steps.
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <ButtonLink href="/customize" variant="primary" full>
                Find my grip
              </ButtonLink>
              <ButtonLink href="/controller-grips" variant="default" full>
                Browse all grips
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            {/* free-shipping progress */}
            <Groove className="shrink-0 px-3 py-2.5">
              {cart.toFreeShipping > 0 ? (
                <p className="text-[12.5px] text-ink-dim">
                  <span className="font-semibold text-ink">
                    {money(cart.toFreeShipping)}
                  </span>{" "}
                  away from free delivery
                </p>
              ) : (
                <p className="text-[12.5px] font-medium text-ps-green">
                  Free delivery applied
                </p>
              )}
              <div className="border border-edge mt-2 h-3 plate-in p-[2px]">
                <div
                  className="h-full bg-[var(--color-blk-green)] transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Groove>

            <ul className="flex-1 space-y-[3px] overflow-y-auto overscroll-contain plate-in p-[3px]">
              {cart.lines.map((line) => {
                const p = productBySlug(line.slug);
                if (!p) return null;
                const d = designById(line.designId);
                const pl = platformById(line.platformId as PlatformId);
                return (
                  <li key={line.key} className="glass flex gap-3 glass p-2.5">
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => cart.setOpen(false)}
                      className="border border-edge h-[70px] w-[70px] shrink-0 overflow-hidden bg-transparent"
                    >
                      <ProductVisual
                        product={p}
                        design={d}
                        platformId={line.platformId as PlatformId}
                        className="w-full"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => cart.setOpen(false)}
                          className="text-[13px] font-bold leading-tight text-ink hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="shrink-0 text-[14px] font-semibold tabular-nums">
                          {money(p.price * line.qty)}
                        </span>
                      </div>

                      {/* Exact variant, always spelled out */}
                      <p className="mt-1 text-[12.5px] text-ink-dim">
                        {d ? `${d.name} · ` : ""}
                        {pl?.short}
                      </p>
                      <CompatibilityBadge className="mt-1">
                        Fits {pl?.controller}
                      </CompatibilityBadge>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <QtyStepper
                          qty={line.qty}
                          onChange={(n) => cart.setQty(line.key, n)}
                          label={`Quantity for ${p.name}`}
                        />
                        <button
                          onClick={() => cart.remove(line.key)}
                          className="text-[12.5px] text-ink-mute underline underline-offset-2 transition-colors hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="shrink-0 p-3">
              <dl className="border border-edge mb-3 space-y-1.5 plate-in p-3 text-[12.5px]">
                <div className="flex justify-between">
                  <dt className="text-ink-dim">Subtotal</dt>
                  <dd className="tabular-nums">{money(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-dim">Delivery</dt>
                  <dd className="tabular-nums">
                    {cart.shipping === 0 ? "Free" : money(cart.shipping)}
                  </dd>
                </div>
                <div className="border-t border-edge flex justify-between pt-2 text-[14px] font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(cart.total)}</dd>
                </div>
              </dl>
              <p className="mb-3 text-[12px] text-ink-mute">
                VAT included. Arrives {eta.earliest} – {eta.latest}.
              </p>
              <ButtonLink href="/checkout" size="lg" variant="go" full>
                CHECKOUT →
              </ButtonLink>
              <Button
                variant="quiet"
                full
                size="sm"
                className="mt-1"
                onClick={() => cart.setOpen(false)}
              >
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Buttons, not a bare number field: typing into a quantity input is the single
   most-failed cart control in the benchmark (97% of sites get it wrong). */
export function QtyStepper({
  qty,
  onChange,
  label,
  size = "sm",
}: {
  qty: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-8" : "h-11";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div
      className={cn("border border-edge inline-flex items-center plate-in", h)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        className={cn("card m-[2px] flex items-center justify-center glass text-ink active:translate-x-[1px]", h === "h-8" ? "h-6" : "h-8", w)}
        aria-label="Decrease quantity"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      <span
        className="min-w-[1.9rem] text-center text-[12px] font-bold tabular-nums"
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= 10}
        className={cn(
          "card m-[2px] flex items-center justify-center glass text-ink active:translate-x-[1px] disabled:opacity-40",
          h === "h-8" ? "h-6" : "h-8",
          w,
        )}
        aria-label="Increase quantity"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
