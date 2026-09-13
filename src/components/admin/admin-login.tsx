import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/primitives";

/** Sign-in screen for /admin. Shown to signed-out visitors and to signed-in
 *  non-admins alike, so the page never confirms who is an admin. */
export function AdminLogin({ sent, error }: { sent?: boolean; error?: string }) {
  return (
    <PageShell
      title="Sign in"
      deck="Staff only. Enter your address and we send a one-time link — no password."
      crumbs={[{ label: "Admin" }]}
    >
      {sent && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] p-4 text-[14px] leading-relaxed">
          If that address has access, a sign-in link is on its way. It is valid
          for 15 minutes and works once.
        </p>
      )}
      {error === "link" && (
        <p className="mb-5 rounded-[var(--radius-md)] border border-edge plate-in p-4 text-[14px]">
          That link has expired or was already used. Request a new one.
        </p>
      )}

      <form className="max-w-md" action="/api/auth/login" method="post">
        <input type="hidden" name="next" value="/admin" />
        <label htmlFor="admin-email" className="mb-1.5 block text-[13px] font-bold">
          Email
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@gammagrips.com"
            className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] plate-in px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-ink"
          />
          <Button type="submit" className="h-11 shrink-0">
            Send link
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
