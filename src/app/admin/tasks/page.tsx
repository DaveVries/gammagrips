import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { MeSwitch } from "./me-switch";
import { TASK_PEOPLE, day, overdue, personName, type Task } from "@/lib/tasks";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tasks", robots: { index: false, follow: false } };

const field = "h-10 w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 text-[13.5px] text-ink outline-none focus:border-ink-mute";
const lbl = "mb-1.5 block text-[12px] font-bold";
const chip = "rounded-full px-3 py-1 text-[12px] font-bold transition-colors";

type Row = Task & { update_count: number; last_update: string | null };

export default async function AdminTasks({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const who = TASK_PEOPLE.some((p) => p.id === sp.who) ? String(sp.who) : "all";
  const show = sp.show === "done" ? "done" : "open";
  const sql = db();

  const rows = (await sql`
    select t.id, t.title, t.notes, t.assignee, t.status, t.due_on::text as due_on,
           t.created_by, t.created_at, t.updated_at, t.completed_at,
           (select count(*)::int from task_updates u where u.task_id = t.id and u.kind = 'comment') as update_count,
           (select u.body from task_updates u where u.task_id = t.id and u.kind = 'comment'
             order by u.created_at desc limit 1) as last_update
      from tasks t
     where t.status = ${show}
       and (${who} = 'all' or t.assignee = ${who})
     order by
       case when ${show} = 'done' then t.completed_at end desc nulls last,
       t.due_on asc nulls last,
       t.created_at desc
     limit 300
  `) as Row[];

  const counts = (await sql`
    select assignee, count(*)::int as n from tasks where status = 'open' group by assignee
  `) as { assignee: string; n: number }[];
  const openFor = (id: string) => counts.find((c) => c.assignee === id)?.n ?? 0;
  const openAll = counts.reduce((s, c) => s + c.n, 0);

  const href = (p: { who?: string; show?: string }) => {
    const q = new URLSearchParams();
    const w = p.who ?? who;
    const s = p.show ?? show;
    if (w !== "all") q.set("who", w);
    if (s !== "open") q.set("show", s);
    const qs = q.toString();
    return `/admin/tasks${qs ? `?${qs}` : ""}`;
  };
  const here = href({});

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-[19px] font-bold">Tasks</h1>
        <p className="text-[12.5px] text-ink-mute">
          {openAll} open · {TASK_PEOPLE.map((p) => `${p.name} ${openFor(p.id)}`).join(" · ")}
        </p>
        <div className="ml-auto"><MeSwitch returnTo={here} /></div>
      </div>

      {sp.created && <Note>Task added.</Note>}
      {sp.deleted && <Note>Task deleted.</Note>}
      {sp.error && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/50 px-3 py-2 text-[13px]">
          A task needs a title and an assignee.
        </p>
      )}

      <details className="mb-4 rounded-[var(--radius-sm)] border border-edge plate-in" open={rows.length === 0 && show === "open"}>
        <summary className="cursor-pointer select-none px-4 py-3 text-[13.5px] font-bold">+ New task</summary>
        <form action="/api/admin/tasks" method="post" className="grid gap-3 px-4 pb-4 sm:grid-cols-4">
          <input type="hidden" name="action" value="create" />
          <input type="hidden" name="return" value={here} />
          <label className="block sm:col-span-4">
            <span className={lbl}>Title</span>
            <input name="title" required maxLength={200} className={field} placeholder="What needs doing?" />
          </label>
          <label className="block sm:col-span-4">
            <span className={lbl}>Details <span className="font-normal text-ink-mute">(optional)</span></span>
            <textarea name="notes" rows={3} maxLength={5000}
              className="w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] p-3 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink-mute" />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className={lbl}>Assign to</legend>
            <div className="flex gap-2">
              {TASK_PEOPLE.map((p, i) => (
                <label key={p.id}
                  className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] text-[13.5px] font-bold has-[:checked]:border-[var(--color-ice)] has-[:checked]:text-[var(--color-ice)]">
                  <input type="radio" name="assignee" value={p.id} required
                    defaultChecked={who === p.id || (who === "all" && i === 0)} className="sr-only" />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className={lbl}>Due <span className="font-normal text-ink-mute">(optional)</span></span>
            <input name="due_on" type="date" className={field} />
          </label>
          <div className="flex items-end">
            <button type="submit"
              className="h-10 w-full rounded-[var(--radius-sm)] bg-[var(--color-ice)] px-4 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)]">
              Add task
            </button>
          </div>
        </form>
      </details>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {[{ id: "all", name: "Everyone" }, ...TASK_PEOPLE].map((p) => (
          <Link key={p.id} href={href({ who: p.id })}
            className={`${chip} ${who === p.id ? "bg-[var(--color-ice)] text-[var(--color-on-ice)]" : "plate-in text-ink-dim hover:text-ink"}`}>
            {p.name}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-[var(--color-plate-edge)]" aria-hidden="true" />
        {(["open", "done"] as const).map((s) => (
          <Link key={s} href={href({ show: s })}
            className={`${chip} ${show === s ? "bg-[var(--color-plate-hi)] text-ink" : "text-ink-mute hover:text-ink"}`}>
            {s === "open" ? "Open" : "Done"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] border border-edge plate-in p-5 text-[14px] text-ink-dim">
          {show === "open" ? "Nothing open. Nice." : "Nothing completed yet."}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-plate-edge)] overflow-hidden rounded-[var(--radius-sm)] border border-edge">
          {rows.map((t) => {
            const late = overdue(t);
            return (
              <li key={t.id} className="flex items-start gap-3 px-3 py-3 hover:bg-[var(--color-plate-lo)]">
                <form action="/api/admin/tasks" method="post" className="pt-0.5">
                  <input type="hidden" name="action" value="toggle" />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="return" value={here} />
                  <button type="submit"
                    aria-label={t.status === "done" ? `Reopen ${t.title}` : `Complete ${t.title}`}
                    title={t.status === "done" ? "Reopen" : "Mark done"}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[12px] font-bold ${
                      t.status === "done"
                        ? "border-[var(--color-hot)] bg-[var(--color-hot)] text-[var(--color-hot-ink)]"
                        : "border-ink-mute text-transparent hover:border-[var(--color-hot)] hover:text-[var(--color-hot)]"
                    }`}>
                    ✓
                  </button>
                </form>
                <Link href={`/admin/tasks/${t.id}`} className="min-w-0 flex-1">
                  <div className={`text-[14px] font-bold ${t.status === "done" ? "text-ink-mute line-through" : ""}`}>
                    {t.title}
                  </div>
                  {t.last_update && (
                    <div className="mt-0.5 truncate text-[12.5px] text-ink-dim">↳ {t.last_update}</div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-mute">
                    <span className="rounded-full plate-in px-2 py-0.5 font-bold text-ink-dim">{personName(t.assignee)}</span>
                    {t.due_on && (
                      <span className={late ? "font-bold text-[var(--color-hot)]" : ""}>
                        {late ? "Overdue · " : "Due "}{day(t.due_on)}
                      </span>
                    )}
                    {t.status === "done" && t.completed_at && <span>Done {day(t.completed_at)}</span>}
                    {t.update_count > 0 && (
                      <span>{t.update_count} update{t.update_count === 1 ? "" : "s"}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
      {children}
    </p>
  );
}
