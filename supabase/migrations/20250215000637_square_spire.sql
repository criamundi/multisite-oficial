/*
  # Simplificar políticas de RLS

  1. Mudanças
    - Remover todas as políticas existentes
    - Criar novas políticas simplificadas
    - Garantir acesso correto para criação e visualização
  
  2. Segurança
    - Manter controle de acesso adequado
    - Permitir criação de sites para usuários autenticados
    - Restringir visualização apenas aos usuários associados
*/

-- Remover políticas existentes
DO $$ 
BEGIN
  -- Remover políticas da tabela sites
  DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
  DROP POLICY IF EXISTS "sites_select_policy" ON sites;
  DROP POLICY IF EXISTS "sites_update_policy" ON sites;
  DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
  DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;
  DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
END $$;

-- Criar novas políticas para sites
CREATE POLICY "enable_insert_for_authenticated"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_for_site_users"
ON sites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "enable_update_for_owners"
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

CREATE POLICY "enable_delete_for_owners"
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

-- Criar novas políticas para site_users
CREATE POLICY "enable_insert_for_authenticated"
ON site_users FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "enable_select_for_authenticated"
ON site_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());
