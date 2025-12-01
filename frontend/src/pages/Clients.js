import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
import MaskedInput from '../components/MaskedInput';
import { clientService } from '../services/api';
import api from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [historyPages, setHistoryPages] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cpf: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientService.getAll();
      setClients(response.data);
    } catch (error) {
      setError('Erro ao carregar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientHistory = async (clientId, page = 1) => {
    setLoadingHistory(prev => ({ ...prev, [clientId]: true }));
    try {
      const response = await api.get(`/clients/${clientId}/history`, {
        params: { page, limit: 10 }
      });
      setClientHistory(prev => ({ ...prev, [clientId]: response.data }));
      setHistoryPages(prev => ({ ...prev, [clientId]: page }));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const toggleClientHistory = async (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
      if (!clientHistory[clientId]) {
        await loadClientHistory(clientId);
      }
    }
  };

  const handlePageChange = async (clientId, newPage) => {
    await loadClientHistory(clientId, newPage);
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

  const closeModal = (forceClose = false) => {
    if (!forceClose && isSaving) return;

    if (!forceClose) {
      const hasChanges =
        formData.fullName !== (editingClient?.fullName || '') ||
        formData.phone !== (editingClient?.phone || '') ||
        formData.email !== (editingClient?.email || '') ||
        formData.cpf !== (editingClient?.cpf || '');

      if (hasChanges) {
        const confirmClose = window.confirm('Você tem alterações não salvas. Deseja realmente sair? Dados não salvos serão perdidos.');
        if (!confirmClose) return;
      }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    setIsSaving(true);

    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        await clientService.create(formData);
        setSuccess('Cliente cadastrado com sucesso!');
      }

      closeModal(true);
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar cliente');
    } finally {
      setIsSaving(false);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.5rem'
          }}>
            {clients.map((client) => {
              const isExpanded = expandedClient === client.id;
              const history = clientHistory[client.id];
              const isLoadingHistory = loadingHistory[client.id];
              const currentPage = historyPages[client.id] || 1;

              return (
                <div
                  key={client.id}
                  className="card"
                  style={{
                    padding: '0',
                    border: '2px solid var(--border-color)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #34a853, #2d8e47)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: '700'
                      }}>
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openModal(client)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#34a853';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold" style={{
                      fontSize: '1.125rem',
                      marginBottom: '0.75rem',
                      color: '#111827'
                    }}>
                      {client.fullName}
                    </h3>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        <Phone size={16} />
                        <span>{client.phone}</span>
                      </div>

                      {client.email && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#6b7280',
                          fontSize: '0.875rem'
                        }}>
                          <Mail size={16} />
                          <span>{client.email}</span>
                        </div>
                      )}

                      {client.cpf && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#6b7280',
                          fontSize: '0.875rem'
                        }}>
                          <CreditCard size={16} />
                          <span>{client.cpf}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleClientHistory(client.id)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: 'none',
                      borderTop: '2px solid var(--border-color)',
                      background: isExpanded ? '#f9fafb' : 'white',
                      color: '#34a853',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isExpanded ? '#f9fafb' : 'white'}
                  >
                    <History size={16} />
                    Ver Histórico
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderTop: '2px solid var(--border-color)',
                      animation: 'slideDown 0.3s ease'
                    }}>
                      {isLoadingHistory ? (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '2rem'
                        }}>
                          <div className="loading" style={{
                            width: '30px',
                            height: '30px',
                            borderWidth: '3px'
                          }}></div>
                        </div>
                      ) : history ? (
                        <div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                          }}>
                            <div style={{
                              padding: '1rem',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                <Calendar size={18} color="#34a853" />
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  fontWeight: '600',
                                  textTransform: 'uppercase'
                                }}>
                                  Total Reservas
                                </span>
                              </div>
                              <p style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: 0
                              }}>
                                {history.statistics.totalReservations}
                              </p>
                            </div>

                            <div style={{
                              padding: '1rem',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                <DollarSign size={18} color="#34a853" />
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  fontWeight: '600',
                                  textTransform: 'uppercase'
                                }}>
                                  GASTO EM COMANDAS
                                </span>
                              </div>
                              <p style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: 0
                              }}>
                                {formatCurrency(history.statistics.totalSpent)}
                              </p>
                            </div>
                          </div>

                          {history.upcomingReservations.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <TrendingUp size={16} color="#34a853" />
                                Próximas Reservas
                              </h4>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                              }}>
                                {history.upcomingReservations.map((reservation) => (
                                  <div
                                    key={reservation.id}
                                    style={{
                                      padding: '0.75rem',
                                      background: 'white',
                                      borderRadius: '8px',
                                      border: '1px solid #e5e7eb',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <div>
                                      <p style={{
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        color: '#111827',
                                        margin: 0
                                      }}>
                                        {reservation.court.name}
                                      </p>
                                      <p style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        margin: 0,
                                        marginTop: '0.25rem'
                                      }}>
                                        {format(new Date(reservation.startTime), "dd 'de' MMMM", { locale: ptBR })}
                                      </p>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: '#34a853',
                                      fontSize: '0.75rem',
                                      fontWeight: '600'
                                    }}>
                                      <Clock size={14} />
                                      {format(new Date(reservation.startTime), 'HH:mm')} - {format(new Date(reservation.endTime), 'HH:mm')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#111827',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <History size={16} color="#34a853" />
                              Histórico de Reservas
                            </h4>

                            {history.history.reservations.length === 0 ? (
                              <p style={{
                                textAlign: 'center',
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                padding: '1rem'
                              }}>
                                Nenhuma reserva encontrada
                              </p>
                            ) : (
                              <>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                  marginBottom: '1rem'
                                }}>
                                  {history.history.reservations.map((reservation) => (
                                    <div
                                      key={reservation.id}
                                      style={{
                                        padding: '0.75rem',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        opacity: reservation.status === 'CANCELLED' ? 0.6 : 1
                                      }}
                                    >
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                      }}>
                                        <p style={{
                                          fontWeight: '600',
                                          fontSize: '0.875rem',
                                          color: '#111827',
                                          margin: 0
                                        }}>
                                          {reservation.court.name}
                                        </p>
                                        {reservation.status === 'CANCELLED' && (
                                          <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: '#fee2e2',
                                            color: '#991b1b',
                                            fontSize: '0.625rem',
                                            fontWeight: '600',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase'
                                          }}>
                                            Finalizada
                                          </span>
                                        )}
                                      </div>
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                      }}>
                                        <p style={{
                                          fontSize: '0.75rem',
                                          color: '#6b7280',
                                          margin: 0
                                        }}>
                                          {format(new Date(reservation.startTime), "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                        <p style={{
                                          fontSize: '0.75rem',
                                          color: '#6b7280',
                                          margin: 0
                                        }}>
                                          {format(new Date(reservation.startTime), 'HH:mm')} - {format(new Date(reservation.endTime), 'HH:mm')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {history.history.pagination.totalPages > 1 && (
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #e5e7eb'
                                  }}>
                                    <button
                                      onClick={() => handlePageChange(client.id, currentPage - 1)}
                                      disabled={currentPage === 1}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        background: currentPage === 1 ? '#f3f4f6' : 'white',
                                        color: currentPage === 1 ? '#9ca3af' : '#111827',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                      }}
                                    >
                                      Anterior
                                    </button>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      color: '#6b7280'
                                    }}>
                                      Página {currentPage} de {history.history.pagination.totalPages}
                                    </span>
                                    <button
                                      onClick={() => handlePageChange(client.id, currentPage + 1)}
                                      disabled={currentPage === history.history.pagination.totalPages}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        background: currentPage === history.history.pagination.totalPages ? '#f3f4f6' : 'white',
                                        color: currentPage === history.history.pagination.totalPages ? '#9ca3af' : '#111827',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: currentPage === history.history.pagination.totalPages ? 'not-allowed' : 'pointer'
                                      }}
                                    >
                                      Próxima
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => closeModal()}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className="modal-header">
                <h2>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <button
                  className="modal-close"
                  onClick={() => closeModal()}
                  disabled={isSaving}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  {error && (
                    <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      Nome Completo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.fullName ? 'input-error' : ''}`}
                      placeholder="Digite o nome completo"
                      disabled={isSaving}
                    />
                    {fieldErrors.fullName && (
                      <p className="error-message">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Telefone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <MaskedInput
                      mask="(99) 99999-9999"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                      placeholder="(00) 00000-0000"
                      disabled={isSaving}
                    />
                    {fieldErrors.phone && (
                      <p className="error-message">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                      placeholder="cliente@email.com"
                      disabled={isSaving}
                    />
                    {fieldErrors.email && (
                      <p className="error-message">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">CPF</label>
                    <MaskedInput
                      mask="999.999.999-99"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.cpf ? 'input-error' : ''}`}
                      placeholder="000.000.000-00"
                      disabled={isSaving}
                    />
                    {fieldErrors.cpf && (
                      <p className="error-message">{fieldErrors.cpf}</p>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => closeModal()}
                    className="btn btn-secondary"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="loading" style={{
                          width: '16px',
                          height: '16px',
                          borderWidth: '2px',
                          marginRight: '0.5rem'
                        }}></div>
                        Salvando...
                      </>
                    ) : (
                      editingClient ? 'Atualizar' : 'Cadastrar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Clients;