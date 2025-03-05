import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, Save, Plus, Trash2, Mail, AlertCircle, CheckCircle, ToggleLeft as Toggle, Archive } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeadSettings {
  id: string;
  site_id: string;
  is_enabled: boolean;
  notification_email: string;
  success_message: string;
  form_title: string;
  button_text: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  auto_response_enabled: boolean;
  auto_response_subject: string;
  auto_response_body: string;
}

interface Lead {
  id: string;
  site_id: string;
  data: Record<string, any>;
  created_at: string;
  source_url: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  notes?: string;
  assigned_to?: string;
  last_contact?: string;
}

export function SiteLeads() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false
  });

  useEffect(() => {
    loadLeadSettings();
    loadLeads();
  }, [siteId]);

  async function loadLeadSettings() {
    if (!siteId) return;

    try {
      let { data: settings, error } = await supabase
        .from('lead_settings')
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle();

      if (!settings && !error) {
        // Se não existir configurações, criar as padrões
        const defaultSettings = {
          site_id: siteId,
          is_enabled: false,
          notification_email: '',
          success_message: 'Obrigado pelo contato! Em breve retornaremos.',
          form_title: 'Entre em contato',
          button_text: 'Enviar',
          fields: [
            { name: 'name', label: 'Nome', type: 'text', required: true },
            { name: 'email', label: 'E-mail', type: 'email', required: true },
            { name: 'phone', label: 'Telefone', type: 'tel', required: false },
            { name: 'message', label: 'Mensagem', type: 'textarea', required: false }
          ],
          auto_response_enabled: false,
          auto_response_subject: '',
          auto_response_body: ''
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('lead_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) {
          // Se houver erro na inserção, tentar carregar novamente
          const { data: retrySettings, error: retryError } = await supabase
            .from('lead_settings')
            .select('*')
            .eq('site_id', siteId)
            .single();

          if (retryError) throw retryError;
          settings = retrySettings;
        } else {
          settings = newSettings;
        }
      }

      if (error) throw error;
      setSettings(settings);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações de leads.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLeads() {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(leads || []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return;
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('lead_settings')
        .update(settings)
        .eq('id', settings.id);

      if (error) throw error;

      setSuccessMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = () => {
    if (!settings) return;

    const fields = [...settings.fields];
    fields.push(newField);

    setSettings({
      ...settings,
      fields
    });

    setShowFieldModal(false);
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false
    });
  };

  const handleRemoveField = (index: number) => {
    if (!settings) return;

    const fields = [...settings.fields];
    fields.splice(index, 1);

    setSettings({
      ...settings,
      fields
    });
  };

  const handleUpdateLeadStatus = async (leadId: string, status: Lead['status'], notes?: string) => {
    try {
      const { error } = await supabase.rpc('update_lead_status', {
        p_lead_id: leadId,
        p_status: status,
        p_notes: notes
      });

      if (error) throw error;
      await loadLeads();
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
      setError('Erro ao atualizar status do lead. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Erro ao carregar configurações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-gray-600">
            Gerencie a captação de leads do seu site
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Formulário */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Configurações do Formulário</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Ativar Captação de Leads
                </label>
                <button
                  onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail para Notificações
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Formulário
                </label>
                <input
                  type="text"
                  value={settings.form_title}
                  onChange={(e) => setSettings({ ...settings, form_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={settings.button_text}
                  onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Sucesso
                </label>
                <textarea
                  value={settings.success_message}
                  onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Campos do Formulário</h2>
                <button
                  onClick={() => setShowFieldModal(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Adicionar Campo</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {settings.fields.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Nenhum campo configurado. Adicione campos ao seu formulário.
                </p>
              ) : (
                <div className="space-y-4">
                  {settings.fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{field.label}</p>
                        <p className="text-sm text-gray-600">
                          Tipo: {field.type} | Nome: {field.name} |{' '}
                          {field.required ? 'Obrigatório' : 'Opcional'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Remover campo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Resposta Automática</h2>
                <button
                  onClick={() => setSettings({ ...settings, auto_response_enabled: !settings.auto_response_enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.auto_response_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.auto_response_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            {settings.auto_response_enabled && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto do E-mail
                  </label>
                  <input
                    type="text"
                    value={settings.auto_response_subject}
                    onChange={(e) => setSettings({ ...settings, auto_response_subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Recebemos sua mensagem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo do E-mail
                  </label>
                  <textarea
                    value={settings.auto_response_body}
                    onChange={(e) => setSettings({ ...settings, auto_response_body: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={5}
                    placeholder="Olá {name},&#10;&#10;Recebemos sua mensagem e retornaremos em breve.&#10;&#10;Atenciosamente,&#10;Equipe {site_name}"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Leads Recebidos</h2>
          </div>
          <div className="p-6">
            {leads.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Nenhum lead recebido ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {lead.data.name || 'Sem nome'}
                        </h3>
                        <p className="text-sm text-gray-600">{lead.data.email}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status === 'new' ? 'Novo' :
                         lead.status === 'contacted' ? 'Contatado' :
                         lead.status === 'converted' ? 'Convertido' :
                         'Arquivado'}
                      </span>
                    </div>

                    {lead.data.message && (
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                        {lead.data.message}
                      </p>
                    )}

                    <div className="flex justify-end space-x-2">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                        >
                          Marcar como Contatado
                        </button>
                      )}
                      {lead.status === 'contacted' && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'converted')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                        >
                          Marcar como Convertido
                        </button>
                      )}
                      {lead.status !== 'archived' && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'archived')}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                        >
                          Arquivar
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

      {/* Modal de Adicionar Campo */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Campo</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Campo (ID)
                </label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nome_do_campo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rótulo
                </label>
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do Campo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Texto</option>
                  <option value="email">E-mail</option>
                  <option value="tel">Telefone</option>
                  <option value="textarea">Área de Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Data</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                  Campo obrigatório
                </label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFieldModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddField}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
