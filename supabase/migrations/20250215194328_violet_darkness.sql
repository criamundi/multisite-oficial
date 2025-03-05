-- Garantir que o primeiro usuário seja admin
DO $$
BEGIN
  -- Atualizar o primeiro usuário para ser admin se não houver nenhum admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE role = 'admin'
  ) THEN
    WITH first_user AS (
      SELECT id
      FROM public.users
      ORDER BY created_at ASC
      LIMIT 1
    )
    UPDATE public.users
    SET role = 'admin'
    FROM first_user
    WHERE users.id = first_user.id;
  END IF;
END $$;

-- Remover políticas existentes
DROP POLICY IF EXISTS "allow_view_users" ON public.users;
DROP POLICY IF EXISTS "allow_update_users" ON public.users;
DROP POLICY IF EXISTS "allow_delete_users" ON public.users;

-- Política para visualização de usuários
CREATE POLICY "allow_view_users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Política para atualização de usuários
CREATE POLICY "allow_update_users"
ON public.users FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para exclusão de usuários
CREATE POLICY "allow_delete_users"
ON public.users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
