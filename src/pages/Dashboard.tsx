import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  Activity,
  Plus,
  Settings,
  Eye,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Site {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalSites: number;
  activeSites: number;
  recentActivity: {
    type: 'create' | 'update' | 'settings';
    siteName: string;
    siteId: string;
    date: string;
  }[];
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    activeSites: 0,
    recentActivity: []
  });
  const [recentSites, setRecentSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Carregar sites
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (sitesError) throw sitesError;

      // Calcular estatísticas
      const { data: allSites, error: statsError } = await supabase
        .from('sites')
        .select('status');

      if (statsError) throw statsError;

      const activeSites = allSites?.filter(site => site.status === 'active').length || 0;

      setStats({
        totalSites: allSites?.length || 0,
        activeSites,
        recentActivity: sites?.map(site => ({
          type: 'create',
          siteName: site.name,
          siteId: site.id,
          date: new Date(site.created_at).toLocaleDateString('pt-BR')
        })) || []
      });

      setRecentSites(sites || []);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Bem-vindo, {user?.email}
          </p>
        </div>
        <button
          onClick={() => navigate('/sites')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Site</span>
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Sites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sites Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Atividade</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSites > 0 
                  ? `${Math.round((stats.activeSites / stats.totalSites) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Recentes e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sites Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Sites Recentes</h2>
              <button
                onClick={() => navigate('/sites')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Ver todos</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentSites.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Nenhum site criado ainda. Comece criando seu primeiro site!
              </p>
            ) : (
              <div className="space-y-4">
                {recentSites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Globe size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-600">{site.domain}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/sites/${site.id}/preview`)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/sites/${site.id}/settings`)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Configurações"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
          </div>
          <div className="p-6">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Nenhuma atividade recente para exibir.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full mt-1">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">
                        Site <span className="font-medium">{activity.siteName}</span> foi criado
                      </p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/sites')}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus size={20} className="text-blue-600" />
              <span className="font-medium text-gray-900">Criar Novo Site</span>
            </button>
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} className="text-gray-600" />
              <span className="font-medium text-gray-900">Configurar Perfil</span>
            </button>
            <button
              onClick={() => window.open('https://docs.example.com', '_blank')}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard size={20} className="text-purple-600" />
              <span className="font-medium text-gray-900">Ver Documentação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
