-- Remove existing policies
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;

-- First, create simple site_users policies
CREATE POLICY "site_users_select_policy"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "site_users_insert_policy"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Then, create sites policies
CREATE POLICY "sites_insert_policy"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "sites_select_policy"
ON sites FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT site_id 
    FROM site_users 
    WHERE user_id = auth.uid()
  )
  OR
  -- Allow temporary access for site creation
  auth.uid() IN (
    SELECT user_id 
    FROM site_users 
    WHERE site_id = id 
    AND created_at >= NOW() - INTERVAL '1 minute'
  )
);

CREATE POLICY "sites_update_policy"
ON sites FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT site_id 
    FROM site_users 
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY "sites_delete_policy"
ON sites FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT site_id 
    FROM site_users 
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Ensure RLS is enabled
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to domain if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'sites_domain_key'
  ) THEN
    ALTER TABLE sites ADD CONSTRAINT sites_domain_key UNIQUE (domain);
  END IF;
END $$;