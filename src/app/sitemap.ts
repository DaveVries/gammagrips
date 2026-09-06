import type { MetadataRoute } from "next";
import { COLLECTIONS, PRODUCTS } from "@/data/catalog";
import { GUIDES } from "@/data/guides";
import { SITE_URL } from "@/lib/site";

/** Static routes worth indexing, most important first. */
const STATIC: [string, number][] = [
  ["/", 1],
  ["/controller-grips", 0.9],
  ["/playstation", 0.8],
  ["/xbox", 0.8],
  ["/collections", 0.7],
  ["/customize", 0.7],
  ["/compatibility", 0.7],
  ["/guides", 0.6],
  ["/shop", 0.5],
  ["/faq", 0.4],
  ["/contact", 0.4],
  ["/shipping", 0.3],
  ["/returns", 0.3],
  ["/privacy", 0.2],
  ["/terms", 0.2],
  ["/cookies", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;
  return [
    ...STATIC.map(([path, priority]) => ({ url: url(path), priority })),
    ...PRODUCTS.map((p) => ({ url: url(`/products/${p.slug}`), priority: 0.9 })),
    ...COLLECTIONS.map((c) => ({ url: url(`/collections/${c.id}`), priority: 0.6 })),
    ...GUIDES.map((g) => ({ url: url(`/guides/${g.slug}`), priority: 0.5 })),
  ];
}
