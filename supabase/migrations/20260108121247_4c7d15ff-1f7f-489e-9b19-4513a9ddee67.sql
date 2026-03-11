-- Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'superadmin'::app_role
  )
$$;

-- Allow superadmins to manage user_roles
CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_superadmin(auth.uid()));

-- Allow superadmins to view all profiles
CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Allow superadmins to manage profiles (insert/delete)
CREATE POLICY "Superadmins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_superadmin(auth.uid()));