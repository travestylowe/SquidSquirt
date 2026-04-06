-- supabase/sql/init_submissions.sql
-- Stores player-submitted compliments, confessions, and puns from the payment system.

create table submissions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('compliment', 'confession', 'pun')),
  content     text not null check (char_length(content) between 1 and 280),
  player_name text default null,
  status      text not null default 'pending' check (status in ('pending', 'keep', 'publish', 'delete')),
  created_at  timestamptz not null default now()
);

alter table submissions enable row level security;

-- Anyone can insert (anonymous players)
create policy "anon_insert" on submissions
  for insert with check (true);

-- Only service role can read/update/delete (admin review)
-- No public SELECT policy — players cannot read other submissions (yet).
-- When ready to surface published submissions, add:
--   create policy "read_published" on submissions for select using (status = 'publish');

grant insert on submissions to anon;
