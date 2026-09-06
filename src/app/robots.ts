import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Nothing here is useful to a crawler and account/checkout URLs can
           carry state, so they stay out of the index. */
        disallow: ["/cart", "/checkout", "/account", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
