import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MeSwitch } from "../me-switch";
import { TASK_PEOPLE, day, overdue, personName, when, who, type Task, type TaskUpdate } from "@/lib/tasks";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Task", robots: { index: false, follow: false } };

const field = "h-10 w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 text-[13.5px] text-ink outline-none focus:border-ink-mute";
const area = "w-full rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] p-3 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink-mute";
const lbl = "mb-1.5 block text-[12px] font-bold";
const btn = "rounded-[var(--radius-sm)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em]";

export default async function TaskDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const sp = await searchParams;
  const sql = db();

  const [task] = (await sql`
    select id, title, notes, assignee, status, due_on::text as due_on, created_by,
           created_at, updated_at, completed_at
      from tasks where id = ${id}
  `) as Task[];
  if (!task) notFound();

  const updates = (await sql`
    select id, task_id, author, kind, body, created_at
      from task_updates where task_id = ${id} order by created_at asc, id asc
  `) as TaskUpdate[];

  const done = task.status === "done";
  const late = overdue(task);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/admin/tasks" className="text-[13px] text-ps-blue hover:underline">← Tasks</Link>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${done ? "bg-[var(--color-hot)] text-[var(--color-hot-ink)]" : "plate-in text-ink-dim"}`}>
          {done ? "done" : "open"}
        </span>
        <span className="text-[12px] text-ink-mute">
          {personName(task.assignee)}
          {task.due_on && <> · <span className={late ? "font-bold text-[var(--color-hot)]" : ""}>{late ? "overdue " : "due "}{day(task.due_on)}</span></>}
          {" · "}added by {who(task.created_by)} {when(task.created_at)}
        </span>
        <div className="ml-auto"><MeSwitch returnTo={`/admin/tasks/${task.id}`} /></div>
      </div>

      {sp.saved && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/40 bg-[var(--color-note-green)] px-3 py-2 text-[13px]">
          Saved.
        </p>
      )}
      {sp.error && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-hot)]/50 px-3 py-2 text-[13px]">
          A task needs a title and an assignee.
        </p>
      )}

      <h1 className={`mb-3 text-[22px] font-bold leading-tight ${done ? "text-ink-mute line-through" : ""}`}>{task.title}</h1>

      <form action="/api/admin/tasks" method="post" className="mb-6">
        <input type="hidden" name="action" value="toggle" />
        <input type="hidden" name="id" value={task.id} />
        <button type="submit"
          className={`${btn} ${done ? "plate text-ink hover:bg-[var(--color-plate-hi)]" : "bg-[var(--color-hot)] text-[var(--color-hot-ink)]"}`}>
          {done ? "Reopen task" : "✓ Mark as done"}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Progress first: it is what gets used most. */}
        <section id="updates" className="lg:col-span-3">
          <h2 className="mb-2 text-[14px] font-bold">Progress</h2>
          <div className="rounded-[var(--radius-sm)] border border-edge plate-in p-4">
            {task.notes && (
              <p className="mb-4 whitespace-pre-wrap border-b border-[var(--color-plate-edge)] pb-4 text-[13.5px] leading-relaxed text-ink-dim">
                {task.notes}
              </p>
            )}
            <ol className="space-y-3">
              {updates.map((u) =>
                u.kind === "event" ? (
                  <li key={u.id} className="text-[12px] text-ink-mute">
                    — {u.body} · {who(u.author)} · {when(u.created_at)}
                  </li>
                ) : (
                  <li key={u.id} className="rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] px-3 py-2.5">
                    <div className="mb-1 text-[11.5px] text-ink-mute">
                      <strong className="text-ink-dim">{who(u.author)}</strong> · {when(u.created_at)}
                    </div>
                    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{u.body}</p>
                  </li>
                ),
              )}
            </ol>

            <form action="/api/admin/tasks" method="post" className="mt-4">
              <input type="hidden" name="action" value="comment" />
              <input type="hidden" name="id" value={task.id} />
              <label className="block">
                <span className={lbl}>Add an update</span>
                <textarea name="body" rows={3} required maxLength={5000} className={area}
                  placeholder="Where does this stand?" />
              </label>
              <button type="submit" className={`${btn} mt-2 bg-[var(--color-ice)] text-[var(--color-on-ice)]`}>
                Post update
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-2 text-[14px] font-bold">Edit</h2>
          <form action="/api/admin/tasks" method="post"
            className="space-y-3 rounded-[var(--radius-sm)] border border-edge plate-in p-4">
            <input type="hidden" name="action" value="edit" />
            <input type="hidden" name="id" value={task.id} />
            <label className="block">
              <span className={lbl}>Title</span>
              <input name="title" required maxLength={200} defaultValue={task.title} className={field} />
            </label>
            <label className="block">
              <span className={lbl}>Details</span>
              <textarea name="notes" rows={4} maxLength={5000} defaultValue={task.notes} className={area} />
            </label>
            <fieldset>
              <legend className={lbl}>Assigned to</legend>
              <div className="flex gap-2">
                {TASK_PEOPLE.map((p) => (
                  <label key={p.id}
                    className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border border-edge bg-[var(--color-plate-lo)] text-[13.5px] font-bold has-[:checked]:border-[var(--color-ice)] has-[:checked]:text-[var(--color-ice)]">
                    <input type="radio" name="assignee" value={p.id} defaultChecked={task.assignee === p.id} className="sr-only" />
                    {p.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className={lbl}>Due</span>
              <input name="due_on" type="date" defaultValue={task.due_on ?? ""} className={field} />
            </label>
            <button type="submit" className={`${btn} plate text-ink hover:bg-[var(--color-plate-hi)]`}>
              Save changes
            </button>
          </form>

          {/* Two steps, so a stray tap on a phone cannot wipe a task and its history. */}
          <details className="mt-3 text-right">
            <summary className="cursor-pointer list-none text-[12px] text-ink-mute underline hover:text-ink">
              Delete task
            </summary>
            <form action="/api/admin/tasks" method="post" className="mt-2">
              <input type="hidden" name="action" value="delete" />
              <input type="hidden" name="id" value={task.id} />
              <button type="submit" className={`${btn} border border-[var(--color-hot)]/60 text-ink`}>
                Delete for good, with its updates
              </button>
            </form>
          </details>
        </section>
      </div>
    </>
  );
}
