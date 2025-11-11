import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { reservationService, courtService, clientService } from '../services/api';
import { 
  Trash2, 
  PlusCircle, 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  RefreshCw,
  Filter,
  Info,
  CheckCircle,
  Users,
  Edit3
} from 'lucide-react';
import { format, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [courts, setCourts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED');
  const [useCustomTime, setUseCustomTime] = useState(false);
  
  const [formData, setFormData] = useState({
    courtId: '',
    clientId: '',
    date: '',
    time: '',
    customTime: '',
    durationInHours: 1,
    isRecurring: false,
    frequency: 'WEEKLY',
    endDate: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateRoundTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const roundTimeSlots = generateRoundTimeSlots();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservationsRes, courtsRes, clientsRes] = await Promise.all([
        reservationService.getAll(),
        courtService.getAll(),
        clientService.getAll()
      ]);

      setReservations(reservationsRes.data);
      setCourts(courtsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setError('');
    setUseCustomTime(false);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setUseCustomTime(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateTime = (time) => {
    if (!time) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    
    if (hours < 6 || hours > 23) {
      return false;
    }
    
    if (hours === 23 && minutes > 30) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.courtId) {
      setError('Selecione uma quadra');
      return;
    }

    if (!formData.clientId) {
      setError('Selecione um cliente');
      return;
    }

    if (!formData.date) {
      setError('Selecione a data');
      return;
    }

    const finalTime = useCustomTime ? formData.customTime : formData.time;

    if (!finalTime) {
      setError('Selecione o horário');
      return;
    }

    if (!validateTime(finalTime)) {
      setError('O horário deve estar entre 06:00 e 23:30');
      return;
    }

    if (!formData.durationInHours || formData.durationInHours < 1) {
      setError('A duração deve ser de pelo menos 1 hora');
      return;
    }

    try {
      const dateTimeString = `${formData.date}T${finalTime}`;
      const startDateTime = new Date(dateTimeString);
      const duration = parseFloat(formData.durationInHours);
      const endDateTime = addHours(startDateTime, duration);

      const reservationData = {
        courtId: formData.courtId,
        clientId: formData.clientId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        durationInHours: duration,
        isRecurring: formData.isRecurring
      };

      if (formData.isRecurring) {
        reservationData.frequency = formData.frequency;
        
        if (formData.endDate) {
          reservationData.endDate = new Date(formData.endDate).toISOString();
        }
      }

      await reservationService.create(reservationData);
      setSuccess('Reserva criada com sucesso!');
      closeModal();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      setError(error.response?.data?.error || 'Erro ao criar reserva. Verifique os dados e tente novamente.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await reservationService.cancel(id);
      setSuccess('Reserva cancelada com sucesso!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao cancelar reserva');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancelRecurringGroup = async (groupId) => {
    if (!window.confirm('Tem certeza que deseja cancelar todas as reservas recorrentes deste grupo?')) {
      return;
    }

    try {
      await reservationService.cancelRecurringGroup(groupId);
      setSuccess('Grupo de reservas cancelado com sucesso!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao cancelar grupo de reservas');
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      courtId: '',
      clientId: '',
      date: '',
      time: '',
      customTime: '',
      durationInHours: 1,
      isRecurring: false,
      frequency: 'WEEKLY',
      endDate: ''
    });
  };

  const getFilteredReservations = () => {
    let filtered = reservations;

    if (selectedCourt) {
      filtered = filtered.filter(r => r.courtId === selectedCourt);
    }

    if (selectedDate) {
      filtered = filtered.filter(r => {
        const reservationDate = format(parseISO(r.startTime), 'yyyy-MM-dd');
        return reservationDate === selectedDate;
      });
    }

    if (selectedStatus) {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const getCourtName = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    return court ? court.name : 'Quadra não encontrada';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.fullName : 'Cliente não encontrado';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      CONFIRMED: { label: 'Confirmada', color: '#34a853' },
      PENDING: { label: 'Pendente', color: '#fbbc04' },
      CANCELLED: { label: 'Cancelada', color: '#ea4335' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: `${config.color}15`,
        color: config.color,
        display: 'inline-block'
      }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container">
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 1rem',
            color: '#5f6368' 
          }}>
            Carregando reservas...
          </div>
        </div>
      </>
    );
  }

  const filteredReservations = getFilteredReservations();

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #34a853, #2d8e47)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Calendar size={26} />
                </div>
                <div>
                  <h1 className="font-bold text-2xl" style={{ marginBottom: '0.25rem' }}>Reservas</h1>
                  <p className="text-muted">Gerencie os horários agendados nas quadras</p>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={openModal}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(52, 168, 83, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(52, 168, 83, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(52, 168, 83, 0.3)';
              }}
            >
              <PlusCircle size={20} />
              Nova Reserva
            </button>
          </div>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {error && !showModal && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ marginBottom: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ 
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-light)'
          }}>
            <h3 style={{ 
              fontWeight: '600', 
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              <Filter size={20} style={{ color: '#34a853' }} />
              Filtrar Reservas
            </h3>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div className="grid grid-4" style={{ gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label 
                  htmlFor="filterCourt"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  <MapPin size={16} style={{ color: '#34a853' }} />
                  Quadra
                </label>
                <select
                  id="filterCourt"
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '10px',
                    border: '2px solid var(--border-color)',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#34a853'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="">Todas as quadras</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label 
                  htmlFor="filterDate"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Calendar size={16} style={{ color: '#34a853' }} />
                  Data
                </label>
                <input
                  type="date"
                  id="filterDate"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '10px',
                    border: '2px solid var(--border-color)',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#34a853'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label 
                  htmlFor="filterStatus"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  <CheckCircle size={16} style={{ color: '#34a853' }} />
                  Status
                </label>
                <select
                  id="filterStatus"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '10px',
                    border: '2px solid var(--border-color)',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#34a853'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="">Todos os status</option>
                  <option value="CONFIRMED">Confirmadas</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="CANCELLED">Canceladas</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedCourt('');
                    setSelectedDate('');
                    setSelectedStatus('CONFIRMED');
                  }}
                  style={{ 
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '10px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <RefreshCw size={18} />
                  Limpar Filtros
                </button>
              </div>
            </div>

            {(selectedCourt || selectedDate || selectedStatus !== 'CONFIRMED') && (
              <div style={{
                marginTop: '1rem',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid #bbf7d0'
              }}>
                <Info size={18} style={{ color: '#34a853', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <strong>Filtros ativos:</strong> 
                  {selectedCourt && ` Quadra específica`}
                  {selectedDate && ` • Data selecionada`}
                  {selectedStatus !== 'CONFIRMED' && ` • Status: ${selectedStatus === 'CANCELLED' ? 'Canceladas' : selectedStatus === 'PENDING' ? 'Pendentes' : 'Todos'}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {filteredReservations.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '3rem',
              textAlign: 'center',
              color: '#5f6368'
            }}>
              <Calendar size={48} style={{ 
                color: '#dadce0',
                marginBottom: '1rem'
              }} />
              <p>Nenhuma reserva encontrada com os filtros aplicados</p>
            </div>
          ) : (
            filteredReservations.map(reservation => (
              <div
                key={reservation.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease',
                  border: '1px solid #f1f3f4'
                }}
              >
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <MapPin size={20} style={{ color: '#34a853' }} />
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#202124'
                    }}>
                      {getCourtName(reservation.courtId)}
                    </h3>
                    {reservation.isRecurring && (
                      <RefreshCw size={16} style={{ color: '#fbbc04' }} />
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#5f6368'
                    }}>
                      <User size={16} />
                      <span>{getClientName(reservation.clientId)}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#5f6368'
                    }}>
                      <Calendar size={16} />
                      <span>
                        {format(parseISO(reservation.startTime), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#5f6368'
                    }}>
                      <Clock size={16} />
                      <span>
                        {format(parseISO(reservation.startTime), 'HH:mm')} - {format(parseISO(reservation.endTime), 'HH:mm')}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                </div>

                {reservation.status !== 'CANCELLED' && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    {reservation.isRecurring && reservation.recurringGroupId && (
                      <button
                        onClick={() => handleCancelRecurringGroup(reservation.recurringGroupId)}
                        className="btn-secondary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <RefreshCw size={16} />
                        Cancelar Grupo
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="btn-danger"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      <Trash2 size={16} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div 
            className="modal-overlay" 
            onClick={closeModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <div 
              className="modal" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: '0',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #34a853, #2d8e47)',
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '16px 16px 0 0',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ marginBottom: '0.25rem' }}>Nova Reserva</h2>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Agende um horário para a quadra</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '2rem', background: 'white' }}>
                {error && (
                  <div 
                    className="alert alert-danger" 
                    style={{ 
                      marginBottom: '1.5rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <Info size={20} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label 
                        htmlFor="courtId" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <MapPin size={18} style={{ color: '#34a853' }} />
                        Selecione a Quadra
                      </label>
                      <select
                        id="courtId"
                        name="courtId"
                        value={formData.courtId}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid var(--border-color)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          background: 'var(--bg-light)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#34a853'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      >
                        <option value="">Escolha uma quadra disponível</option>
                        {courts
                          .filter(court => court.status === 'AVAILABLE')
                          .map(court => (
                            <option key={court.id} value={court.id}>
                              {court.name} • {court.sportType}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label 
                        htmlFor="clientId"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <Users size={18} style={{ color: '#34a853' }} />
                        Selecione o Cliente
                      </label>
                      <select
                        id="clientId"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid var(--border-color)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          background: 'var(--bg-light)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#34a853'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      >
                        <option value="">Escolha um cliente da lista</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label 
                        htmlFor="date"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <Calendar size={18} style={{ color: '#34a853' }} />
                        Data da Reserva
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid var(--border-color)',
                          fontSize: '1rem',
                          transition: 'all 0.2s',
                          background: 'var(--bg-light)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#34a853'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label 
                        htmlFor="time"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <Clock size={18} style={{ color: '#34a853' }} />
                        Horário de Início
                      </label>
                      
                      {!useCustomTime ? (
                        <>
                          <select
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required={!useCustomTime}
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '2px solid var(--border-color)',
                              fontSize: '1rem',
                              transition: 'all 0.2s',
                              background: 'var(--bg-light)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#34a853'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                          >
                            <option value="">Selecione o horário</option>
                            {roundTimeSlots.map(time => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setUseCustomTime(true)}
                            style={{
                              marginTop: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'none',
                              border: 'none',
                              color: '#34a853',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              padding: '0.25rem 0',
                              fontWeight: '500'
                            }}
                          >
                            <Edit3 size={14} />
                            Digitar horário personalizado
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="time"
                            id="customTime"
                            name="customTime"
                            value={formData.customTime}
                            onChange={handleInputChange}
                            required={useCustomTime}
                            min="06:00"
                            max="23:30"
                            style={{
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '2px solid var(--border-color)',
                              fontSize: '1rem',
                              transition: 'all 0.2s',
                              background: 'var(--bg-light)',
                              cursor: 'text'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#34a853'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUseCustomTime(false);
                              setFormData({ ...formData, customTime: '' });
                            }}
                            style={{
                              marginTop: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'none',
                              border: 'none',
                              color: '#5f6368',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              padding: '0.25rem 0',
                              fontWeight: '500'
                            }}
                          >
                            <Clock size={14} />
                            Voltar para horários sugeridos
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label 
                      htmlFor="durationInHours"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Clock size={18} style={{ color: '#34a853' }} />
                      Duração (em horas)
                    </label>
                    <input
                      type="number"
                      id="durationInHours"
                      name="durationInHours"
                      value={formData.durationInHours}
                      onChange={handleInputChange}
                      min="0.5"
                      max="12"
                      step="0.5"
                      required
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid var(--border-color)',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        background: 'var(--bg-light)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#34a853'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>

                  <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--bg-light)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      <input
                        type="checkbox"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleInputChange}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <RefreshCw size={18} style={{ color: '#34a853' }} />
                      <span>Criar Reserva Recorrente</span>
                    </label>
                    <small className="text-muted" style={{ marginLeft: '2.5rem', display: 'block', marginTop: '0.5rem' }}>
                      Repetir esta reserva semanalmente ou mensalmente
                    </small>
                  </div>

                  {formData.isRecurring && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1.5rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <h4 style={{ 
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-primary)'
                      }}>
                        <Info size={18} style={{ color: '#34a853' }} />
                        Configurações de Recorrência
                      </h4>

                      <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label htmlFor="frequency" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                            Frequência
                          </label>
                          <select
                            id="frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            required
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '2px solid var(--border-color)',
                              fontSize: '0.95rem',
                              width: '100%'
                            }}
                          >
                            <option value="WEEKLY">Semanal</option>
                            <option value="MONTHLY">Mensal</option>
                          </select>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label htmlFor="endDate" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                            Data Final (opcional)
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '2px solid var(--border-color)',
                              fontSize: '0.95rem',
                              width: '100%'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(52, 168, 83, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)'
                      }}>
                        <strong>Nota:</strong> A reserva será repetida no mesmo dia da semana e horário até a data final especificada.
                      </div>
                    </div>
                  )}

                  <div className="flex" style={{ gap: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={closeModal} 
                      style={{ 
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ 
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Calendar size={20} />
                      Criar Reserva
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(53%) sepia(94%) saturate(396%) hue-rotate(92deg) brightness(92%) contrast(91%);
        }

        input[type="time"]:hover::-webkit-calendar-picker-indicator {
          filter: invert(40%) sepia(94%) saturate(396%) hue-rotate(92deg) brightness(92%) contrast(91%);
        }
      `}</style>
    </>
  );
};

export default Reservations;