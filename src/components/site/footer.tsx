import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { COLLECTIONS, PLATFORMS, PRODUCTS } from "@/data/catalog";
import { Rule } from "@/components/ui/primitives";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Grips",
    links: [
      ...PRODUCTS.map((p) => ({
        label: p.name.replace(" Grips", ""),
        href: `/products/${p.slug}`,
      })),
      { label: "All six grips", href: "/controller-grips" },
    ],
  },
  {
    heading: "Controllers",
    links: [
      ...PLATFORMS.map((p) => ({ label: p.short, href: `/controller-grips?platform=${p.id}` })),
      { label: "Compatibility checker", href: "/compatibility" },
    ],
  },
  {
    heading: "Designs",
    links: [
      ...COLLECTIONS.map((c) => ({ label: c.name, href: `/collections/${c.id}` })),
      { label: "Configurator", href: "/customize" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "Fitting guides", href: "/guides" },
      { label: "Contact us", href: "/contact" },
      { label: "Track an order", href: "/account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="gutter mt-8 pb-4">
      <div className="shell glass p-[3px]">
      <div className="titlebar flex h-[22px] items-center px-2"><span className="label text-[10px]">GAMMAGRIPS B.V. — CUSTOMER SERVICE</span></div>
      <div className="px-4 md:px-6">
        <div>
          {/* newsletter — deliberately understated, at the top of the footer
              rather than interrupting the page */}
          <div className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-md">
              <h2 className="text-[17px] font-semibold">New designs, once a month</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
                One email when a collection drops or a limited run opens. No
                discount spam, and one click to leave.
              </p>
            </div>
            <form className="flex w-full max-w-sm gap-2" action="/newsletter" method="post">
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <input
                id="nl-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="plate-in h-10 min-w-0 flex-1 px-3 text-[13px] text-ink outline-none placeholder:text-ink-mute"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-[var(--radius-md)] bg-ink px-5 text-[14px] font-medium text-white transition-colors hover:plate-in"
              >
                Sign up
              </button>
            </form>
          </div>

          <Rule />

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 lg:grid-cols-6">
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-dim">
                Moulded controller grips for the PS5 DualSense and Xbox Wireless
                Controller. Designed and shipped from Rotterdam since 2021.
              </p>
              <ul className="mt-5 flex gap-2">
                {[
                  { label: "Discord", href: "https://discord.gg", d: "M6.5 6.2A11 11 0 0 1 9.4 5.4l.3.6a9 9 0 0 1 2.6 0l.3-.6a11 11 0 0 1 2.9.8c1.8 2.6 2.6 5.6 2.3 8.9a11.4 11.4 0 0 1-3.5 1.7l-.7-1.2c.4-.2.8-.4 1.1-.6l-.3-.2a8 8 0 0 1-6.8 0l-.3.2 1.1.6-.7 1.2A11.4 11.4 0 0 1 4.2 15c-.3-3.3.5-6.3 2.3-8.9Zm2.5 6.4c.7 0 1.2-.6 1.2-1.4s-.5-1.4-1.2-1.4-1.2.6-1.2 1.4.5 1.4 1.2 1.4Zm6 0c.7 0 1.2-.6 1.2-1.4s-.5-1.4-1.2-1.4-1.2.6-1.2 1.4.5 1.4 1.2 1.4Z" },
                  { label: "YouTube", href: "https://youtube.com", d: "M20.2 7.4a2.3 2.3 0 0 0-1.6-1.6C17.1 5.4 12 5.4 12 5.4s-5.1 0-6.6.4A2.3 2.3 0 0 0 3.8 7.4 24 24 0 0 0 3.4 12c0 1.6.1 3.1.4 4.6a2.3 2.3 0 0 0 1.6 1.6c1.5.4 6.6.4 6.6.4s5.1 0 6.6-.4a2.3 2.3 0 0 0 1.6-1.6c.3-1.5.4-3 .4-4.6s-.1-3.1-.4-4.6ZM10.4 14.8V9.2L15.1 12Z" },
                  { label: "Instagram", href: "https://instagram.com", d: "M12 7.6A4.4 4.4 0 1 0 16.4 12 4.4 4.4 0 0 0 12 7.6Zm0 7.2A2.8 2.8 0 1 1 14.8 12 2.8 2.8 0 0 1 12 14.8Zm5.6-7.4a1 1 0 1 1-1-1 1 1 0 0 1 1 1ZM20.6 8.4a5.1 5.1 0 0 0-1.4-3.6 5.1 5.1 0 0 0-3.6-1.4C14.2 3.3 9.8 3.3 8.4 3.4a5.1 5.1 0 0 0-3.6 1.4 5.1 5.1 0 0 0-1.4 3.6c-.1 1.4-.1 5.8 0 7.2a5.1 5.1 0 0 0 1.4 3.6 5.1 5.1 0 0 0 3.6 1.4c1.4.1 5.8.1 7.2 0a5.1 5.1 0 0 0 3.6-1.4 5.1 5.1 0 0 0 1.4-3.6c.1-1.4.1-5.8 0-7.2Zm-1.9 8.7a2.8 2.8 0 0 1-1.6 1.6c-1.1.4-3.7.3-4.9.3s-3.9.1-5-.3a2.8 2.8 0 0 1-1.6-1.6c-.4-1.1-.3-3.7-.3-4.9s-.1-3.9.3-5a2.8 2.8 0 0 1 1.6-1.6c1.1-.4 3.7-.3 5-.3s3.9-.1 4.9.3a2.8 2.8 0 0 1 1.6 1.6c.4 1.1.3 3.7.3 5s.1 3.8-.3 4.9Z" },
                  { label: "X", href: "https://x.com", d: "M17.2 4h2.7l-5.9 6.8L21 20h-5.4l-4.2-5.6L6.5 20H3.8l6.3-7.3L3.3 4h5.6l3.8 5.1Zm-.9 14.4h1.5L8.1 5.5H6.5Z" },
                ].map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      rel="noopener noreferrer nofollow"
                      target="_blank"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-edge text-ink-dim transition-colors hover:border-edge hover:text-ink"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                        <path d={s.d} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {COLUMNS.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="label mb-4 text-ink-mute">{col.heading}</h2>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-ink-dim hover:text-ps-blue hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <Rule />

          <div className="flex flex-col gap-5 py-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="text-[12.5px] text-ink-mute">
                © {new Date().getFullYear()} GammaGrips B.V.
              </p>
              <p className="text-[12.5px] text-ink-mute">KvK 82910433 · VAT NL862634891B01</p>
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "/cookies" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[12px] text-ink-mute underline-offset-2 hover:text-ps-blue hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
              {["iDEAL", "Visa", "Mastercard", "PayPal", "Klarna", "Apple Pay"].map((m) => (
                <li
                  key={m}
                  className="border border-edge label glass px-2 py-1.5 text-ink-dim"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
