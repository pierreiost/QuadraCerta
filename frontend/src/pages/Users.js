import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MaskedInput from '../components/MaskedInput';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PermissionCheckboxes from '../components/PermissionCheckboxes';
import { userService, permissionService } from '../services/api';
import {
  Users as UsersIcon,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Check,
  Key,
  Shield,
  User,
  Mail,
  Phone
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    role: 'SEMI_ADMIN'
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'permissions'

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (showModal || showResetPasswordModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showResetPasswordModal]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }

    if (error) setError('');
  };

  const handleResetPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData({
      ...resetPasswordData,
      [name]: value
    });

    if (error) setError('');
  };

  const openModal = async (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        phone: user.phone,
        cpf: user.cpf || '',
        role: user.role
      });

      // NOVO: Carregar permissões se for SEMI_ADMIN
      if (user.role === 'SEMI_ADMIN') {
        try {
          const response = await permissionService.getUserPermissions(user.id);
          setSelectedPermissions(response.data.permissionIds || []);
        } catch (error) {
          console.error('Erro ao carregar permissões:', error);
        }
      }
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'SEMI_ADMIN'
      });
      
      // NOVO: Carregar permissões padrão de "visualizar"
      try {
        const response = await permissionService.getAll();
        const viewPermIds = response.data.permissions
          .filter(p => p.action === 'view') // Filtra apenas permissões 'view'
          .map(p => p.id); // Pega os IDs
        setSelectedPermissions(viewPermIds); // Define como selecionadas
      } catch (err) {
        console.error("Erro ao carregar permissões padrão", err);
        setSelectedPermissions([]); // Em caso de erro, começa vazio
      }
    }

    setActiveTab('info'); // NOVO: Sempre começa na aba de informações
    setShowModal(true);
    setError('');
    setFieldErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      cpf: '',
      role: 'SEMI_ADMIN'
    });
    setError('');
    setFieldErrors({});
  };

  const handleModalClose = () => {
    const hasData = formData.firstName || formData.lastName || formData.email || formData.phone;

    if (hasData && !editingUser) {
      const confirmClose = window.confirm('Tem certeza? Dados não salvos serão perdidos.');
      if (!confirmClose) return;
    }

    closeModal();
  };

  const openResetPasswordModal = (user) => {
    setResetPasswordUser(user);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowResetPasswordModal(true);
    setError('');
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setResetPasswordUser(null);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido';
      }
    }

    if (!editingUser && !formData.password) {
      errors.password = 'Senha é obrigatória para novo usuário';
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'Senha deve ter no mínimo 8 caracteres';
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Senha deve conter letras minúsculas';
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Senha deve conter letras maiúsculas';
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Senha deve conter números';
      } else if (!/[@$!%*?&#]/.test(formData.password)) {
        errors.password = 'Senha deve conter caracteres especiais';
      }
    }

    if (!formData.phone) {
      errors.phone = 'Telefone é obrigatório';
    } else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        errors.phone = 'Telefone inválido';
      }
    }

    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        errors.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Por favor, corrija os erros antes de continuar');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        // NOVO: Enviar permissões na criação
        const createData = {
          ...formData,
          permissionIds: selectedPermissions // Adiciona os IDs das permissões
        };
        await userService.create(createData);
        setSuccess('Usuário cadastrado com sucesso!');
      }
      closeModal();
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetPasswordData.newPassword) {
      setError('Nova senha é obrigatória');
      return;
    }

    if (resetPasswordData.newPassword.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await userService.resetPassword(resetPasswordUser.id, resetPasswordData.newPassword);
      setSuccess('Senha resetada com sucesso!');
      closeResetPasswordModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao resetar senha');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      await userService.delete(id);
      setSuccess('Usuário deletado com sucesso!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao deletar usuário');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handlePermissionsChange = (permissionIds) => {
    setSelectedPermissions(permissionIds);
  };

  const savePermissions = async (userId) => {
    try {
      await permissionService.updateUserPermissions(userId, selectedPermissions);
      setSuccess('Permissões atualizadas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setError(error.response?.data?.error || 'Erro ao salvar permissões');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { class: 'badge-danger', text: 'Administrador' },
      SEMI_ADMIN: { class: 'badge-info', text: 'Funcionário' }
    };
    return badges[role] || { class: 'badge', text: role };
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: '2rem' }}>
          <div className="flex-center" style={{ minHeight: '50vh' }}>
            <div className="loading" style={{ width: '50px', height: '50px', borderWidth: '5px' }}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '2rem' }}>

        <div className="flex-between" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-bold text-2xl">Gerenciar Usuários</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              Gerencie os usuários e funcionários do sistema
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={18} />
            Novo Usuário
          </button>
        </div>

        {error && !showModal && !showResetPasswordModal && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {users.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <UsersIcon size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3 className="font-bold text-lg" style={{ marginBottom: '0.5rem' }}>
              Nenhum usuário cadastrado
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Comece cadastrando seu primeiro funcionário
            </p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <PlusCircle size={18} />
              Cadastrar Primeiro Usuário
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Função</th>
                    <th>Cadastrado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} style={{ color: 'var(--text-light)' }} />
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} style={{ color: 'var(--text-light)' }} />
                            {user.email}
                          </div>
                        </td>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={14} style={{ color: 'var(--text-light)' }} />
                            {user.phone}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${roleBadge.class}`}>
                            {roleBadge.text}
                          </span>
                        </td>
                        <td>
                          {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td>
                          <div className="flex" style={{ gap: '0.5rem' }}>
                            <button
                              className="btn-icon"
                              onClick={() => openModal(user)}
                              title="Editar usuário"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => openResetPasswordModal(user)}
                              title="Resetar senha"
                            >
                              <Key size={18} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDelete(user.id)}
                              title="Deletar usuário"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Criar/Editar */}
        {showModal && (
          <div className="modal-overlay" onClick={handleModalClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="card" style={{ margin: 0 }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="font-bold text-xl">
                    {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </h2>
                  <button onClick={handleModalClose} className="btn-icon">
                    <X size={24} />
                  </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* NOVO: Tabs (modificado para aparecer na criação) */}
                {formData.role === 'SEMI_ADMIN' && (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('info')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'info' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'info' ? 'var(--primary-color)' : '#6b7280',
                        fontWeight: activeTab === 'info' ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      📋 Informações
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('permissions')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'permissions' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'permissions' ? 'var(--primary-color)' : '#6b7280',
                        fontWeight: activeTab === 'permissions' ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Shield size={18} />
                      Permissões
                    </button>
                  </div>
                )}

                {/* Conteúdo das Tabs */}
                {activeTab === 'info' ? (
                  <form onSubmit={handleSubmit}>
                    {/* INÍCIO: Conteúdo do Formulário Adicionado */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="input-group">
                        <label htmlFor="firstName">Nome *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Nome do funcionário"
                          className={fieldErrors.firstName ? 'input-error' : ''}
                        />
                        {fieldErrors.firstName && <small className="error-message">{fieldErrors.firstName}</small>}
                      </div>

                      <div className="input-group">
                        <label htmlFor="lastName">Sobrenome *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Sobrenome do funcionário"
                          className={fieldErrors.lastName ? 'input-error' : ''}
                        />
                        {fieldErrors.lastName && <small className="error-message">{fieldErrors.lastName}</small>}
                      </div>

                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@exemplo.com"
                          className={fieldErrors.email ? 'input-error' : ''}
                        />
                        {fieldErrors.email && <small className="error-message">{fieldErrors.email}</small>}
                      </div>

                      <div className="input-group">
                        <label htmlFor="phone">Telefone *</label>
                        <MaskedInput
                          mask="phone"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(XX) XXXXX-XXXX"
                          className={fieldErrors.phone ? 'input-error' : ''}
                        />
                        {fieldErrors.phone && <small className="error-message">{fieldErrors.phone}</small>}
                      </div>

                      <div className="input-group">
                        <label htmlFor="cpf">CPF (Opcional)</label>
                        <MaskedInput
                          mask="cpf"
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                          className={fieldErrors.cpf ? 'input-error' : ''}
                        />
                        {fieldErrors.cpf && <small className="error-message">{fieldErrors.cpf}</small>}
                      </div>

                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label htmlFor="role">Função *</label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                        >
                          <option value="SEMI_ADMIN">Funcionário</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>

                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label htmlFor="password">
                          {editingUser ? 'Nova Senha (Opcional)' : 'Senha *'}
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder={editingUser ? 'Deixe em branco para manter a senha' : '••••••••'}
                          className={fieldErrors.password ? 'input-error' : ''}
                        />
                        {fieldErrors.password ? (
                          <small className="error-message">{fieldErrors.password}</small>
                        ) : (
                          <small className="text-sm text-muted">
                            Mín. 8 caracteres, com maiúsculas, minúsculas, números e símbolos.
                          </small>
                        )}
                      </div>
                    </div>
                    {/* FIM: Conteúdo do Formulário Adicionado */}

                    {/* Botões */}
                    <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                      >
                        <X size={18} />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        <Check size={18} />
                        {editingUser ? 'Atualizar' : 'Cadastrar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {/* NOVO: Aba de Permissões */}
                    <PermissionCheckboxes
                      userId={editingUser?.id}
                      onPermissionsChange={handlePermissionsChange}
                    />

                    <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                      >
                        <X size={18} />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => editingUser ? savePermissions(editingUser.id) : setActiveTab('info')}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        {editingUser ? <><Shield size={18} /> Salvar Permissões</> : 'Salvar e Próximo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Resetar Senha */}
        {showResetPasswordModal && (
          <div className="modal-overlay" onClick={closeResetPasswordModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="card" style={{ margin: 0 }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="font-bold text-xl">Resetar Senha</h2>
                  <button onClick={closeResetPasswordModal} className="btn-icon">
                    <X size={24} />
                  </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                  <p className="font-bold">
                    {resetPasswordUser?.firstName} {resetPasswordUser?.lastName}
                  </p>
                  <p className="text-sm text-muted">{resetPasswordUser?.email}</p>
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="input-group">
                    <label htmlFor="newPassword">Nova Senha *</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={resetPasswordData.newPassword}
                      onChange={handleResetPasswordInputChange}
                      required
                      placeholder="••••••••"
                    />
                    <small className="text-sm text-muted">Mín. 8 caracteres</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmar Senha *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={resetPasswordData.confirmPassword}
                      onChange={handleResetPasswordInputChange}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={closeResetPasswordModal}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      <Key size={18} />
                      Resetar Senha
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersPage;