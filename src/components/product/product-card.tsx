"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlatformFamily, PlatformId, Product } from "@/lib/types";
import { designById, platformById, textureById } from "@/data/catalog";
import { ProductVisual } from "@/components/product/product-visual";
import {
  Badge,
  CompatibilityBadge,
  Price,
  Rating,
  Well,
} from "@/components/ui/primitives";
import { compatibilityLine, inStock, variantFor } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  platformId,
  className,
}: {
  product: Product;
  /** When the page has a controller scope, the card respects it. */
  platformId?: PlatformId;
  className?: string;
}) {
  /* With one design per grip there is no swatch row to browse, so the card
     instead lets you see the grip on either controller family — the question
     people actually have while scanning a grid. */
  const [family, setFamily] = useState<PlatformFamily | null>(null);
  const scoped = platformId ? platformById(platformId)?.family : null;
  const shownFamily = family ?? scoped ?? "playstation";
  const renderPlatform: PlatformId =
    platformId && platformById(platformId)?.family === shownFamily
      ? platformId
      : shownFamily === "playstation"
        ? "dualsense"
        : "xbox-series";

  const design = designById(product.designs[0]);
  const texture = textureById(product.texture);
  const available = inStock(product);
  const variant = variantFor(product, product.designs[0] ?? null, renderPlatform);
  const thisOneOut = !variant || variant.stock === 0;

  return (
    <article
      className={cn(
        "group plate cut drop lift sheen relative flex flex-col transition-colors duration-150 hover:bg-[var(--color-plate-hi)]",
        className,
      )}
    >
      <Well className="plate-in !border-0 border-b border-[var(--color-plate-edge)]">
        <ProductVisual
          product={product}
          design={design}
          platformId={renderPlatform}
          className="relative z-[1] w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]"
        />

        {product.badge && (
          <span className="absolute left-2 top-2 z-[2]">
            <Badge tone="blue">
              {product.badge === "new"
                ? "New"
                : product.badge === "limited"
                  ? "Limited"
                  : "Best seller"}
            </Badge>
          </span>
        )}
        {product.compareAt && !product.badge && (
          <span className="absolute left-2 top-2 z-[2]">
            <Badge tone="yellow">Sale</Badge>
          </span>
        )}
        {!available && (
          <span className="absolute right-2 top-2 z-[2]">
            <Badge>Sold out</Badge>
          </span>
        )}

        {/* controller-family preview toggle */}
        {!platformId && (
          <div className="absolute bottom-3 left-3 z-10 flex gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
            {(
              [
                ["playstation", "PS"],
                ["xbox", "Xbox"],
              ] as const
            ).map(([f, label]) => (
              <button
                key={f}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFamily(f);
                }}
                aria-pressed={shownFamily === f}
                aria-label={`Preview on ${label === "PS" ? "PlayStation" : "Xbox"} controller`}
                className={cn(
                  "cut-sm label px-2 py-1 backdrop-blur transition-colors",
                  shownFamily === f
                    ? "bg-[var(--color-blk-blue)] text-[var(--color-on-blk-blue)]"
                    : "plate text-ink hover:bg-[var(--color-plate-hi)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </Well>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="display text-[17px] leading-tight">
            <Link
              href={`/products/${product.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {product.name}
            </Link>
          </h3>
          {/* Compatibility on the card — never make someone open the product
              page to find out whether it fits. */}
          <CompatibilityBadge className="mt-1.5">
            {compatibilityLine(product)}
          </CompatibilityBadge>
        </div>

        <Rating value={product.rating} count={product.reviewCount} size={12} />

        {texture && (
          <div className="flex items-center gap-2 plate-in px-2.5 py-1.5">
            <span className="text-[11.5px] font-semibold text-ink-dim">{texture.name}</span>
            <span className="label text-ink-mute">{texture.profile}</span>
            <span className="ml-auto flex gap-[2px]" aria-label={`Grip ${texture.grip} out of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-[9px] w-[5px]",
                    n <= texture.grip ? "bg-[var(--color-blk-green)]" : "bg-[var(--color-pip-off)]",
                  )}
                />
              ))}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div>
            <Price value={product.price} compareAt={product.compareAt} />
            {thisOneOut && available && (
              <p className="mt-1 text-[11.5px] text-ink-mute">
                Sold out for {platformById(renderPlatform)?.short}
              </p>
            )}
          </div>
          <span className="cut-sm label relative z-10 bg-[var(--color-blk-blue)] px-3 py-2 text-[var(--color-on-blk-blue)] transition-[filter] group-hover:brightness-115">
            View →
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  platformId,
  className,
}: {
  products: Product[];
  platformId?: PlatformId;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} platformId={platformId} />
      ))}
    </div>
  );
}

/* --- compact row, used in the cart drawer cross-sell ----------------------- */

export function ProductMini({
  product,
  platformId,
}: {
  product: Product;
  designId?: string | null;
  platformId: PlatformId;
}) {
  const design = designById(product.designs[0]);
  const pl = platformById(platformId);
  return (
    <Link
      href={`/products/${product.slug}?platform=${platformId}`}
      className="plate cut-sm flex items-center gap-3 p-2.5 transition-colors hover:bg-[var(--color-plate-hi)]"
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden border border-edge plate-in">
        <ProductVisual
          product={product}
          design={design}
          platformId={platformId}
          className="w-full"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">
          {product.name}
        </span>
        <span className="block truncate text-[12px] text-ink-mute">{pl?.short}</span>
      </span>
      <span className="shrink-0 text-[13px] font-semibold tabular-nums">
        {new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
          product.price,
        )}
      </span>
    </Link>
  );
}
