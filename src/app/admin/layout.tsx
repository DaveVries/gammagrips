import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";

/**
 * Admin shell.
 *
 * Deliberately not the storefront chrome: a maintenance screen wants density
 * and a persistent nav, not glass panels and generous rhythm. One gate here
 * too, so every page under /admin is checked in one place instead of each
 * page remembering to do it.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await currentSession().catch(() => null);
  if (!session) redirect("/account?next=/admin");
  if (!session.is_admin) redirect("/account");

  const tabs = [
    ["/admin", "Orders"],
    ["/admin/products", "Products"],
    ["/admin/stock", "Stock"],
  ] as const;

  return (
    <div className="gutter pb-24 pt-4">
      <div className="shell">
        <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[var(--color-plate-edge)] pb-3">
          <span className="label text-ink-mute">ADMIN</span>
          <nav className="flex flex-wrap gap-1">
            {tabs.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-bold text-ink-dim transition-colors hover:bg-[var(--color-plate-hi)] hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto hidden text-[12.5px] text-ink-mute sm:block">
            {session.email}
          </span>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-[var(--radius-sm)] plate px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-[var(--color-plate-hi)]"
            >
              Sign out
            </button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
