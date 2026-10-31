alter table public.orders
  add column if not exists owner_email_status text not null default 'pending',
  add column if not exists customer_email_status text not null default 'pending',
  add column if not exists owner_email_sent_at timestamptz,
  add column if not exists customer_email_sent_at timestamptz,
  add column if not exists owner_email_message_id text,
  add column if not exists customer_email_message_id text,
  add column if not exists email_last_error text,
  add column if not exists email_attempts integer not null default 0,
  add column if not exists email_last_attempt_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_owner_email_status_check') then
    alter table public.orders
      add constraint orders_owner_email_status_check
      check (owner_email_status in ('pending', 'sending', 'sent', 'failed', 'skipped'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_customer_email_status_check') then
    alter table public.orders
      add constraint orders_customer_email_status_check
      check (customer_email_status in ('pending', 'sending', 'sent', 'failed', 'skipped'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_email_attempts_check') then
    alter table public.orders
      add constraint orders_email_attempts_check
      check (email_attempts >= 0);
  end if;
end
$$;

create index if not exists orders_email_status_idx
  on public.orders (owner_email_status, customer_email_status);

comment on column public.orders.owner_email_status is 'Status of the owner notification email for this order/question.';
comment on column public.orders.customer_email_status is 'Status of the customer confirmation email for this order/question.';
