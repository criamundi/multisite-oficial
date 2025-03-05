/*
  # Adicionar políticas RLS para sites

  1. Políticas
    - Permitir que usuários autenticados criem sites
    - Permitir que usuários vejam seus próprios sites através da tabela site_users
    - Permitir que usuários atualizem seus próprios sites
    - Permitir que usuários excluam seus próprios sites

  2. Alterações
    - Remove política existente de super_admin
    - Adiciona novas políticas baseadas em site_users
*/

-- Remover política existente
DROP POLICY IF EXISTS "Super admins can do everything with sites" ON sites;

-- Política para criação de sites
CREATE POLICY "Users can create sites"
ON sites FOR INSERT TO authenticated
WITH CHECK (true);

-- Política para visualização de sites
CREATE POLICY "Users can view their own sites"
ON sites FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = sites.id
    AND site_users.user_id = auth.uid()
  )
);

-- Política para atualização de sites
CREATE POLICY "Users can update their own sites"
ON sites FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = sites.id
    AND site_users.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = sites.id
    AND site_users.user_id = auth.uid()
  )
);

-- Política para exclusão de sites
CREATE POLICY "Users can delete their own sites"
ON sites FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = sites.id
    AND site_users.user_id = auth.uid()
  )
);
