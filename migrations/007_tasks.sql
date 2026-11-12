-- Internal task list for the two people running the shop.
--
-- Assignee is a fixed pair rather than a users table: there are two of us,
-- and a check constraint is the whole of the user management this needs.
-- Add a name to the check (and to TASK_PEOPLE in src/lib/tasks.ts) to grow it.

create table if not exists tasks (
  id            bigint generated always as identity primary key,
  title         text not null,
  notes         text not null default '',
  assignee      text not null check (assignee in ('toon','dave')),
  status        text not null default 'open' check (status in ('open','done')),
  due_on        date,
  created_by    text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists tasks_status_idx on tasks (status, assignee);

-- Progress comments, plus an automatic line whenever a task is reassigned,
-- completed or reopened, so the history reads top to bottom on its own.
create table if not exists task_updates (
  id          bigint generated always as identity primary key,
  task_id     bigint not null references tasks (id) on delete cascade,
  author      text not null,
  kind        text not null default 'comment' check (kind in ('comment','event')),
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists task_updates_task_idx on task_updates (task_id, created_at);
