/*
  # Corrigir sincronização de usuários

  1. Alterações
    - Adiciona trigger para sincronizar atualizações entre auth.users e public.users
    - Garante que o email seja atualizado quando alterado na tabela auth.users
    - Mantém os dados consistentes entre as duas tabelas

  2. Segurança
    - Mantém as políticas de segurança existentes
    - Usa SECURITY DEFINER para garantir que a trigger tenha as permissões necessárias
*/

-- Função para sincronizar atualizações de usuários
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
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      'editor',
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Criar nova trigger para atualizações
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OR INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_data();

-- Garantir que todos os usuários existentes estejam sincronizados
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  'editor',
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  updated_at = now();
