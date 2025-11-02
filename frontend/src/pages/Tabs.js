// frontend/src/pages/Tabs.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { tabService, clientService, reservationService } from '../services/api';
import { Receipt, PlusCircle, Eye, X, DollarSign, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Tabs = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    reservationId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tabsRes, clientsRes, reservationsRes] = await Promise.all([
        tabService.getAll(),
        clientService.getAll(),
        reservationService.getAll()
      ]);

      setTabs(tabsRes.data);
      setClients(clientsRes.data);
      setReservations(reservationsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = () => {
    setFormData({
      clientId: '',
      reservationId: ''
    });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      clientId: '',
      reservationId: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await tabService.create(formData);
      setSuccess('Comanda criada com sucesso!');
      closeModal();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
      // Redirecionar para detalhes da comanda
      navigate(`/tabs/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar comanda');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: { class: 'badge-info', text: 'Aberta' },
      PAID: { class: 'badge-success', text: 'Paga' },
      CANCELLED: { class: 'badge-danger', text: 'Cancelada' }
    };
    return badges[status] || badges.OPEN;
  };

  const filteredTabs = tabs.filter(tab => {
    if (filterStatus && tab.status !== filterStatus) return false;
    return true;
  });

  const openTabs = tabs.filter(t => t.status === 'OPEN');
  const totalOpen = openTabs.reduce((sum, tab) => sum + tab.total, 0);

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
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Comandas</h1>
            <p className="text-muted">Controle de vendas e comandas</p>
          </div>
          <button className="btn btn-primary" onClick={openModal}>
            <PlusCircle size={18} />
            Nova Comanda
          </button>
        </div>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && !showModal && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Comandas Abertas</p>
                <h3 className="text-2xl font-bold">{openTabs.length}</h3>
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
                <Receipt size={30} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Total em Aberto</p>
                <h3 className="text-2xl font-bold text-primary">
                  R$ {totalOpen.toFixed(2)}
                </h3>
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
                <DollarSign size={30} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex-between">
              <div>
                <p className="text-muted text-sm">Total de Comandas</p>
                <h3 className="text-2xl font-bold">{tabs.length}</h3>
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
                <Clock size={30} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="filterStatus">Filtrar por Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="OPEN">Abertas</option>
              <option value="PAID">Pagas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
        </div>

        {filteredTabs.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <Receipt size={64} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
            <h3 className="font-bold" style={{ marginBottom: '0.5rem' }}>
              {filterStatus ? 'Nenhuma comanda encontrada' : 'Nenhuma comanda cadastrada'}
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              {filterStatus 
                ? 'Tente ajustar os filtros' 
                : 'Comece criando sua primeira comanda'}
            </p>
            {!filterStatus && (
              <button className="btn btn-primary" onClick={openModal}>
                <PlusCircle size={18} />
                Criar Primeira Comanda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredTabs.map((tab) => {
              const statusBadge = getStatusBadge(tab.status);
              return (
                <div key={tab.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tabs/${tab.id}`)}>
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                      <Receipt size={20} style={{ color: 'var(--primary-color)' }} />
                      <span className="font-bold">
                        #{tab.id.substring(0, 8)}
                      </span>
                    </div>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <User size={14} style={{ color: 'var(--text-light)' }} />
                      <p className="text-sm">{tab.client.fullName}</p>
                    </div>
                    
                    {tab.reservation && (
                      <p className="text-sm text-muted">
                        {tab.reservation.court.name}
                      </p>
                    )}

                    <p className="text-sm text-muted">
                      {format(new Date(tab.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-sm text-muted">
                      {tab.items?.length || 0} item(ns)
                    </p>
                    <p className="text-lg font-bold text-primary">
                      R$ {tab.total.toFixed(2)}
                    </p>
                  </div>

                  <button 
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tabs/${tab.id}`);
                    }}
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Nova Comanda */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl font-bold">Nova Comanda</h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                  <X size={24} />
                </button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
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

                <div className="input-group">
                  <label htmlFor="reservationId">Reserva (Opcional)</label>
                  <select
                    id="reservationId"
                    name="reservationId"
                    value={formData.reservationId}
                    onChange={handleInputChange}
                  >
                    <option value="">Sem reserva associada</option>
                    {reservations
                      .filter(r => r.status === 'CONFIRMED')
                      .map(reservation => (
                        <option key={reservation.id} value={reservation.id}>
                          {reservation.court.name} - {format(new Date(reservation.startTime), "dd/MM HH:mm", { locale: ptBR })}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="alert" style={{ background: 'var(--bg-dark)', border: 'none', marginBottom: '1.5rem' }}>
                  <p className="text-sm">
                    💡 <strong>Dica:</strong> Após criar a comanda, você poderá adicionar produtos e itens.
                  </p>
                </div>

                <div className="flex" style={{ gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Criar Comanda
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

export default Tabs;