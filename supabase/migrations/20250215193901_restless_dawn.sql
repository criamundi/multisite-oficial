-- Criar função para verificar se o usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas existentes
DROP POLICY IF EXISTS "allow_view_users" ON public.users;
DROP POLICY IF EXISTS "allow_update_own_data" ON public.users;

-- Política para visualização de usuários
CREATE POLICY "allow_view_users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Política para atualização de dados
CREATE POLICY "allow_update_users"
ON public.users FOR UPDATE
TO authenticated
USING (
  -- Usuário pode atualizar seus próprios dados OU ser administrador
  id = auth.uid() OR (SELECT public.is_admin())
)
WITH CHECK (
  id = auth.uid() OR (SELECT public.is_admin())
);

-- Política para exclusão de usuários (apenas admin)
CREATE POLICY "allow_delete_users"
ON public.users FOR DELETE
TO authenticated
USING ((SELECT public.is_admin()));

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Criar um usuário admin inicial se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE role = 'admin'
    LIMIT 1
  ) THEN
    UPDATE public.users
    SET role = 'admin'
    WHERE id = (
      SELECT id FROM public.users
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END $$;