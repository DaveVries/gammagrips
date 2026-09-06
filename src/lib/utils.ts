export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const eur = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export const money = (n: number) => eur.format(n);

/** "1,247" — used for review counts. */
export const count = (n: number) => new Intl.NumberFormat("en-GB").format(n);

export const dateLabel = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * A concrete delivery date rather than a duration.
 * Baymard: users should never have to count business days themselves.
 * Deterministic from a supplied "today" so server and client agree.
 */
export function deliveryWindow(from: Date, minDays = 2, maxDays = 4) {
  const add = (d: number) => {
    const out = new Date(from);
    let added = 0;
    while (added < d) {
      out.setDate(out.getDate() + 1);
      const day = out.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return out;
  };
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return { earliest: fmt(add(minDays)), latest: fmt(add(maxDays)) };
}

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_FLAT = 4.95;
export const RETURN_DAYS = 60;
