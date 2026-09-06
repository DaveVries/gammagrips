import Link from "next/link";

/**
 * Hierarchy breadcrumbs (not click history). Most traffic to a product page
 * arrives from search or a link, so this is often the only orientation the
 * visitor gets. Emits BreadcrumbList structured data alongside.
 */
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {c.href && !last ? (
                  <Link
                    href={c.href}
                    className="label text-ps-blue hover:underline"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="label text-ink" aria-current={last ? "page" : undefined}>
                    {c.label}
                  </span>
                )}
                {!last && (
                  <span className="text-ink-mute" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: all.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.label,
              ...(c.href ? { item: `https://gammagrips.com${c.href}` } : {}),
            })),
          }),
        }}
      />
    </>
  );
}
