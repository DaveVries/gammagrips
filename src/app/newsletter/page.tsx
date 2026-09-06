import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false } };

export default function NewsletterPage() {
  return (
    <PageShell
      title="You're on the list"
      deck="One email a month, only when something is genuinely new. One click to leave, in every message."
      crumbs={[{ label: "Newsletter" }]}
    >
      <p>
        Nothing else is needed from you. We will not pass your address on, and we
        will not use it to email you about anything other than new grips and
        restocks.
      </p>
    </PageShell>
  );
}
