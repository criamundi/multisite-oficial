import React from 'react';
import { HeroBlock } from './HeroBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { ContactBlock } from './ContactBlock';
import { MenuBlock } from './MenuBlock';
import { SlideBlock } from './SlideBlock';
import { RichTextBlock } from './RichTextBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { FooterBlock } from './FooterBlock';
import { YouTubeBlock } from './YouTubeBlock';
import { DividerBlock } from './DividerBlock';
import { IconsBlock } from './IconsBlock';
import { ButtonsBlock } from './ButtonsBlock';
import { GoogleMapBlock } from './GoogleMapBlock';

interface BlockRendererProps {
  block: any;
  siteId: string;
}

export function BlockRenderer({ block, siteId }: BlockRendererProps) {
  if (!block || !block.type) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Bloco inválido ou tipo não especificado
      </div>
    );
  }

  switch (block.type) {
    case 'hero':
      return <HeroBlock settings={block.settings} background={block.background} content={block.content} />;
    case 'features':
      return <FeaturesBlock settings={block.settings} items={block.items} />;
    case 'testimonials':
      return <TestimonialsBlock settings={block.settings} items={block.items} />;
    case 'contact':
      return <ContactBlock settings={block.settings} fields={block.fields} siteId={siteId} />;
    case 'slide':
      return <SlideBlock settings={block.settings} slides={block.slides} />;
    case 'menu':
      return <MenuBlock settings={block.settings} items={block.items} />;
    case 'richtext':
      return <RichTextBlock settings={block.settings} content={block.content} />;
    case 'columns':
      return <ColumnsBlock settings={block.settings} items={block.items} />;
    case 'footer':
      return <FooterBlock settings={block.settings} content={block.content} />;
    case 'youtube':
      return <YouTubeBlock settings={block.settings} content={block.content} />;
    case 'divider':
      return <DividerBlock settings={block.settings} />;
    case 'icons':
      return <IconsBlock settings={block.settings} items={block.items} />;
    case 'buttons':
      return <ButtonsBlock settings={block.settings} items={block.items} />;
    case 'googlemap':
      return <GoogleMapBlock settings={block.settings} content={block.content} />;
    default:
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Bloco não suportado: {block.type}
        </div>
      );
  }
}