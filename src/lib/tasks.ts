export const TASK_PEOPLE = [
  { id: "toon", name: "Toon" },
  { id: "dave", name: "Dave" },
] as const;

export type TaskPerson = (typeof TASK_PEOPLE)[number]["id"];

export const personName = (id: string) =>
  TASK_PEOPLE.find((p) => p.id === id)?.name ?? id;

export const isPerson = (v: unknown): v is TaskPerson =>
  TASK_PEOPLE.some((p) => p.id === v);

export type Task = {
  id: number;
  title: string;
  notes: string;
  assignee: TaskPerson;
  status: "open" | "done";
  due_on: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type TaskUpdate = {
  id: number;
  task_id: number;
  author: string;
  kind: "comment" | "event";
  body: string;
  created_at: string;
};

/** Which of us is on this device. The admin login is shared, so the session
 *  email cannot tell us apart; a cookie set from the Tasks tab does. */
export const ME_COOKIE = "gg_task_me";

/** Author label: a person id becomes their name; an email (older rows, or a
 *  device that never picked) shows the part before the @. */
export const who = (author: string) => (isPerson(author) ? personName(author) : author.split("@")[0]);

export const when = (d: string | Date) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  });

export const day = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

/** Due dates are plain dates; compare against today in Amsterdam. */
export function overdue(t: Pick<Task, "due_on" | "status">) {
  if (!t.due_on || t.status === "done") return false;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
  return String(t.due_on).slice(0, 10) < today;
}
