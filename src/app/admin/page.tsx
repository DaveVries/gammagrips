import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { Button, Win } from "@/components/ui/primitives";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  /* The real check. Middleware only saw that *a* cookie existed. */
  const session = await currentSession().catch(() => null);
  if (!session) redirect("/account?next=/admin");
  if (!session.is_admin) redirect("/account");

  const sql = db();
  const [totals] = (await sql`
    select
      count(*) filter (where status = 'paid')::int         as paid,
      count(*) filter (where status = 'pending')::int      as pending,
      coalesce(sum(total_cents) filter (where status = 'paid'), 0)::int as revenue_cents
    from orders
  `) as { paid: number; pending: number; revenue_cents: number }[];

  const orders = (await sql`
    select number, token, status, email, total_cents, created_at
      from orders order by number desc limit 100
  `) as Record<string, unknown>[];

  return (
    <PageShell
      title="Orders"
      deck={`Signed in as ${session.email}.`}
      crumbs={[{ label: "Admin" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Win title="TOTALS">
            <dl className="space-y-2 p-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Paid</dt>
                <dd className="font-bold tabular-nums">{totals.paid}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-mute">Awaiting payment</dt>
                <dd className="font-bold tabular-nums">{totals.pending}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--color-plate-edge)] pt-2">
                <dt className="text-ink-mute">Revenue</dt>
                <dd className="font-bold tabular-nums">
                  {money(totals.revenue_cents / 100)}
                </dd>
              </div>
            </dl>
          </Win>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="default" full>
              Sign out
            </Button>
          </form>
        </div>
      }
    >
      {orders.length === 0 ? (
        <p className="text-[15px] text-ink-dim">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13.5px]">
            <thead>
              <tr className="border-b border-[var(--color-plate-edge)] text-left">
                <th className="label py-2 text-ink-mute">Order</th>
                <th className="label py-2 text-ink-mute">Date</th>
                <th className="label py-2 text-ink-mute">Email</th>
                <th className="label py-2 text-ink-mute">Status</th>
                <th className="label py-2 text-right text-ink-mute">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={String(o.number)} className="border-b border-[var(--color-edge)]">
                  <td className="py-2.5 font-bold">
                    <Link href={`/order/${String(o.token)}`} className="hover:underline">
                      {String(o.number)}
                    </Link>
                  </td>
                  <td className="py-2.5 text-ink-dim">
                    {new Date(String(o.created_at)).toLocaleDateString("en-GB")}
                  </td>
                  <td className="max-w-[180px] truncate py-2.5 text-ink-dim">
                    {String(o.email)}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={
                        String(o.status) === "paid"
                          ? "rounded-full bg-[var(--color-hot)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-hot-ink)]"
                          : "rounded-full plate-in px-2 py-0.5 text-[11px] font-bold text-ink-dim"
                      }
                    >
                      {String(o.status)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold tabular-nums">
                    {money(Number(o.total_cents) / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
