import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  Calendar as CalendarIcon,
  Users,
  PlusCircle,
  MapPin,
  Package,
  Receipt,
  X
} from 'lucide-react';
import { dashboardService, courtService, reservationService, clientService } from '../services/api';
// import { format } from 'date-fns'; // Removido (não estava em uso)
import { ptBR } from 'date-fns/locale';

// --- IMPORTS DO FULLCALENDAR ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // Para o clique no dia
import timeGridPlugin from '@fullcalendar/timegrid'; // Para visualização de semana/dia
import 'react-calendar/dist/Calendar.css'; 
// --- FIM DOS IMPORTS ---

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courts, setCourts] = useState([]);
  const [clients, setClients] = useState([]); // Para o modal
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- CORREÇÃO AQUI: Esta linha estava faltando ---
  const [showModal, setShowModal] = useState(false);
  // --- FIM DA CORREÇÃO ---

  // Estados para o modal de Nova Reserva
  const [formData, setFormData] = useState({
    courtId: '',
    clientId: '',
    startTime: '',
    durationInHours: 1, // Padrão de 1 hora
    isRecurring: false,
    frequency: 'WEEKLY',
    dayOfWeek: '',
    endDate: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, courtsRes, reservationsRes, clientsRes] = await Promise.all([
        dashboardService.getOverview(),
        courtService.getAll(),
        reservationService.getAll(),
        clientService.getAll() // Precisamos dos clientes para o modal
      ]);

      setStats(statsRes.data);
      setCourts(courtsRes.data);
      setReservations(reservationsRes.data);
      setClients(clientsRes.data); // Salva os clientes

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Formata os dados para o FullCalendar
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

  // --- LÓGICA DO MODAL ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const closeModal = () => {
    setShowModal(false); // Agora 'setShowModal' existe
    setFormData({
      courtId: '',
      clientId: '',
      startTime: '',
      durationInHours: 1, // Reseta para 1 hora
      isRecurring: false,
      frequency: 'WEEKLY',
      dayOfWeek: '',
      endDate: ''
    });
    setError('');
  };

  // Abre o modal com a data clicada
  const handleDateClick = (arg) => {
    const defaultStartTime = new Date(arg.date);
    defaultStartTime.setHours(18, 0, 0, 0); // Define horário padrão (ex: 18:00)
    
    // Formata para 'yyyy-MM-ddThh:mm'
    const formatForInput = (date) => {
      const yyyy = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
    };

    setFormData({
      ...formData,
      startTime: formatForInput(defaultStartTime),
      durationInHours: 1, // Garante que a duração seja 1
    });
    setShowModal(true); // Agora 'setShowModal' existe
    setError('');
  };

  // Navega para a página de reservas
  const handleEventClick = (info) => {
    navigate('/reservations');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await reservationService.create(formData);
      setSuccess('Reserva criada com sucesso!');
      closeModal();
      loadDashboardData(); // Recarrega os dados para o calendário
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar reserva');
    }
  };

  // --- FIM DA LÓGICA DO MODAL ---

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
        {error && !showModal && ( // Agora 'showModal' existe
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Cards de Status */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          {/* Card Total de Quadras */}
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

          {/* Card Clientes */}
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

          {/* Card Reservas Ativas */}
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

          {/* Card Comandas Abertas */}
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

        {/* Botões de Ação Rápida */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)} // Agora 'setShowModal' existe
            style={{ width: '100%' }}
          >
            <PlusCircle size={18} />
            Nova Reserva
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/tabs')}
            style={{ width: '100%' }}
          >
            <Receipt size={18} />
            Nova Comanda
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/products')}
            style={{ width: '100%' }}
          >
            <Package size={18} />
            Produtos
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/clients')}
            style={{ width: '100%' }}
          >
            <Users size={18} />
            Clientes
          </button>
        </div>

        {/* Calendário */}
        <div className="card" style={{ padding: '2rem' }}>
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
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
          }}
        />
        </div>
      </div>

      <footer style={{
        background: 'white',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 0',
        marginTop: '4rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <p className="text-sm text-muted">
            © 2025 QuadraCerta. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modal de Nova Reserva */}
      {showModal && ( // Agora 'showModal' existe
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card" style={{ margin: 0 }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl font-bold">Nova Reserva</h2>
                <button 
                  onClick={closeModal}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="input-group">
                    <label htmlFor="courtId">Quadra *</label>
                    <select
                      id="courtId"
                      name="courtId"
                      value={formData.courtId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione uma quadra</option>
                      {courts.map(court => (
                        <option key={court.id} value={court.id}>
                          {court.name} - {court.sportType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="clientId">Cliente *</label>
                    <select
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="input-group">
                    <label htmlFor="startTime">Início *</label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="durationInHours">Duração (em horas) *</label>
                    <input
                      type="number"
                      id="durationInHours"
                      name="durationInHours"
                      value={formData.durationInHours}
                      onChange={handleInputChange}
                      required
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                    />
                    Reserva Recorrente
                  </label>
                </div>

                {formData.isRecurring && (
                  <>
                    <div className="grid grid-2">
                      <div className="input-group">
                        <label htmlFor="frequency">Frequência</label>
                        <select
                          id="frequency"
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleInputChange}
                        >
                          <option value="WEEKLY">Semanal</option>
                          <option value="MONTHLY">Mensal</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label htmlFor="endDate">Data Final</label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={closeModal}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Criar Reserva
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;