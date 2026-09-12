"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/site/logo";
import { NAV, type NavItem } from "@/components/site/nav-data";
import { DesignSwatch } from "@/components/product/controller-render";
import { designById } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/site/search-overlay";
import { MobileNav } from "@/components/site/mobile-nav";

const COLS: Record<number, string> = { 1: "grid-cols-2", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

export function Header() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const cart = useCart();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenIdx(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setOpenIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clear = () => timer.current && clearTimeout(timer.current);
  const hoverOpen = (i: number) => {
    clear();
    timer.current = setTimeout(() => setOpenIdx(i), 200);
  };
  const hoverClose = () => {
    clear();
    timer.current = setTimeout(() => setOpenIdx(null), 250);
  };

  const isCurrent = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:plate focus:px-4 focus:py-2 focus:text-[12px] focus:font-bold"
      >
        Skip to content
      </a>

      {/* thin gradient rule — the only chrome above the nav */}
      <div className="ps-rule h-[4px] w-full" />

      <header
        className="sticky top-0 z-50 border-b border-white/12 bg-[rgba(46,45,42,0.72)] backdrop-blur-xl backdrop-saturate-150"
        onMouseLeave={hoverClose}
      >
        <div className="gutter">
          <div className="shell flex h-[62px] items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="cut-sm plate flex h-9 w-9 shrink-0 items-center justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <Logo className="mr-2 min-w-0 shrink sm:mr-3" />

            {/* --- nav as bevelled tabs; the active one is pressed in ------ */}
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-[3px]">
                {NAV.map((item, i) => {
                  const current = isCurrent(item);
                  const open = openIdx === i;
                  return (
                    <li key={item.label} onMouseEnter={() => (item.panel ? hoverOpen(i) : hoverClose())}>
                      <Link
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        aria-expanded={item.panel ? open : undefined}
                        onFocus={() => item.panel && setOpenIdx(i)}
                        className={cn(
                          "relative flex h-[62px] items-center px-4 text-[13px] font-semibold tracking-tight transition-colors",
                          current || open ? "text-ink" : "text-ink-dim hover:text-ink",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "ps-rule absolute inset-x-3 bottom-0 h-[3px] transition-opacity",
                            current || open ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
                <li className="ml-1">
                  <Link
                    href="/customize"
                    className={cn(
                      "key cut-sm flex h-9 items-center px-4 text-[12px] font-bold uppercase tracking-[0.06em]",
                      "[--key-glow:rgba(220,232,255,0.35)]",
                      pathname === "/customize"
                        ? "bg-[var(--color-steel)] text-[var(--color-on-ice)]"
                        : "bg-[var(--color-ice)] text-[var(--color-on-ice)]",
                    )}
                  >
                    ▶ FIND MY GRIP
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-[3px]">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="cut-sm plate flex h-9 items-center gap-1.5 px-3 hover:bg-[var(--color-plate-hi)]"
                aria-label="Search products"
              >
                <SearchIcon />
                <span className="label hidden text-ink-dim xl:inline">Search</span>
              </button>

              <Link
                href="/account"
                className="cut-sm plate flex h-9 w-9 items-center justify-center hover:bg-[var(--color-plate-hi)]"
                aria-label="Account"
              >
                <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 16c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => cart.setOpen(true)}
                className="cut-sm plate flex h-9 items-center gap-2 px-3 hover:bg-[var(--color-plate-hi)]"
                aria-label={`Cart, ${cart.count} item${cart.count === 1 ? "" : "s"}`}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M1.5 2h2.4l2 9.6h8.2l1.7-6.8H5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="7" cy="15" r="1.4" fill="currentColor" />
                  <circle cx="14" cy="15" r="1.4" fill="currentColor" />
                </svg>
                <span
                  className={cn(
                    "min-w-[20px] px-1 text-center text-[11px] font-bold tabular-nums",
                    cart.count > 0 ? "bg-[var(--color-blk-green)] px-1.5 text-[var(--color-on-blk-green)]" : "text-ink-mute",
                  )}
                >
                  {cart.ready ? cart.count : 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* --- mega menu ------------------------------------------------- */}
        {NAV.map((item, i) =>
          item.panel && openIdx === i ? (
            <div
              key={item.label}
              className="absolute inset-x-0 top-full hidden border-b-2 border-[var(--color-plate-edge)] bg-[rgba(52,51,47,0.97)] shadow-[0_26px_60px_-18px_rgba(20,22,30,0.7)] backdrop-blur-2xl lg:block"
              onMouseEnter={clear}
            >
              <div className="ps-rule h-[3px] w-full" />
              <div className="gutter">
                <div className="shell grid grid-cols-12 gap-8 py-7">
                  <div
                    className={cn(
                      "grid gap-8",
                      item.panel.feature ? "col-span-8" : "col-span-12",
                      COLS[item.panel.columns.length] ?? "grid-cols-3",
                    )}
                  >
                    {item.panel.columns.map((col) => (
                      <div key={col.heading}>
                        {col.headingHref ? (
                          <Link
                            href={col.headingHref}
                            className="label mb-3 block border-b-2 border-[var(--color-plate-edge)] pb-2 text-ink hover:text-ps-blue"
                          >
                            {col.heading} →
                          </Link>
                        ) : (
                          <p className="label mb-3 border-b-2 border-[var(--color-plate-edge)] pb-2 text-ink">{col.heading}</p>
                        )}
                        <ul className="space-y-px">
                          {col.links.map((l) => (
                            <li key={l.href + l.label}>
                              <Link
                                href={l.href}
                                className="group -mx-2 block px-2.5 py-2 transition-colors hover:bg-[var(--color-plate-hi)]"
                              >
                                <span className="block text-[13.5px] font-semibold text-ink group-hover:text-ink">
                                  {l.label}
                                </span>
                                {l.note && (
                                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-mute group-hover:text-ink-dim">
                                    {l.note}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {item.panel.feature && (
                    <Link
                      href={item.panel.feature.href}
                      className="cut card col-span-4 flex flex-col justify-between p-5 transition-colors hover:card-hi"
                    >
                      <div>
                        <p className="text-[15px] font-bold leading-tight">{item.panel.feature.title}</p>
                        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-dim">
                          {item.panel.feature.copy}
                        </p>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-4">
                        <span className="label text-ps-blue">{item.panel.feature.cta} →</span>
                        {(() => {
                          const d = designById(item.panel!.feature!.designId);
                          return d ? (
                            <span className="bevel-in block p-[3px]">
                              <DesignSwatch design={d} size={56} />
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : null,
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 12 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
