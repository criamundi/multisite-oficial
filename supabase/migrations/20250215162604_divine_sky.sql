/*
  # Fix sites RLS policies

  1. Changes
    - Simplify sites RLS policies
    - Ensure proper site creation flow
    - Fix site_users policies

  2. Security
    - Allow site creation for authenticated users
    - Restrict site viewing to associated users
    - Maintain owner-only updates and deletes
*/

-- Remove existing policies
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;

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
  WITH CHECK (user_id = auth.uid());
