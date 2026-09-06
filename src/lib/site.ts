/**
 * The canonical origin. Set NEXT_PUBLIC_SITE_URL in the Vercel project once the
 * custom domain is attached; the preview fallback keeps OG tags and the sitemap
 * pointing at whatever host a preview build is actually served from.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://gammagrips.com")
).replace(/\/$/, "");
