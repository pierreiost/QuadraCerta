// frontend/src/pages/Clients.js

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MaskedInput from '../components/MaskedInput';
import { clientService } from '../services/api';
import { Users, Edit2, Trash2, PlusCircle, X, User, Phone, Mail, Check } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cpf: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const loadClients = async () => {
    try {
      const response = await clientService.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
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

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        fullName: client.fullName,
        phone: client.phone,
        email: client.email || '',
        cpf: client.cpf || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        cpf: ''
      });
    }
    setShowModal(true);
    setError('');
    setFieldErrors({});
  };

  const closeModal = () => {
    const hasData = formData.fullName || formData.phone || formData.email || formData.cpf;
    
    if (hasData) {
      const confirmClose = window.confirm('Tem certeza? Dados não salvos serão perdidos.');
      if (!confirmClose) return;
    }
    
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      cpf: ''
    });
    setError('');
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      errors.fullName = 'Nome completo deve ter pelo menos 3 caracteres';
    }

    if (!formData.phone) {
      errors.phone = 'Telefone é obrigatório';
    } else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        errors.phone = 'Telefone inválido';
      }
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email inválido';
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
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        await clientService.create(formData);
        setSuccess('Cliente cadastrado com sucesso!');
      }
      closeModal();
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar cliente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente?')) {
      return;
    }

    try {
      await clientService.delete(id);
      setSuccess('Cliente deletado com sucesso!');
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao deletar cliente');
      setTimeout(() => setError(''), 5000);
    }
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
            <h1 className="font-bold text-2xl">Clientes</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              Gerencie seus clientes cadastrados
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={18} />
            Novo Cliente
          </button>
        </div>

        {error && !showModal && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {clients.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3 className="font-bold text-lg" style={{ marginBottom: '0.5rem' }}>
              Nenhum cliente cadastrado
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Comece cadastrando seu primeiro cliente
            </p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <PlusCircle size={18} />
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <User size={14} style={{ color: 'var(--text-light)' }} />
                          {client.fullName}
                        </div>
                      </td>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} style={{ color: 'var(--text-light)' }} />
                          {client.phone}
                        </div>
                      </td>
                      <td>
                        {client.email ? (
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} style={{ color: 'var(--text-light)' }} />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{client.cpf || <span className="text-muted">-</span>}</td>
                      <td>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => openModal(client)}
                            title="Editar cliente"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(client.id)}
                            title="Deletar cliente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div 
            className="modal-overlay" 
            onClick={closeModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div 
              className="modal" 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'modalSlideIn 0.3s ease-out'
              }}
            >
              <div 
                className="modal-header"
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <h2 className="font-bold text-xl" style={{ margin: 0 }}>
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button 
                  onClick={closeModal} 
                  className="btn-icon"
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {error && (
                  <div 
                    className="alert alert-danger" 
                    style={{ 
                      marginBottom: '1.5rem',
                      padding: '0.75rem 1rem',
                      background: '#FEE2E2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      color: '#991B1B',
                      fontSize: '14px'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label 
                      htmlFor="fullName"
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="João Silva Santos"
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 1rem',
                        border: fieldErrors.fullName ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '15px',
                        transition: 'border 0.15s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!fieldErrors.fullName) {
                          e.target.style.border = '2px solid #3B82F6';
                        }
                      }}
                      onBlur={(e) => {
                        if (!fieldErrors.fullName) {
                          e.target.style.border = '1px solid #E5E7EB';
                        }
                      }}
                    />
                    {fieldErrors.fullName && (
                      <span style={{ 
                        display: 'block', 
                        color: '#EF4444', 
                        fontSize: '13px', 
                        marginTop: '0.25rem' 
                      }}>
                        {fieldErrors.fullName}
                      </span>
                    )}
                  </div>

                  <div 
                    className="grid grid-2" 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: window.innerWidth > 640 ? '1fr 1fr' : '1fr',
                      gap: '1.5rem',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div className="input-group">
                      <label 
                        htmlFor="phone"
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Telefone *
                      </label>
                      <MaskedInput
                        mask="phone"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(00) 00000-0000"
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 1rem',
                          border: fieldErrors.phone ? '2px solid #EF4444' : '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border 0.15s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          if (!fieldErrors.phone) {
                            e.target.style.border = '2px solid #3B82F6';
                          }
                        }}
                        onBlur={(e) => {
                          if (!fieldErrors.phone) {
                            e.target.style.border = '1px solid #E5E7EB';
                          }
                        }}
                      />
                      {fieldErrors.phone && (
                        <span style={{ 
                          display: 'block', 
                          color: '#EF4444', 
                          fontSize: '13px', 
                          marginTop: '0.25rem' 
                        }}>
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>

                    <div className="input-group">
                      <label 
                        htmlFor="cpf"
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}
                      >
                        CPF (Opcional)
                      </label>
                      <MaskedInput
                        mask="cpf"
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 1rem',
                          border: fieldErrors.cpf ? '2px solid #EF4444' : '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border 0.15s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          if (!fieldErrors.cpf) {
                            e.target.style.border = '2px solid #3B82F6';
                          }
                        }}
                        onBlur={(e) => {
                          if (!fieldErrors.cpf) {
                            e.target.style.border = '1px solid #E5E7EB';
                          }
                        }}
                      />
                      {fieldErrors.cpf && (
                        <span style={{ 
                          display: 'block', 
                          color: '#EF4444', 
                          fontSize: '13px', 
                          marginTop: '0.25rem' 
                        }}>
                          {fieldErrors.cpf}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label 
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Email (Opcional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="cliente@email.com"
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 1rem',
                        border: fieldErrors.email ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '15px',
                        transition: 'border 0.15s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!fieldErrors.email) {
                          e.target.style.border = '2px solid #3B82F6';
                        }
                      }}
                      onBlur={(e) => {
                        if (!fieldErrors.email) {
                          e.target.style.border = '1px solid #E5E7EB';
                        }
                      }}
                    />
                    {fieldErrors.email && (
                      <span style={{ 
                        display: 'block', 
                        color: '#EF4444', 
                        fontSize: '13px', 
                        marginTop: '0.25rem' 
                      }}>
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div 
                    className="flex" 
                    style={{ 
                      display: 'flex',
                      gap: '1rem', 
                      marginTop: '2rem' 
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-outline"
                      style={{ 
                        flex: 1,
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        color: '#374151',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#F9FAFB';
                        e.target.style.borderColor = '#D1D5DB';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ 
                        flex: 1,
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        background: '#10B981',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                      onMouseLeave={(e) => e.target.style.background = '#10B981'}
                    >
                      <Check size={18} />
                      {editingClient ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 640px) {
          .grid.grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default Clients;