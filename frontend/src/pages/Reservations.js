import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { reservationService, courtService, clientService } from '../services/api';
import { Trash2, PlusCircle, X, Calendar, Clock, User, MapPin, RefreshCw } from 'lucide-react';
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
  
  const [formData, setFormData] = useState({
    courtId: '',
    clientId: '',
    startTime: '',
    durationInHours: 1,
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
    // Data atual + 1 hora, arredondada
    const now = new Date();
    const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
    const formattedDate = format(nextHour, "yyyy-MM-dd'T'HH:mm");

    setFormData({
      courtId: '',
      clientId: '',
      startTime: formattedDate,
      durationInHours: 1,
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
      durationInHours: 1,
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

    // Validações frontend
    if (!formData.courtId) {
      setError('Selecione uma quadra');
      return;
    }

    if (!formData.clientId) {
      setError('Selecione um cliente');
      return;
    }

    if (!formData.startTime) {
      setError('Selecione data e horário de início');
      return;
    }

    if (formData.durationInHours < 0.5 || formData.durationInHours > 12) {
      setError('Duração deve ser entre 0.5 e 12 horas');
      return;
    }

    if (formData.isRecurring && !formData.endDate) {
      setError('Para reservas recorrentes, defina a data final');
      return;
    }

    try {
      const response = await reservationService.create(formData);
      
      if (formData.isRecurring) {
        setSuccess(`${response.data.createdReservations} reservas criadas com sucesso!`);
      } else {
        setSuccess('Reserva criada com sucesso!');
      }
      
      closeModal();
      loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar reserva';
      setError(errorMessage);
      
      // Se houver conflito, mostrar detalhes
      if (error.response?.data?.conflictWith) {
        const conflict = error.response.data.conflictWith;
        setError(
          `Horário conflita com reserva de ${conflict.client} ` +
          `(${format(parseISO(conflict.startTime), 'HH:mm')} - ${format(parseISO(conflict.endTime), 'HH:mm')})`
        );
      }
    }
  };

  const handleDelete = async (id) => {
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

  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: { text: 'Confirmada', class: 'badge-success' },
      PENDING: { text: 'Pendente', class: 'badge-warning' },
      CANCELLED: { text: 'Cancelada', class: 'badge-danger' }
    };
    return badges[status] || { text: status, class: 'badge-info' };
  };

  // Calcular endTime baseado em startTime + duration
  const calculateEndTime = () => {
    if (!formData.startTime || !formData.durationInHours) return '';
    
    try {
      const start = parseISO(formData.startTime);
      const end = addHours(start, parseFloat(formData.durationInHours));
      return format(end, 'HH:mm');
    } catch {
      return '';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (selectedCourt && reservation.courtId !== selectedCourt) return false;
    if (selectedDate && !reservation.startTime.startsWith(selectedDate)) return false;
    return true;
  });

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
        
        {/* Header da Página */}
        <div className="flex-between" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-bold text-2xl">Reservas</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              Gerencie os agendamentos das quadras
            </p>
          </div>
          <button className="btn btn-primary" onClick={openModal}>
            <PlusCircle size={18} />
            Nova Reserva
          </button>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="grid grid-3">
            <div className="input-group">
              <label htmlFor="filterCourt">Filtrar por Quadra</label>
              <select
                id="filterCourt"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
              >
                <option value="">Todas as quadras</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="filterDate">Filtrar por Data</label>
              <input
                type="date"
                id="filterDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelectedCourt('');
                  setSelectedDate('');
                }}
                style={{ width: '100%' }}
              >
                <RefreshCw size={18} />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Reservas */}
        {filteredReservations.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <Calendar size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3 className="font-bold text-lg" style={{ marginBottom: '0.5rem' }}>
              {selectedCourt || selectedDate 
                ? 'Nenhuma reserva encontrada' 
                : 'Nenhuma reserva cadastrada'}
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
                    <th>Duração</th>
                    <th>Status</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => {
                    const statusBadge = getStatusBadge(reservation.status);
                    const startTime = parseISO(reservation.startTime);
                    const endTime = parseISO(reservation.endTime);
                    const duration = (endTime - startTime) / (1000 * 60 * 60); // horas

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
                          {format(startTime, "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td>
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} style={{ color: 'var(--text-light)' }} />
                            {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                          </div>
                        </td>
                        <td>
                          {duration}h
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
                              className="btn-icon"
                              onClick={() => handleDelete(reservation.id)}
                              title="Cancelar reserva"
                            >
                              <Trash2 size={18} />
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

        {/* Modal de Nova Reserva */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="font-bold text-xl">Nova Reserva</h2>
                <button onClick={closeModal} className="btn-icon">
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    {error}
                  </div>
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
                        {courts.map((court) => (
                          <option key={court.id} value={court.id}>
                            {court.name} - {court.sportType} - R$ {court.pricePerHour}/h
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
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.fullName} - {client.phone}
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
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="durationInHours">
                        Duração (horas) *
                        {calculateEndTime() && (
                          <span style={{ color: 'var(--text-light)', fontWeight: 'normal', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                            Término: {calculateEndTime()}
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        id="durationInHours"
                        name="durationInHours"
                        value={formData.durationInHours}
                        onChange={handleInputChange}
                        required
                        min="0.5"
                        max="12"
                        step="0.5"
                      />
                      <small className="text-muted">Mínimo: 0.5h | Máximo: 12h</small>
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
                      <span>Reserva Recorrente</span>
                    </label>
                    <small className="text-muted">Marque para criar reservas que se repetem semanalmente</small>
                  </div>

                  {formData.isRecurring && (
                    <>
                      <div className="grid grid-2">
                        <div className="input-group">
                          <label htmlFor="frequency">Frequência *</label>
                          <select
                            id="frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            required={formData.isRecurring}
                          >
                            <option value="WEEKLY">Semanal</option>
                            <option value="MONTHLY">Mensal</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label htmlFor="endDate">Data Final *</label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            required={formData.isRecurring}
                            min={formData.startTime ? format(parseISO(formData.startTime), 'yyyy-MM-dd') : ''}
                          />
                        </div>
                      </div>

                      <div className="alert alert-info">
                        <strong>Atenção:</strong> Serão criadas múltiplas reservas automaticamente até a data final escolhida.
                        Horários já ocupados serão pulados.
                      </div>
                    </>
                  )}

                  <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-outline"
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
      </div>
    </>
  );
};

export default Reservations;
