-- Enable Row Level Security on all tables first
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.swipes enable row level security;
alter table public.favorites enable row level security;
alter table public.matches enable row level security;