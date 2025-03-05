/*
  # Ajuste nas políticas de segurança para sites e site_users

  1. Alterações
    - Simplificação das políticas de sites e site_users
    - Garantia de que o usuário possa criar sites e associações
    - Permissão para visualizar sites recém-criados

  2. Políticas
    - Políticas para sites:
      - INSERT: Permitido para usuários autenticados
      - SELECT: Permitido para usuários associados ao site
      - UPDATE/DELETE: Permitido para proprietários do site
    - Políticas para site_users:
      - INSERT: Permitido para usuários autenticados
      - SELECT: Permitido para usuários associados
*/

-- Remove existing policies
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;
DROP POLICY IF EXISTS "allow_insert_sites" ON sites;
DROP POLICY IF EXISTS "allow_select_sites" ON sites;
DROP POLICY IF EXISTS "allow_update_sites" ON sites;
DROP POLICY IF EXISTS "allow_delete_sites" ON sites;
DROP POLICY IF EXISTS "allow_insert_site_users" ON site_users;
DROP POLICY IF EXISTS "allow_select_site_users" ON site_users;

-- Sites policies
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

-- Site Users policies
CREATE POLICY "site_users_insert_policy"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "site_users_select_policy"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;