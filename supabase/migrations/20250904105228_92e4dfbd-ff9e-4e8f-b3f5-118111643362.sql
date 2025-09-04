-- RLS Policies for SWIPES, FAVORITES, MATCHES tables
create policy "Users can view their own swipes"
on public.swipes for select
using (auth.uid() = user_id);

create policy "Users can create their own swipes"
on public.swipes for insert
with check (auth.uid() = user_id);

create policy "Users can view their own favorites"
on public.favorites for select
using (auth.uid() = user_id);

create policy "Users can add their own favorites"
on public.favorites for insert
with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
on public.favorites for delete
using (auth.uid() = user_id);

create policy "Users can view matches they're part of"
on public.matches for select
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can create matches for their own items"
on public.matches for insert
with check (auth.uid() = user_a_id);

create policy "Users can update matches they're part of"
on public.matches for update
using (auth.uid() = user_a_id or auth.uid() = user_b_id);