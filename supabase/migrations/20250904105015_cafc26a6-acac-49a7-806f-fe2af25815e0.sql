-- RLS Policies for USERS and LISTINGS tables
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);

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