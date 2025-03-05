/*
  # Fix user creation and RLS policies

  1. Changes
    - Add trigger to create user record when auth.users is created
    - Update RLS policies for better security

  2. Security
    - Ensure user record exists before site_users creation
    - Restrict site_users visibility to own records
    - Allow site creation only for authenticated users
*/

-- Create trigger function to create user record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'editor')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove existing policies
DROP POLICY IF EXISTS "allow_select" ON sites;
DROP POLICY IF EXISTS "allow_insert" ON sites;
DROP POLICY IF EXISTS "allow_update" ON sites;
DROP POLICY IF EXISTS "allow_delete" ON sites;
DROP POLICY IF EXISTS "allow_select" ON site_users;
DROP POLICY IF EXISTS "allow_insert" ON site_users;

-- Sites policies
CREATE POLICY "sites_select_policy" ON sites
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "sites_insert_policy" ON sites
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "sites_update_policy" ON sites
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

CREATE POLICY "sites_delete_policy" ON sites
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

-- Site Users policies
CREATE POLICY "site_users_select_policy" ON site_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "site_users_insert_policy" ON site_users
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );
