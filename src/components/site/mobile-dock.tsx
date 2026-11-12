"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phone navigation as a floating pill at the bottom, where the thumb is.
 * The header keeps only the logo and search; menu, cart and account live
 * here. Desktop is unchanged — the dock is lg:hidden.
 */
export function MobileDock({
  pathname,
  cartCount,
  onCart,
  onMenu,
  session,
}: {
  pathname: string;
  cartCount: number;
  onCart: () => void;
  onMenu: () => void;
  session?: { email: string; isAdmin: boolean } | null;
}) {
  const on = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const accountHref = session?.isAdmin ? "/admin" : "/account";
  const accountLabel = session?.isAdmin ? "Admin" : session ? "Account" : "Sign in";

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[45] lg:hidden"
    >
      <ul className="glass grid grid-cols-5 rounded-full border border-white/[0.08] bg-black/80 p-1 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        <Item href="/" label="Home" active={on("/")}>
          <path d="M3 8.5 9 3.5l6 5V15H11v-4H7v4H3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </Item>
        <Item href="/controller-grips" label="Shop" active={on("/controller-grips") || on("/products")}>
          <path d="M3.5 6h11l-1 9h-9z M6.5 6V5a2.5 2.5 0 0 1 5 0v1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </Item>
        <li>
          <button type="button" onClick={onCart} className={itemClass(false)}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
            <span className="relative">
              <Icon>
                <path d="M1.5 2h2.4l2 9.6h8.2l1.7-6.8H5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="7" cy="15" r="1.4" fill="currentColor" />
                <circle cx="14" cy="15" r="1.4" fill="currentColor" />
              </Icon>
              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-1.5 min-w-[17px] rounded-full bg-[var(--color-blk-green)] px-1 text-center text-[10px] font-bold leading-[17px] text-[var(--color-on-blk-green)] tabular-nums">
                  {cartCount}
                </span>
              )}
            </span>
            <span>Cart</span>
          </button>
        </li>
        <Item href={accountHref} label={accountLabel} active={on(accountHref)}>
          <circle cx="9" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 16c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </Item>
        <li>
          <button type="button" onClick={onMenu} className={itemClass(false)} aria-label="Open menu">
            <Icon>
              <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" stroke="currentColor" strokeWidth="1.8" />
            </Icon>
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

const itemClass = (active: boolean) =>
  cn(
    "flex h-[54px] w-full flex-col items-center justify-center gap-1 rounded-full text-[10.5px] font-bold transition-colors",
    active ? "bg-white/[0.08] text-[var(--color-ice)]" : "text-ink-dim active:bg-white/[0.06]",
  );

function Item({ href, label, active, children }: { href: string; label: string; active: boolean; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className={itemClass(active)} aria-current={active ? "page" : undefined}>
        <Icon>{children}</Icon>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="19" height="19" viewBox="0 0 18 18" aria-hidden="true">
      {children}
    </svg>
  );
}
