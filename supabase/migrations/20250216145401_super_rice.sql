-- Atualizar e adicionar novos blocos predefinidos
TRUNCATE TABLE page_blocks;

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

('Features Grid', 'content', 'Grade de recursos ou serviços com ícones', null, '{
  "type": "features",
  "settings": {
    "columns": 3,
    "gap": "2rem",
    "iconSize": 48,
    "iconColor": "blue"
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

('Testimonials', 'social', 'Carrossel de depoimentos com avatares', null, '{
  "type": "testimonials",
  "settings": {
    "autoplay": true,
    "interval": 5000,
    "avatarSize": 80,
    "showCompany": true
  },
  "items": [
    {
      "name": "João Silva",
      "role": "CEO",
      "company": "Empresa ABC",
      "avatar": "User",
      "text": "Depoimento do cliente sobre sua experiência"
    },
    {
      "name": "Maria Santos",
      "role": "Diretora",
      "company": "Empresa XYZ",
      "avatar": "User",
      "text": "Depoimento do cliente sobre sua experiência"
    }
  ]
}'::jsonb),

('Contact Form', 'forms', 'Formulário de contato com campos personalizáveis', null, '{
  "type": "contact",
  "settings": {
    "layout": "stacked",
    "submitButton": {
      "text": "Enviar Mensagem",
      "style": "primary"
    },
    "showIcon": true,
    "icon": "Mail"
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
}'::jsonb),

('Menu de Navegação', 'navigation', 'Menu responsivo com suporte a links âncora', null, '{
  "type": "menu",
  "settings": {
    "position": "top",
    "style": "fixed",
    "backgroundColor": "white",
    "textColor": "gray-800",
    "hoverColor": "blue-600",
    "logo": {
      "icon": "Activity",
      "height": "32px"
    }
  },
  "items": [
    {
      "id": "home",
      "label": "Início",
      "url": "#home",
      "isAnchor": true
    },
    {
      "id": "about",
      "label": "Sobre",
      "url": "#about",
      "isAnchor": true
    },
    {
      "id": "contact",
      "label": "Contato",
      "url": "#contact",
      "isAnchor": true
    }
  ]
}'::jsonb),

('Texto Rico', 'content', 'Bloco de texto com formatação rica', null, '{
  "type": "richtext",
  "settings": {
    "maxWidth": "800px",
    "alignment": "left",
    "padding": "2rem"
  },
  "content": {
    "title": "Título da Seção",
    "subtitle": "Subtítulo opcional",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
}'::jsonb),

('Colunas', 'layout', 'Layout em colunas para conteúdo flexível', null, '{
  "type": "columns",
  "settings": {
    "columns": 2,
    "gap": "2rem",
    "padding": "2rem",
    "alignment": "stretch"
  },
  "items": [
    {
      "title": "Coluna 1",
      "content": "Conteúdo da primeira coluna"
    },
    {
      "title": "Coluna 2",
      "content": "Conteúdo da segunda coluna"
    }
  ]
}'::jsonb),

('Rodapé', 'footer', 'Rodapé com links e informações de contato', null, '{
  "type": "footer",
  "settings": {
    "backgroundColor": "gray-900",
    "textColor": "gray-100",
    "padding": "4rem",
    "columns": 4
  },
  "content": {
    "logo": {
      "icon": "Activity",
      "text": "Nome da Empresa"
    },
    "description": "Breve descrição da empresa ou site",
    "copyright": "© 2025 Todos os direitos reservados",
    "columns": [
      {
        "title": "Links Úteis",
        "items": [
          {
            "label": "Sobre",
            "url": "#"
          },
          {
            "label": "Serviços",
            "url": "#"
          }
        ]
      },
      {
        "title": "Contato",
        "items": [
          {
            "icon": "Mail",
            "text": "contato@exemplo.com"
          },
          {
            "icon": "Phone",
            "text": "(11) 9999-9999"
          }
        ]
      }
    ]
  }
}'::jsonb),

('Vídeo do YouTube', 'media', 'Incorporar vídeo do YouTube responsivo', null, '{
  "type": "youtube",
  "settings": {
    "aspectRatio": "16:9",
    "maxWidth": "800px",
    "showControls": true,
    "autoplay": false
  },
  "content": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Título do Vídeo",
    "description": "Descrição opcional do vídeo"
  }
}'::jsonb),

('Separador', 'layout', 'Linha divisória com opções de estilo', null, '{
  "type": "divider",
  "settings": {
    "style": "solid",
    "color": "gray-200",
    "width": "100%",
    "height": "1px",
    "margin": "2rem",
    "showIcon": false,
    "icon": "Star"
  }
}'::jsonb),

('Ícones', 'content', 'Exibir ícones com texto', null, '{
  "type": "icons",
  "settings": {
    "size": 48,
    "color": "blue-600",
    "layout": "horizontal",
    "spacing": "2rem",
    "alignment": "center"
  },
  "items": [
    {
      "icon": "Star",
      "label": "Ícone 1"
    },
    {
      "icon": "Heart",
      "label": "Ícone 2"
    },
    {
      "icon": "Shield",
      "label": "Ícone 3"
    }
  ]
}'::jsonb),

('Mapa do Google', 'embed', 'Incorporar mapa do Google Maps', null, '{
  "type": "googlemap",
  "settings": {
    "height": "400px",
    "zoom": 15,
    "showControls": true,
    "allowFullscreen": true
  },
  "content": {
    "address": "Av. Paulista, 1000 - São Paulo, SP",
    "lat": -23.5505,
    "lng": -46.6333
  }
}'::jsonb),

('Botões', 'content', 'Grupo de botões personalizáveis', null, '{
  "type": "buttons",
  "settings": {
    "layout": "horizontal",
    "spacing": "1rem",
    "alignment": "center"
  },
  "items": [
    {
      "text": "Botão Principal",
      "url": "#",
      "style": "primary",
      "icon": "ArrowRight",
      "iconPosition": "right"
    },
    {
      "text": "Botão Secundário",
      "url": "#",
      "style": "secondary",
      "icon": "Download",
      "iconPosition": "left"
    }
  ]
}'::jsonb);
