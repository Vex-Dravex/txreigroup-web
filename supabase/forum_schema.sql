-- Forum schema setup for Reddit-style features (topics, hashtags, votes, images)
-- Run this in the Supabase SQL editor or via the CLI.

-- Core posts table
create extension if not exists "pgcrypto";

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  topic text,
  image_urls text[] not null default '{}',
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  comment_count integer not null default 0,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill for existing tables (no-op if columns already exist)
alter table public.forum_posts add column if not exists topic text;
alter table public.forum_posts add column if not exists image_urls text[] not null default '{}';
alter table public.forum_posts add column if not exists upvotes integer not null default 0;
alter table public.forum_posts add column if not exists downvotes integer not null default 0;
alter table public.forum_posts add column if not exists comment_count integer not null default 0;
alter table public.forum_posts add column if not exists is_pinned boolean not null default false;
alter table public.forum_posts alter column updated_at set default now();

-- Tags / hashtags
create table if not exists public.forum_post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_post_tags_post_id_idx on public.forum_post_tags(post_id);
create index if not exists forum_post_tags_tag_idx on public.forum_post_tags(lower(tag));

-- Mentions
create table if not exists public.forum_post_mentions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists forum_post_mentions_post_id_idx on public.forum_post_mentions(post_id);
create index if not exists forum_post_mentions_user_id_idx on public.forum_post_mentions(mentioned_user_id);

-- Votes on posts
create table if not exists public.forum_post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote','downvote')),
  created_at timestamptz not null default now()
);
create unique index if not exists forum_post_votes_unique_user_post on public.forum_post_votes(post_id, user_id);

-- Comments
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references public.forum_comments(id) on delete cascade,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists forum_comments_post_id_idx on public.forum_comments(post_id);
create index if not exists forum_comments_parent_idx on public.forum_comments(parent_comment_id);

-- Votes on comments
create table if not exists public.forum_comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.forum_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote','downvote')),
  created_at timestamptz not null default now()
);
create unique index if not exists forum_comment_votes_unique_user_comment on public.forum_comment_votes(comment_id, user_id);

-- Trigger: keep post vote counts in sync
create or replace function public.forum_post_vote_counter() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if new.vote_type = 'upvote' then
      update public.forum_posts set upvotes = upvotes + 1 where id = new.post_id;
    else
      update public.forum_posts set downvotes = downvotes + 1 where id = new.post_id;
    end if;
  elsif (tg_op = 'UPDATE') then
    if old.vote_type <> new.vote_type then
      if old.vote_type = 'upvote' then
        update public.forum_posts set upvotes = upvotes - 1 where id = new.post_id;
      else
        update public.forum_posts set downvotes = downvotes - 1 where id = new.post_id;
      end if;
      if new.vote_type = 'upvote' then
        update public.forum_posts set upvotes = upvotes + 1 where id = new.post_id;
      else
        update public.forum_posts set downvotes = downvotes + 1 where id = new.post_id;
      end if;
    end if;
  elsif (tg_op = 'DELETE') then
    if old.vote_type = 'upvote' then
      update public.forum_posts set upvotes = upvotes - 1 where id = old.post_id;
    else
      update public.forum_posts set downvotes = downvotes - 1 where id = old.post_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists forum_post_vote_counter_trigger on public.forum_post_votes;
create trigger forum_post_vote_counter_trigger
after insert or update or delete on public.forum_post_votes
for each row execute function public.forum_post_vote_counter();

-- Trigger: keep post comment counts in sync
create or replace function public.forum_post_comment_counter() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.forum_posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.forum_posts set comment_count = comment_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists forum_post_comment_counter_trigger on public.forum_comments;
create trigger forum_post_comment_counter_trigger
after insert or delete on public.forum_comments
for each row execute function public.forum_post_comment_counter();

-- RLS: basic policies (adjust to your auth model)
alter table public.forum_posts enable row level security;
alter table public.forum_post_tags enable row level security;
alter table public.forum_post_mentions enable row level security;
alter table public.forum_post_votes enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_comment_votes enable row level security;

-- Authenticated users can read everything
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts' and policyname = 'forum_posts_read'
  ) then
    create policy forum_posts_read on public.forum_posts for select using (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts' and policyname = 'forum_posts_read_all'
  ) then
    -- Permissive catch-all to avoid 404s from overly restrictive legacy policies
    create policy forum_posts_read_all on public.forum_posts for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_tags' and policyname = 'forum_post_tags_read'
  ) then
    create policy forum_post_tags_read on public.forum_post_tags for select using (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_mentions' and policyname = 'forum_post_mentions_read'
  ) then
    create policy forum_post_mentions_read on public.forum_post_mentions for select using (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_votes' and policyname = 'forum_post_votes_read'
  ) then
    create policy forum_post_votes_read on public.forum_post_votes for select using (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comments' and policyname = 'forum_comments_read'
  ) then
    create policy forum_comments_read on public.forum_comments for select using (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comment_votes' and policyname = 'forum_comment_votes_read'
  ) then
    create policy forum_comment_votes_read on public.forum_comment_votes for select using (auth.role() = 'authenticated');
  end if;
end; $$;

-- Authenticated users can insert their own posts/comments/votes/tags/mentions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts' and policyname = 'forum_posts_insert'
  ) then
    create policy forum_posts_insert on public.forum_posts for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_tags' and policyname = 'forum_post_tags_insert'
  ) then
    create policy forum_post_tags_insert on public.forum_post_tags for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_mentions' and policyname = 'forum_post_mentions_insert'
  ) then
    create policy forum_post_mentions_insert on public.forum_post_mentions for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_votes' and policyname = 'forum_post_votes_insert'
  ) then
    create policy forum_post_votes_insert on public.forum_post_votes for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comments' and policyname = 'forum_comments_insert'
  ) then
    create policy forum_comments_insert on public.forum_comments for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comment_votes' and policyname = 'forum_comment_votes_insert'
  ) then
    create policy forum_comment_votes_insert on public.forum_comment_votes for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());
  end if;
end; $$;

-- Authenticated users can update/delete their own posts/comments/votes
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts' and policyname = 'forum_posts_update_self'
  ) then
    create policy forum_posts_update_self on public.forum_posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comments' and policyname = 'forum_comments_update_self'
  ) then
    create policy forum_comments_update_self on public.forum_comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_votes' and policyname = 'forum_post_votes_owner'
  ) then
    create policy forum_post_votes_owner on public.forum_post_votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comment_votes' and policyname = 'forum_comment_votes_owner'
  ) then
    create policy forum_comment_votes_owner on public.forum_comment_votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_votes' and policyname = 'forum_post_votes_delete'
  ) then
    create policy forum_post_votes_delete on public.forum_post_votes for delete using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_comment_votes' and policyname = 'forum_comment_votes_delete'
  ) then
    create policy forum_comment_votes_delete on public.forum_comment_votes for delete using (auth.uid() = user_id);
  end if;
end; $$;

-- Optional: auto-update updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists forum_posts_set_updated_at on public.forum_posts;
create trigger forum_posts_set_updated_at
before update on public.forum_posts
for each row execute function public.set_updated_at();

-- Storage bucket reminder (run in Storage UI or Supabase CLI):
--   supabase storage create-bucket forum-media --public
-- Add storage policies to allow authenticated users to upload/list/delete their own objects.
