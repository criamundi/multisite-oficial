-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver configurações de leads dos seus sites" ON lead_settings;
DROP POLICY IF EXISTS "Usuários podem criar configurações de leads nos seus sites" ON lead_settings;
DROP POLICY IF EXISTS "Usuários podem atualizar configurações de leads dos seus sites" ON lead_settings;

-- Criar novas políticas mais permissivas
CREATE POLICY "allow_select_lead_settings"
ON lead_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = lead_settings.site_id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "allow_insert_lead_settings"
ON lead_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = lead_settings.site_id
    AND site_users.user_id = auth.uid()
  )
);

CREATE POLICY "allow_update_lead_settings"
ON lead_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = lead_settings.site_id
    AND site_users.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.site_id = lead_settings.site_id
    AND site_users.user_id = auth.uid()
  )
);

-- Garantir que RLS está habilitado
ALTER TABLE lead_settings ENABLE ROW LEVEL SECURITY;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lead_settings_site_id ON lead_settings(site_id);