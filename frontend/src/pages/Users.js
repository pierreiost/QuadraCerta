import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MaskedInput from '../components/MaskedInput';
import { userService } from '../services/api';
import { Users, Edit2, Trash2, PlusCircle, X, User, Phone, Mail, Check, Key } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const openModal = (user = null) => {
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
    }
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
        await userService.create(formData);
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
            <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
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
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="card" style={{ margin: 0 }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="font-bold text-xl">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h2>
                  <button onClick={closeModal} className="btn-icon">
                    <X size={24} />
                  </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-2">
                    <div className="input-group">
                      <label htmlFor="firstName">Nome *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="João"
                      />
                      {fieldErrors.firstName && (
                        <span className="text-sm text-danger">{fieldErrors.firstName}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label htmlFor="lastName">Sobrenome *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Silva"
                      />
                      {fieldErrors.lastName && (
                        <span className="text-sm text-danger">{fieldErrors.lastName}</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="usuario@email.com"
                    />
                    {fieldErrors.email && (
                      <span className="text-sm text-danger">{fieldErrors.email}</span>
                    )}
                  </div>

                  {!editingUser && (
                    <div className="input-group">
                      <label htmlFor="password">Senha *</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingUser}
                        placeholder="••••••••"
                      />
                      <small className="text-sm text-muted">
                        Mín. 8 caracteres, maiúsculas, minúsculas, números e especiais
                      </small>
                      {fieldErrors.password && (
                        <span className="text-sm text-danger">{fieldErrors.password}</span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-2">
                    <div className="input-group">
                      <label htmlFor="phone">Telefone *</label>
                      <MaskedInput
                        mask="phone"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(00) 00000-0000"
                      />
                      {fieldErrors.phone && (
                        <span className="text-sm text-danger">{fieldErrors.phone}</span>
                      )}
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
                      />
                      {fieldErrors.cpf && (
                        <span className="text-sm text-danger">{fieldErrors.cpf}</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="role">Função *</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="SEMI_ADMIN">Funcionário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                    <small className="text-sm text-muted">
                      Administradores têm acesso total ao sistema
                    </small>
                  </div>

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