import { cookies } from "next/headers";
import { ME_COOKIE, TASK_PEOPLE, isPerson } from "@/lib/tasks";

/**
 * "I'm Toon / I'm Dave". The admin login is shared, so this is what signs
 * updates and completions with the right name. Until a device picks, it asks.
 */
export async function MeSwitch({ returnTo }: { returnTo: string }) {
  const picked = (await cookies()).get(ME_COOKIE)?.value;
  const me = isPerson(picked) ? picked : null;

  return (
    <form action="/api/admin/tasks" method="post"
      className={`flex flex-wrap items-center gap-2 ${me ? "" : "mb-4 w-full rounded-[var(--radius-sm)] border border-[var(--color-ice)]/60 plate-in px-3 py-2.5"}`}>
      <input type="hidden" name="action" value="me" />
      <input type="hidden" name="return" value={returnTo} />
      <span className="text-[12.5px] text-ink-mute">
        {me ? "Posting as" : "Who's using this device? Updates are signed with this name."}
      </span>
      <div className="flex gap-1">
        {TASK_PEOPLE.map((p) => (
          <button key={p.id} type="submit" name="person" value={p.id} aria-pressed={me === p.id}
            className={`rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
              me === p.id
                ? "bg-[var(--color-ice)] text-[var(--color-on-ice)]"
                : "plate text-ink-dim hover:text-ink"
            }`}>
            {me ? p.name : `I'm ${p.name}`}
          </button>
        ))}
      </div>
    </form>
  );
}
