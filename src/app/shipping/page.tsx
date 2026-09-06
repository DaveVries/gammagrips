import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, AsideCard } from "@/components/site/page-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/shipping" },
  title: "Shipping",
  description: "Delivery costs, times and carriers for GammaGrips orders.",
};

export default function ShippingPage() {
  return (
    <PageShell
      title="Shipping"
      deck="Everything ships from our own unit in Rotterdam. No dropshipping, no third-party fulfilment, no surprise customs charges inside the EU."
      crumbs={[{ label: "Shipping" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <AsideCard title="At a glance">
            <ul className="space-y-1.5">
              <li>€4.95 flat inside the EU</li>
              <li>Free over €50</li>
              <li>Same-day dispatch before 16:00 CET, weekdays</li>
              <li>Tracked as standard</li>
            </ul>
          </AsideCard>
          <AsideCard title="Need it faster?">
            <p>
              Email <a href="mailto:support@gammagrips.com">support@gammagrips.com</a>{" "}
              before 15:00 CET with your order number and we will upgrade it to
              express at cost.
            </p>
          </AsideCard>
        </div>
      }
    >
      <h2>Costs</h2>
      <table>
        <thead>
          <tr>
            <th>Destination</th>
            <th>Cost</th>
            <th>Typical time</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Netherlands", "€3.95 · free over €50", "1 working day"],
            ["Belgium, Germany, Luxembourg", "€4.95 · free over €50", "2 working days"],
            ["Rest of EU", "€4.95 · free over €50", "2–4 working days"],
            ["United Kingdom", "€8.95", "3–5 working days"],
            ["Switzerland, Norway", "€11.95", "4–7 working days"],
            ["United States, Canada", "€14.95", "5–9 working days"],
          ].map((r) => (
            <tr key={r[0]}>
              <td>{r[0]}</td>
              <td className="tabular-nums">{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Dispatch</h2>
      <p>
        Orders placed before 16:00 CET on a working day leave the same day.
        Anything after that, or at a weekend, goes out on the next working day.
        You get a tracking link by email as soon as the label is scanned — not
        when it is printed, so the link works the first time you open it.
      </p>

      <h2>Carriers</h2>
      <p>
        PostNL inside the Benelux, DHL for the rest of the EU and the UK, and
        DHL Express outside Europe. All services are tracked. We do not offer an
        untracked option, because the saving is smaller than the cost of one
        lost parcel to either of us.
      </p>

      <h2>Customs and duties</h2>
      <p>
        Inside the EU there are none — prices include Dutch VAT and nothing else
        is collected on delivery. For the UK, Switzerland, Norway and North
        America, VAT is removed at checkout and local import duty may be charged
        by the carrier on arrival. That charge is set by your country, not by us,
        and we cannot pre-pay it.
      </p>

      <h2>If something goes wrong</h2>
      <p>
        If tracking has not moved for five working days, email us with the order
        number and we will send a replacement immediately rather than waiting for
        an investigation to close. See also{" "}
        <Link href="/returns">returns and refunds</Link>.
      </p>
    </PageShell>
  );
}
