/*
  # Corrigir sincronização de usuários

  1. Alterações
    - Modifica a trigger para incluir full_name e role nas atualizações
    - Garante que os campos personalizados sejam mantidos durante a sincronização
*/

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
      NEW.raw_user_meta_data->>'full_name',
      COALESCE(NEW.raw_user_meta_data->>'role', 'editor'),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      role = COALESCE(EXCLUDED.role, public.users.role),
      updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar políticas de RLS para permitir atualizações
CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
