import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, AsideCard } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about fit, fitting, surfaces, delivery and returns.",
};

const GROUPS = [
  {
    heading: "Fit",
    items: [
      ["Which controllers do you make grips for?", "The PS5 DualSense, the DualSense Edge, the Xbox Wireless Controller (including the 2016 Xbox One refresh with a 3.5 mm jack) and the Xbox Elite Series 2. Each is a separate mould and they are not interchangeable. The compatibility checker identifies yours in two questions."],
      ["Will a DualSense grip fit a DualSense Edge?", "No. The Edge has a rear paddle module and our Edge shells are cut around it. A standard DualSense shell will not seat correctly on an Edge, and vice versa."],
      ["Do they cover the ports or the paddles?", "No. Every shell is cut around the USB-C port, both triggers, the headphone jack and — on the Edge and Elite Series 2 — the rear module, so stick modules and paddles still come out with the grips on."],
      ["How much thicker will my controller be?", "Between 1.1 mm and 3.1 mm per handle depending on the surface. Vapor at 1.4 mm and Ice Froyo at 1.1 mm are the least noticeable; Venom at 3.1 mm is the most."],
    ],
  },
  {
    heading: "Fitting and care",
    items: [
      ["How long does fitting take?", "About two minutes, with no tools and no adhesive. The one step people skip is cleaning the handles first, which is the usual reason a grip later works loose."],
      ["Will it leave residue on my controller?", "No, because there is no adhesive anywhere in the product. It is held by the shape of the mould. You can remove and refit it as often as you like."],
      ["A grip is lifting at one edge. Is it faulty?", "Nine times out of ten it is skin oil on the controller. Take the grip off, wash both the handle and the inside of the shell with warm water and washing-up liquid, dry completely and refit. If it still lifts at the same edge, email us — that is a moulding fault and we replace it."],
      ["Can I wash them?", "Yes. Dishwasher safe on a normal cycle, top rack, or warm water and washing-up liquid with a brush. Open-cell surfaces need it every two to three weeks under heavy use — the cells collect skin oil and go slick once they load up."],
    ],
  },
  {
    heading: "Choosing",
    items: [
      ["Which grip should I buy?", "If your hands sweat, Dark Matter or Ember — they are the only surfaces with channels deep enough to move moisture. For long sessions without sweat, Volt. For joint pain, Venom. To change as little as possible, Vapor or Ice Froyo."],
      ["Is the pattern printed on?", "No. Each grip is one mould, so the pattern is the physical relief — what you see is what your hand feels. That is also why design and surface are a single choice here rather than two."],
      ["Do you restock sold-out combinations?", "Yes. Everything in the range is in continuous production; a sold-out controller variant is a tooling schedule gap, usually two to three weeks."],
    ],
  },
  {
    heading: "Orders",
    items: [
      ["Do I need an account to order?", "No. Guest checkout is the normal path and you can track the order from the emailed link. If you want an account afterwards, one click on the confirmation page turns the order into one."],
      ["When will it arrive?", "Same-day dispatch before 16:00 CET on a working day. One day in the Netherlands, two to four across the EU. Full table on the shipping page."],
      ["Can I change or cancel an order?", "If it has not shipped, yes — email us with the order number. After dispatch, use the 60-day return window instead."],
    ],
  },
];

export default function FaqPage() {
  return (
    <PageShell
      title="Frequently asked questions"
      deck="If your question is not here, email us — we answer within one working day and a person writes the reply."
      crumbs={[{ label: "FAQ" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <AsideCard title="Still stuck?">
            <p>
              <a href="mailto:support@gammagrips.com">support@gammagrips.com</a>
              <br />
              Monday to Friday, 09:00–17:30 CET.
            </p>
            <p>
              <Link href="/contact">Contact form</Link> ·{" "}
              <Link href="/compatibility">Compatibility checker</Link>
            </p>
          </AsideCard>
        </div>
      }
    >
      {GROUPS.map((g) => (
        <section key={g.heading}>
          <h2>{g.heading}</h2>
          <div className="mt-4 divide-y divide-edge border-y border-edge">
            {g.items.map(([q, a]) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14.5px] font-medium text-ink marker:hidden">
                  {q}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                    className="shrink-0 text-ink-mute transition-transform group-open:rotate-45"
                  >
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </summary>
                <p className="pb-5 pr-8">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
