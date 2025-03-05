/*
  # Simplificar políticas RLS

  1. Mudanças
    - Remover todas as políticas existentes
    - Criar políticas simples e diretas
    - Evitar recursão entre tabelas
    - Usar IN ao invés de EXISTS para melhor performance
    
  2. Novas Políticas
    - sites: INSERT, SELECT, UPDATE, DELETE
    - site_users: INSERT, SELECT
*/

-- Remove existing policies
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;

-- First, create site_users policies (simpler ones)
CREATE POLICY "site_users_select_policy"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "site_users_insert_policy"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Then, create sites policies using direct references
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
