-- The trigger exists but the function was outdated - let's update just the function
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

-- Fix existing user that's stuck
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