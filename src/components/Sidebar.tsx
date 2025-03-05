import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  User, 
  LogOut, 
  Users,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { siteId } = useParams();
  const location = useLocation();
  const showSiteMenu = location.pathname.includes('/sites/') && siteId;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">MultiSite CMS</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Painel</span>
        </NavLink>
        
        <NavLink
          to="/sites"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Globe size={20} />
          <span>Sites</span>
        </NavLink>

        {showSiteMenu && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                Gerenciar Site
              </div>
            </div>

            <NavLink
              to={`/sites/${siteId}/pages`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FileText size={20} />
              <span>Páginas</span>
            </NavLink>

            <NavLink
              to={`/sites/${siteId}/leads`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <MessageSquare size={20} />
              <span>Leads</span>
            </NavLink>

            <NavLink
              to={`/sites/${siteId}/settings`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Settings size={20} />
              <span>Configurações</span>
            </NavLink>
          </>
        )}

        <div className="pt-4 pb-2">
          <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
            Sistema
          </div>
        </div>

        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Users size={20} />
          <span>Usuários</span>
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <User size={20} />
          <span>Meu Perfil</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-4 py-2 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}