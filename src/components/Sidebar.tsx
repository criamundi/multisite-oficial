import React, { useState } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  User, 
  LogOut, 
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { siteId } = useParams();
  const location = useLocation();
  const showSiteMenu = location.pathname.includes('/sites/') && siteId;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`w-${isCollapsed ? '16' : '64'} transition-all bg-white border-r border-gray-200 h-full flex flex-col`}>
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-2xl font-bold text-gray-800">Criamundi</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 px-1 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <LayoutDashboard size={20} />
          {!isCollapsed && <span>Painel</span>}
        </NavLink>
        
        <NavLink
          to="/sites"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Globe size={20} />
          {!isCollapsed && <span>Sites</span>}
        </NavLink>

        {showSiteMenu && (
          <>
            <div className="pt-4 pb-2">
              {!isCollapsed && (
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                  Gerenciar Site
                </div>
              )}
            </div>

            <NavLink
              to={`/sites/${siteId}/pages`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FileText size={20} />
              {!isCollapsed && <span>Páginas</span>}
            </NavLink>

            <NavLink
              to={`/sites/${siteId}/leads`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <MessageSquare size={20} />
              {!isCollapsed && <span>Leads</span>}
            </NavLink>

            <NavLink
              to={`/sites/${siteId}/settings`}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Settings size={20} />
              {!isCollapsed && <span>Configurações</span>}
            </NavLink>
          </>
        )}

        <div className="pt-4 pb-2">
          {!isCollapsed && (
            <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
              Sistema
            </div>
          )}
        </div>

        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Users size={20} />
          {!isCollapsed && <span>Usuários</span>}
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <User size={20} />
          {!isCollapsed && <span>Meu Perfil</span>}
        </NavLink>
      </nav>
      
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-2 py-2 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}
