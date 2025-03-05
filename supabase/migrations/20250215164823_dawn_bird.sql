/*
  # Fix RLS policies and user creation

  1. Changes
    - Simplifica as políticas RLS para sites e site_users
    - Garante que o trigger de criação de usuários funcione corretamente
    - Sincroniza usuários existentes

  2. Security
    - Mantém as restrições de segurança necessárias
    - Permite que usuários autenticados criem sites
    - Permite que usuários vejam apenas seus próprios sites
*/

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "sites_insert_policy" ON sites;
DROP POLICY IF EXISTS "sites_update_policy" ON sites;
DROP POLICY IF EXISTS "sites_delete_policy" ON sites;
DROP POLICY IF EXISTS "site_users_select_policy" ON site_users;
DROP POLICY IF EXISTS "site_users_insert_policy" ON site_users;

-- Políticas simplificadas para sites
CREATE POLICY "sites_select_policy" ON sites
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "sites_insert_policy" ON sites
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "sites_update_policy" ON sites
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

CREATE POLICY "sites_delete_policy" ON sites
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = id
      AND site_users.user_id = auth.uid()
      AND site_users.role = 'owner'
    )
  );

-- Políticas simplificadas para site_users
CREATE POLICY "site_users_select_policy" ON site_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "site_users_insert_policy" ON site_users
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Atualizar função de trigger para garantir criação de usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'editor')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar usuários existentes
INSERT INTO public.users (id, email, role)
SELECT id, email, 'editor'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    updated_at = now();