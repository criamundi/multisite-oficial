/*
  # Corrigir políticas RLS para sites e site_users

  1. Alterações
    - Remove todas as políticas existentes para sites e site_users
    - Cria novas políticas simplificadas e corretas
    - Garante que usuários possam criar sites e associações

  2. Políticas
    - Sites: INSERT, SELECT, UPDATE, DELETE
    - Site_users: INSERT, SELECT
*/

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can create sites" ON sites;
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON sites;
DROP POLICY IF EXISTS "Users can create site assignments" ON site_users;
DROP POLICY IF EXISTS "Users can view site assignments" ON site_users;

-- Política para sites
CREATE POLICY "Users can create sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their sites"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their sites"
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

CREATE POLICY "Users can delete their sites"
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

-- Política para site_users
CREATE POLICY "Users can manage their site assignments"
ON site_users FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());