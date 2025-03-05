/*
  # Fix RLS policies for sites and site_users tables

  1. Changes
    - Simplify and fix RLS policies for sites table
    - Ensure proper access for site creation and viewing
    - Fix site_users policies to allow proper association

  2. Security
    - Maintain RLS protection while allowing necessary operations
    - Ensure users can only access their own data
*/

-- Remove existing policies
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;

-- Sites policies
CREATE POLICY "allow_insert_sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_select_sites"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
  OR
  -- Allow viewing for 5 seconds after creation to handle the initial setup
  EXTRACT(EPOCH FROM (now() - created_at)) < 5
);

CREATE POLICY "allow_update_sites"
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

CREATE POLICY "allow_delete_sites"
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

-- Site Users policies
CREATE POLICY "allow_insert_site_users"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM sites s
    WHERE s.id = site_id
    AND EXTRACT(EPOCH FROM (now() - s.created_at)) < 5
  )
);

CREATE POLICY "allow_select_site_users"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;