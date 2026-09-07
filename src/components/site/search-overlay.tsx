"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { search, relaxedSuggestions, compatibilityLine, type SearchHit } from "@/lib/shop";
import { DesignSwatch } from "@/components/product/controller-render";
import { designById } from "@/data/catalog";
import { cn, money } from "@/lib/utils";
import { productBySlug } from "@/data/catalog";

const POPULAR = ["apex pro", "dualsense", "thumb grips", "bg", "elite series 2", "returns"];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hits = useMemo(() => search(q), [q]);

  /* Mounted only while open (see Header), so there is no state to reset here.
     Focus and scroll-lock are genuine DOM side effects and stay in an effect. */
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return onClose();
    if (!hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    }
    if (e.key === "Enter") {
      const a = listRef.current?.querySelectorAll("a")[active] as HTMLAnchorElement | undefined;
      a?.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
      {/* Dimming the page is a documented autocomplete win — it removes the
          competition from banners and rails while the user is choosing. */}
      <button
        className="absolute inset-0 cursor-default bg-[#000]/45"
        onClick={onClose}
        aria-label="Close search"
        tabIndex={-1}
      />
      <div className="relative mx-auto mt-[8vh] w-[min(680px,92vw)] glass cut p-[3px] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <div className="titlebar flex h-[24px] items-center px-2">
          <span className="label text-[10px]">FIND</span>
        </div>
        <div className="border border-edge mt-[3px] flex items-center gap-2 plate-in px-3">
          <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0 text-ink-mute">
            <circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.2 12.2 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            type="search"
            placeholder="Search grips, designs, or ask about returns…"
            aria-label="Search"
            className="h-11 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute"
          />
          <kbd className="border border-edge label hidden glass px-1.5 py-1 text-ink-dim sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[58vh] overflow-y-auto glass">
          {q && hits.length > 0 && (
            <ul ref={listRef} className="p-2">
              {hits.map((h, i) => (
                <li key={h.href + h.title}>
                  <SearchRow hit={h} active={i === active} onHover={() => setActive(i)} />
                </li>
              ))}
            </ul>
          )}

          {/* Never a bare "no results": echo the query, then offer a way out. */}
          {q && hits.length === 0 && (
            <div className="p-5">
              <p className="text-[14px] text-ink">
                Nothing matches <span className="font-semibold">“{q}”</span>.
              </p>
              <p className="mt-1 text-[13px] text-ink-dim">
                Check the spelling, or try a controller name like “DualSense”. If you
                are looking for help with an order,{" "}
                <Link href="/contact" className="text-ink underline underline-offset-2">
                  contact support
                </Link>
                .
              </p>
              <p className="label mt-6 mb-3 text-ink-mute">Popular right now</p>
              <ul className="space-y-1">
                {relaxedSuggestions().map((p) => (
                  <li key={p.slug}>
                    <SearchRow
                      hit={{
                        kind: "product",
                        title: p.name,
                        meta: compatibilityLine(p),
                        href: `/products/${p.slug}`,
                        slug: p.slug,
                      }}
                      active={false}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!q && (
            <div className="p-5">
              <p className="label mb-3 text-ink-mute">Try</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setQ(t);
                      setActive(0);
                    }}
                    className="rounded-[var(--radius-sm)] border border-edge px-2.5 py-1.5 text-[13px] text-ink-dim transition-colors hover:border-edge hover:text-ink"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-[12.5px] leading-relaxed text-ink-mute">
                Search covers products, designs and help pages — including
                shipping, returns and compatibility.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchRow({
  hit,
  active,
  onHover,
}: {
  hit: SearchHit;
  active: boolean;
  onHover?: () => void;
}) {
  const product = hit.slug ? productBySlug(hit.slug) : undefined;
  const design = hit.designId ? designById(hit.designId) : undefined;
  const kindLabel =
    hit.kind === "product"
      ? "Product"
      : hit.kind === "design"
        ? "Design"
        : hit.kind === "collection"
          ? "Collection"
          : "Help";

  return (
    <Link
      href={hit.href}
      onMouseEnter={onHover}
      className={cn(
        "flex items-center gap-3 px-2.5 py-2",
        active
          ? "bg-[var(--color-blk-blue)] text-white"
          : "hover:bg-[var(--color-blk-blue)] hover:text-white",
      )}
    >
      <span className="border border-edge flex h-9 w-9 shrink-0 items-center justify-center glass">
        {design ? (
          <DesignSwatch design={design} size={34} className="rounded-[4px]" />
        ) : hit.kind === "help" ? (
          <span className="text-ink-mute" aria-hidden="true">?</span>
        ) : (
          <span className="text-ink-mute" aria-hidden="true">◆</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold">{hit.title}</span>
        <span className="block truncate text-[12px] opacity-75">{hit.meta}</span>
      </span>
      {product ? (
        <span className="shrink-0 text-[13px] font-bold tabular-nums">
          {money(product.price)}
        </span>
      ) : (
        <span className="label shrink-0 opacity-70">{kindLabel}</span>
      )}
    </Link>
  );
}
