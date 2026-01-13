-- Add rating column to user_reviews table
alter table public.user_reviews
  add column if not exists rating integer not null default 5;

-- Add check constraint to ensure rating is between 1 and 5
alter table public.user_reviews
  add constraint user_reviews_rating_check check (rating >= 1 and rating <= 5);

-- Create index on rating for potential future queries
create index if not exists user_reviews_rating_idx on public.user_reviews (rating);
