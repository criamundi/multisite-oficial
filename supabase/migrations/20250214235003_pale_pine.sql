/*
  # Fix sites creation policy

  1. Changes
    - Modify sites policies to allow proper site creation flow
    - Ensure users can create sites and then be associated with them
    - Maintain security while fixing the creation flow

  2. Security
    - Keep RLS enabled
    - Ensure proper access control
    - Prevent unauthorized access
*/

-- Remove existing policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Anyone can create sites') THEN
    DROP POLICY "Anyone can create sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Users can view their own sites') THEN
    DROP POLICY "Users can view their own sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Owners can update their sites') THEN
    DROP POLICY "Owners can update their sites" ON sites;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sites' AND policyname = 'Owners can delete their sites') THEN
    DROP POLICY "Owners can delete their sites" ON sites;
  END IF;
END $$;

-- Create new policies with proper creation flow
CREATE POLICY "Users can create sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view sites they are associated with"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
  OR
  -- Allow viewing immediately after creation for the creating user
  auth.uid() = (
    SELECT user_id 
    FROM site_users 
    WHERE site_id = id 
    ORDER BY created_at ASC 
    LIMIT 1
  )
);

CREATE POLICY "Site owners can update their sites"
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

CREATE POLICY "Site owners can delete their sites"
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