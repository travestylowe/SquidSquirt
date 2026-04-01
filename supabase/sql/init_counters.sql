-- Run in Supabase SQL editor. See README.md for wiring config.js.

create table counters (
  id    int primary key,
  total int not null default 0
);

insert into counters (id, total) values (1, 0);

alter table counters enable row level security;
create policy "allow read" on counters for select using (true);

create or replace function increment_squirt()
returns int
language plpgsql
security definer
as $$
declare new_total int;
begin
  update counters
     set total = total + 1
   where id = 1
  returning total into new_total;
  return new_total;
end;
$$;

grant execute on function increment_squirt() to anon;
