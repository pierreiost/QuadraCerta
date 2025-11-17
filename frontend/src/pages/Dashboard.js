import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { dashboardService, courtService, clientService, reservationService } from '../services/api';
import { 
  MapPin, 
  Users, 
  CalendarIcon, 
  Receipt, 
  PlusCircle, 
  Package,
  X,
  Clock,
  Calendar,
  RefreshCw,
  Info,
  Edit3
} from 'lucide-react';
import { format, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courts, setCourts] = useState([]);
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, courtsRes, reservationsRes, clientsRes] = await Promise.all([
        dashboardService.getOverview(),
        courtService.getAll(),
        reservationService.getAll(),
        clientService.getAll()
      ]);

      setStats(statsRes.data);
      setCourts(courtsRes.data);
      setReservations(reservationsRes.data);
      setClients(clientsRes.data);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents = useMemo(() => {
    return reservations
      .filter(res => res.status !== 'CANCELLED')
      .map(res => ({
        id: res.id,
        title: `${res.client.fullName} (${res.court.name})`,
        start: res.startTime,
        end: res.endTime,
        className: res.status === 'PENDING' ? 'event-pending' : 'event-confirmed'
      }));
  }, [reservations]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isRecurring') {
      setFormData({
        ...formData,
        [name]: checked,
        frequency: checked ? 'WEEKLY' : 'WEEKLY',
        endDate: checked ? formData.endDate : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setUseCustomTime(false);
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
    setError('');
  };

  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.date);
    
    const formatDateForInput = (date) => {
      const yyyy = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${MM}-${dd}`;
    };

    setFormData({
      ...formData,
      date: formatDateForInput(clickedDate),
      time: '18:00',
      customTime: '',
      durationInHours: 1
    });
    setUseCustomTime(false);
    setShowModal(true);
    setError('');
  };

  const handleEventClick = (info) => {
    navigate('/reservations');
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
      loadDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      setError(error.response?.data?.error || 'Erro ao criar reserva. Verifique os dados e tente novamente.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex-center" style={{ minHeight: '80vh' }}>
          <div className="loading" style={{ width: '50px', height: '50px', borderWidth: '5px' }}></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="container" style={{ padding: '2rem 1rem' }}>
        
        {success && (
          <div className="alert alert-success">{success}</div>
        )}
        {error && !showModal && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/courts')}>
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Total de Quadras</p>
                <h3 className="text-2xl font-bold">{stats?.courts.total || 0}</h3>
              </div>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <MapPin size={30} />
              </div>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/clients')}>
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Clientes</p>
                <h3 className="text-2xl font-bold">{stats?.clients || 0}</h3>
              </div>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Users size={30} />
              </div>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/reservations')}>
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Reservas Ativas</p>
                <h3 className="text-2xl font-bold">{stats?.reservations || 0}</h3>
              </div>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CalendarIcon size={30} />
              </div>
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/tabs')}>
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Comandas Abertas</p>
                <h3 className="text-2xl font-bold">{stats?.tabs || 0}</h3>
              </div>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Receipt size={30} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem' 
        }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            <PlusCircle size={16} />
            Nova Reserva
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/courts')}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            <MapPin size={16} />
            Nova Quadra
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/tabs')}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            <Receipt size={16} />
            Nova Comanda
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/products')}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            <Package size={16} />
            Produtos
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/clients')}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem'
            }}
          >
            <Users size={16} />
            Clientes
          </button>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="font-bold text-xl" style={{ marginBottom: '1.5rem' }}>
            <Clock size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Calendário de Reservas
          </h2>
          
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={ptBR}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              
              height="auto"
              contentHeight="auto"
              aspectRatio={1.5}
              handleWindowResize={true}
              windowResizeDelay={100}
              
              dayMaxEvents={3}
              moreLinkClick="popover"
              
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
              allDayText="Dia todo"
              noEventsText="Sem reservas"
              
              views={{
                dayGridMonth: {
                  dayMaxEvents: 2
                },
                timeGridWeek: {
                  dayMaxEvents: 4
                }
              }}
            />
          </div>
        </div>
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
                            {court.name}
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
                      min={format(new Date(), 'yyyy-MM-dd')}
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
                          min={formData.date}
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

export default Dashboard;