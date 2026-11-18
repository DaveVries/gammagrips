-- Physical shops that stock GammaGrips, listed on /partners and managed
-- from the admin. Only active rows are shown publicly.

create table if not exists partners (
  id          bigint generated always as identity primary key,
  name        text not null,
  address     text not null default '',
  postcode    text not null default '',
  city        text not null,
  country     text not null default 'NL',
  website     text not null default '',
  note        text not null default '',
  logo_url    text,
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists partners_active_idx on partners (active, city, sort);
