/*
  # Corrigir políticas RLS para sites e site_users

  1. Políticas
    - Ajustar política de criação de sites
    - Adicionar políticas para site_users
    - Garantir que o usuário possa criar a associação site_user

  2. Alterações
    - Atualiza política de criação de sites
    - Adiciona políticas para site_users
*/

-- Atualizar política de criação de sites
DROP POLICY IF EXISTS "Users can create sites" ON sites;
CREATE POLICY "Users can create sites"
ON sites FOR INSERT TO authenticated
WITH CHECK (true);

-- Políticas para site_users
DROP POLICY IF EXISTS "Users can create site assignments" ON site_users;
CREATE POLICY "Users can create site assignments"
ON site_users FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view site assignments" ON site_users;
CREATE POLICY "Users can view site assignments"
ON site_users FOR SELECT TO authenticated
USING (user_id = auth.uid());