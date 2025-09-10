-- Enable RLS explicitly (idempotent)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ngo_drives ENABLE ROW LEVEL SECURITY;

-- 1) Ensure signup sync works: attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) Enforce that only NGO role can own drives
DROP TRIGGER IF EXISTS trg_validate_ngo_role ON public.ngo_drives;
CREATE TRIGGER trg_validate_ngo_role
  BEFORE INSERT OR UPDATE ON public.ngo_drives
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ngo_role();

-- 3) Karma triggers
DROP TRIGGER IF EXISTS trg_donations_karma ON public.donations;
CREATE TRIGGER trg_donations_karma
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.donations_karma_fn();

DROP TRIGGER IF EXISTS trg_matches_karma ON public.matches;
CREATE TRIGGER trg_matches_karma
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.matches_karma_fn();

DROP TRIGGER IF EXISTS trg_claims_karma ON public.claims;
CREATE TRIGGER trg_claims_karma
  AFTER UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.claims_karma_fn();

-- 4) Foreign keys (idempotent with guards)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_listings_user_id_users') THEN
    ALTER TABLE public.listings
    ADD CONSTRAINT fk_listings_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_favorites_user_id_users') THEN
    ALTER TABLE public.favorites
    ADD CONSTRAINT fk_favorites_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_favorites_listing_id_listings') THEN
    ALTER TABLE public.favorites
    ADD CONSTRAINT fk_favorites_listing_id_listings
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_swipes_user_id_users') THEN
    ALTER TABLE public.swipes
    ADD CONSTRAINT fk_swipes_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_swipes_listing_id_listings') THEN
    ALTER TABLE public.swipes
    ADD CONSTRAINT fk_swipes_listing_id_listings
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_forums_user_id_users') THEN
    ALTER TABLE public.forums
    ADD CONSTRAINT fk_forums_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comments_user_id_users') THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT fk_comments_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_comments_forum_id_forums') THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT fk_comments_forum_id_forums
    FOREIGN KEY (forum_id) REFERENCES public.forums(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_user_a_id_users') THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT fk_matches_user_a_id_users
    FOREIGN KEY (user_a_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_user_b_id_users') THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT fk_matches_user_b_id_users
    FOREIGN KEY (user_b_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_item_a_id_listings') THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT fk_matches_item_a_id_listings
    FOREIGN KEY (item_a_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_matches_item_b_id_listings') THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT fk_matches_item_b_id_listings
    FOREIGN KEY (item_b_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_user_id_users') THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT fk_donations_user_id_users
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_ngo_drive_id_ngo_drives') THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT fk_donations_ngo_drive_id_ngo_drives
    FOREIGN KEY (ngo_drive_id) REFERENCES public.ngo_drives(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_item_id_listings') THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT fk_donations_item_id_listings
    FOREIGN KEY (item_id) REFERENCES public.listings(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_claims_ngo_id_users') THEN
    ALTER TABLE public.claims
    ADD CONSTRAINT fk_claims_ngo_id_users
    FOREIGN KEY (ngo_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_claims_listing_id_listings') THEN
    ALTER TABLE public.claims
    ADD CONSTRAINT fk_claims_listing_id_listings
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ngo_drives_ngo_id_users') THEN
    ALTER TABLE public.ngo_drives
    ADD CONSTRAINT fk_ngo_drives_ngo_id_users
    FOREIGN KEY (ngo_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5) Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_listing_id ON public.swipes(listing_id);
CREATE INDEX IF NOT EXISTS idx_forums_user_id ON public.forums(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_forum_id ON public.comments(forum_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_a_id ON public.matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b_id ON public.matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_item_a_id ON public.matches(item_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_item_b_id ON public.matches(item_b_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_drive_id ON public.donations(ngo_drive_id);
CREATE INDEX IF NOT EXISTS idx_donations_item_id ON public.donations(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_ngo_id ON public.claims(ngo_id);
CREATE INDEX IF NOT EXISTS idx_claims_listing_id ON public.claims(listing_id);
CREATE INDEX IF NOT EXISTS idx_ngo_drives_ngo_id ON public.ngo_drives(ngo_id);

-- 6) Uniqueness to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_favorites_user_listing ON public.favorites(user_id, listing_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_swipes_user_listing ON public.swipes(user_id, listing_id);

-- 7) Backfill users table from auth.users for any missing rows
INSERT INTO public.users (id, email, name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'name', '')
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;