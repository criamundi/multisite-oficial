-- Adicionar campos faltantes na tabela site_pages
ALTER TABLE site_pages
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS layout jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo_settings jsonb DEFAULT '{
  "title": null,
  "description": null,
  "keywords": null,
  "og_image": null
}'::jsonb;

-- Adicionar campos faltantes na tabela lead_settings
ALTER TABLE lead_settings
ADD COLUMN IF NOT EXISTS email_template text,
ADD COLUMN IF NOT EXISTS auto_response_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_response_subject text,
ADD COLUMN IF NOT EXISTS auto_response_body text;

-- Adicionar campos faltantes na tabela leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS last_contact timestamptz;

-- Criar função para atualizar o status do lead
CREATE OR REPLACE FUNCTION update_lead_status(
  p_lead_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE leads
  SET 
    status = p_status,
    notes = CASE 
      WHEN p_notes IS NOT NULL 
      THEN COALESCE(notes, '') || E'\n' || NOW()::text || ': ' || p_notes
      ELSE notes
    END,
    last_contact = CASE 
      WHEN p_status = 'contacted' 
      THEN NOW() 
      ELSE last_contact
    END
  WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que apenas usuários autenticados podem executar a função
REVOKE EXECUTE ON FUNCTION update_lead_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_lead_status(uuid, text, text) TO authenticated;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_last_contact ON leads(last_contact);
CREATE INDEX IF NOT EXISTS idx_site_pages_author_id ON site_pages(author_id);