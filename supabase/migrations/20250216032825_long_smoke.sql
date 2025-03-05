/*
  # Corrigir sincronização de usuários

  1. Alterações
    - Atualiza a função de sincronização para lidar melhor com os metadados
    - Garante que o trigger seja executado após INSERT e UPDATE
    - Adiciona tratamento para campos nulos

  2. Segurança
    - Mantém a função como SECURITY DEFINER para garantir acesso aos dados
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
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
      role = COALESCE(NEW.raw_user_meta_data->>'role', public.users.role),
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

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_data();

-- Sincronizar usuários existentes
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  COALESCE(raw_user_meta_data->>'role', 'editor'),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
  role = COALESCE(EXCLUDED.role, public.users.role),
  updated_at = now();
