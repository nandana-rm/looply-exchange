-- 1) Create trigger to sync users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.users (id,email,name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end;$$;

-- Create trigger on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Validate NGO role trigger on ngo_drives
create or replace function public.validate_ngo_role()
returns trigger
language plpgsql
security definer set search_path = public as $$
declare r public.role_enum;
begin
  select role into r from public.users where id=new.ngo_id;
  if r is distinct from 'ngo'::public.role_enum then
    raise exception 'Only NGO users can own ngo_drives (ngo_id=%)', new.ngo_id;
  end if;
  return new;
end;$$;

-- Create trigger before insert/update on ngo_drives
create or replace trigger trg_validate_ngo_role
  before insert or update on public.ngo_drives
  for each row execute procedure public.validate_ngo_role();

-- 3) Update RLS for ngo_drives: restrict public to active, NGOs can see own
alter policy if exists "Anyone can view active NGO drives" on public.ngo_drives using (true);
-- Drop and recreate policies for clarity
drop policy if exists "Anyone can view active NGO drives" on public.ngo_drives;

create policy "Public can view active drives"
  on public.ngo_drives
  for select
  to public
  using ((status::text = 'active'));

create policy if not exists "NGOs can view their own drives"
  on public.ngo_drives
  for select
  to authenticated
  using (auth.uid() = ngo_id);

-- 4) Karma Points: helper function
create or replace function public.adjust_karma(_user_id uuid, _delta int)
returns void
language sql
security definer
set search_path = public as $$
  update public.users set karma_points = karma_points + _delta where id = _user_id;
$$;

-- Donations: +10 when delivered (on insert or transition to delivered)
create or replace function public.donations_karma_fn()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.status::text, '') = 'delivered' then
      perform public.adjust_karma(new.user_id, 10);
    end if;
  elsif tg_op = 'UPDATE' then
    if coalesce(old.status::text, '') <> 'delivered' and coalesce(new.status::text, '') = 'delivered' then
      perform public.adjust_karma(new.user_id, 10);
    end if;
  end if;
  return new;
end;$$;

create or replace trigger trg_donations_karma
  after insert or update on public.donations
  for each row execute procedure public.donations_karma_fn();

-- Matches: +5 to both users when status transitions to matched
create or replace function public.matches_karma_fn()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if coalesce(old.status::text, '') <> 'matched' and coalesce(new.status::text, '') = 'matched' then
      perform public.adjust_karma(new.user_a_id, 5);
      perform public.adjust_karma(new.user_b_id, 5);
    end if;
  end if;
  return new;
end;$$;

create or replace trigger trg_matches_karma
  after update on public.matches
  for each row execute procedure public.matches_karma_fn();

-- Claims: -2 when status becomes no_show or issue reported
create or replace function public.claims_karma_fn()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if coalesce(old.status::text, '') <> coalesce(new.status::text, '') then
      if new.status::text in ('no_show', 'issue_reported') then
        -- Penalize the NGO owner or the listing owner? Assuming penalize claimant (ngo_id)
        perform public.adjust_karma(new.ngo_id, -2);
      end if;
    end if;
  end if;
  return new;
end;$$;

create or replace trigger trg_claims_karma
  after update on public.claims
  for each row execute procedure public.claims_karma_fn();

-- 5) Favorites policies already exist per audit; ensure enforcement (no changes)
