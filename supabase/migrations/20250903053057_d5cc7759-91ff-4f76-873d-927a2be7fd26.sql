-- 1) ENUM TYPES
create type public.app_role as enum ('admin','ngo','user');
create type public.priority as enum ('low','medium','high');
create type public.item_condition as enum ('new','like_new','good','fair','poor');
create type public.item_mode as enum ('barter','gift','sale');
create type public.item_status as enum ('available','reserved','claimed','removed');
create type public.claim_status as enum ('pending','accepted','declined','cancelled','received');
create type public.drive_status as enum ('open','fulfilled','closed');
create type public.offer_status as enum ('offered','accepted','declined','cancelled');
create type public.claimer_type as enum ('ngo','user');

-- 2) CORE TABLES
-- profiles mirrors auth.users and holds public info + karma
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_ngo boolean not null default false,
  location text,
  bio text,
  karma_points integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- roles separate from profiles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- donations/items posted by users
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  condition public.item_condition,
  mode public.item_mode not null default 'gift',
  price numeric(12,2),
  location text,
  status public.item_status not null default 'available',
  tags text[] not null default '{}',
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.items enable row level security;

create table if not exists public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.item_images enable row level security;

-- drives created by NGOs
create table if not exists public.drives (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamptz,
  priority public.priority not null default 'medium',
  location text,
  status public.drive_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.drives enable row level security;

-- users offering items to a drive
create table if not exists public.drive_offers (
  id uuid primary key default gen_random_uuid(),
  drive_id uuid not null references public.drives(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  message text,
  status public.offer_status not null default 'offered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (drive_id, donor_id, item_id)
);
alter table public.drive_offers enable row level security;

-- favorites (bookmarks / liked items)
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
alter table public.favorites enable row level security;

-- claims system for NGOs or users
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimer_id uuid not null references public.profiles(id) on delete cascade,
  claimer_type public.claimer_type not null default 'ngo',
  status public.claim_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, claimer_id)
);
alter table public.claims enable row level security;

-- reports for no-shows / issues
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  claim_id uuid references public.claims(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;

-- karma events log
create table if not exists public.karma_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now()
);
alter table public.karma_events enable row level security;

-- 3) SECURITY DEFINER HELPERS
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create or replace function public.is_ngo(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_ngo from public.profiles p where p.id = _user_id), false);
$$;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles r where r.user_id = _user_id and r.role = _role
  );
$$;

create or replace function public.award_karma(_user_id uuid, _delta int, _reason text, _related_table text default null, _related_id uuid default null)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  update public.profiles set karma_points = karma_points + _delta where id = _user_id;
  insert into public.karma_events (user_id, delta, reason, related_table, related_id)
  values (_user_id, _delta, _reason, _related_table, _related_id);
end;
$$;

-- 4) TRIGGERS
-- updated_at triggers
create or replace trigger trg_items_updated_at
before update on public.items
for each row execute function public.update_updated_at_column();

create or replace trigger trg_drives_updated_at
before update on public.drives
for each row execute function public.update_updated_at_column();

create or replace trigger trg_drive_offers_updated_at
before update on public.drive_offers
for each row execute function public.update_updated_at_column();

create or replace trigger trg_claims_updated_at
before update on public.claims
for each row execute function public.update_updated_at_column();

-- karma triggers
create or replace function public.on_claim_received_award_karma()
returns trigger as $$
declare v_owner uuid;
begin
  if (tg_op = 'UPDATE' and new.status = 'received' and old.status is distinct from new.status) then
    select owner_id into v_owner from public.items where id = new.item_id;
    if v_owner is not null then
      perform public.award_karma(v_owner, 5, 'claim_received', 'claims', new.id);
    end if;
    perform public.award_karma(new.claimer_id, 5, 'claim_received', 'claims', new.id);
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

create or replace trigger trg_claims_received
after update on public.claims
for each row execute function public.on_claim_received_award_karma();

create or replace function public.on_item_gift_claimed_award_karma()
returns trigger as $$
begin
  if (tg_op = 'UPDATE' and new.status = 'claimed' and old.status is distinct from new.status and new.mode = 'gift') then
    perform public.award_karma(new.owner_id, 10, 'gift_claimed', 'items', new.id);
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

create or replace trigger trg_items_gift_claimed
after update on public.items
for each row execute function public.on_item_gift_claimed_award_karma();

create or replace function public.on_report_insert_penalize()
returns trigger as $$
begin
  perform public.award_karma(new.reported_user_id, -2, 'reported_issue', 'reports', new.id);
  return new;
