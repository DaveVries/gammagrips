"use client";

import Link from "next/link";
import { useState } from "react";
import { PLATFORMS, PRODUCTS, designById } from "@/data/catalog";
import { ControllerRender } from "@/components/product/controller-render";
import { ProductGrid } from "@/components/product/product-card";
import { Badge, ButtonLink, Rule, SectionHead } from "@/components/ui/primitives";
import { inStock } from "@/lib/shop";
import { cn } from "@/lib/utils";
import type { PlatformFamily, PlatformId } from "@/lib/types";

/* A finder, not a form: two questions, an explicit "I don't know" route, and a
   named unsupported outcome rather than silence. */

const UNSUPPORTED = [
  { name: "DualShock 4", why: "PS4 handle geometry — a different shell entirely." },
  { name: "Xbox One, pre-2016", why: "No 3.5 mm jack in the bottom edge. Different mould." },
  { name: "Switch Pro Controller", why: "We do not tool for Nintendo yet." },
  { name: "Joy-Con", why: "Nothing to grip — no handle to mould around." },
  { name: "Third-party pads", why: "Victrix, Nacon, 8BitDo and similar are not supported." },
];

export function CompatibilityChecker() {
  const [family, setFamily] = useState<PlatformFamily | null>(null);
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? null;
  const fits = platform ? PRODUCTS.filter((p) => p.platforms.includes(platform.id)) : [];

  return (
    <div className="gutter">
      <div className="shell py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* --- q1 --- */}
            <fieldset>
              <legend className="flex items-baseline gap-3">
                <span className="label flex h-5 w-5 items-center justify-center rounded-full border border-edge text-ink-mute">
                  1
                </span>
                <span className="text-[16px] font-semibold">Which console is it for?</span>
              </legend>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(
                  [
                    ["playstation", "PlayStation 5"],
                    ["xbox", "Xbox Series X|S"],
                  ] as const
                ).map(([f, label]) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFamily(f);
                      setPlatformId(null);
                    }}
                    aria-pressed={family === f}
                    className={cn(
                      "rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-colors",
                      family === f ? "border-ink plate-in" : "border-edge hover:border-edge",
                    )}
                  >
                    <span className="block text-[14.5px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* --- q2 --- */}
            {family && (
              <fieldset className="mt-9 border-t border-edge pt-7">
                <legend className="flex items-baseline gap-3">
                  <span className="label flex h-5 w-5 items-center justify-center rounded-full border border-edge text-ink-mute">
                    2
                  </span>
                  <span className="text-[16px] font-semibold">Which controller?</span>
                </legend>
                <p className="mt-2 pl-8 text-[13.5px] leading-relaxed text-ink-mute">
                  {family === "playstation"
                    ? "Turn it over. If there is a removable panel with two paddle slots, it is an Edge."
                    : "Turn it over. If there are four paddle slots and a rubberised wrap, it is an Elite Series 2."}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PLATFORMS.filter((p) => p.family === family).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatformId(p.id)}
                      aria-pressed={platformId === p.id}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-colors",
                        platformId === p.id
                          ? "border-ink plate-in"
                          : "border-edge hover:border-edge",
                      )}
                    >
                      <ControllerRender
                        design={designById("ice-froyo")!}
                        platformId={p.id}
                        flat
                        className="h-12 w-16 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium">
                          {p.short}
                        </span>
                        <span className="block truncate text-[12px] text-ink-mute">
                          {p.console}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* --- result --- */}
            {platform && (
              <div
                className="mt-9 rounded-[var(--radius-lg)] border border-ps-green/30 glass p-5"
                role="status"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="green">Supported</Badge>
                  <p className="text-[15px] font-semibold">
                    All six grips fit the {platform.short}
                  </p>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
                  Full name: <strong className="text-ink">{platform.controller}</strong>{" "}
                  ({platform.console}). Every shell is cut around the USB-C port,
                  both triggers, the headphone jack
                  {platform.id === "dualsense-edge" || platform.id === "xbox-elite-2"
                    ? " and the rear module, so stick modules and paddles still swap out"
                    : ""}
                  .
                </p>
                <p className="mt-2 text-[13.5px] text-ink-dim">
                  {fits.filter(inStock).length} of {fits.length} are in stock for
                  this controller right now.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href={`/controller-grips?platform=${platform.id}`} size="sm">
                    Shop grips for the {platform.short}
                  </ButtonLink>
                  <ButtonLink href={`/customize?platform=${platform.id}`} size="sm" variant="default">
                    Help me choose a surface
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>

          {/* --- not supported --- */}
          <div className="lg:col-span-5">
            <div className="rounded-[var(--radius-lg)] border border-edge p-5">
              <h2 className="text-[15px] font-semibold">What we do not fit</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
                Stated plainly so you do not have to guess. If you order for the
                wrong controller, our 60-day window covers the mistake either way.
              </p>
              <ul className="mt-4 space-y-3">
                {UNSUPPORTED.map((u) => (
                  <li key={u.name} className="flex gap-2.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-ink-mute"
                    >
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5.4 5.4 10.6 10.6M10.6 5.4 5.4 10.6" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <span>
                      <span className="block text-[13.5px] font-medium">{u.name}</span>
                      <span className="block text-[12.5px] leading-snug text-ink-mute">
                        {u.why}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-edge pt-4 text-[13px] leading-relaxed text-ink-dim">
                Still not sure?{" "}
                <Link href="/contact" className="text-ink underline underline-offset-2">
                  Send us a photo of the bottom edge
                </Link>{" "}
                and we will tell you which mould you need before you order.
              </p>
            </div>
          </div>
        </div>

        {platform && (
          <>
            <Rule className="my-14" />
            <SectionHead
              eyebrow="Confirmed fit"
              title={`Grips for the ${platform.short}`}
              copy="Every one of these is moulded for the controller you selected."
            />
            <div className="mt-8">
              <ProductGrid products={fits} platformId={platform.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
