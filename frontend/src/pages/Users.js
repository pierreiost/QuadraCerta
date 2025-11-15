import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MaskedInput from '../components/MaskedInput';
import PermissionCheckboxes from '../components/PermissionCheckboxes';
import { userService, permissionService } from '../services/api';
import { Users as UsersIcon, PlusCircle, Edit2, Trash2, X, Check, Key, Shield, UserCheck, UserX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [defaultPermissions, setDefaultPermissions] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    role: 'SEMI_ADMIN'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUsers();
    loadDefaultPermissions();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError(error.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultPermissions = async () => {
    try {
      const response = await permissionService.getAll();
      const allPermissions = response.data.permissions;
      
      const basicPermissions = allPermissions.filter(p => 
        (p.module === 'dashboard' && p.action === 'view') ||
        (p.module === 'products' && p.action === 'view') ||
        (p.module === 'clients' && p.action === 'view') ||
        (p.module === 'courts' && p.action === 'view') ||
        (p.module === 'reservations' && p.action === 'view') ||
        (p.module === 'tabs' && p.action === 'view') ||
        (p.module === 'notifications' && p.action === 'view')
      );
      
      const basicPermissionIds = basicPermissions.map(p => p.id);
      setDefaultPermissions(basicPermissionIds);
      
    } catch (error) {
      console.error('Erro ao carregar permissões padrão:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
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
      
      if (user.role === 'SEMI_ADMIN') {
        try {
          const response = await permissionService.getUserPermissions(user.id);
          setSelectedPermissions(response.data.permissionIds || []);
        } catch (error) {
          console.error('Erro ao carregar permissões:', error);
          setSelectedPermissions([]);
        }
      } else {
        setSelectedPermissions([]);
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
      setSelectedPermissions([...defaultPermissions]);
    }
    
    setActiveTab('info');
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
    setSelectedPermissions([]);
    setActiveTab('info');
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
      errors.password = 'Senha é obrigatória';
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
        errors.password = 'Senha deve conter caracteres especiais (@$!%*?&#)';
      }
    }

    if (!formData.phone) {
      errors.phone = 'Telefone é obrigatório';
    } else {
      const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Telefone inválido. Use (XX) XXXXX-XXXX';
      }
    }

    if (formData.cpf) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(formData.cpf)) {
        errors.cpf = 'CPF inválido. Use XXX.XXX.XXX-XX';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const dataToSend = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        cpf: formData.cpf || null,
        role: formData.role
      };

      if (!editingUser) {
        dataToSend.password = formData.password;
        
        if (formData.role === 'SEMI_ADMIN' && selectedPermissions.length > 0) {
          dataToSend.permissionIds = selectedPermissions;
        }
      }

      if (editingUser) {
        await userService.update(editingUser.id, dataToSend);
      } else {
        await userService.create(dataToSend);
      }

      setSuccess(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
      await loadUsers();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setError(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await userService.delete(userId);
      setSuccess('Funcionário excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError(error.response?.data?.error || 'Erro ao excluir funcionário');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

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
      setTimeout(() => setSuccess(''), 3000);
      closeResetPasswordModal();
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setError(error.response?.data?.error || 'Erro ao resetar senha');
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

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#06b6d4', '#6366f1', '#14b8a6'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const employeeCount = users.filter(u => u.role === 'SEMI_ADMIN').length;

  return (
    <div className="page">
      <Header />
      
      <div className="container">
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="font-bold text-2xl flex items-center" style={{ gap: '0.75rem', marginBottom: '0.5rem', marginTop: '2rem' }}>
              <UsersIcon size={32} color="#34a853" />
              Gerenciar Funcionários
            </h1>
            <p className="text-muted">Gerencie os usuários e suas permissões no sistema</p>
          </div>
          
          <button onClick={() => openModal()} className="btn btn-primary">
            <PlusCircle size={20} />
            Novo Funcionário
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            <Check size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <X size={18} />
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#e0f2fe' }}>
              <UsersIcon size={24} color="#0284c7" />
            </div>
            <div>
              <div className="metric-label">Total de Usuários</div>
              <div className="metric-value">{totalUsers}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#fef3c7' }}>
              <Shield size={24} color="#f59e0b" />
            </div>
            <div>
              <div className="metric-label">Administradores</div>
              <div className="metric-value">{adminCount}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#dbeafe' }}>
              <UserCheck size={24} color="#3b82f6" />
            </div>
            <div>
              <div className="metric-label">Funcionários</div>
              <div className="metric-value">{employeeCount}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <p className="text-muted text-center">Carregando funcionários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <UserX size={48} color="#9ca3af" />
              <h3>Nenhum funcionário cadastrado</h3>
              <p>Comece adicionando o primeiro funcionário ao sistema</p>
              <button onClick={() => openModal()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <PlusCircle size={20} />
                Adicionar Funcionário
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {users.map(user => (
              <div key={user.id} className="card" style={{
                padding: '1.5rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: getAvatarColor(user.firstName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openModal(user)}
                      className="btn-icon btn-icon-success"
                      title="Editar funcionário"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => openResetPasswordModal(user)}
                      className="btn-icon btn-icon-warning"
                      title="Resetar senha"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn-icon btn-icon-danger"
                      title="Excluir funcionário"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: '#1f2937'
                }}>
                  {user.firstName} {user.lastName}
                </h3>

                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {user.email}
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Cargo</span>
                    <span style={{
                      fontWeight: '500',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      backgroundColor: user.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
                      color: user.role === 'ADMIN' ? '#92400e' : '#1e40af'
                    }}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Telefone</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{user.phone}</span>
                  </div>

                  {user.cpf && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: '#6b7280' }}>CPF</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>{user.cpf}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>Cadastrado em</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>
                      {format(parseISO(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
              <button onClick={handleModalClose} className="btn-icon">
                <X size={24} />
              </button>
            </div>

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Informações
              </button>
              {editingUser && editingUser.role === 'SEMI_ADMIN' && (
                <button
                  className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('permissions')}
                >
                  Permissões
                </button>
              )}
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <X size={18} />
                  {error}
                </div>
              )}

              {activeTab === 'info' ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">Nome *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={fieldErrors.firstName ? 'error' : ''}
                        placeholder="Digite o nome"
                      />
                      {fieldErrors.firstName && (
                        <span className="error-message">{fieldErrors.firstName}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Sobrenome *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={fieldErrors.lastName ? 'error' : ''}
                        placeholder="Digite o sobrenome"
                      />
                      {fieldErrors.lastName && (
                        <span className="error-message">{fieldErrors.lastName}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={fieldErrors.email ? 'error' : ''}
                      placeholder="email@exemplo.com"
                    />
                    {fieldErrors.email && (
                      <span className="error-message">{fieldErrors.email}</span>
                    )}
                  </div>

                  {!editingUser && (
                    <div className="form-group">
                      <label htmlFor="password">Senha *</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={fieldErrors.password ? 'error' : ''}
                        placeholder="Mínimo 8 caracteres"
                      />
                      {fieldErrors.password && (
                        <span className="error-message">{fieldErrors.password}</span>
                      )}
                      <small className="text-sm text-muted">
                        A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais
                      </small>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Telefone *</label>
                      <MaskedInput
                        mask="(99) 99999-9999"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={fieldErrors.phone ? 'error' : ''}
                        placeholder="(00) 00000-0000"
                      />
                      {fieldErrors.phone && (
                        <span className="error-message">{fieldErrors.phone}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cpf">CPF</label>
                      <MaskedInput
                        mask="999.999.999-99"
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        className={fieldErrors.cpf ? 'error' : ''}
                        placeholder="000.000.000-00"
                      />
                      {fieldErrors.cpf && (
                        <span className="error-message">{fieldErrors.cpf}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Cargo *</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={editingUser}
                    >
                      <option value="SEMI_ADMIN">Funcionário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                    <small className="text-sm text-muted">
                      Administradores têm acesso total ao sistema
                    </small>
                  </div>

                  {!editingUser && formData.role === 'SEMI_ADMIN' && (
                    <div style={{
                      padding: '1rem',
                      background: '#eff6ff',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      marginTop: '1rem'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Shield size={16} />
                        Este funcionário receberá permissões básicas de visualização automaticamente
                      </p>
                    </div>
                  )}

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
                  <PermissionCheckboxes
                    selectedPermissions={selectedPermissions}
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
                      onClick={() => savePermissions(editingUser.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      <Check size={18} />
                      Salvar Permissões
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div className="modal-overlay" onClick={closeResetPasswordModal}>
          <div className="modal-content" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resetar Senha</h2>
              <button onClick={closeResetPasswordModal} className="btn-icon">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <X size={18} />
                  {error}
                </div>
              )}

              <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                Resetando senha de: <strong>{resetPasswordUser?.firstName} {resetPasswordUser?.lastName}</strong>
              </p>

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="newPassword">Nova Senha</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    placeholder="Digite a senha novamente"
                    required
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
  );
};

export default Users;