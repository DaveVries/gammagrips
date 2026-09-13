-- Commercial overrides for the catalogue.
--
-- Deliberately an overlay, not a replacement. The catalogue in
-- src/data/catalog.ts still owns the things that are code — the design a grip
-- renders with, the Voronoi geometry, the platform variants and their SKUs.
-- What lives here is what a shopkeeper changes: price, copy, discount,
-- whether it is on sale at all, which texture it claims, and its photos.
--
-- Every column is nullable: null means "use the catalogue value", so a product
-- with no row here behaves exactly as it did before.

create table if not exists product_overrides (
  slug              text primary key,
  name              text,
  tagline           text,
  summary           text,
  price_cents       integer check (price_cents is null or price_cents >= 0),
  compare_at_cents  integer check (compare_at_cents is null or compare_at_cents >= 0),
  texture_id        text,
  active            boolean not null default true,
  sort              integer,
  updated_at        timestamptz not null default now()
);

create table if not exists product_images (
  id          bigint generated always as identity primary key,
  slug        text not null,
  url         text not null,
  alt         text not null default '',
  kind        text not null default 'front' check (kind in ('front','macro','detail','lifestyle')),
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_slug_idx on product_images (slug, sort);
