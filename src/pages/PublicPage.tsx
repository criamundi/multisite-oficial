import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlockRenderer } from '../components/blocks/BlockRenderer';

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  settings: {
    layout: string;
    spacing: {
      padding: {
        top: string;
        right: string;
        bottom: string;
        left: string;
      };
      margin: {
        top: string;
        right: string;
        bottom: string;
        left: string;
      };
    };
    background: {
      type: string;
      color: string;
      image: string | null;
      position: string;
      repeat: string;
      size: string;
    };
  };
}

export function PublicPage() {
  const { siteId, slug } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, [siteId, slug]);

  async function loadPage() {
    try {
      const { data: page, error } = await supabase
        .from('site_pages')
        .select('*')
        .eq('site_id', siteId)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      
      if (!page) {
        setError('Página não encontrada');
        return;
      }

      setPage(page);

      // Atualizar meta tags
      if (page.meta_title) {
        document.title = page.meta_title;
      } else {
        document.title = page.title;
      }
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.meta_description || '');
      }
    } catch (err) {
      console.error('Erro ao carregar página:', err);
      setError('Erro ao carregar página');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando página...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error || 'Página não encontrada'}</p>
      </div>
    );
  }

  // Aplicar estilos da página
  const pageStyle = {
    padding: `${page.settings?.spacing?.padding?.top || '0'} ${page.settings?.spacing?.padding?.right || '0'} ${page.settings?.spacing?.padding?.bottom || '0'} ${page.settings?.spacing?.padding?.left || '0'}`,
    margin: `${page.settings?.spacing?.margin?.top || '0'} ${page.settings?.spacing?.margin?.right || '0'} ${page.settings?.spacing?.margin?.bottom || '0'} ${page.settings?.spacing?.margin?.left || '0'}`,
    backgroundColor: page.settings?.background?.color || '#ffffff',
    backgroundImage: page.settings?.background?.image ? `url(${page.settings.background.image})` : 'none',
    backgroundPosition: page.settings?.background?.position || 'center',
    backgroundRepeat: page.settings?.background?.repeat || 'no-repeat',
    backgroundSize: page.settings?.background?.size || 'cover',
  };

  return (
    <div style={pageStyle}>
      {page.blocks.map((block, index) => (
        <BlockRenderer 
          key={block.id || index} 
          block={block} 
          siteId={siteId || ''} 
        />
      ))}
    </div>
  );
}
