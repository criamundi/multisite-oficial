/*
  # Adicionar suporte a páginas e leads

  1. Novas Tabelas
    - `page_templates` - Templates de páginas disponíveis
      - `id` (uuid, primary key)
      - `name` (text) - Nome do template
      - `description` (text) - Descrição do template
      - `thumbnail_url` (text) - URL da miniatura do template
      - `created_at` (timestamptz)
    
    - `site_pages` - Páginas dos sites
      - `id` (uuid, primary key)
      - `site_id` (uuid) - Referência ao site
      - `template_id` (uuid) - Referência ao template usado
      - `title` (text) - Título da página
      - `slug` (text) - URL amigável
      - `content` (jsonb) - Conteúdo da página
      - `meta_title` (text) - Título para SEO
      - `meta_description` (text) - Descrição para SEO
      - `is_published` (boolean) - Status de publicação
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `published_at` (timestamptz)

    - `lead_settings` - Configurações de leads por site
      - `id` (uuid, primary key)
      - `site_id` (uuid) - Referência ao site
      - `is_enabled` (boolean) - Se captação de leads está ativa
      - `notification_email` (text) - Email para receber notificações
      - `success_message` (text) - Mensagem de sucesso
      - `form_title` (text) - Título do formulário
      - `button_text` (text) - Texto do botão
      - `fields` (jsonb) - Campos do formulário
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `leads` - Leads capturados
      - `id` (uuid, primary key)
      - `site_id` (uuid) - Referência ao site
      - `data` (jsonb) - Dados do lead
      - `created_at` (timestamptz)
      - `source_url` (text) - URL de origem
      - `status` (text) - Status do lead

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para garantir que usuários só acessem dados dos seus sites
    - Proteção contra SQL injection usando tipos apropriados

  3. Índices
    - Índices em chaves estrangeiras
    - Índice em slugs para busca rápida
    - Índice em datas para ordenação
*/

-- Templates de Páginas
CREATE TABLE page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Páginas dos Sites
CREATE TABLE site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  template_id uuid REFERENCES page_templates(id),
  title text NOT NULL,
  slug text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  UNIQUE(site_id, slug)
);

-- Configurações de Leads
CREATE TABLE lead_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  is_enabled boolean DEFAULT false,
  notification_email text,
  success_message text DEFAULT 'Obrigado pelo contato! Em breve retornaremos.',
  form_title text DEFAULT 'Entre em contato',
  button_text text DEFAULT 'Enviar',
  fields jsonb DEFAULT '[
    {"name": "name", "label": "Nome", "type": "text", "required": true},
    {"name": "email", "label": "E-mail", "type": "email", "required": true},
    {"name": "phone", "label": "Telefone", "type": "tel", "required": false},
    {"name": "message", "label": "Mensagem", "type": "textarea", "required": false}
  ]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  source_url text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived'))
);

-- Habilitar RLS
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas para page_templates
CREATE POLICY "Templates visíveis para todos usuários autenticados"
  ON page_templates FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para site_pages
CREATE POLICY "Usuários podem ver páginas dos seus sites"
  ON site_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = site_pages.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar páginas nos seus sites"
  ON site_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = site_pages.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar páginas dos seus sites"
  ON site_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = site_pages.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar páginas dos seus sites"
  ON site_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = site_pages.site_id
      AND site_users.user_id = auth.uid()
    )
  );

-- Políticas para lead_settings
CREATE POLICY "Usuários podem ver configurações de leads dos seus sites"
  ON lead_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = lead_settings.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar configurações de leads nos seus sites"
  ON lead_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = lead_settings.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar configurações de leads dos seus sites"
  ON lead_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = lead_settings.site_id
      AND site_users.user_id = auth.uid()
    )
  );

-- Políticas para leads
CREATE POLICY "Usuários podem ver leads dos seus sites"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = leads.site_id
      AND site_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar leads dos seus sites"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_users
      WHERE site_users.site_id = leads.site_id
      AND site_users.user_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX idx_site_pages_site_id ON site_pages(site_id);
CREATE INDEX idx_site_pages_template_id ON site_pages(template_id);
CREATE INDEX idx_site_pages_slug ON site_pages(slug);
CREATE INDEX idx_site_pages_created_at ON site_pages(created_at);
CREATE INDEX idx_leads_site_id ON leads(site_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);

-- Templates padrão
INSERT INTO page_templates (name, description, thumbnail_url) VALUES
('Landing Page', 'Template ideal para páginas de conversão com formulário de captura de leads.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500'),
('Institucional', 'Template para páginas institucionais com seções para história, missão e valores.', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500'),
('Contato', 'Template com formulário de contato e informações de localização.', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=500'),
('Blog', 'Template para blog com lista de posts e sidebar.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500');