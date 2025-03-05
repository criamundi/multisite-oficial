-- Adicionar bloco de slide aos blocos predefinidos
INSERT INTO page_blocks (name, category, description, thumbnail_url, content) VALUES
('Slide Show', 'header', 'Carrossel de imagens com texto e botões', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500', '{
  "type": "slide",
  "settings": {
    "height": "500px",
    "autoplay": true,
    "interval": 5000,
    "overlay": true,
    "overlayColor": "rgba(0,0,0,0.3)"
  },
  "slides": [
    {
      "id": "slide-1",
      "image_url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1920",
      "title": "Primeiro Slide",
      "subtitle": "Descrição do primeiro slide",
      "button_text": "Saiba Mais",
      "button_url": "#"
    },
    {
      "id": "slide-2",
      "image_url": "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=1920",
      "title": "Segundo Slide",
      "subtitle": "Descrição do segundo slide",
      "button_text": "Contato",
      "button_url": "#contato"
    }
  ]
}'::jsonb);
