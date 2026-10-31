create extension if not exists pgcrypto;

create table public.products (
  id text primary key,
  name text not null,
  volume text not null,
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'EUR',
  image_path text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.products (id, name, volume, description, price_cents, currency, image_path)
values (
  'decucare-150',
  'DECUCARE крем',
  '150 мл',
  'Регенериращ и възстановяващ крем за специална грижа при чувствителна, раздразнена или увредена кожа.',
  null,
  'EUR',
  '/images/decucare-bathroom.webp'
);

create sequence public.order_reference_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('DC-' || to_char(now(), 'YYMMDD') || '-' || nextval('public.order_reference_seq')::text),
  kind text not null check (kind in ('order', 'question')),
  product_id text references public.products(id),
  product_name text,
  product_volume text,
  quantity integer not null default 1 check (quantity between 1 and 20),
  unit_price_cents integer check (unit_price_cents is null or unit_price_cents >= 0),
  total_price_cents integer check (total_price_cents is null or total_price_cents >= 0),
  currency text not null default 'EUR',
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null check (char_length(customer_email) between 3 and 254),
  customer_phone text check (customer_phone is null or char_length(customer_phone) between 6 and 30),
  message text check (message is null or char_length(message) <= 2000),
  consent boolean not null check (consent = true),
  status text not null default 'new' check (status in ('new', 'contacted', 'completed', 'cancelled')),
  idempotency_key uuid not null unique,
  ip_hash text,
  email_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'order' and product_id is not null and customer_phone is not null)
    or (kind = 'question' and message is not null and char_length(message) >= 5)
  )
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_ip_hash_created_at_idx on public.orders (ip_hash, created_at desc);
create index orders_email_hash_created_at_idx on public.orders (email_hash, created_at desc);

create table public.rate_limit_buckets (
  key text primary key,
  window_start timestamptz not null,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  bucket public.rate_limit_buckets%rowtype;
begin
  insert into public.rate_limit_buckets as r (key, window_start, count, updated_at)
  values (p_key, now_ts, 1, now_ts)
  on conflict (key) do update set
    count = case
      when r.window_start < now_ts - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < now_ts - make_interval(secs => p_window_seconds) then now_ts
      else r.window_start
    end,
    updated_at = now_ts
  returning * into bucket;

  return bucket.count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.rate_limit_buckets enable row level security;

create policy "Active products are public" on public.products
for select to anon, authenticated
using (is_active = true);

revoke all on public.orders from anon, authenticated;
revoke all on public.rate_limit_buckets from anon, authenticated;
grant select on public.products to anon, authenticated;
grant all on public.products, public.orders, public.rate_limit_buckets to service_role;
grant usage, select on sequence public.order_reference_seq to service_role;
