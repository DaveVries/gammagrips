import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { Button, Win } from "@/components/ui/primitives";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  description: "Sign in with a link, or track an order straight from your confirmation email.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};

const LABEL: Record<string, string> = {
  pending: "Awaiting payment", paid: "Paid", failed: "Payment failed",
  cancelled: "Cancelled", expired: "Expired", refunded: "Refunded",
};

/**
 * One door for everyone.
 *
 * There is no separate staff login: the same magic link signs in a customer
 * and an admin, and being staff simply adds options once you are through.
 * A second login screen would be a second thing to keep secure for no gain.
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await currentSession().catch(() => null);

  let orders: Record<string, unknown>[] = [];
  if (session) {
    orders = (await db()`
      select number, token, status, total_cents, created_at
        from orders where lower(email) = ${session.email}
       order by number desc limit 50
    `.catch(() => [])) as Record<string, unknown>[];
  }

  return (
    <PageShell
      title={session ? "Your account" : "Sign in"}
      deck={
        session
          ? `Signed in as ${session.email}.`
          : "No password. Enter your email and we send a link that signs you in — nothing to remember, nothing to reset, nothing to steal."
      }
      crumbs={[{ label: "Account" }]}
      aside={
        <div className="space-y-4 lg:sticky lg:top-24">
          {session?.is_admin && (
            <Win title="STAFF">
              <div className="space-y-2 p-4">
                <p className="mb-3 text-[13px] leading-relaxed text-ink-dim">
                  This address has staff access.
                </p>
                {[
                  ["/admin", "Orders dashboard"],
                  ["/admin/products", "Products"],
                  ["/admin/stock", "Stock"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="key cut-sm flex h-10 items-center justify-center bg-[var(--color-hot)] text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-hot-ink)]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </Win>
          )}
          <Win title="NO ACCOUNT NEEDED">
            <div className="space-y-3 p-4 text-[13.5px] leading-relaxed text-ink-dim">
              <p>
                The link in your confirmation email opens your order directly —
                tracking, returns and re-ordering, without signing in at all.
              </p>
              <p>
                <Link href="/contact" className="text-ps-blue hover:underline">
                  Lost the email?
                </Link>
              </p>
            </div>
          </Win>
        </div>
      }
    >
      {!session && (
        <>
          {sp.sent && (
            <p className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] p-4 text-[14px] leading-relaxed">
              Check your inbox — if that address is known here, a sign-in link is
              on its way. It is valid for 15 minutes and works once.
            </p>
          )}
          {sp.error === "link" && (
            <p className="mb-5 rounded-[var(--radius-md)] border border-edge plate-in p-4 text-[14px]">
              That link has expired or was already used. Request a new one below.
            </p>
          )}

          <form className="max-w-md" action="/api/auth/login" method="post">
            <input type="hidden" name="next" value="/account" />
            <label htmlFor="ac-email" className="mb-1.5 block text-[13px] font-bold">Email</label>
            <div className="flex flex-wrap gap-2">
              <input
                id="ac-email" name="email" type="email" required
                autoComplete="email" inputMode="email" placeholder="you@example.com"
                className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] plate-in px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-ink"
              />
              <Button type="submit" className="h-11 shrink-0">Send link</Button>
            </div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-mute">
              We only send a link to an address that has ordered here.
            </p>
          </form>
        </>
      )}

      {session && (
        <>
          <h2>Your orders</h2>
          {orders.length === 0 ? (
            <p className="text-[15px] text-ink-dim">
              No orders on this address yet.{" "}
              <Link href="/controller-grips" className="text-ps-blue hover:underline">Browse the grips</Link>.
            </p>
          ) : (
            <ul className="not-prose space-y-2">
              {orders.map((o) => (
                <li key={String(o.number)}>
                  <Link
                    href={`/order/${String(o.token)}`}
                    className="lift flex items-center gap-4 rounded-[var(--radius-md)] border border-edge glass p-4 transition-colors hover:bg-[var(--color-plate-hi)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold">Order {String(o.number)}</span>
                      <span className="block text-[12.5px] text-ink-mute">
                        {new Date(String(o.created_at)).toLocaleDateString("en-GB")} ·{" "}
                        {LABEL[String(o.status)] ?? String(o.status)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums">
                      {money(Number(o.total_cents) / 100)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <form action="/api/auth/logout" method="post" className="mt-8 not-prose">
            <Button type="submit" variant="default">Sign out</Button>
          </form>
        </>
      )}
    </PageShell>
  );
}
