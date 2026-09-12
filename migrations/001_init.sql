-- Orders and their lines.
--
-- Money is stored in cents as integers. Never floats: 0.1 + 0.2 in floating
-- point is not 0.3, and a webshop that rounds a cent differently from its PSP
-- reconciles by hand forever.

create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  -- Guest tracking: the link in the confirmation email carries this, so an
  -- order can be followed without an account. Random, not sequential.
  token           text unique not null,
  -- Human-facing number. Sequential is fine here; it is not a secret.
  number          bigint generated always as identity (start with 1001),

  status          text not null default 'pending'
                  check (status in ('pending','paid','failed','cancelled','expired','refunded')),

  email           text not null,
  first_name      text not null,
  last_name       text not null,
  address         text not null,
  postcode        text not null,
  city            text not null,
  country         text not null default 'NL',

  subtotal_cents  integer not null,
  shipping_cents  integer not null,
  total_cents     integer not null,
  currency        text not null default 'EUR',

  -- Pay.nl side
  pay_order_id    text unique,
  pay_status_code integer,
  paid_at         timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_token_idx on orders (token);
create index if not exists orders_pay_order_id_idx on orders (pay_order_id);
create index if not exists orders_created_at_idx on orders (created_at desc);

create table if not exists order_lines (
  id            bigint generated always as identity primary key,
  order_id      uuid not null references orders (id) on delete cascade,
  sku           text not null,
  product_slug  text not null,
  design_id     text,
  platform_id   text,
  name          text not null,
  unit_cents    integer not null,
  qty           integer not null check (qty > 0),
  line_cents    integer not null
);

create index if not exists order_lines_order_id_idx on order_lines (order_id);

-- Every exchange call Pay.nl sends, recorded before it is acted on. This is
-- what makes the webhook idempotent: a repeat delivery of the same payload
-- hits the unique index and is skipped rather than processed twice.
create table if not exists payment_events (
  id            bigint generated always as identity primary key,
  pay_order_id  text not null,
  status_code   integer,
  status_name   text,
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  unique (pay_order_id, status_code)
);
