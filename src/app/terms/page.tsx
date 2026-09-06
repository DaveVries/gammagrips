import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: 'Terms',
  description: 'The terms that apply when you order from GammaGrips.',
};

export default function Page() {
  return (
    <PageShell
      title={'Terms'}
      deck={'The terms that apply when you order from GammaGrips.'}
      crumbs={[{ label: 'Terms' }]}
    >
      <h2>Who you are contracting with</h2>
      <p>
        GammaGrips B.V., Keileweg 22, 3029 BS Rotterdam, Netherlands. KvK
        82910433, VAT NL862634891B01. Dutch law applies to these terms.
      </p>

      <h2>Orders</h2>
      <p>
        An order is an offer to buy. The contract forms when we email your
        confirmation. If we cannot fulfil an order — a stock error, an address we
        cannot ship to — we cancel it and refund in full, and we tell you why.
      </p>

      <h2>Prices</h2>
      <p>
        Prices are in euros and include Dutch VAT at 21% for EU customers. VAT is
        removed at checkout for destinations outside the EU, where local import
        duty may apply instead. Where a product shows a struck-through price, that
        price was the price we actually charged within the preceding 30 days.
      </p>

      <h2>Right of withdrawal</h2>
      <p>
        You may cancel within 14 days of delivery without giving a reason, as
        required by EU law. Our own returns policy is 60 days and covers used
        goods, so in practice it is the broader of the two that applies.
      </p>

      <h2>Warranty</h2>
      <p>
        Two years against manufacturing defects. This does not cover damage from
        modification, cutting, or use outside the stated 5–45 °C range, and it
        does not cover a grip loosening because of skin oil, which cleaning
        resolves.
      </p>

      <h2>Liability</h2>
      <p>
        Our liability is limited to the value of the order. Nothing in these terms
        limits liability for death, personal injury or fraud, and nothing reduces
        your statutory rights as a consumer.
      </p>

      <h2>Trademarks</h2>
      <p>
        PlayStation, DualSense and DualSense Edge are trademarks of Sony
        Interactive Entertainment. Xbox and Xbox Elite are trademarks of Microsoft.
        GammaGrips is not affiliated with, endorsed by or sponsored by either
        company. Controller names are used only to state which products fit which
        hardware.
      </p>
    </PageShell>
  );
}
