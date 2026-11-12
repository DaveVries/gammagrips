import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPerson, personName } from "@/lib/tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Every task action is a form POST here with an `action` field, the same
 * no-JS pattern as the rest of the admin: submit, redirect back with 303.
 */
export async function POST(req: Request) {
  const session = await currentSession().catch(() => null);
  if (!session?.is_admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return back(req, "/admin/tasks");

  const sql = db();
  const me = session.email;
  const action = String(form.get("action") ?? "");
  const id = Number(form.get("id"));
  const text = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const due = text("due_on", 10);
  const dueOn = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
  /* Where to land afterwards: the list keeps its filters, the detail page its id. */
  const ret = safeReturn(String(form.get("return") ?? ""));

  if (action === "create") {
    const title = text("title", 200);
    const assignee = String(form.get("assignee") ?? "");
    if (!title || !isPerson(assignee)) return back(req, withParam(ret ?? "/admin/tasks", "error", "missing"));
    const [row] = (await sql`
      insert into tasks (title, notes, assignee, due_on, created_by)
      values (${title}, ${text("notes", 5000)}, ${assignee}, ${dueOn}, ${me})
      returning id
    `) as { id: number }[];
    await sql`
      insert into task_updates (task_id, author, kind, body)
      values (${row.id}, ${me}, 'event', ${`Created and assigned to ${personName(assignee)}`})
    `;
    return back(req, withParam(ret ?? "/admin/tasks", "created", "1"));
  }

  if (!Number.isInteger(id) || id <= 0) return back(req, "/admin/tasks");
  const [task] = (await sql`select id, assignee, status from tasks where id = ${id}`) as {
    id: number; assignee: string; status: string;
  }[];
  if (!task) return back(req, "/admin/tasks");
  const detail = `/admin/tasks/${id}`;

  if (action === "edit") {
    const title = text("title", 200);
    const assignee = String(form.get("assignee") ?? "");
    if (!title || !isPerson(assignee)) return back(req, `${detail}?error=missing`);
    await sql`
      update tasks set title = ${title}, notes = ${text("notes", 5000)}, assignee = ${assignee},
             due_on = ${dueOn}, updated_at = now()
       where id = ${id}
    `;
    if (assignee !== task.assignee) {
      await sql`
        insert into task_updates (task_id, author, kind, body)
        values (${id}, ${me}, 'event', ${`Reassigned from ${personName(task.assignee)} to ${personName(assignee)}`})
      `;
    }
    return back(req, `${detail}?saved=1`);
  }

  if (action === "toggle") {
    const done = task.status !== "done";
    await sql`
      update tasks set status = ${done ? "done" : "open"},
             completed_at = ${done ? new Date().toISOString() : null}, updated_at = now()
       where id = ${id}
    `;
    await sql`
      insert into task_updates (task_id, author, kind, body)
      values (${id}, ${me}, 'event', ${done ? "Marked as done" : "Reopened"})
    `;
    return back(req, ret ?? detail);
  }

  if (action === "comment") {
    const body = text("body", 5000);
    if (body) {
      await sql`insert into task_updates (task_id, author, body) values (${id}, ${me}, ${body})`;
      await sql`update tasks set updated_at = now() where id = ${id}`;
    }
    return back(req, `${detail}#updates`);
  }

  if (action === "delete") {
    await sql`delete from tasks where id = ${id}`;
    return back(req, "/admin/tasks?deleted=1");
  }

  return back(req, detail);
}

const back = (req: Request, path: string) => NextResponse.redirect(new URL(path, req.url), 303);

/** Only ever redirect within the tasks screens. */
function safeReturn(v: string) {
  return v.startsWith("/admin/tasks") && !v.startsWith("//") ? v : null;
}

function withParam(path: string, k: string, v: string) {
  const u = new URL(path, "http://x");
  u.searchParams.set(k, v);
  return u.pathname + u.search;
}
