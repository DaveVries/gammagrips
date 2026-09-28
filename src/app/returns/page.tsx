import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, AsideCard } from "@/components/site/page-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/returns" },
  title: "Returns & refunds",
  description: "60-day returns on every GammaGrips order, including fitted grips.",
};

export default function ReturnsPage() {
  return (
    <PageShell
      title="Returns & refunds"
      deck="Sixty days, including grips you have already fitted and used. There is no way to find out whether a grip suits your hands without putting it on a controller, so we do not penalise you for finding out."
      crumbs={[{ label: "Returns" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <AsideCard title="At a glance">
            <ul className="space-y-1.5">
              <li>60 days from delivery</li>
              <li>Used and fitted grips accepted</li>
              <li>Return postage paid inside the EU</li>
              <li>Refunded within 5 working days</li>
            </ul>
          </AsideCard>
          <AsideCard title="Start a return">
            <p>
              Email <a href="mailto:info@gammagrips.com">info@gammagrips.com</a>{" "}
              with your order number. A prepaid label comes back the same working
              day. No form, no reason required.
            </p>
          </AsideCard>
        </div>
      }
    >
      <h2>What we accept</h2>
      <p>
        Any grip, for any reason, within 60 days of delivery. That explicitly
        includes grips you have fitted, played with for a month and decided
        against. Wash them if you like; you do not have to.
      </p>
      <p>
        The only things we cannot take back are shells that have been cut,
        painted or otherwise modified, and anything returned after 60 days.
      </p>

      <h2>Why sixty days</h2>
      <p>
        How a moulded surface feels after six hours is not knowable in fourteen
        days of light use, and it is not the customer&rsquo;s fault that it is not.
        A window short enough to make people gamble is a window that generates
        bad purchases.
      </p>

      <h2>Exchanges</h2>
      <p>
        If you want a different colourway rather than your money back, say so in
        the email and we ship the replacement as soon as the return is scanned
        into the carrier network — you are not waiting for it to reach us. Every
        colourway is the same price, so there is nothing to settle.
      </p>

      <h2>Refunds</h2>
      <p>
        Back to the original payment method within five working days of the
        return arriving, including the original delivery charge if the whole
        order goes back. Card refunds usually appear within another two working
        days; iDEAL and PayPal are typically same-day.
      </p>

      <h2>Faults and warranty</h2>
      <p>
        Two years against manufacturing faults — splitting, a lifting edge, or a
        shell that will not stay seated on a clean controller. Email a photo and
        we ship a replacement without asking for the faulty one back. Note that a
        grip working loose is usually skin oil rather than a fault; cleaning both
        surfaces fixes it, and{" "}
        <Link href="/guides/dualsense-grip-installation">the fitting guide</Link>{" "}
        covers it.
      </p>

      <h2>Your statutory rights</h2>
      <p>
        Nothing above reduces your rights under EU consumer law, including the
        14-day right of withdrawal. Our policy is longer and broader than the
        statutory minimum; where they differ, whichever is better for you applies.
      </p>
    </PageShell>
  );
}
