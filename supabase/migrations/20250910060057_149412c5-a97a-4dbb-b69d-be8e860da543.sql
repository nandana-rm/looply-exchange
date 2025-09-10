-- 1) Update handle_new_user to also map role (no location column involved)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::role_enum
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', users.role::text)::role_enum;
  RETURN NEW;
END;
$$;

-- 2) Backfill any missing users from auth.users into public.users
INSERT INTO public.users (id, email, name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'user')::role_enum
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3) Ensure NGO role validation trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'validate_ngo_role_trigger'
  ) THEN
    CREATE TRIGGER validate_ngo_role_trigger
      BEFORE INSERT OR UPDATE ON public.ngo_drives
      FOR EACH ROW EXECUTE FUNCTION public.validate_ngo_role();
  END IF;
END$$;

-- 4) Ensure karma triggers exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'donations_karma_trigger'
  ) THEN
    CREATE TRIGGER donations_karma_trigger
      AFTER INSERT OR UPDATE ON public.donations
      FOR EACH ROW EXECUTE FUNCTION public.donations_karma_fn();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'matches_karma_trigger'
  ) THEN
    CREATE TRIGGER matches_karma_trigger
      AFTER UPDATE ON public.matches
      FOR EACH ROW EXECUTE FUNCTION public.matches_karma_fn();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'claims_karma_trigger'
  ) THEN
    CREATE TRIGGER claims_karma_trigger
      AFTER UPDATE ON public.claims
      FOR EACH ROW EXECUTE FUNCTION public.claims_karma_fn();
  END IF;
END$$;