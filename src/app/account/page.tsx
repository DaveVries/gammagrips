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
      <h2>Sign in</h2>
      <p>
        We use a sign-in link rather than a password. Enter your email and we send
        a link that signs you in — nothing to remember, nothing to reset, and
        nothing for anyone to steal.
      </p>

      <form className="mt-5 max-w-md" action="/account" method="post">
        <label htmlFor="ac-email" className="mb-1.5 block text-[13px] font-medium">
          Email <span className="text-ink-mute">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="ac-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] plate-in px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-ink"
          />
          <Button type="submit" className="shrink-0">
            Send link
          </Button>
        </div>
      </form>

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
