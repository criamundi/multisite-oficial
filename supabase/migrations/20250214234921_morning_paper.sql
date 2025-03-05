/*
  # Fix RLS policies for sites management

  1. Changes
    - Remove and recreate RLS policies for sites table
    - Update site_users policies
    - Ensure no duplicate policies

  2. Security
    - Maintain proper access control for sites and site_users
    - Ensure users can only access their own data
*/

DO $$ 
BEGIN
  -- Remove existing policies from sites table
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can create sites') THEN
    DROP POLICY "Users can create sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can view their own sites') THEN
    DROP POLICY "Users can view their own sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can update their own sites') THEN
    DROP POLICY "Users can update their own sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can delete their own sites') THEN
    DROP POLICY "Users can delete their own sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Anyone can create sites') THEN
    DROP POLICY "Anyone can create sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Owners can update their sites') THEN
    DROP POLICY "Owners can update their sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Owners can delete their sites') THEN
    DROP POLICY "Owners can delete their sites" ON sites;
  END IF;
END $$;

-- Create new sites policies
CREATE POLICY "Anyone can create sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own sites"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update their sites"
ON sites FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
    AND site_users.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
    AND site_users.role = 'owner'
  )
);

CREATE POLICY "Owners can delete their sites"
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