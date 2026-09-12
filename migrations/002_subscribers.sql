create table if not exists subscribers (
  id            bigint generated always as identity primary key,
  email         text unique not null,
  source        text,
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);
