"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV } from "@/components/site/nav-data";
import { Glyph } from "@/components/ui/glyphs";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation is an accordion, not a slide-in stack of subpages: users
 * keep their place, and every level exposes an explicit "View all …" link with
 * the full scope in its label, since there is no hover to reveal breadth.
 *
 * One surface only. An earlier version put `.card` and `.glass` on the same
 * element — `.card` rescopes descendant text to the dark-screen palette while
 * `.glass` paints a light background over it, so every row rendered near-white
 * on light grey. The drawer is light glass throughout, like the mega menu.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        className="absolute inset-0 cursor-default bg-[#000]/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={-1}
      />

      <div className="relative flex h-full w-[min(360px,86vw)] flex-col border-r-2 border-[var(--color-plate-edge)] bg-[rgba(50,49,45,0.98)] shadow-[18px_0_60px_-20px_rgba(20,22,30,0.75)] backdrop-blur-2xl">
        <div className="ps-rule h-[3px] w-full shrink-0" />

        <div className="flex h-[54px] shrink-0 items-center gap-2 border-b border-[var(--color-plate-edge)] px-3">
          <span className="label text-ink-mute">MENU</span>
          <button
            onClick={onClose}
            className="plate cut-sm press ml-auto flex h-9 w-9 items-center justify-center text-ink"
            aria-label="Close menu"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2 14 14M14 2 2 14" stroke="currentColor" strokeWidth="2.4" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain" aria-label="Main">
          <ul className="divide-y divide-[var(--color-plate-edge)]">
            {NAV.map((item) => {
              const isOpen = expanded === item.label;
              return (
                <li key={item.label}>
                  {item.panel ? (
                    <>
                      <button
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        className={cn(
                          "flex w-full items-center justify-between px-3.5 py-3.5 text-left text-[15px] font-bold transition-colors",
                          isOpen
                            ? "bg-[var(--color-blk-blue)] text-[var(--color-on-blk-blue)]"
                            : "text-ink active:bg-[var(--color-plate-hi)]",
                        )}
                      >
                        {item.label}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                          className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                        >
                          <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="plate-in border-t border-[var(--color-plate-edge)] pb-3">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="plate cut-sm drop-sm press mx-3.5 my-3 flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-ink"
                          >
                            <Glyph name="tri" size={9} />
                            View all {item.label}
                          </Link>

                          {item.panel.columns.map((col) => (
                            <div key={col.heading} className="px-3.5 pt-1">
                              <p className="label mb-1 flex items-center gap-2 py-1 text-ink-mute">
                                <span className="h-px flex-1 bg-[var(--color-plate-edge)]" />
                                {col.heading}
                                <span className="h-px flex-1 bg-[var(--color-plate-edge)]" />
                              </p>
                              <ul>
                                {col.links.map((l) => (
                                  <li key={l.href + l.label}>
                                    <Link
                                      href={l.href}
                                      onClick={onClose}
                                      className="-mx-1.5 block px-1.5 py-2 transition-colors active:bg-[var(--color-blk-blue)]"
                                    >
                                      <span className="block text-[14px] font-semibold text-ink">
                                        {l.label}
                                      </span>
                                      {l.note && (
                                        <span className="mt-0.5 block text-[12px] leading-snug text-ink-mute">
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
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-3.5 py-3.5 text-[15px] font-bold text-ink transition-colors active:bg-[var(--color-blk-blue)] active:text-[var(--color-on-blk-blue)]"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="border-t-2 border-[var(--color-plate-edge)] p-3.5">
            <Link
              href="/customize"
              onClick={onClose}
              className="key cut-sm mb-2.5 flex h-12 items-center justify-center bg-[var(--color-ice)] text-[14px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)] [--key-glow:rgba(200,215,240,0.4)]"
            >
              ▶ Find my grip
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/compatibility"
                onClick={onClose}
                className="plate cut-sm press flex h-10 items-center justify-center text-[13px] font-bold text-ink"
              >
                Check fit
              </Link>
              <Link
                href="/guides"
                onClick={onClose}
                className="plate cut-sm press flex h-10 items-center justify-center text-[13px] font-bold text-ink"
              >
                Guides
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
