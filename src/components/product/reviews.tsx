"use client";

import { useMemo, useState } from "react";
import type { Product, Review } from "@/lib/types";
import { designById, platformById } from "@/data/catalog";
import { DesignSwatch } from "@/components/product/controller-render";
import { Badge, Groove, Stars } from "@/components/ui/primitives";
import { cn, count as fmt, dateLabel } from "@/lib/utils";

/**
 * The ratings histogram is the integrity mechanism, not decoration: without a
 * visible distribution people assume negative reviews have been filtered out.
 * Bars are clickable filters (users try to click them regardless), expanded by
 * default, and mutually exclusive — one rating is examined at a time.
 */
export function Reviews({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [star, setStar] = useState<number | null>(null);
  const [sort, setSort] = useState<"helpful" | "recent" | "critical">("helpful");
  const [shown, setShown] = useState(4);

  const total = product.ratingBreakdown.reduce((a, b) => a + b, 0);

  const filtered = useMemo(() => {
    let list = star ? reviews.filter((r) => r.rating === star) : [...reviews];
    list = list.sort((a, b) => {
      if (sort === "recent") return b.date.localeCompare(a.date);
      if (sort === "critical") return a.rating - b.rating || b.helpful - a.helpful;
      return b.helpful - a.helpful;
    });
    return list;
  }, [reviews, star, sort]);

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* --- summary --------------------------------------------------- */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-[20px] font-bold">Reviews</h2>

            <Groove className="mt-4 flex items-end gap-3 p-3">
              <p className="text-[40px] font-bold leading-none tabular-nums">
                {product.rating.toFixed(1)}
              </p>
              <div className="pb-1">
                <Stars value={product.rating} size={15} />
                <p className="mt-1 text-[12px] text-ink-mute">
                  {fmt(product.reviewCount)} reviews
                </p>
              </div>
            </Groove>

            <ul className="mt-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s, i) => {
                const n = product.ratingBreakdown[i];
                const pct = total ? (n / total) * 100 : 0;
                const on = star === s;
                return (
                  <li key={s}>
                    <button
                      onClick={() => setStar(on ? null : s)}
                      aria-pressed={on}
                      className={cn(
                        "group flex w-full items-center gap-2.5 px-1.5 py-1",
                        on ? "plate-in" : "hover:plate-in",
                      )}
                    >
                      <span className="w-8 shrink-0 text-left text-[12.5px] tabular-nums text-ink-dim">
                        {s} ★
                      </span>
                      <span className="border border-edge h-3 flex-1 plate-in p-[2px]">
                        <span
                          className={cn(
                            "block h-full",
                            on ? "bg-ps-blue" : "bg-ps-yellow",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-ink-mute">
                        {fmt(n)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {star && (
              <button
                onClick={() => setStar(null)}
                className="mt-3 text-[12.5px] text-ink-mute underline underline-offset-2 hover:text-ink"
              >
                Show all ratings
              </button>
            )}

            {/* Category-specific subscores. For grips the anxiety dimension is
                FIT — the same role "fit" plays in apparel. */}
            <dl className="border-t border-edge mt-6 space-y-3 pt-5">
              <p className="label mb-1 text-ink-mute">Rated on</p>
              {product.subscores.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <dt className="w-20 shrink-0 text-[13px] text-ink-dim">{s.label}</dt>
                  <dd className="flex flex-1 items-center gap-2.5">
                    <span className="border border-edge h-3 flex-1 plate-in p-[2px]">
                      <span
                        className="block h-full bg-ps-green"
                        style={{ width: `${(s.score / 5) * 100}%` }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right text-[12.5px] tabular-nums text-ink">
                      {s.score.toFixed(1)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-[12px] leading-relaxed text-ink-mute">
              Every review is from a verified order. We do not remove negative
              reviews, and we reply to the critical ones in public.
            </p>
          </div>
        </div>

        {/* --- list ------------------------------------------------------- */}
        <div className="lg:col-span-8">
          <div className="card flex flex-wrap items-center justify-between gap-3 plate px-3 py-2">
            <p className="text-[13.5px] text-ink-dim">
              Showing{" "}
              <span className="font-semibold text-ink tabular-nums">
                {Math.min(shown, filtered.length)}
              </span>{" "}
              of {filtered.length}
              {star ? ` ${star}-star` : ""} review{filtered.length === 1 ? "" : "s"}
            </p>
            <label className="inline-flex items-center gap-2">
              <span className="label text-ink-mute">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="border border-edge h-8 plate-in px-2 pr-7 text-[12px] outline-none"
              >
                <option value="helpful">Most helpful</option>
                <option value="recent">Most recent</option>
                <option value="critical">Most critical</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-ink-dim">
              No {star}-star reviews for this product yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {filtered.slice(0, shown).map((r) => {
                const d = designById(r.designId);
                const pl = platformById(r.platformId);
                return (
                  <li key={r.id} className="glass cut-sm p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars value={r.rating} size={13} />
                      <span className="text-[13px] font-medium">{r.author}</span>
                      {r.verified && <Badge tone="green">Verified purchase</Badge>}
                      <span className="label ml-auto text-ink-mute">
                        {dateLabel(r.date)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[14px] font-bold leading-snug">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
                      {r.body}
                    </p>

                    <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                      {d && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="border border-edge p-[2px]"><DesignSwatch design={d} size={16} /></span>
                          <span className="text-[12.5px] text-ink-mute">{d.name}</span>
                        </span>
                      )}
                      <span className="text-[12.5px] text-ink-mute">{pl?.short}</span>
                      <span className="text-[12.5px] text-ink-mute">
                        Owned {r.ownedWeeks} week{r.ownedWeeks === 1 ? "" : "s"}
                      </span>
                      <span className="text-[12.5px] text-ink-mute">
                        {r.helpful} found this helpful
                      </span>
                    </div>

                    {/* Brand replies are styled distinctly from customer text */}
                    {r.response && (
                      <div className="cut-sm mt-3.5 border border-ps-blue/30 border-l-[3px] border-l-ps-blue bg-[#dde5f4] p-3">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <p className="text-[13px] font-semibold">{r.response.from}</p>
                          <span className="label text-ink-mute">
                            {dateLabel(r.response.date)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
                          {r.response.body}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {shown < filtered.length && (
            <button
              onClick={() => setShown((n) => n + 6)}
              className="card mt-3 h-11 w-full plate text-[13px] font-bold text-ink hover:plate-in active:translate-x-[1px]"
            >
              Show more reviews
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
