create extension if not exists "pgcrypto";

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  message text not null,
  related_deal_id uuid null,
  metadata jsonb null,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_related_deal_id_idx on public.notifications (related_deal_id);
