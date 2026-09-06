"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartLine, PlatformId } from "@/lib/types";
import { productBySlug } from "@/data/catalog";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/utils";

/* ============================================================================
   The cart lives in a small module-level store read through
   useSyncExternalStore rather than hydrated inside an effect. That keeps the
   server snapshot (an empty cart) and the first client render consistent, and
   it subscribes to `storage` events, so two open tabs stay in sync for free.
   ========================================================================= */

const KEY = "gg.cart.v1";
const EMPTY: CartLine[] = [];

let snapshot: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as CartLine[]) : EMPTY;
  } catch {
    return EMPTY; // corrupt storage is not worth surfacing — start empty
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  // First subscription happens after hydration, so reading here cannot cause a
  // server/client mismatch.
  if (!loaded) {
    loaded = true;
    snapshot = parse(localStorage.getItem(KEY));
  }
  listeners.add(onChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = parse(e.newValue);
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

function write(next: CartLine[]) {
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — the cart still works for this session */
  }
  emit();
}

const lineKey = (slug: string, d: string | null, p: string) => `${slug}|${d ?? "-"}|${p}`;

interface AddArgs {
  slug: string;
  designId?: string | null;
  platformId: PlatformId;
  qty?: number;
}

interface CartApi {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  toFreeShipping: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (a: AddArgs) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  has: (slug: string, designId: string | null, platformId: PlatformId) => boolean;
}

const Ctx = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);

  const add = useCallback((a: AddArgs) => {
    const key = lineKey(a.slug, a.designId ?? null, a.platformId);
    const qty = a.qty ?? 1;
    const i = snapshot.findIndex((l) => l.key === key);
    if (i === -1) {
      write([
        ...snapshot,
        { key, slug: a.slug, designId: a.designId ?? null, platformId: a.platformId, qty },
      ]);
    } else {
      const copy = [...snapshot];
      copy[i] = { ...copy[i], qty: Math.min(10, copy[i].qty + qty) };
      write(copy);
    }
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    write(
      qty <= 0
        ? snapshot.filter((l) => l.key !== key)
        : snapshot.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 10) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    write(snapshot.filter((l) => l.key !== key));
  }, []);

  const value = useMemo<CartApi>(() => {
    const subtotal = lines.reduce((sum, l) => {
      const p = productBySlug(l.slug);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
    const shipping =
      lines.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    return {
      lines,
      // `loaded` flips on the first subscription, i.e. after hydration.
      ready: loaded,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      toFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      open,
      setOpen,
      add,
      setQty,
      remove,
      has: (slug, designId, platformId) =>
        lines.some((l) => l.key === lineKey(slug, designId, platformId)),
    };
  }, [lines, open, add, setQty, remove]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}
