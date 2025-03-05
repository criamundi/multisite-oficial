-- Adicionar campos necessários para o editor visual
ALTER TABLE site_pages
ADD COLUMN IF NOT EXISTS blocks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS styles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{
  "layout": "default",
  "spacing": {
    "padding": {
      "top": "0",
      "right": "0",
      "bottom": "0",
      "left": "0"
    },
    "margin": {
      "top": "0",
      "right": "0",
      "bottom": "0",
      "left": "0"
    }
  },
  "background": {
    "type": "color",
    "color": "#ffffff",
    "image": null,
    "position": "center",
    "repeat": "no-repeat",
    "size": "cover"
  }
}'::jsonb;

-- Criar tabela de blocos predefinidos
CREATE TABLE page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  thumbnail_url text,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

-- Política para visualização de blocos predefinidos
CREATE POLICY "allow_select_page_blocks"
ON page_blocks FOR SELECT
TO authenticated
USING (true);

-- Inserir blocos predefinidos
INSERT INTO page_blocks (name, category, description, thumbnail_url, content) VALUES
('Hero Section', 'header', 'Seção principal com título, subtítulo e botão de ação', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=500', '{
  "type": "hero",
  "settings": {
    "height": "600px",
    "alignment": "center",
    "overlay": true,
    "overlayColor": "rgba(0,0,0,0.5)"
  },
  "background": {
    "type": "image",
    "url": "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1920",
    "position": "center",
    "size": "cover"
  },
  "content": {
    "title": "Título Principal",
    "subtitle": "Subtítulo ou descrição do seu site",
    "button": {
      "text": "Saiba Mais",
      "url": "#",
      "style": "primary"
    }
  }
}'::jsonb),
('Features Grid', 'content', 'Grade de recursos ou serviços com ícones', 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=500', '{
  "type": "features",
  "settings": {
    "columns": 3,
    "gap": "2rem"
  },
  "items": [
    {
      "icon": "Star",
      "title": "Recurso 1",
      "description": "Descrição do recurso ou serviço"
    },
    {
      "icon": "Shield",
      "title": "Recurso 2",
      "description": "Descrição do recurso ou serviço"
    },
    {
      "icon": "Heart",
      "title": "Recurso 3",
      "description": "Descrição do recurso ou serviço"
    }
  ]
}'::jsonb),
('Testimonials', 'social', 'Carrossel de depoimentos de clientes', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500', '{
  "type": "testimonials",
  "settings": {
    "autoplay": true,
    "interval": 5000
  },
  "items": [
    {
      "name": "João Silva",
      "role": "CEO",
      "company": "Empresa ABC",
      "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      "text": "Depoimento do cliente sobre sua experiência"
    },
    {
      "name": "Maria Santos",
      "role": "Diretora",
      "company": "Empresa XYZ",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      "text": "Depoimento do cliente sobre sua experiência"
    }
  ]
}'::jsonb),
('Contact Form', 'forms', 'Formulário de contato com campos personalizáveis', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=500', '{
  "type": "contact",
  "settings": {
    "layout": "stacked",
    "submitButton": {
      "text": "Enviar Mensagem",
      "style": "primary"
    }
  },
  "fields": [
    {
      "type": "text",
      "name": "name",
      "label": "Nome",
      "required": true
    },
    {
      "type": "email",
      "name": "email",
      "label": "E-mail",
      "required": true
    },
    {
      "type": "textarea",
      "name": "message",
      "label": "Mensagem",
      "required": true
    }
  ]
}'::jsonb);