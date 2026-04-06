-- supabase/sql/init_leaderboard.sql
-- Anonymous leaderboard with optional nicknames.

create table leaderboard (
  id            uuid primary key default gen_random_uuid(),
  player_id     text not null unique,
  display_name  text not null,
  squirt_count  int not null default 0,
  last_updated  timestamptz not null default now()
);

alter table leaderboard enable row level security;

-- Anyone can read the leaderboard
create policy "public_read" on leaderboard
  for select using (true);

-- Anyone can insert their own row (upsert via RPC)
create policy "anon_insert" on leaderboard
  for insert with check (true);

-- Anyone can update their own row (matched by player_id)
create policy "anon_update" on leaderboard
  for update using (true);

grant select, insert, update on leaderboard to anon;

-- Case-insensitive unique display names (two players can't share a name)
create unique index leaderboard_display_name_lower on leaderboard (lower(display_name));

-- RPC: upsert player score and return their rank.
-- Returns -1 if the display_name is already taken by a different player.
create or replace function upsert_player_score(
  p_player_id text,
  p_display_name text,
  p_squirt_count int
)
returns int
language plpgsql
security definer
as $$
declare
  player_rank int;
  existing_owner text;
begin
  -- Check if another player already owns this display name
  select player_id into existing_owner
    from leaderboard
   where lower(display_name) = lower(p_display_name)
     and player_id <> p_player_id;

  if existing_owner is not null then
    return -1;  -- name taken
  end if;

  insert into leaderboard (player_id, display_name, squirt_count, last_updated)
  values (p_player_id, p_display_name, p_squirt_count, now())
  on conflict (player_id) do update
    set display_name = excluded.display_name,
        squirt_count = excluded.squirt_count,
        last_updated = now();

  select count(*) + 1 into player_rank
    from leaderboard
   where squirt_count > p_squirt_count;

  return player_rank;
end;
$$;

-- RPC: get top N players
create or replace function get_leaderboard(n int default 10)
returns table(display_name text, squirt_count int, rank bigint)
language sql
security definer
as $$
  select display_name, squirt_count,
         row_number() over (order by squirt_count desc) as rank
    from leaderboard
   order by squirt_count desc
   limit n;
$$;

-- RPC: look up a player by ID (for recovery code verification)
create or replace function get_player_by_id(p_player_id text)
returns table(display_name text, squirt_count int)
language sql
security definer
as $$
  select display_name, squirt_count
    from leaderboard
   where player_id = p_player_id
   limit 1;
$$;

grant execute on function upsert_player_score(text, text, int) to anon;
grant execute on function get_leaderboard(int) to anon;
grant execute on function get_player_by_id(text) to anon;
