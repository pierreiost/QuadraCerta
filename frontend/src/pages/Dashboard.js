import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Calendar, 
  Users, 
  PlusCircle,
  MapPin,
  Clock,
  Package,
  Receipt
} from 'lucide-react';
import { dashboardService, courtService } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, upcomingRes, courtsRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getUpcoming(),
        courtService.getAll()
      ]);

      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
      setCourts(courtsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourtStatusBadge = (status) => {
    const badges = {
      AVAILABLE: { class: 'badge-success', text: 'Disponível' },
      OCCUPIED: { class: 'badge-danger', text: 'Ocupada' },
      MAINTENANCE: { class: 'badge-warning', text: 'Manutenção' }
    };
    return badges[status] || badges.AVAILABLE;
  };

  const getReservationStatusBadge = (status) => {
    const badges = {
      CONFIRMED: { class: 'badge-success', text: 'Confirmada' },
      PENDING: { class: 'badge-warning', text: 'Pendente' },
      CANCELLED: { class: 'badge-danger', text: 'Cancelada' }
    };
    return badges[status] || badges.CONFIRMED;
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
        <div style={{ borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
          <div className="flex" style={{ gap: '2rem' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                cursor: 'pointer',
                fontWeight: 600,
                color: activeTab === 'overview' ? 'var(--primary-color)' : 'var(--text-light)',
                borderBottom: activeTab === 'overview' ? '2px solid var(--primary-color)' : 'none',
                marginBottom: '-2px'
              }}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                cursor: 'pointer',
                fontWeight: 600,
                color: activeTab === 'upcoming' ? 'var(--primary-color)' : 'var(--text-light)',
                borderBottom: activeTab === 'upcoming' ? '2px solid var(--primary-color)' : 'none',
                marginBottom: '-2px'
              }}
            >
              Próximos Horários
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
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
                    <Calendar size={30} />
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

            <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/reservations')}
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

            <div className="card">
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 className="text-xl font-bold">Quadras Cadastradas</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/courts')}
                >
                  <PlusCircle size={18} />
                  Adicionar Quadra
                </button>
              </div>

              {courts.length === 0 ? (
                <div className="text-center" style={{ padding: '3rem' }}>
                  <p className="text-muted">Nenhuma quadra cadastrada ainda.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/courts')}
                    style={{ marginTop: '1rem' }}
                  >
                    Cadastrar Primeira Quadra
                  </button>
                </div>
              ) : (
                <div className="grid grid-3">
                  {courts.map(court => {
                    const statusBadge = getCourtStatusBadge(court.status);
                    return (
                      <div 
                        key={court.id}
                        className="card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/courts')}
                      >
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                          <h4 className="font-bold">{court.name}</h4>
                          <span className={`badge ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-sm text-muted">{court.sportType}</p>
                        <div className="flex-between" style={{ marginTop: '1rem' }}>
                          <p className="text-sm">
                            <strong>Capacidade:</strong> {court.capacity} jogadores
                          </p>
                          <p className="text-sm font-bold text-primary">
                            R$ {court.pricePerHour.toFixed(2)}/h
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'upcoming' && (
          <div className="card">
            <h3 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>
              Próximos Horários Marcados
            </h3>

            {upcoming.length === 0 ? (
              <div className="text-center" style={{ padding: '3rem' }}>
                <p className="text-muted">Nenhuma reserva agendada.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/reservations')}
                  style={{ marginTop: '1rem' }}
                >
                  Criar Nova Reserva
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Quadra</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map(reservation => {
                      const statusBadge = getReservationStatusBadge(reservation.status);
                      return (
                        <tr key={reservation.id}>
                          <td>{reservation.client.fullName}</td>
                          <td>{reservation.court.name}</td>
                          <td>
                            {format(new Date(reservation.startTime), "dd/MM/yyyy", { locale: ptBR })}
                          </td>
                          <td>
                            {format(new Date(reservation.startTime), "HH:mm", { locale: ptBR })} - {format(new Date(reservation.endTime), "HH:mm", { locale: ptBR })}
                          </td>
                          <td>
                            <span className={`badge ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                              onClick={() => navigate('/reservations')}
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
    </>
  );
};

export default Dashboard;