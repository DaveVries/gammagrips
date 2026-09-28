import Link from "next/link";
import type { PlatformId, Product } from "@/lib/types";
import { designById, platformById, textureById } from "@/data/catalog";
import { ProductShot } from "@/components/product/product-shot";
import { GripPhoto } from "@/components/product/grip-photo";
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
  /* The card used to carry a PS/Xbox preview toggle. We photograph the
     DualSense only, so both sides of it returned the same picture — a control
     that claimed to show you an Xbox and did not. Gone until Xbox renders
     exist; the card is a server component again as a result. */
  const renderPlatform: PlatformId = platformId ?? "dualsense";

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
      <Well
        className="hdr plate-in aspect-[4/3] !border-0"
        style={{ ["--hdr-glow" as string]: design?.ink }}
      >
        <ProductShot
          design={design!}
          platformId={renderPlatform}
          className="absolute inset-0 z-[1] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
        />

        {product.badge && (
          <span className="absolute left-3 top-3 z-[2]">
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
          <span className="absolute left-3 top-3 z-[2]">
            <Badge tone="yellow">Sale</Badge>
          </span>
        )}
        {!available && (
          <span className="absolute right-3 top-3 z-[2]">
            <Badge>Sold out</Badge>
          </span>
        )}
      </Well>

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:gap-2.5 sm:p-4">
        <div>
          <h3 className="display text-[14px] leading-tight sm:text-[17px]">
            <Link
              href={`/products/${product.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {product.name}
            </Link>
          </h3>
          {/* Compatibility on the card — never make someone open the product
              page to find out whether it fits. */}
          {/* Fit is a decision input, so it stays on mobile — just quieter. */}
          <CompatibilityBadge className="mt-1 hidden sm:mt-1.5 sm:block">
            {compatibilityLine(product)}
          </CompatibilityBadge>
        </div>

        <Rating
          value={product.rating}
          count={product.reviewCount}
          size={12}
          className="hidden sm:flex"
        />
        {/* Mobile keeps the score without the star row, which is unreadable at
            half width and costs a line of height. */}
        <p className="text-[11.5px] text-ink-dim sm:hidden">
          ★ {product.rating.toFixed(1)}{" "}
          <span className="text-ink-mute">({product.reviewCount})</span>
        </p>

        {texture && (
          <div className="hidden items-center gap-2 plate-in px-2.5 py-1.5 sm:flex">
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

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <Price value={product.price} compareAt={product.compareAt} />
            {thisOneOut && available && (
              <p className="mt-1 text-[11.5px] text-ink-mute">
                Sold out for {platformById(renderPlatform)?.short}
              </p>
            )}
          </div>
          <span className="cut-sm label relative z-10 shrink-0 bg-[var(--color-blk-blue)] px-2.5 py-2 text-[var(--color-on-blk-blue)] transition-[filter] group-hover:brightness-115 sm:px-3">
            View <span className="hidden sm:inline">→</span>
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
        "grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3",
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
      <span className="cut-sm plate-in relative h-14 w-14 shrink-0 overflow-hidden">
        <GripPhoto
          design={design!}
          platformId={platformId}
          sizes="56px"
          className="h-full w-full object-contain"
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
