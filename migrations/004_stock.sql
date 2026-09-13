create table if not exists stock (
  sku         text primary key,
  qty         integer not null default 0 check (qty >= 0),
  updated_at  timestamptz not null default now()
);

create table if not exists settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

insert into settings (key, value) values ('shop_open', 'false')
  on conflict (key) do nothing;
