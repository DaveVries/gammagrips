create table if not exists login_tokens (
  id          bigint generated always as identity primary key,
  -- The token is stored hashed. A database leak should not hand over working
  -- sign-in links, the same reason passwords are never stored in the clear.
  token_hash  text unique not null,
  email       text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists login_tokens_email_idx on login_tokens (email);
create index if not exists login_tokens_expires_idx on login_tokens (expires_at);

create table if not exists sessions (
  id           bigint generated always as identity primary key,
  token_hash   text unique not null,
  email        text not null,
  is_admin     boolean not null default false,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

create index if not exists sessions_email_idx on sessions (email);
