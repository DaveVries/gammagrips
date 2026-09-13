-- Products created from the dashboard rather than defined in code.
--
-- product_overrides already carries the editable fields, so a created product
-- is the same row with is_custom set and the not-null-in-practice columns
-- filled. Keeping one table means the merge in catalog-db.ts stays one pass
-- and a custom product cannot drift into a different shape from a catalogue
-- one.
alter table product_overrides add column if not exists is_custom  boolean not null default false;
alter table product_overrides add column if not exists platforms  text[]  not null default '{}';
alter table product_overrides add column if not exists created_at timestamptz not null default now();
