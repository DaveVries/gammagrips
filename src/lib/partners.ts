import { db } from "@/lib/db";

/** One place for the public name of the stockist page. */
export const PARTNERS_TITLE = "Entrusted Partners";

export type Partner = {
  id: number;
  name: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  website: string;
  note: string;
  logo_url: string | null;
  active: boolean;
  sort: number;
};

export const COUNTRIES: Record<string, string> = {
  NL: "Netherlands",
  BE: "Belgium",
  DE: "Germany",
  LU: "Luxembourg",
  FR: "France",
};

export const countryName = (c: string) => COUNTRIES[c] ?? c;

/** Partners for the public page. Never throws: a database hiccup shows the
 *  empty state rather than breaking the page. */
export async function activePartners(): Promise<Partner[]> {
  try {
    return (await db()`
      select id, name, address, postcode, city, country, website, note, logo_url, active, sort
        from partners where active
       order by country, city, sort, name
    `) as Partner[];
  } catch (err) {
    console.error("[partners] load failed", err);
    return [];
  }
}

export const mapsUrl = (p: Pick<Partner, "name" | "address" | "postcode" | "city" | "country">) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [p.name, p.address, p.postcode, p.city, countryName(p.country)].filter(Boolean).join(", "),
  )}`;

/** Accept "shop.nl" as well as "https://shop.nl"; anything else is dropped. */
export function cleanWebsite(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export const displayHost = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};
