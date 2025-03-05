import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Globe, Settings, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Site {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  status: string;
}

export function Sites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({ name: '', domain: '' });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    try {
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;
      setSites(sites || []);
    } catch (err) {
      console.error('Erro ao carregar sites:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setFormData({ name: site.name, domain: site.domain });
    } else {
      setEditingSite(null);
      setFormData({ name: '', domain: '' });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSite(null);
    setFormData({ name: '', domain: '' });
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      if (editingSite) {
        // Atualizar site existente
        const { error: updateError } = await supabase
          .from('sites')
          .update({
            name: formData.name,
            domain: formData.domain,
          })
          .eq('id', editingSite.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo site
        const { data: site, error: siteError } = await supabase
          .from('sites')
          .insert([{
            name: formData.name,
            domain: formData.domain,
            settings: {},
            status: 'active'
          }])
          .select()
          .single();

        if (siteError) throw siteError;
        if (!site) throw new Error('Erro ao criar site: nenhum dado retornado');

        const { error: siteUserError } = await supabase
          .from('site_users')
          .insert([{
            site_id: site.id,
            user_id: user?.id,
            role: 'owner'
          }]);

        if (siteUserError) {
          await supabase.from('sites').delete().eq('id', site.id);
          throw siteUserError;
        }
      }

      await loadSites();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar operação. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeleteSite(siteId: string) {
    if (!window.confirm('Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;
      await loadSites();
    } catch (err: any) {
      console.error('Erro ao excluir site:', err);
      alert('Erro ao excluir site. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          disabled={isProcessing}
        >
          <Plus size={20} />
          <span>Novo Site</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Carregando sites...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Nenhum site encontrado. Crie seu primeiro site para começar!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{site.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex items-center">
                  <Globe size={16} className="mr-1" />
                  {site.domain}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {site.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/sites/${site.id}/preview`)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Visualizar"
                      disabled={isProcessing}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(site)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Editar"
                      disabled={isProcessing}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir"
                      disabled={isProcessing}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/sites/${site.id}/settings`)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Configurações"
                      disabled={isProcessing}
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingSite ? 'Editar Site' : 'Criar Novo Site'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Site
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                  Domínio
                </label>
                <input
                  type="text"
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="exemplo.com.br"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processando...' : editingSite ? 'Salvar Alterações' : 'Criar Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}