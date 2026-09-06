"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV } from "@/components/site/nav-data";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation is an accordion, not a slide-in stack of subpages: users
 * keep their place, and every level exposes an explicit "View all …" link with
 * the full scope in its label, since there is no hover to reveal breadth.
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
        className="absolute inset-0 cursor-default bg-[#000]/45"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={-1}
      />
      <div className="card relative flex h-full w-[min(380px,88vw)] flex-col glass p-[3px]">
        <div className="titlebar flex h-[26px] shrink-0 items-center justify-between px-2">
          <span className="label text-[10px]">MENU</span>
          <button
            onClick={onClose}
            className="border border-edge flex h-[18px] w-[19px] items-center justify-center glass text-ink"
            aria-label="Close menu"
          >
            <svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2 14 14M14 2 2 14" stroke="currentColor" strokeWidth="2.4" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain" aria-label="Main">
          <ul className="divide-y divide-edge glass">
            {NAV.map((item) => {
              const isOpen = expanded === item.label;
              return (
                <li key={item.label}>
                  {item.panel ? (
                    <>
                      <button
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between px-3 py-3.5 text-left text-[15px] font-bold text-ink"
                      >
                        {item.label}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                          className={cn(
                            "shrink-0 text-ink-mute transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                        >
                          <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pb-3">
                          <Link
                            href={item.href}
                            className="card mx-3 mb-2 block glass px-3 py-2 text-[13px] font-bold text-ink"
                          >
                            View all {item.label}
                          </Link>
                          {item.panel.columns.map((col) => (
                            <div key={col.heading} className="px-4 pt-3">
                              <p className="label mb-2 text-ink-mute">{col.heading}</p>
                              <ul>
                                {col.links.map((l) => (
                                  <li key={l.href + l.label}>
                                    <Link
                                      href={l.href}
                                      className="block py-2 text-[14px] text-ink-dim active:text-ps-blue"
                                    >
                                      {l.label}
                                      {l.note && (
                                        <span className="mt-0.5 block text-[12.5px] text-ink-mute">
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
                      className="block px-4 py-4 text-[16px] font-medium text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="glass p-3">
            <Link
              href="/customize"
              className="mb-2 flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-ink text-[15px] font-medium text-white"
            >
              Open the configurator
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/compatibility"
                className="glass flex h-10 items-center justify-center glass text-[13px] font-bold text-ink active:translate-x-[1px]"
              >
                Check fit
              </Link>
              <Link
                href="/guides"
                className="glass flex h-10 items-center justify-center glass text-[13px] font-bold text-ink active:translate-x-[1px]"
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
