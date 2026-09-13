import type { Metadata } from "next";
import Link from "next/link";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { shopOpen } from "@/lib/inventory";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };

const TONE: Record<string, string> = {
  paid: "bg-[var(--color-hot)] text-[var(--color-hot-ink)]",
  pending: "plate-in text-ink-dim",
  failed: "plate-in text-ink-mute",
  cancelled: "plate-in text-ink-mute",
  expired: "plate-in text-ink-mute",
  refunded: "plate-in text-ink-dim",
};

export default async function AdminOrders() {
  const session = (await currentSession())!;
  const sql = db();
  const open = await shopOpen();

  const [t] = (await sql`
    select
      count(*)::int                                                        as all_orders,
      count(*) filter (where status = 'paid')::int                         as paid,
      count(*) filter (where status = 'pending')::int                      as pending,
      coalesce(sum(total_cents) filter (where status = 'paid'), 0)::int    as revenue_cents,
      coalesce(sum(total_cents) filter (where status = 'paid'
        and created_at > now() - interval '30 days'), 0)::int              as revenue_30d
    from orders
  `) as Record<string, number>[];

  const orders = (await sql`
    select number, token, status, email, total_cents, created_at, paid_at
      from orders order by number desc limit 200
  `) as Record<string, unknown>[];

  const stat = (label: string, value: string) => (
    <div key={label} className="rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2.5">
      <div className="label text-ink-mute">{label}</div>
      <div className="mt-1 text-[19px] font-bold tabular-nums">{value}</div>
    </div>
  );

  return (
    <>
      {/* A management screen leads with numbers, not with a hero. */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stat("Orders", String(t.all_orders))}
        {stat("Paid", String(t.paid))}
        {stat("Unpaid", String(t.pending))}
        {stat("Revenue", money(t.revenue_cents / 100))}
        {stat("Last 30d", money(t.revenue_30d / 100))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border border-edge plate-in px-3 py-2.5">
        <span className="flex items-center gap-2 text-[13.5px]">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${open ? "bg-[var(--color-hot)]" : "bg-[var(--color-pip-off)]"}`}
            aria-hidden="true"
          />
          Shop is <strong>{open ? "open" : "closed"}</strong>
        </span>
        <span className="text-[12.5px] text-ink-mute">
          {open
            ? "Checkout accepts orders. Items with no stock are still refused."
            : "Checkout refuses every order, whatever a page shows."}
        </span>
        <form action="/api/admin/shop" method="post" className="ml-auto">
          <input type="hidden" name="open" value={open ? "false" : "true"} />
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] plate px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-[var(--color-plate-hi)]"
          >
            {open ? "Close shop" : "Open shop"}
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] border border-edge plate-in p-5 text-[14px] text-ink-dim">
          No orders yet. Signed in as {session.email}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-edge">
          <table className="atable min-w-[680px]">
            <thead>
              <tr>
                <th>Order</th><th>Placed</th><th>Email</th><th>Status</th>
                <th className="num">Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={String(o.number)}>
                  <td className="font-bold tabular-nums">{String(o.number)}</td>
                  <td className="text-ink-dim">
                    {new Date(String(o.created_at)).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "2-digit",
                    })}
                  </td>
                  <td className="max-w-[220px] truncate text-ink-dim">{String(o.email)}</td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE[String(o.status)] ?? "plate-in text-ink-mute"}`}>
                      {String(o.status)}
                    </span>
                  </td>
                  <td className="num font-bold">{money(Number(o.total_cents) / 100)}</td>
                  <td className="num">
                    <Link href={`/order/${String(o.token)}`} className="text-ps-blue hover:underline">
                      view
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
