import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, AsideCard } from "@/components/site/page-shell";
import { Button } from "@/components/ui/primitives";

export const metadata: Metadata = {
  alternates: { canonical: "/account" },
  title: "Account",
  description: "Sign in, or track an order without an account.",
};

export default function AccountPage() {
  return (
    <PageShell
      title="Your account"
      deck="An account is optional here. Every order can be tracked, returned and re-ordered from the link in your confirmation email without ever creating one."
      crumbs={[{ label: "Account" }]}
      aside={
        <AsideCard title="No account? No problem">
          <p>
            The tracking link in your confirmation email opens the order, the
            tracking and the return flow. It does not expire.
          </p>
          <p>
            Lost the email?{" "}
            <Link href="/contact">Ask us to resend it</Link> — order number or
            delivery postcode is enough.
          </p>
        </AsideCard>
      }
    >
      <h2>Tracking your order</h2>
      <p>
        There is no sign-in yet, and for most things there does not need to be:
        the link in your confirmation email opens your order directly, and from
        there you can track it, start a return or re-order. Keep that email and
        you have everything an account would give you.
      </p>
      <p>
        Lost the link? <Link href="/contact">Email us</Link> with your order
        number or the address you ordered with and we will send it again.
      </p>

      <h2>What an account gets you</h2>
      <ul>
        <li>Every order in one list, with tracking and one-click reorder</li>
        <li>Return and exchange requests without emailing us</li>
        <li>Saved delivery address, so checkout is one tap</li>
        <li>Optional restock alerts for a specific grip and controller</li>
      </ul>

      <h2>Deleting it</h2>
      <p>
        One button inside the account, no email required, effective immediately.
        Invoices we are legally obliged to retain survive deletion; nothing else
        does. See <Link href="/privacy">privacy</Link>.
      </p>
    </PageShell>
  );
}
