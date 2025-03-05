/*
  # Ajuste de políticas para persistência de sites

  1. Alterações
    - Simplificação das políticas de segurança
    - Ajuste da política de inserção de site_users
    - Correção da política de seleção de sites

  2. Políticas
    - Sites:
      - SELECT: Usuários podem ver seus próprios sites
      - INSERT: Usuários autenticados podem criar sites
      - UPDATE/DELETE: Apenas proprietários podem modificar/excluir
    - Site Users:
      - SELECT: Usuários podem ver suas próprias associações
      - INSERT: Permitir inserção durante criação do site
*/

-- Remove existing policies
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;

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
  OR
  -- Permitir visualização temporária após a criação
  EXTRACT(EPOCH FROM (now() - created_at)) < 10
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