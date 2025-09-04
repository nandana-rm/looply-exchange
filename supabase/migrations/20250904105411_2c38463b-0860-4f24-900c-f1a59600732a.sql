-- RLS Policies for remaining tables
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