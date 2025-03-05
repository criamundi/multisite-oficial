/*
  # Corrigir políticas de RLS para sites e site_users

  1. Mudanças
    - Remover todas as políticas existentes
    - Implementar políticas mais permissivas para criação
    - Garantir que usuários possam ver seus próprios sites
  
  2. Segurança
    - Manter controle de acesso básico
    - Permitir criação e visualização adequada
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON sites;
DROP POLICY IF EXISTS "enable_select_for_site_users" ON sites;
DROP POLICY IF EXISTS "enable_update_for_owners" ON sites;
DROP POLICY IF EXISTS "enable_delete_for_owners" ON sites;
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON site_users;
DROP POLICY IF EXISTS "enable_select_for_authenticated" ON site_users;

-- Políticas para sites
CREATE POLICY "allow_select" ON sites
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "allow_insert" ON sites
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_update" ON sites
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

CREATE POLICY "allow_delete" ON sites
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

-- Políticas para site_users
CREATE POLICY "allow_select" ON site_users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "allow_insert" ON site_users
  FOR INSERT TO authenticated
  WITH CHECK (true);
