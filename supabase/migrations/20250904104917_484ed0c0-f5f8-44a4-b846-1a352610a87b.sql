-- Enable RLS on remaining tables
alter table public.ngo_drives enable row level security;
alter table public.donations enable row level security;
alter table public.claims enable row level security;
alter table public.forums enable row level security;
alter table public.comments enable row level security;