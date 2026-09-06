import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Logo } from "@/components/site/logo";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  /* Checkout drops the store chrome: no mega menu, no search, no promos.
     The only navigation is back to the cart and out to support. */
  return (
    <div className="min-h-screen">
      <header className="border-b border-edge">
        <div className="gutter">
          <div className="shell flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-5">
              <Link
                href="/cart"
                className="text-[13px] text-ink-dim underline-offset-2 hover:text-ink hover:underline"
              >
                Back to cart
              </Link>
              <span className="label hidden items-center gap-1.5 text-ink-mute sm:inline-flex">
                <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="2.5" y="6" width="9" height="6.5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.6 6V4.3a2.4 2.4 0 0 1 4.8 0V6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Secure checkout
              </span>
            </div>
          </div>
        </div>
      </header>
      <CheckoutFlow />
    </div>
  );
}
