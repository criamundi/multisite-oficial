-- Atualizar a função de sincronização para lidar melhor com metadados
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
      full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), public.users.full_name),
      role = COALESCE(NEW.raw_user_meta_data->>'role', public.users.role),
      updated_at = now();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que o trigger está atualizado
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OR INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_data();

-- Adicionar índice para melhorar performance de busca por email
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
