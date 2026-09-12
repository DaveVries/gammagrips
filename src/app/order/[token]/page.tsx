import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { Win, Rule } from "@/components/ui/primitives";
import { orderByToken } from "@/lib/orders";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  // A tracking link is not something to index or share around.
  robots: { index: false, follow: false },
};

const STATUS: Record<string, { label: string; note: string }> = {
  pending: { label: "Awaiting payment", note: "We have not received the payment yet. If you just paid, this can take a few seconds — refresh the page." },
  paid: { label: "Paid", note: "Thank you. We are picking and packing; you will get a tracking link when it leaves Hillegom." },
  failed: { label: "Payment failed", note: "The payment did not go through and nothing has been charged. You can order again, or email us." },
  cancelled: { label: "Cancelled", note: "The payment was cancelled. Nothing has been charged." },
  expired: { label: "Expired", note: "The payment window expired. Nothing has been charged." },
  refunded: { label: "Refunded", note: "This order has been refunded. It can take a few days to appear on your statement." },
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await orderByToken(token).catch(() => null);
  if (!found) notFound();

  const { order, lines } = found;
  const status = String(order.status);
  const meta = STATUS[status] ?? STATUS.pending;

  return (
    <PageShell
      title={meta.label}
      deck={meta.note}
      crumbs={[{ label: `Order ${order.number}` }]}
    >
      <Win title={`ORDER ${order.number}`}>
        <div className="p-4 sm:p-5">
          <ul className="space-y-2">
            {lines.map((l, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="min-w-0">
                  <span className="font-semibold">{String(l.name)}</span>{" "}
                  <span className="text-ink-mute">× {String(l.qty)}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {money(Number(l.line_cents) / 100)}
                </span>
              </li>
            ))}
          </ul>

          <Rule className="my-4 h-[2px]" />

          <div className="flex items-baseline justify-between text-[15px] font-bold">
            <span>Total</span>
            <span className="tabular-nums">{money(Number(order.total_cents) / 100)}</span>
          </div>

          <p className="mt-4 text-[12.5px] text-ink-mute">
            Confirmation sent to {String(order.email)}. Keep this link — it is how
            you track, return or re-order without an account.
          </p>
        </div>
      </Win>
    </PageShell>
  );
}
