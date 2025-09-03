-- Enable required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
create type public.role_enum as enum ('user', 'ngo');
create type public.listing_status as enum ('available', 'claimed', 'inactive');
create type public.swipe_action as enum ('like', 'reject');
create type public.match_status as enum ('pending', 'matched', 'cancelled');
create type public.priority as enum ('high', 'medium', 'low');
create type public.drive_status as enum ('active', 'completed');
create type public.donation_status as enum ('pledged', 'delivered', 'received');
create type public.claim_status as enum ('claimed', 'pickup_arranged', 'received');

-- =========================
-- TABLES
-- =========================
-- 1) USERS (linked to auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique not null,
  role public.role_enum not null default 'user',
  karma_points integer not null default 0,
  created_at timestamptz not null default now()
);

-- Trigger to auto-create public.users row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) LISTINGS (user posted items)
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

-- 3) SWIPES (for smart matchmaking)
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  action public.swipe_action not null,
  created_at timestamptz not null default now()
);
create index idx_swipes_user_id on public.swipes(user_id);
create index idx_swipes_listing_id on public.swipes(listing_id);

-- 4) FAVORITES (saved items)
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_favorites_listing_id on public.favorites(listing_id);

-- 5) MATCHES (barter match flow)
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

-- 6) NGO_DRIVES (donation needs / live drives)
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

-- Enforce that ngo_id belongs to a user with role='ngo'
create or replace function public.validate_ngo_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare r public.role_enum;
begin
  select role into r from public.users where id = new.ngo_id;
  if r is distinct from 'ngo'::public.role_enum then
    raise exception 'Only NGO users can own ngo_drives (ngo_id=%)', new.ngo_id;
  end if;
  return new;
end;
$$;

create trigger trg_validate_ngo_role
before insert or update on public.ngo_drives
for each row execute procedure public.validate_ngo_role();

-- 7) DONATIONS (user contributions to NGO drives)
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

-- 8) CLAIMS (NGOs claiming user donations)
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status public.claim_status not null default 'claimed',
  claimed_at timestamptz not null default now()
);
create index idx_claims_ngo_id on public.claims(ngo_id);
create index idx_claims_listing_id on public.claims(listing_id);

-- 9) FORUMS (community posts)
create table public.forums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  community text,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);
create index idx_forums_user_id on public.forums(user_id);

-- 10) COMMENTS (replies in forums)
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid not null references public.forums(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_comments_forum_id on public.comments(forum_id);
create index idx_comments_user_id on public.comments(user_id);
