/*
  # Corrigir permissões de usuários

  1. Alterações
    - Adiciona políticas RLS mais permissivas para a tabela users
    - Permite que usuários vejam outros usuários do sistema
    - Permite que usuários atualizem seus próprios dados
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;

-- Política para visualização de usuários
CREATE POLICY "allow_view_users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Política para atualização de dados próprios
CREATE POLICY "allow_update_own_data"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Atualizar a função de sincronização
CREATE OR REPLACE FUNCTION public.sync_user_data()
RETURNS trigger AS $$
BEGIN
  -- Se o registro foi atualizado em auth.users
  IF (TG_OP = 'UPDATE') THEN
    UPDATE public.users
    SET 
      email = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  -- Se o registro foi inserido em auth.users
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'editor'),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
      role = COALESCE(EXCLUDED.role, public.users.role),
      updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
