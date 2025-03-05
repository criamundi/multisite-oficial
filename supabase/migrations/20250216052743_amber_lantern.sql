-- Adicionar política para permitir acesso público às páginas publicadas
CREATE POLICY "allow_public_access_to_published_pages"
ON site_pages FOR SELECT
TO anon
USING (
  is_published = true
);

-- Garantir que RLS está habilitado
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_site_pages_published ON site_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_site_pages_site_slug ON site_pages(site_id, slug);