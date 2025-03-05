import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Mail, 
  Trash2, 
  Shield, 
  Search,
  UserPlus,
  Edit2,
  Key,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

type ModalType = 'create' | 'edit' | 'password';

export function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'editor'
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;
      setCurrentUser(userData);
    } catch (err) {
      console.error('Erro ao carregar usuário atual:', err);
    }
  }

  async function loadUsers() {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(users || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const isAdmin = currentUser?.role === 'admin';

  const handleOpenModal = (type: ModalType, userData?: User) => {
    if (!isAdmin && type === 'create') {
      setError('Apenas administradores podem criar novos usuários.');
      return;
    }

    setModalType(type);
    setError(null);
    setSuccessMessage(null);

    if (type === 'edit' && userData) {
      setSelectedUser(userData);
      setFormData({
        email: userData.email,
        password: '',
        full_name: userData.full_name || '',
        role: userData.role
      });
    } else if (type === 'password' && userData) {
      setSelectedUser(userData);
      setPasswordData({
        newPassword: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'editor'
      });
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Apenas administradores podem criar novos usuários.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Primeiro, criar o usuário na autenticação
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Este e-mail já está registrado.');
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário: nenhum dado retornado');
      }

      setSuccessMessage('Usuário criado com sucesso!');
      handleCloseModal();
      await loadUsers();
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      setError(err.message || 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!isAdmin && selectedUser.id !== user?.id) {
      setError('Você não tem permissão para editar este usuário.');
      return;
    }

    // Usuários não-admin só podem editar seus dados básicos
    if (!isAdmin && selectedUser.id === user?.id) {
      formData.role = currentUser?.role || 'editor';
    }

    setError(null);
    setIsProcessing(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      setSuccessMessage('Usuário atualizado com sucesso!');
      await loadUsers();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!isAdmin && selectedUser.id !== user?.id) {
      setError('Você não tem permissão para alterar a senha deste usuário.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      if (selectedUser.id === user?.id) {
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword
        });
        if (error) throw error;
      } else {
        throw new Error('Apenas administradores podem redefinir senhas de outros usuários.');
      }

      setSuccessMessage('Senha atualizada com sucesso!');
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      setError('Apenas administradores podem excluir usuários.');
      return;
    }

    if (userId === user?.id) {
      setError('Você não pode excluir sua própria conta.');
      return;
    }

    // Verificar se o usuário a ser excluído é um administrador
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      setError('Não é possível excluir outro administrador.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsProcessing(true);
    try {
      // Chamar a função RPC para excluir o usuário
      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) throw error;

      setSuccessMessage('Usuário excluído com sucesso!');
      await loadUsers();
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(err.message || 'Erro ao excluir usuário. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-gray-600">
            Gerencie os usuários do sistema
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal('create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Novo Usuário</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <Lock size={20} />
          <span>Apenas administradores podem gerenciar usuários. Você pode apenas visualizar seus próprios dados.</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuários..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                Nenhum usuário encontrado.
              </p>
            ) : (
              filteredUsers.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UsersIcon size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData.full_name || 'Sem nome'}
                      </p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield size={14} className={userData.role === 'admin' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`text-sm capitalize ${userData.role === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                          {userData.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(isAdmin || userData.id === user?.id) && (
                      <>
                        <button
                          onClick={() => handleOpenModal('edit', userData)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Editar usuário"
                          disabled={isProcessing}
                        >
                          <Edit2 size={18} />
                        </button>
                        {userData.id === user?.id && (
                          <button
                            onClick={() => handleOpenModal('password', userData)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Alterar senha"
                            disabled={isProcessing}
                          >
                            <Key size={18} />
                          </button>
                        )}
                      </>
                    )}
                    {isAdmin && userData.id !== user?.id && userData.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(userData.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Excluir usuário"
                        disabled={isProcessing}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar/Editar Usuário */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário'}
              </h3>
            </div>
            <form onSubmit={modalType === 'create' ? handleCreateUser : handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={modalType === 'edit'}
                  />
                </div>
              </div>

              {modalType === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {(isAdmin || modalType === 'create') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Função
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isAdmin && modalType === 'edit'}
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Visualizador</option>
                    {isAdmin && <option value="admin">Administrador</option>}
                  </select>
                </div>
              )}

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
                  {isProcessing ? 'Processando...' : modalType === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alterar Senha */}
      {modalType === 'password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
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
                  {isProcessing ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
