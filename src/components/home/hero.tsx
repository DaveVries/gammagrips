"use client";

import Link from "next/link";
import { useState } from "react";
import { COLLECTIONS, DESIGNS, PRODUCTS, designById, textureById } from "@/data/catalog";
import { DesignSwatch } from "@/components/product/controller-render";
import { ProductVisual } from "@/components/product/product-visual";
import { ButtonLink, Well } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";

const ORDER = ["dark-matter", "volt", "ember", "vapor", "venom", "ice-froyo"];

/**
 * The hero is the demo. The design row swaps the product with no image request
 * and no layout shift — an autorotating carousel would be unreadable and never
 * behaves on mobile.
 */
export function Hero() {
  const [id, setId] = useState("dark-matter");
  const design = designById(id)!;
  const collection = COLLECTIONS.find((c) => c.id === design.collection)!;
  const product = PRODUCTS.find((p) => p.designs[0] === id)!;
  const texture = textureById(product.texture)!;

  return (
    <section className="gutter pt-6 md:pt-9">
      <div
        className="shell glass glass-hi cut relative overflow-hidden"
        /* The slab picks up the selected grip's accent, so switching designs
           relights the whole hero rather than just swapping a picture. */
        style={{ ["--accent" as string]: design.ink }}
      >
        <div className="ps-rule h-[3px] w-full" />

        {/* Accent wash + oversized face-button watermark. Both are decoration
            and sit behind everything, hence aria-hidden and pointer-events-none. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-[background] duration-700"
          style={{
            background:
              "radial-gradient(60% 70% at 78% 18%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 70%)",
          }}
        />
        <span
          aria-hidden="true"
          className="display pointer-events-none absolute -right-6 -top-10 z-0 select-none text-[190px] leading-none tracking-[-0.06em] text-[rgba(255,255,255,0.05)] sm:text-[260px]"
        >
          GG
        </span>

        <div className="relative z-[1] grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:gap-10 lg:p-12">
        {/* --- copy -------------------------------------------------------- */}
        <div className="lg:col-span-5" data-reveal>
          <p className="label mb-5 inline-flex items-center gap-2 text-ink-mute">
            <span className="ps-rule inline-block h-[3px] w-10" />
            CONTROLLER GRIPS
          </p>
          <h1 className="shout text-[38px] sm:text-[48px] xl:text-[55px]">
            More grip.
            <br />
            <span className="oblique text-ink-dim">
              Your controller.
            </span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-dim">
            Six moulded grip shells for the PS5 DualSense and the Xbox Wireless
            Controller. The pattern is the relief, so what you see is what your
            hand feels. Fitted in two minutes, no adhesive.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/controller-grips" size="lg" variant="primary">
              Shop all six
            </ButtonLink>
            <ButtonLink href="/customize" size="lg">
              Find my grip
            </ButtonLink>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 border-t border-plate-edge pt-6">
            {[
              ["6", "Grips"],
              ["5", "Surfaces"],
              ["4", "Controllers"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="display text-[30px] leading-none tabular-nums">{n}</dt>
                <dd className="label mt-2 text-ink-mute">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* --- product ------------------------------------------------------ */}
        <div className="lg:col-span-7" data-reveal data-reveal-delay="70">
          <div
            className="relative"
            /* Accent halo behind the screen. Sits outside the Well so the
               clip-path on .cut does not eat it. */
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 z-0 opacity-70 blur-3xl transition-[background] duration-700"
              style={{
                background:
                  "radial-gradient(50% 55% at 50% 45%, color-mix(in srgb, var(--accent) 55%, transparent), transparent 72%)",
              }}
            />
          <Well className="cut drop relative z-[1]">
            <ProductVisual
              product={product}
              design={design}
              platformId="dualsense"
              className="relative z-[1] w-full"
            />
            {/* readout, floated over the screen like a console HUD */}
            <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-wrap items-center gap-x-4 gap-y-1 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8">
              <span className="display text-[15px] text-ink">{design.name}</span>
              <span className="label text-ink-mute">{collection.name}</span>
              <span className="label text-ink-mute">{texture.name}</span>
              <span className="label text-ink-mute">{texture.profile}</span>
              <span className="ml-auto display text-[15px] tabular-nums text-ink">
                {money(product.price)}
              </span>
            </div>
          </Well>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="label shrink-0 text-ink-mute">Select</span>
            <ul className="no-bar flex gap-2 overflow-x-auto">
              {ORDER.map((d) => {
                const item = DESIGNS.find((x) => x.id === d)!;
                return (
                  <li key={d}>
                    <button
                      type="button"
                      onMouseEnter={() => setId(d)}
                      onFocus={() => setId(d)}
                      onClick={() => setId(d)}
                      aria-pressed={id === d}
                      aria-label={`Preview ${item.name}`}
                      className={cn(
                        "sheen press cut-sm block p-[3px] transition-colors",
                        id === d ? "bg-[var(--color-blk-blue)]" : "plate hover:bg-[var(--color-plate-hi)]",
                      )}
                    >
                      <DesignSwatch design={item} size={38} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/collections"
              className="label ml-auto hidden shrink-0 text-ink-mute hover:text-ink sm:block"
            >
              All designs →
            </Link>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
