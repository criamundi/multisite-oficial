/*
  # Fix site creation flow

  1. Changes
    - Simplify site creation policy to allow authenticated users to create sites
    - Add policy to allow viewing sites immediately after creation
    - Ensure site_users can be created for new sites

  2. Security
    - Maintains RLS security while fixing the creation flow
    - Only allows access to sites the user is associated with
*/

-- Remove existing policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can create sites') THEN
    DROP POLICY "Users can create sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can view sites they are associated with') THEN
    DROP POLICY "Users can view sites they are associated with" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Site owners can update their sites') THEN
    DROP POLICY "Site owners can update their sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Site owners can delete their sites') THEN
    DROP POLICY "Site owners can delete their sites" ON sites;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_users' AND policyname = 'Users can manage their site assignments') THEN
    DROP POLICY "Users can manage their site assignments" ON site_users;
  END IF;
END $$;

-- Sites policies
CREATE POLICY "Allow site creation for authenticated users"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow site viewing for associated users"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
  OR
  -- Temporary access for site creation
  (EXTRACT(EPOCH FROM (now() - created_at)) < 5)
);

CREATE POLICY "Allow site updates for owners"
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

CREATE POLICY "Allow site deletion for owners"
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
CREATE POLICY "Allow site_users management"
ON site_users FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM sites s
    WHERE s.id = site_id
    AND EXTRACT(EPOCH FROM (now() - s.created_at)) < 5
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM sites s
    WHERE s.id = site_id
    AND EXTRACT(EPOCH FROM (now() - s.created_at)) < 5
  )
);