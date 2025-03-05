/*
  # Fix RLS recursion issues

  1. Changes
    - Simplify RLS policies to avoid circular references
    - Remove time-based checks that were causing recursion
    - Implement simpler, more direct policies

  2. Security
    - Maintain security while fixing recursion issues
    - Ensure proper access control for sites and site_users
*/

-- Remove existing policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites') THEN
    DROP POLICY IF EXISTS "Allow site creation for authenticated users" ON sites;
    DROP POLICY IF EXISTS "Allow site viewing for associated users" ON sites;
    DROP POLICY IF EXISTS "Allow site updates for owners" ON sites;
    DROP POLICY IF EXISTS "Allow site deletion for owners" ON sites;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_users') THEN
    DROP POLICY IF EXISTS "Allow site_users management" ON site_users;
  END IF;
END $$;

-- Simple site_users policies first
CREATE POLICY "site_users_select_policy"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "site_users_insert_policy"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Then site policies that depend on site_users
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
