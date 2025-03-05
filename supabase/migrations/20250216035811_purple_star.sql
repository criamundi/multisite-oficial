-- Atualizar função de exclusão de usuários para garantir a ordem correta
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Verificar se o usuário que está executando é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir usuários';
  END IF;

  -- Verificar se o usuário a ser excluído existe
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id
  ) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se não está tentando excluir um admin
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Não é possível excluir um administrador';
  END IF;

  -- Verificar se não está tentando excluir a si mesmo
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível excluir sua própria conta';
  END IF;

  -- Primeiro remover todas as associações do usuário
  DELETE FROM site_users WHERE user_id = user_id;
  
  -- Depois remover da tabela users
  DELETE FROM public.users WHERE id = user_id;
  
  -- Por fim, remover da autenticação
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;