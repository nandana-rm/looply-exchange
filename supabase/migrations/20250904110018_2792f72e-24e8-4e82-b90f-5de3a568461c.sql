-- Final RLS Policies for CLAIMS, FORUMS, COMMENTS tables
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