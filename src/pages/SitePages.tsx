import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit2, Trash2, Globe, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import slugify from 'slugify';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
}

interface SitePage {
  id: string;
  site_id: string;
  template_id: string;
  title: string;
  slug: string;
  content: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  template?: PageTemplate;
}

export function SitePages() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    template_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPages();
    loadTemplates();
  }, [siteId]);

  async function loadPages() {
    try {
      const { data: pages, error: pagesError } = await supabase
        .from('site_pages')
        .select(`
          *,
          template:page_templates (
            id,
            name,
            description,
            thumbnail_url
          )
        `)
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (pagesError) throw pagesError;
      setPages(pages || []);
    } catch (err) {
      console.error('Erro ao carregar páginas:', err);
      setError('Não foi possível carregar as páginas.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('page_templates')
        .select('*')
        .order('name');

      if (templatesError) throw templatesError;
      setTemplates(templates || []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const slug = slugify(formData.title, { lower: true, strict: true });

      const { data: page, error: pageError } = await supabase
        .from('site_pages')
        .insert([{
          site_id: siteId,
          template_id: formData.template_id,
          title: formData.title,
          slug,
          author_id: user?.id,
          content: {},
          is_published: false
        }])
        .select()
        .single();

      if (pageError) throw pageError;

      setShowModal(false);
      setFormData({ title: '', template_id: '' });
      await loadPages();
    } catch (err: any) {
      console.error('Erro ao criar página:', err);
      setError(err.message || 'Erro ao criar página. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('site_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      await loadPages();
    } catch (err) {
      console.error('Erro ao excluir página:', err);
      setError('Erro ao excluir página. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePublish = async (page: SitePage) => {
    try {
      const { error } = await supabase
        .from('site_pages')
        .update({
          is_published: !page.is_published,
          published_at: !page.is_published ? new Date().toISOString() : null
        })
        .eq('id', page.id);

      if (error) throw error;
      await loadPages();
    } catch (err) {
      console.error('Erro ao alterar status da página:', err);
      setError('Erro ao alterar status da página. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando páginas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Páginas</h1>
          <p className="mt-1 text-gray-600">
            Gerencie as páginas do seu site
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          disabled={isProcessing}
        >
          <Plus size={20} />
          <span>Nova Página</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Nenhuma página criada. Comece criando sua primeira página!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{page.title}</h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Globe size={16} className="mr-1" />
                  {page.slug}
                </p>
                {page.template && (
                  <p className="text-sm text-gray-500 mb-4">
                    Template: {page.template.name}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.is_published ? 'Publicada' : 'Rascunho'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className={`p-2 transition-colors ${
                        page.is_published 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-600 hover:text-gray-700'
                      }`}
                      title={page.is_published ? 'Despublicar' : 'Publicar'}
                      disabled={isProcessing}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/sites/${siteId}/pages/${page.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Editar"
                      disabled={isProcessing}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir"
                      disabled={isProcessing}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Página */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Nova Página</h3>
            </div>
            <form onSubmit={handleCreatePage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Página
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Criando...' : 'Criar Página'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
