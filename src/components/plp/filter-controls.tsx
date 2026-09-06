"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FacetGroup, Filters } from "@/lib/shop";
import { SORTS } from "@/lib/shop";
import { cn } from "@/lib/utils";

/* ============================================================================
   Filtering is URL-driven: every state is linkable, shareable and survives a
   refresh or a back-navigation. The controls only push query params.
   ========================================================================= */

function useFilterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const current = next.getAll(key);
      next.delete(key);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updated.forEach((v) => next.append(key, v));
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearOne = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const rest = next.getAll(key).filter((v) => v !== value);
      next.delete(key);
      rest.forEach((v) => next.append(key, v));
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
    router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  const setSort = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value === "popular") next.delete("sort");
      else next.set("sort", value);
      router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return { toggle, clearOne, clearAll, setSort, params };
}

/* --- applied filters ------------------------------------------------------- */

export function AppliedFilters({
  chips,
  className,
}: {
  chips: { key: string; value: string; label: string }[];
  className?: string;
}) {
  const { clearOne, clearAll } = useFilterNav();
  if (!chips.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="label mr-1 text-ink-mute">Filtered by</span>
      {chips.map((c) => (
        <button
          key={`${c.key}:${c.value}`}
          onClick={() => clearOne(c.key, c.value)}
          className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-edge glass py-1.5 pl-2.5 pr-2 text-[12.5px] text-ink transition-colors hover:border-ink-mute"
        >
          {c.label}
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="text-ink-mute transition-colors group-hover:text-ink"
          >
            <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        onClick={clearAll}
        className="ml-1 text-[12.5px] text-ink-mute underline underline-offset-2 transition-colors hover:text-ink"
      >
        Clear all
      </button>
    </div>
  );
}

/* --- sort ------------------------------------------------------------------ */

export function SortSelect({ value }: { value: string }) {
  const { setSort } = useFilterNav();
  return (
    <label className="inline-flex items-center gap-2">
      <span className="label whitespace-nowrap text-ink-mute">Sort</span>
      <select
        value={value}
        onChange={(e) => setSort(e.target.value)}
        className="h-9 max-w-[10.5rem] rounded-[var(--radius-sm)] border border-edge glass px-2.5 pr-7 text-[13px] text-ink outline-none transition-colors hover:border-ink-mute focus:border-ink"
      >
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* --- facet group ------------------------------------------------------------ */

function Group({
  group,
  selected,
  defaultOpen,
}: {
  group: FacetGroup;
  selected: string[];
  defaultOpen: boolean;
}) {
  const { toggle } = useFilterNav();
  const [open, setOpen] = useState(defaultOpen);
  const [hint, setHint] = useState(false);

  return (
    <div className="border-t border-edge py-3 first:border-t-0">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center justify-between text-left"
        >
          <span className="text-[12.5px] font-bold text-ink">
            {group.label}
            {selected.length > 0 && (
              <span className="ml-2 text-ink-mute tabular-nums">({selected.length})</span>
            )}
          </span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            aria-hidden="true"
            className={cn(
              "shrink-0 text-ink-mute transition-transform duration-200",
              open && "rotate-180",
            )}
          >
            <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {/* Industry terms are explained inline — an unexplained filter is an
            unused filter. */}
        {group.hint && (
          <button
            onClick={() => setHint((h) => !h)}
            aria-expanded={hint}
            aria-label={`What does ${group.label} mean?`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-edge text-[10px] text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            ?
          </button>
        )}
      </div>

      {hint && group.hint && (
        <p className="mt-2 rounded-[var(--radius-sm)] plate-in p-2.5 text-[12.5px] leading-relaxed text-ink-dim">
          {group.hint}
        </p>
      )}

      {open && (
        <ul className="mt-3 space-y-0.5">
          {group.options.map((o) => {
            const on = selected.includes(o.value);
            // Zero-result options stay visible but disabled: hiding them makes
            // the facet set unstable and unlearnable.
            const dead = o.count === 0 && !on;
            return (
              <li key={o.value}>
                <label
                  className={cn(
                    "-mx-1 flex cursor-pointer items-center gap-2.5 px-1 py-1",
                    dead ? "cursor-not-allowed opacity-40" : "hover:bg-ps-blue hover:text-white",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={dead}
                    onChange={() => toggle(group.key, o.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "border border-edge flex h-[14px] w-[14px] shrink-0 items-center justify-center",
                      on ? "plate-in text-ink" : "plate-in",
                    )}
                  >
                    {on && (
                      <svg width="10" height="10" viewBox="0 0 10 10" className="text-ink">
                        <path d="M1.5 5 4 7.5 8.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </span>
                  {o.swatch && (
                    <span
                      aria-hidden="true"
                      className="border border-edge h-3.5 w-3.5 shrink-0"
                      style={{ background: o.swatch }}
                    />
                  )}
                  <span className="flex-1 text-[12.5px]">
                    {o.label}
                  </span>
                  <span className="text-[11px] tabular-nums opacity-70">{o.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* --- desktop rail ------------------------------------------------------------ */

export function FilterRail({
  groups,
  filters,
}: {
  groups: FacetGroup[];
  filters: Filters;
}) {
  return (
    <div>
      {groups.map((g, i) => (
        <Group
          key={g.key}
          group={g}
          selected={filters[g.key]}
          defaultOpen={i < 4 || filters[g.key].length > 0}
        />
      ))}
    </div>
  );
}

/* --- mobile drawer ------------------------------------------------------------ */

export function FilterDrawer({
  groups,
  filters,
  total,
  activeCount,
}: {
  groups: FacetGroup[];
  filters: Filters;
  total: number;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const { clearAll } = useFilterNav();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="card inline-flex h-8 items-center gap-2 glass px-3 text-[12px] font-bold text-ink active:translate-x-[1px]"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[85] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            className="absolute inset-0 cursor-default bg-black/70"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            tabIndex={-1}
          />
          <div className="card absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col glass">
            <div className="titlebar flex h-8 shrink-0 items-center justify-between px-3">
              <h2 className="label text-[10px]">FILTERS</h2>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[12px] text-white underline underline-offset-2"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="border border-edge flex h-5 w-5 items-center justify-center glass text-ink"
                  aria-label="Close filters"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 2 14 14M14 2 2 14" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4">
              {groups.map((g) => (
                <Group
                  key={g.key}
                  group={g}
                  selected={filters[g.key]}
                  defaultOpen={filters[g.key].length > 0}
                />
              ))}
            </div>

            {/* The count lives on the button so the effect of a tap is visible
                without closing the drawer. */}
            <div className="shrink-0 border-t border-edge p-4">
              <button
                onClick={() => setOpen(false)}
                className="h-12 w-full rounded-[var(--radius-md)] bg-ink text-[15px] font-medium text-white"
              >
                Show {total} {total === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
