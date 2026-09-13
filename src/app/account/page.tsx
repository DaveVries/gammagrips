import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { Win } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Every order is tracked from the link in your confirmation email — no account needed.",
  alternates: { canonical: "/account" },
};

/**
 * Deliberately not a login page.
 *
 * Customer accounts were considered and dropped: with six SKUs the only thing
 * an account would add over the emailed tracking link is a list, and Baymard's
 * finding is that pushing registration costs sales. Admin sign-in lives at
 * /admin, which is a different audience and a different risk.
 */
export default function AccountPage() {
  return (
    <PageShell
      title="Track your order"
      deck="There is no account to create here, and nothing to remember. The link in your confirmation email is your order."
      crumbs={[{ label: "Track your order" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Win title="LOST THE EMAIL?">
            <div className="space-y-3 p-4 text-[13.5px] leading-relaxed text-ink-dim">
              <p>
                <Link href="/contact" className="text-ps-blue hover:underline">
                  Send us a message
                </Link>{" "}
                with your order number or the postcode you ordered with, and we
                will resend the link.
              </p>
            </div>
          </Win>
        </div>
      }
    >
      <h2>What the link does</h2>
      <p>
        It opens your order directly: current status, what you bought, what you
        paid, and the tracking code once it ships. From there you can start a
        return or re-order the same grip. It does not expire.
      </p>

      <h2>Why there is no account</h2>
      <p>
        An account would give you a list of orders and nothing else — and it
        would mean another password to manage, for you and for us. We would
        rather keep the tracking link working than ask you to register.
      </p>
    </PageShell>
  );
}
