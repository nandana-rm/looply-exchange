-- Enable Row Level Security on all tables
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

-- RLS Policies for USERS table
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);

-- RLS Policies for LISTINGS table
create policy "Anyone can view listings"
on public.listings for select
using (true);

create policy "Users can create their own listings"
on public.listings for insert
with check (auth.uid() = user_id);

create policy "Users can update their own listings"
on public.listings for update
using (auth.uid() = user_id);

create policy "Users can delete their own listings"
on public.listings for delete
using (auth.uid() = user_id);

-- RLS Policies for SWIPES table
create policy "Users can view their own swipes"
on public.swipes for select
using (auth.uid() = user_id);

create policy "Users can create their own swipes"
on public.swipes for insert
with check (auth.uid() = user_id);

-- RLS Policies for FAVORITES table
create policy "Users can view their own favorites"
on public.favorites for select
using (auth.uid() = user_id);

create policy "Users can add their own favorites"
on public.favorites for insert
with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
on public.favorites for delete
using (auth.uid() = user_id);

-- RLS Policies for MATCHES table
create policy "Users can view matches they're part of"
on public.matches for select
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can create matches for their own items"
on public.matches for insert
with check (auth.uid() = user_a_id);

create policy "Users can update matches they're part of"
on public.matches for update
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- RLS Policies for NGO_DRIVES table
create policy "Anyone can view active NGO drives"
on public.ngo_drives for select
using (true);

create policy "NGOs can create drives"
on public.ngo_drives for insert
with check (auth.uid() = ngo_id);

create policy "NGOs can update their own drives"
on public.ngo_drives for update
using (auth.uid() = ngo_id);

create policy "NGOs can delete their own drives"
on public.ngo_drives for delete
using (auth.uid() = ngo_id);

-- RLS Policies for DONATIONS table
create policy "Users can view their own donations"
on public.donations for select
using (auth.uid() = user_id);

create policy "NGOs can view donations to their drives"
on public.donations for select
using (exists (
  select 1 from public.ngo_drives 
  where id = ngo_drive_id and ngo_id = auth.uid()
));

create policy "Users can create donations"
on public.donations for insert
with check (auth.uid() = user_id);

create policy "Users can update their own donations"
on public.donations for update
using (auth.uid() = user_id);

-- RLS Policies for CLAIMS table
create policy "Users can view claims on their listings"
on public.claims for select
using (exists (
  select 1 from public.listings 
  where id = listing_id and user_id = auth.uid()
));

create policy "NGOs can view their own claims"
on public.claims for select
using (auth.uid() = ngo_id);

create policy "NGOs can create claims"
on public.claims for insert
with check (auth.uid() = ngo_id);

create policy "NGOs can update their own claims"
on public.claims for update
using (auth.uid() = ngo_id);

-- RLS Policies for FORUMS table
create policy "Anyone can view forum posts"
on public.forums for select
using (true);

create policy "Users can create forum posts"
on public.forums for insert
with check (auth.uid() = user_id);

create policy "Users can update their own forum posts"
on public.forums for update
using (auth.uid() = user_id);

create policy "Users can delete their own forum posts"
on public.forums for delete
using (auth.uid() = user_id);

-- RLS Policies for COMMENTS table
create policy "Anyone can view comments"
on public.comments for select
using (true);

create policy "Users can create comments"
on public.comments for insert
with check (auth.uid() = user_id);

create policy "Users can update their own comments"
on public.comments for update
using (auth.uid() = user_id);

create policy "Users can delete their own comments"
on public.comments for delete
using (auth.uid() = user_id);