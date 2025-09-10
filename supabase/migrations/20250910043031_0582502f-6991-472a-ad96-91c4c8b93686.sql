-- Tighten users table RLS to restrict reads to authenticated users only
-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update existing SELECT policy to only apply to authenticated users
ALTER POLICY "Users can view their own profile"
ON public.users
TO authenticated
USING (auth.uid() = id);
