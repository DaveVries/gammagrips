import type { PlatformId, Product } from "@/lib/types";
import {
  PRICE_BANDS,
  buildFacets,
  matches,
  parseFilters,
  sortProducts,
  type SortId,
} from "@/lib/shop";
import { COLLECTIONS, PLATFORMS, TEXTURES } from "@/data/catalog";
import { ProductGrid } from "@/components/product/product-card";
import {
  AppliedFilters,
  FilterDrawer,
  FilterRail,
  SortSelect,
} from "@/components/plp/filter-controls";
import { ButtonLink, Win } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export interface PlpProps {
  /** Everything this route is allowed to show, before user filters. */
  pool: Product[];
  title: string;
  intro: string;
  eyebrow?: string;
  crumbs: { label: string; href?: string }[];
  searchParams: Record<string, string | string[] | undefined>;
  /** Scopes card previews (and compatibility) to one controller. */
  platformId?: PlatformId;
  /** Rendered above the grid — subcategory tiles on intermediary pages. */
  children?: React.ReactNode;
  /** Facet keys that are implied by the route and so must not be shown. */
  lockedFacets?: string[];
}

const LABELS: Record<string, (v: string) => string> = {
  platform: (v) => PLATFORMS.find((p) => p.id === v)?.short ?? v,
  texture: (v) => TEXTURES.find((t) => t.id === v)?.name ?? v,
  collection: (v) => COLLECTIONS.find((c) => c.id === v)?.name ?? v,
  price: (v) => PRICE_BANDS.find((b) => b.id === v)?.label ?? v,
  type: (v) =>
    v === "grips"
      ? "Controller grips"
      : v === "thumb-grips"
        ? "Thumb grips"
        : v === "stick-accessories"
          ? "Stick accessories"
          : v === "protection"
            ? "Cases & cables"
            : v === "care"
              ? "Care"
              : "Bundles",
  color: (v) => v[0].toUpperCase() + v.slice(1),
  availability: (v) => (v === "in-stock" ? "In stock" : "On sale"),
};

export function CollectionPage({
  pool,
  title,
  intro,
  eyebrow,
  crumbs,
  searchParams,
  platformId,
  children,
  lockedFacets = [],
}: PlpProps) {
  const filters = parseFilters(searchParams);
  const sort = ((Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort) ?? "popular") as SortId;

  const results = sortProducts(
    pool.filter((p) => matches(p, filters)),
    sort,
  );

  const groups = buildFacets(pool, filters).filter(
    (g) => !lockedFacets.includes(g.key),
  );

  const chips = (Object.keys(filters) as (keyof typeof filters)[])
    .filter((k) => !lockedFacets.includes(k))
    .flatMap((k) =>
      filters[k].map((v) => ({
        key: k,
        value: v,
        label: LABELS[k]?.(v) ?? v,
      })),
    );

  const active = chips.length;

  return (
    <>
      <div className="gutter pt-3">
        <div className="shell">
          <Win
            title={eyebrow ?? title}
            right={<span className="label text-[9.5px] opacity-85">{pool.length} ITEMS</span>}
            bodyClass="p-4 md:p-5"
          >
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-3 text-[26px] font-bold leading-tight md:text-[32px]">{title}</h1>
            <p className="mt-2.5 max-w-[62ch] text-[14px] leading-relaxed text-ink-dim">
              {intro}
            </p>
          </Win>
        </div>
      </div>

      {children}

      <div className="gutter">
        <div className="shell grid gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-5">
          {/* --- desktop rail ------------------------------------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-[70px]">
              <Win
                title="FILTER"
                right={
                  <span className="label text-[9.5px] tabular-nums opacity-85">
                    {results.length}/{pool.length}
                  </span>
                }
                bodyClass="glass cut px-3 pb-2 pt-1"
              >
                <FilterRail groups={groups} filters={filters} />
              </Win>
            </div>
          </aside>

          <div className="min-w-0">
            {/* --- toolbar ---------------------------------------------- */}
            <div className="glass cut-sm flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:justify-between">
              <p className="order-1 shrink-0 text-[13.5px] text-ink-dim">
                <span className="font-semibold tabular-nums text-ink">
                  {results.length}
                </span>{" "}
                {results.length === 1 ? "product" : "products"}
              </p>
              <div className="order-3 flex w-full items-center gap-2 sm:order-2 sm:w-auto">
                <div className="lg:hidden">
                  <FilterDrawer
                    groups={groups}
                    filters={filters}
                    total={results.length}
                    activeCount={active}
                  />
                </div>
                <div className="ml-auto">
                  <SortSelect value={sort} />
                </div>
              </div>
            </div>

            {/* Applied filters stay above the grid on every breakpoint — the
                single most-failed mobile guideline in the benchmark. */}
            {active > 0 && (
              <div className="border border-edge mt-2 plate-in px-3 py-2.5">
                <AppliedFilters chips={chips} />
              </div>
            )}

            <div className="mt-3">
              {results.length > 0 ? (
                <ProductGrid products={results} platformId={platformId} />
              ) : (
                <EmptyState pool={pool} platformId={platformId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Never a bare "no results": say what happened and offer a route forward. */
function EmptyState({ pool, platformId }: { pool: Product[]; platformId?: PlatformId }) {
  const fallback = sortProducts(pool, "popular").slice(0, 4);
  return (
    <div>
      <div className="glass p-8 text-center">
        <p className="text-[15px] font-bold">No products match all of those filters</p>
        <p className="mx-auto mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ink-dim">
          Try removing one — colour and texture together are the combination that
          most often comes back empty, because not every design is made in every
          texture.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/customize" size="sm">
            Use the configurator instead
          </ButtonLink>
          <ButtonLink href="/contact" size="sm" variant="default">
            Ask us what fits
          </ButtonLink>
        </div>
      </div>
      {fallback.length > 0 && (
        <div className="mt-10">
          <h2 className="label mb-4 text-ink-mute">Popular in this category</h2>
          <ProductGrid products={fallback} platformId={platformId} />
        </div>
      )}
    </div>
  );
}
