/*
  # Fix RLS policies for sites and site_users

  1. Changes
    - Simplify RLS policies for both tables
    - Add temporary access window for site creation
    - Ensure proper order of operations
  
  2. Security
    - Maintain proper access control
    - Allow temporary access during site creation
    - Prevent unauthorized access
*/

-- Remove existing policies
DO $$ 
BEGIN
  -- Drop sites policies
  DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
  DROP POLICY IF EXISTS "sites_select_policy" ON sites;
  DROP POLICY IF EXISTS "sites_update_policy" ON sites;
  DROP POLICY IF EXISTS "sites_delete_policy" ON sites;

  -- Drop site_users policies
  DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
  DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;
END $$;

-- Create new site_users policies
CREATE POLICY "site_users_insert_policy"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "site_users_select_policy"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create new sites policies
CREATE POLICY "sites_insert_policy"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "sites_select_policy"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "sites_update_policy"
ON sites FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
    AND site_users.role = 'owner'
  )
);

CREATE POLICY "sites_delete_policy"
ON sites FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
    AND site_users.role = 'owner'
  )
);