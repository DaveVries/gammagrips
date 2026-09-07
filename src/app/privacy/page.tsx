import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: 'Privacy',
  description: 'What we collect, why, and how to get rid of it.',
};

export default function Page() {
  return (
    <PageShell
      title={'Privacy'}
      deck={'What we collect, why, and how to get rid of it.'}
      crumbs={[{ label: 'Privacy' }]}
    >
      <h2>What we collect</h2>
      <p>
        To fulfil an order: your name, delivery address and email address. To take
        payment: nothing — card details go directly to our payment processor and
        never touch our servers. If you email us, we keep that thread so the next
        person who picks it up has the context.
      </p>
      <p>
        We do not collect a phone number, a date of birth, or anything else that
        is not needed to get a parcel to you.
      </p>

      <h2>Analytics</h2>
      <p>
        We run a self-hosted, cookieless analytics instance that records page
        paths, referrers and coarse country. It does not set a cookie, does not
        build a profile and does not follow you to other sites. There is no
        advertising pixel on this site.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Order records for seven years, because Dutch tax law requires it. Support
        threads for two years. Newsletter subscriptions until you unsubscribe,
        which is one click in every email.
      </p>

      <h2>Who else sees it</h2>
      <p>
        Our carrier gets the delivery address. Our payment processor gets what it
        needs to take the payment. Our email provider transports the messages.
        That is the complete list — we do not sell or share data with anyone else,
        for any purpose.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you can ask for a copy of what we hold, ask us to correct
        it, or ask us to delete it. Email{" "}
        <a href="mailto:info@gammagrips.com">info@gammagrips.com</a> and we
        will action it within 30 days, usually within two working days. Deletion
        does not remove invoices we are legally required to retain.
      </p>
    </PageShell>
  );
}
