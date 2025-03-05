import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Facebook, Instagram, Twitter, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SiteData {
  id: string;
  name: string;
  domain: string;
  settings: {
    theme?: 'light' | 'dark';
    logo_url?: string;
    primary_color?: string;
    show_social_links?: boolean;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
}

interface SitePage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

export function SitePreview() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<SiteData | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSite();
    loadPages();
  }, [siteId]);

  async function loadSite() {
    try {
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (siteError) throw siteError;
      setSite(site);
    } catch (err) {
      console.error('Erro ao carregar site:', err);
      setError('Não foi possível carregar o site.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPages() {
    try {
      const { data: pages, error: pagesError } = await supabase
        .from('site_pages')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (pagesError) throw pagesError;
      setPages(pages || []);
    } catch (err) {
      console.error('Erro ao carregar páginas:', err);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando site...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error || 'Site não encontrado.'}</p>
      </div>
    );
  }

  const theme = site.settings?.theme || 'light';
  const primaryColor = site.settings?.primary_color || '#3B82F6';
  const showSocialLinks = site.settings?.show_social_links || false;
  const socialLinks = site.settings?.social_links || {};

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Barra de Administração */}
      <div className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-2 z-50`}>
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/sites')}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors flex items-center space-x-2`}
          >
            <ArrowLeft size={20} />
            <span>Voltar para o painel</span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Visualizando: {site.domain}</span>
            <button
              onClick={() => navigate(`/sites/${site.id}/settings`)}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Editar Site
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Site */}
      <div className="pt-16">
        {/* Header */}
        <header className={`py-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {site.settings?.logo_url && (
                  <img
                    src={site.settings.logo_url}
                    alt={`${site.name} logo`}
                    className="h-12 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <h1 className="text-3xl font-bold">{site.name}</h1>
              </div>
              {showSocialLinks && (
                <div className="flex items-center space-x-4">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Facebook size={24} />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Instagram size={24} />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Twitter size={24} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Lista de Páginas */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Páginas do Site</h2>
            {pages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Nenhuma página criada ainda. Crie sua primeira página para começar!
                </p>
                <button
                  onClick={() => navigate(`/sites/${siteId}/pages`)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Criar Página
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-medium mb-1">{page.title}</h3>
                        <p className="text-sm text-gray-500">/{page.slug}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          page.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.is_published ? 'Publicada' : 'Rascunho'}
                        </span>
                        {page.is_published && (
                          <a
                            href={`/sites/${siteId}/p/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Visualizar
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className={`mt-12 py-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
