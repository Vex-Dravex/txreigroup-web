create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists bio text,
  add column if not exists banner_url text;

create table if not exists public.user_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  image_url text not null,
  caption text null,
  created_at timestamptz not null default now()
);

create index if not exists user_portfolio_items_user_id_idx on public.user_portfolio_items (user_id);
create index if not exists user_portfolio_items_category_idx on public.user_portfolio_items (category);

create table if not exists public.user_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_reviews_reviewed_user_id_idx on public.user_reviews (reviewed_user_id);
create index if not exists user_reviews_reviewer_id_idx on public.user_reviews (reviewer_id);

create table if not exists public.network_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  requestee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz null,
  constraint network_requests_status_check check (status in ('pending', 'accepted', 'declined')),
  constraint network_requests_unique_pair unique (requester_id, requestee_id)
);

create index if not exists network_requests_requestee_id_idx on public.network_requests (requestee_id);
create index if not exists network_requests_requester_id_idx on public.network_requests (requester_id);
