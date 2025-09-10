-- Fix 1: Create the missing trigger for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, location)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::role_enum,
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', users.role::text)::role_enum,
    location = COALESCE(NEW.raw_user_meta_data->>'location', users.location);
  RETURN NEW;
END;
$$;

-- Create the trigger that was missing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix 2: Manually sync the existing user that's stuck
INSERT INTO public.users (id, email, name, role, location) 
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', email),
  COALESCE(raw_user_meta_data->>'role', 'user')::role_enum,
  COALESCE(raw_user_meta_data->>'location', 'Unknown')
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;