end;
$$ language plpgsql set search_path = public;

create or replace trigger trg_reports_penalty
after insert on public.reports
for each row execute function public.on_report_insert_penalize();

-- 5) RLS POLICIES
-- profiles
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy if not exists "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- user_roles (read own only)
create policy if not exists "Users can read own roles"
  on public.user_roles for select using (auth.uid() = user_id);
-- no insert/update/delete from client by default

-- items
create policy if not exists "Items are viewable by everyone"
  on public.items for select using (true);
create policy if not exists "Users can insert their own items"
  on public.items for insert with check (auth.uid() = owner_id);
create policy if not exists "Owners can update their items"
  on public.items for update using (auth.uid() = owner_id);
create policy if not exists "Owners can delete their items"
  on public.items for delete using (auth.uid() = owner_id);

-- item_images
create policy if not exists "Item images viewable by everyone"
  on public.item_images for select using (true);
create policy if not exists "Owners can manage item images"
  on public.item_images for all using (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  );

-- drives
create policy if not exists "Drives are viewable by everyone"
  on public.drives for select using (true);
create policy if not exists "NGOs can insert their drives"
  on public.drives for insert with check (auth.uid() = ngo_id and public.is_ngo(auth.uid()));
create policy if not exists "NGOs can update their drives"
  on public.drives for update using (auth.uid() = ngo_id and public.is_ngo(auth.uid()));
create policy if not exists "NGOs can delete their drives"
  on public.drives for delete using (auth.uid() = ngo_id and public.is_ngo(auth.uid()));

-- drive_offers
create policy if not exists "Participants can select drive_offers"
  on public.drive_offers for select using (
    auth.uid() = donor_id or
    exists (select 1 from public.drives d where d.id = drive_id and d.ngo_id = auth.uid())
  );
create policy if not exists "Donor can insert offer"
  on public.drive_offers for insert with check (auth.uid() = donor_id);
create policy if not exists "Donor or NGO can update offer"
  on public.drive_offers for update using (
    auth.uid() = donor_id or
    exists (select 1 from public.drives d where d.id = drive_id and d.ngo_id = auth.uid())
  );
create policy if not exists "Donor can delete own offer"
  on public.drive_offers for delete using (auth.uid() = donor_id);

-- favorites
create policy if not exists "Users can view their favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy if not exists "Users can insert their favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy if not exists "Users can delete their favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- claims
create policy if not exists "Participants can view claims"
  on public.claims for select using (
    auth.uid() = claimer_id or
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  );
create policy if not exists "Authenticated can insert claims"
  on public.claims for insert with check (auth.uid() = claimer_id);
create policy if not exists "Claimer or owner can update claims"
  on public.claims for update using (
    auth.uid() = claimer_id or
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  );

-- reports
create policy if not exists "Reporter can insert reports"
  on public.reports for insert with check (auth.uid() = reporter_id);
create policy if not exists "Reporter can view own reports"
  on public.reports for select using (auth.uid() = reporter_id);

-- karma_events
create policy if not exists "Users can view their karma events"
  on public.karma_events for select using (auth.uid() = user_id);
-- no insert/update/delete from client; handled by award_karma()

-- 6) NEW USER TRIGGER TO AUTO-CREATE PROFILE AND DEFAULT ROLE
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, is_ngo, location, bio)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url', coalesce((new.raw_user_meta_data->>'is_ngo')::boolean, false), null, null)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7) REALTIME
alter table public.items replica identity full;
alter table public.drives replica identity full;
alter table public.drive_offers replica identity full;
alter table public.claims replica identity full;
alter table public.favorites replica identity full;

-- add to supabase_realtime publication if not already
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.drives;
alter publication supabase_realtime add table public.drive_offers;
alter publication supabase_realtime add table public.claims;
alter publication supabase_realtime add table public.favorites;

-- 8) STORAGE BUCKETS AND POLICIES
insert into storage.buckets (id, name, public) values ('item-images','item-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;

-- Public read for these buckets
create policy if not exists "Public read item-images"
  on storage.objects for select
  using (bucket_id in ('item-images','avatars'));

-- Authenticated can insert/update/delete their uploads
create policy if not exists "Authenticated write item-images"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('item-images','avatars'));
create policy if not exists "Authenticated update item-images"
  on storage.objects for update to authenticated
  using (bucket_id in ('item-images','avatars'));
create policy if not exists "Authenticated delete item-images"
  on storage.objects for delete to authenticated
  using (bucket_id in ('item-images','avatars'));
