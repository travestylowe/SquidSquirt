-- supabase/sql/init_feedback.sql
-- Player feedback submitted via in-game form.

create table feedback (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('bug', 'feature', 'hello')),
  content     text not null check (char_length(content) between 1 and 280),
  created_at  timestamptz not null default now()
);

alter table feedback enable row level security;

create policy "anon_insert" on feedback
  for insert with check (true);

grant insert on feedback to anon;
