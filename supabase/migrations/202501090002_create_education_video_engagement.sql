create extension if not exists "pgcrypto";

create table if not exists public.education_video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.education_videos(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists education_video_comments_video_id_idx
  on public.education_video_comments (video_id, created_at desc);

alter table public.education_video_comments enable row level security;

create policy "Education video comments are viewable by authenticated users"
  on public.education_video_comments
  for select
  using (auth.uid() is not null);

create policy "Users can add education video comments"
  on public.education_video_comments
  for insert
  with check (auth.uid() = author_id);

create policy "Users can delete their education video comments"
  on public.education_video_comments
  for delete
  using (auth.uid() = author_id);

create table if not exists public.education_watch_later (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.education_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint education_watch_later_unique unique (user_id, video_id)
);

create index if not exists education_watch_later_user_id_idx
  on public.education_watch_later (user_id, created_at desc);

alter table public.education_watch_later enable row level security;

create policy "Users can view their watch later list"
  on public.education_watch_later
  for select
  using (auth.uid() = user_id);

create policy "Users can save watch later videos"
  on public.education_watch_later
  for insert
  with check (auth.uid() = user_id);

create policy "Users can remove watch later videos"
  on public.education_watch_later
  for delete
  using (auth.uid() = user_id);
