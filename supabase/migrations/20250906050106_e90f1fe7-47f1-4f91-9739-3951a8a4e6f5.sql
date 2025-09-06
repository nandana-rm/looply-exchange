begin;

-- Clean up existing triggers and functions if any
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists trg_validate_ngo_role on public.ngo_drives;
drop function if exists public.validate_ngo_role();

-- Drop tables if they exist (order for FK dependencies)
drop table if exists public.comments cascade;
drop table if exists public.forums cascade;
drop table if exists public.claims cascade;
drop table if exists public.donations cascade;
drop table if exists public.ngo_drives cascade;
drop table if exists public.matches cascade;
drop table if exists public.favorites cascade;
drop table if exists public.swipes cascade;
drop table if exists public.listings cascade;
drop table if exists public.users cascade;

-- Drop enums
drop type if exists public.claim_status;
drop type if exists public.donation_status;
drop type if exists public.drive_status;
drop type if exists public.priority;
drop type if exists public.match_status;
drop type if exists public.swipe_action;
drop type if exists public.listing_status;
drop type if exists public.role_enum;

commit;

-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- Enums
create type public.role_enum as enum ('user','ngo');
create type public.listing_status as enum ('available','claimed','inactive');
create type public.swipe_action as enum ('like','reject');
create type public.match_status as enum ('pending','matched','cancelled');
create type public.priority as enum ('high','medium','low');
create type public.drive_status as enum ('active','completed');
create type public.donation_status as enum ('pledged','delivered','received');
create type public.claim_status as enum ('claimed','pickup_arranged','received');

-- Users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique not null,
  role public.role_enum not null default 'user',
  karma_points integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.users (id,email,name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  images text[],
  tags text[],
  location text,
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now()
);
create index idx_listings_user_id on public.listings(user_id);

-- Swipes
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now()
);
create index idx_swipes_user_id on public.swipes(user_id);
create index idx_swipes_listing_id on public.swipes(listing_id);

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_favorites_listing_id on public.favorites(listing_id);

-- Matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.users(id) on delete cascade,
  user_b_id uuid not null references public.users(id) on delete cascade,
  item_a_id uuid not null references public.listings(id) on delete cascade,
  item_b_id uuid not null references public.listings(id) on delete cascade,
  status public.match_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index idx_matches_user_a_id on public.matches(user_a_id);
create index idx_matches_user_b_id on public.matches(user_b_id);
create index idx_matches_item_a_id on public.matches(item_a_id);
create index idx_matches_item_b_id on public.matches(item_b_id);

-- NGO Drives
create table public.ngo_drives (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  priority public.priority not null default 'medium',
  deadline date,
  progress integer not null default 0,
  status public.drive_status not null default 'active',
  created_at timestamptz not null default now()
);
create index idx_ngo_drives_ngo_id on public.ngo_drives(ngo_id);

create or replace function public.validate_ngo_role()
returns trigger language plpgsql security definer set search_path=public as $$
declare r public.role_enum;
begin
  select role into r from public.users where id=new.ngo_id;
  if r is distinct from 'ngo'::public.role_enum then
    raise exception 'Only NGO users can own ngo_drives (ngo_id=%)', new.ngo_id;
  end if;
  return new;
end; $$;

create trigger trg_validate_ngo_role
before insert or update on public.ngo_drives
for each row execute procedure public.validate_ngo_role();

-- Donations
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ngo_drive_id uuid not null references public.ngo_drives(id) on delete cascade,
  item_id uuid references public.listings(id) on delete cascade,
  status public.donation_status not null default 'pledged',
  created_at timestamptz not null default now()
);
create index idx_donations_user_id on public.donations(user_id);
create index idx_donations_ngo_drive_id on public.donations(ngo_drive_id);
create index idx_donations_item_id on public.donations(item_id);

-- Claims
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status public.claim_status not null default 'claimed',
  claimed_at timestamptz not null default now()
);
create index idx_claims_ngo_id on public.claims(ngo_id);
create index idx_claims_listing_id on public.claims(listing_id);

-- Forums
create table public.forums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  community text,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);
create index idx_forums_user_id on public.forums(user_id);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid not null references public.forums(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_comments_forum_id on public.comments(forum_id);
create index idx_comments_user_id on public.comments(user_id);

-- Enable RLS
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.swipes enable row level security;
alter table public.favorites enable row level security;
alter table public.matches enable row level security;
alter table public.ngo_drives enable row level security;
alter table public.donations enable row level security;
alter table public.claims enable row level security;
alter table public.forums enable row level security;
alter table public.comments enable row level security;

-- RLS Policies
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

create policy "Anyone can view listings" on public.listings for select using (true);
create policy "Users can create their own listings" on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update their own listings" on public.listings for update using (auth.uid() = user_id);
create policy "Users can delete their own listings" on public.listings for delete using (auth.uid() = user_id);

create policy "Users can view their own swipes" on public.swipes for select using (auth.uid() = user_id);
create policy "Users can create their own swipes" on public.swipes for insert with check (auth.uid() = user_id);

create policy "Users can view their own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can add their own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove their own favorites" on public.favorites for delete using (auth.uid() = user_id);

create policy "Users can view matches they're part of" on public.matches for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);
create policy "Users can create matches for their own items" on public.matches for insert with check (auth.uid() = user_a_id);
create policy "Users can update matches they're part of" on public.matches for update using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Anyone can view active NGO drives" on public.ngo_drives for select using (true);
create policy "NGOs can create drives" on public.ngo_drives for insert with check (auth.uid() = ngo_id);
create policy "NGOs can update their own drives" on public.ngo_drives for update using (auth.uid() = ngo_id);
create policy "NGOs can delete their own drives" on public.ngo_drives for delete using (auth.uid() = ngo_id);

create policy "Users can view their own donations" on public.donations for select using (auth.uid() = user_id);
create policy "NGOs can view donations to their drives" on public.donations for select using (exists (select 1 from public.ngo_drives where id = ngo_drive_id and ngo_id = auth.uid()));
create policy "Users can create donations" on public.donations for insert with check (auth.uid() = user_id);
create policy "Users can update their own donations" on public.donations for update using (auth.uid() = user_id);

create policy "Users can view claims on their listings" on public.claims for select using (exists (select 1 from public.listings where id = listing_id and user_id = auth.uid()));
create policy "NGOs can view their own claims" on public.claims for select using (auth.uid() = ngo_id);
create policy "NGOs can create claims" on public.claims for insert with check (auth.uid() = ngo_id);
create policy "NGOs can update their own claims" on public.claims for update using (auth.uid() = ngo_id);

create policy "Anyone can view forum posts" on public.forums for select using (true);
create policy "Users can create forum posts" on public.forums for insert with check (auth.uid() = user_id);
create policy "Users can update their own forum posts" on public.forums for update using (auth.uid() = user_id);
create policy "Users can delete their own forum posts" on public.forums for delete using (auth.uid() = user_id);

create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);