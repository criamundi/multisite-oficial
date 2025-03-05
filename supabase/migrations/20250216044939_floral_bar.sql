-- Remover políticas existentes
DROP POLICY IF EXISTS "allow_select_lead_settings" ON lead_settings;
DROP POLICY IF EXISTS "allow_insert_lead_settings" ON lead_settings;
DROP POLICY IF EXISTS "allow_update_lead_settings" ON lead_settings;

-- Criar função para garantir uma única configuração por site
CREATE OR REPLACE FUNCTION ensure_single_lead_settings()
RETURNS trigger AS $$
BEGIN
  -- Se já existe uma configuração para este site, atualizar ao invés de inserir
  IF EXISTS (
    SELECT 1 FROM lead_settings 
    WHERE site_id = NEW.site_id
  ) THEN
    UPDATE lead_settings
    SET 
      is_enabled = NEW.is_enabled,
      notification_email = NEW.notification_email,
      success_message = NEW.success_message,
      form_title = NEW.form_title,
      button_text = NEW.button_text,
      fields = NEW.fields,
      auto_response_enabled = NEW.auto_response_enabled,
      auto_response_subject = NEW.auto_response_subject,
      auto_response_body = NEW.auto_response_body,
      updated_at = now()
    WHERE site_id = NEW.site_id;
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para garantir uma única configuração
DROP TRIGGER IF EXISTS ensure_single_lead_settings_trigger ON lead_settings;
CREATE TRIGGER ensure_single_lead_settings_trigger
  BEFORE INSERT ON lead_settings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_lead_settings();

-- Criar novas políticas
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