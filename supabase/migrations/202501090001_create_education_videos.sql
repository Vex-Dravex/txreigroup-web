create extension if not exists "pgcrypto";

create table if not exists public.education_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  topics text[] not null default '{}',
  level text not null,
  video_url text not null,
  storage_path text not null,
  mime_type text null,
  file_size integer null,
  created_by uuid references public.profiles(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz null
);

create index if not exists education_videos_published_idx
  on public.education_videos (is_published, created_at desc);

create index if not exists education_videos_topics_idx
  on public.education_videos using gin (topics);

alter table public.education_videos enable row level security;

create policy "Education videos are viewable when published"
  on public.education_videos
  for select
  using (is_published = true);

create policy "Admins can view all education videos"
  on public.education_videos
  for select
  using (
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can insert education videos"
  on public.education_videos
  for insert
  with check (
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can update education videos"
  on public.education_videos
  for update
  using (
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can delete education videos"
  on public.education_videos
  for delete
  using (
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

insert into storage.buckets (id, name, public)
values ('education-videos', 'education-videos', true)
on conflict (id) do nothing;

create policy "Education videos are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'education-videos');

create policy "Admins can upload education videos"
  on storage.objects
  for insert
  with check (
    bucket_id = 'education-videos'
    and (
      exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
      )
      or exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    )
  );

create policy "Admins can update education videos"
  on storage.objects
  for update
  using (
    bucket_id = 'education-videos'
    and (
      exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
      )
      or exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    )
  )
  with check (
    bucket_id = 'education-videos'
    and (
      exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
      )
      or exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    )
  );

create policy "Admins can delete education videos"
  on storage.objects
  for delete
  using (
    bucket_id = 'education-videos'
    and (
      exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
      )
      or exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    )
  );
