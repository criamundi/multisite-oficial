-- Adicionar bloco de menu aos blocos predefinidos
INSERT INTO page_blocks (name, category, description, thumbnail_url, content) VALUES
('Menu de Navegação', 'navigation', 'Menu responsivo com suporte a links âncora', 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=500', '{
  "type": "menu",
  "settings": {
    "position": "top",
    "style": "fixed",
    "backgroundColor": "white",
    "textColor": "gray-800",
    "hoverColor": "blue-600",
    "logo": {
      "url": "",
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
      "id": "services",
      "label": "Serviços",
      "url": "#services",
      "isAnchor": true
    },
    {
      "id": "contact",
      "label": "Contato",
      "url": "#contact",
      "isAnchor": true
    }
  ]
}'::jsonb);
