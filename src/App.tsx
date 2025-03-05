import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Sites } from './pages/Sites';
import { SiteSettings } from './pages/SiteSettings';
import { SitePreview } from './pages/SitePreview';
import { SitePages } from './pages/SitePages';
import { SiteLeads } from './pages/SiteLeads';
import { PageEditor } from './pages/PageEditor';
import { PublicPage } from './pages/PublicPage';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Rota pública para visualização de páginas */}
          <Route path="/sites/:siteId/p/:slug" element={<PublicPage />} />
          {/* Rotas protegidas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sites" element={<Sites />} />
            <Route path="sites/:siteId/settings" element={<SiteSettings />} />
            <Route path="sites/:siteId/preview" element={<SitePreview />} />
            <Route path="sites/:siteId/pages" element={<SitePages />} />
            <Route path="sites/:siteId/pages/:pageId" element={<PageEditor />} />
            <Route path="sites/:siteId/leads" element={<SiteLeads />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="perfil" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;