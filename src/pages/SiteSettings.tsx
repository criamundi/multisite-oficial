import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Plus, Trash2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SiteSettings {
  id: string;
  name: string;
  domain: string;
  settings: {
    theme?: string;
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

interface SiteUser {
  id: string;
  user_id: string;
  site_id: string;
  role: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

export function SiteSettings() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('editor');

  useEffect(() => {
    loadSite();
    loadSiteUsers();
  }, [siteId]);

  async function loadSite() {
    try {
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (siteError) throw siteError;
      
      // Garantir que settings existe e tem a estrutura correta
      site.settings = {
        theme: 'light',
        logo_url: '',
        primary_color: '#3B82F6',
        show_social_links: false,
        social_links: {
          facebook: '',
          instagram: '',
          twitter: '',
        },
        ...site.settings
      };

      setSite(site);
    } catch (err) {
      console.error('Erro ao carregar site:', err);
      setError('Não foi possível carregar as configurações do site.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSiteUsers() {
    try {
      const { data: users, error: usersError } = await supabase
        .from('site_users')
        .select(`
          *,
          user:users (
            email,
            full_name
          )
        `)
        .eq('site_id', siteId);

      if (usersError) throw usersError;
      setSiteUsers(users || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }

  const handleSettingChange = (path: string, value: any) => {
    if (!site) return;

    const newSettings = { ...site.settings };
    const pathParts = path.split('.');
    
    let current: any = newSettings;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
      if (!current) {
        current = {};
      }
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    setSite({ ...site, settings: newSettings });
  };

  const handleSave = async () => {
    if (!site) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('sites')
        .update({
          settings: site.settings
        })
        .eq('id', site.id);

      if (updateError) throw updateError;

      setSuccessMessage('Configurações salvas com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError('Erro ao salvar as configurações. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Primeiro, verificar se o usuário existe
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUserEmail)
        .single();

      if (userError) {
        throw new Error('Usuário não encontrado. Verifique o e-mail informado.');
      }

      // Verificar se o usuário já está associado ao site
      const { data: existingUser, error: existingError } = await supabase
        .from('site_users')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', userData.id)
        .single();

      if (existingUser) {
        throw new Error('Este usuário já está associado ao site.');
      }

      // Adicionar usuário ao site
      const { error: insertError } = await supabase
        .from('site_users')
        .insert([
          {
            site_id: siteId,
            user_id: userData.id,
            role: newUserRole
          }
        ]);

      if (insertError) throw insertError;

      setSuccessMessage('Usuário adicionado com sucesso!');
      setShowUserModal(false);
      setNewUserEmail('');
      setNewUserRole('editor');
      loadSiteUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar usuário. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('site_users')
        .delete()
        .eq('site_id', siteId)
        .eq('user_id', userId);

      if (error) throw error;

      setSuccessMessage('Usuário removido com sucesso!');
      loadSiteUsers();
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
      setError('Erro ao remover usuário. Tente novamente.');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('site_users')
        .update({ role: newRole })
        .eq('site_id', siteId)
        .eq('user_id', userId);

      if (error) throw error;

      setSuccessMessage('Função do usuário atualizada com sucesso!');
      loadSiteUsers();
    } catch (err) {
      console.error('Erro ao atualizar função do usuário:', err);
      setError('Erro ao atualizar função do usuário. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Site não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/sites')}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Site</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save size={20} />
          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Informações Básicas</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={site.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domínio
                </label>
                <input
                  type="text"
                  value={site.domain}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Aparência</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tema
                </label>
                <select
                  value={site.settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Logo
                </label>
                <input
                  type="url"
                  value={site.settings.logo_url}
                  onChange={(e) => handleSettingChange('logo_url', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={site.settings.primary_color}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    className="w-12 h-8 p-0 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={site.settings.primary_color}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Redes Sociais</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={site.settings.show_social_links}
                    onChange={(e) => handleSettingChange('show_social_links', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Exibir links sociais</span>
                </label>
              </div>
              
              {site.settings.show_social_links && (
                <div className="grid gap-4 pl-4 border-l-2 border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={site.settings.social_links?.facebook}
                      onChange={(e) => handleSettingChange('social_links.facebook', e.target.value)}
                      placeholder="https://facebook.com/sua-pagina"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={site.settings.social_links?.instagram}
                      onChange={(e) => handleSettingChange('social_links.instagram', e.target.value)}
                      placeholder="https://instagram.com/seu-perfil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={site.settings.social_links?.twitter}
                      onChange={(e) => handleSettingChange('social_links.twitter', e.target.value)}
                      placeholder="https://twitter.com/seu-perfil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gerenciamento de Usuários */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Usuários</h2>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Adicionar Usuário</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {siteUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Nenhum usuário adicionado além de você.
                </p>
              ) : (
                <div className="space-y-4">
                  {siteUsers.map((siteUser) => (
                    <div
                      key={siteUser.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {siteUser.user.full_name || siteUser.user.email}
                          </p>
                          <p className="text-sm text-gray-600">{siteUser.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={siteUser.role}
                          onChange={(e) => handleUpdateUserRole(siteUser.user_id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                          disabled={siteUser.user_id === user?.id}
                        >
                          <option value="owner">Proprietário</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Visualizador</option>
                        </select>
                        {siteUser.user_id !== user?.id && (
                          <button
                            onClick={() => handleRemoveUser(siteUser.user_id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Remover usuário"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Usuário</h3>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail do Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
