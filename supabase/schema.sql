create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  portion text,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  description text,
  source text not null default 'manual',
  ingredients jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  person text not null,
  day text not null,
  meal text not null,
  recipe_id uuid references public.recipes(id) on delete set null,
  recipe_name text not null,
  portion text,
  base_calories numeric not null default 0,
  base_protein numeric not null default 0,
  base_carbs numeric not null default 0,
  base_fat numeric not null default 0,
  servings numeric not null default 1,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (household_id, person, day, meal)
);

create index if not exists recipes_household_id_idx on public.recipes(household_id);
create index if not exists planner_entries_household_id_idx on public.planner_entries(household_id);
create index if not exists household_members_user_id_idx on public.household_members(user_id);

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.user_id = auth.uid()
  );
$$;

create or replace function public.create_household(household_name text, member_name text default null)
returns table (household_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household public.households%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.households (name, created_by)
  values (coalesce(nullif(trim(household_name), ''), 'Casa'), auth.uid())
  returning * into new_household;

  insert into public.household_members (household_id, user_id, display_name)
  values (new_household.id, auth.uid(), nullif(trim(member_name), ''));

  return query select new_household.id, new_household.invite_code;
end;
$$;

create or replace function public.join_household(code text, member_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id into target_id
  from public.households
  where upper(invite_code) = upper(trim(code));

  if target_id is null then
    raise exception 'Código de hogar inválido';
  end if;

  insert into public.household_members (household_id, user_id, display_name)
  values (target_id, auth.uid(), nullif(trim(member_name), ''))
  on conflict (household_id, user_id)
  do update set display_name = excluded.display_name;

  return target_id;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.recipes enable row level security;
alter table public.planner_entries enable row level security;

drop policy if exists "Members can view households" on public.households;
create policy "Members can view households"
on public.households
for select
to authenticated
using (public.is_household_member(id));

drop policy if exists "Members can view household members" on public.household_members;
create policy "Members can view household members"
on public.household_members
for select
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members can update own membership" on public.household_members;
create policy "Members can update own membership"
on public.household_members
for update
to authenticated
using (user_id = auth.uid() and public.is_household_member(household_id))
with check (user_id = auth.uid() and public.is_household_member(household_id));

drop policy if exists "Members can view recipes" on public.recipes;
create policy "Members can view recipes"
on public.recipes
for select
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members can insert recipes" on public.recipes;
create policy "Members can insert recipes"
on public.recipes
for insert
to authenticated
with check (public.is_household_member(household_id) and created_by = auth.uid());

drop policy if exists "Members can update recipes" on public.recipes;
create policy "Members can update recipes"
on public.recipes
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

drop policy if exists "Members can delete recipes" on public.recipes;
create policy "Members can delete recipes"
on public.recipes
for delete
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members can view planner" on public.planner_entries;
create policy "Members can view planner"
on public.planner_entries
for select
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members can insert planner" on public.planner_entries;
create policy "Members can insert planner"
on public.planner_entries
for insert
to authenticated
with check (public.is_household_member(household_id) and updated_by = auth.uid());

drop policy if exists "Members can update planner" on public.planner_entries;
create policy "Members can update planner"
on public.planner_entries
for update
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

drop policy if exists "Members can delete planner" on public.planner_entries;
create policy "Members can delete planner"
on public.planner_entries
for delete
to authenticated
using (public.is_household_member(household_id));

grant execute on function public.create_household(text, text) to authenticated;
grant execute on function public.join_household(text, text) to authenticated;
grant execute on function public.is_household_member(uuid) to authenticated;
