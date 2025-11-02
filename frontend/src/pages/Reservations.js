// frontend/src/pages/Reservations.js

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { reservationService, courtService, clientService } from '../services/api';
import { Calendar, Clock, PlusCircle, X, Edit2, Trash2, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [courts, setCourts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    courtId: '',
    clientId: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    frequency: 'WEEKLY',
    dayOfWeek: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = () => {
    setFormData({
      courtId: '',
      clientId: '',
      startTime: '',
      endTime: '',
      isRecurring: false,
      frequency: 'WEEKLY',
      dayOfWeek: '',
      endDate: ''
    });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      courtId: '',
      clientId: '',
      startTime: '',
      endTime: '',
      isRecurring: false,
      frequency: 'WEEKLY',
      dayOfWeek: '',
      endDate: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await reservationService.create(formData);
      setSuccess('Reserva criada com sucesso!');
      closeModal();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar reserva');
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
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: { class: 'badge-success', text: 'Confirmada' },
      PENDING: { class: 'badge-warning', text: 'Pendente' },
      CANCELLED: { class: 'badge-danger', text: 'Cancelada' }
    };
    return badges[status] || badges.CONFIRMED;
  };

  const filteredReservations = reservations.filter(res => {
    if (selectedCourt && res.courtId !== selectedCourt) return false;
    if (selectedDate) {
      const resDate = format(new Date(res.startTime), 'yyyy-MM-dd');
      if (resDate !== selectedDate) return false;
    }
    return true;
  });

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
            <h1 className="text-2xl font-bold">Agenda de Reservas</h1>
            <p className="text-muted">Gerencie todas as reservas do complexo</p>
          </div>
          <button className="btn btn-primary" onClick={openModal}>
            <PlusCircle size={18} />
            Nova Reserva
          </button>
        </div>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && !showModal && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-2">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filterCourt">Filtrar por Quadra</label>
              <select
                id="filterCourt"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
              >
                <option value="">Todas as quadras</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filterDate">Filtrar por Data</label>
              <input
                type="date"
                id="filterDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <Calendar size={64} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
            <h3 className="font-bold" style={{ marginBottom: '0.5rem' }}>
              {selectedCourt || selectedDate ? 'Nenhuma reserva encontrada' : 'Nenhuma reserva cadastrada'}
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              {selectedCourt || selectedDate 
                ? 'Tente ajustar os filtros' 
                : 'Comece criando sua primeira reserva'}
            </p>
            {!selectedCourt && !selectedDate && (
              <button className="btn btn-primary" onClick={openModal}>
                <PlusCircle size={18} />
                Criar Primeira Reserva
              </button>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Quadra</th>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Status</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => {
                    const statusBadge = getStatusBadge(reservation.status);
                    return (
                      <tr key={reservation.id}>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} style={{ color: 'var(--text-light)' }} />
                            {reservation.client.fullName}
                          </div>
                        </td>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} style={{ color: 'var(--text-light)' }} />
                            {reservation.court.name}
                          </div>
                        </td>
                        <td>
                          {format(new Date(reservation.startTime), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} style={{ color: 'var(--text-light)' }} />
                            {format(new Date(reservation.startTime), "HH:mm", { locale: ptBR })} - {format(new Date(reservation.endTime), "HH:mm", { locale: ptBR })}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          {reservation.isRecurring ? (
                            <span className="badge badge-info">Recorrente</span>
                          ) : (
                            <span className="badge">Avulsa</span>
                          )}
                        </td>
                        <td>
                          {reservation.status !== 'CANCELLED' && (
                            <button 
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                              onClick={() => handleCancel(reservation.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
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
                    <label htmlFor="endTime">Fim *</label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
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

export default Reservations;