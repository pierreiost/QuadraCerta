import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { courtService } from '../services/api';
import { MapPin, Edit2, Trash2, PlusCircle, X } from 'lucide-react';

const Courts = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sportType: '',
    capacity: '',
    pricePerHour: '',
    description: '',
    status: 'AVAILABLE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const response = await courtService.getAll();
      setCourts(response.data);
    } catch (error) {
      console.error('Erro ao carregar quadras:', error);
      setError('Erro ao carregar quadras');
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

  const openModal = (court = null) => {
    if (court) {
      setEditingCourt(court);
      setFormData({
        name: court.name,
        sportType: court.sportType,
        capacity: court.capacity.toString(),
        pricePerHour: court.pricePerHour.toString(),
        description: court.description || '',
        status: court.status
      });
    } else {
      setEditingCourt(null);
      setFormData({
        name: '',
        sportType: '',
        capacity: '',
        pricePerHour: '',
        description: '',
        status: 'AVAILABLE'
      });
    }
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourt(null);
    setFormData({
      name: '',
      sportType: '',
      capacity: '',
      pricePerHour: '',
      description: '',
      status: 'AVAILABLE'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCourt) {
        await courtService.update(editingCourt.id, formData);
        setSuccess('Quadra atualizada com sucesso!');
      } else {
        await courtService.create(formData);
        setSuccess('Quadra criada com sucesso!');
      }
      closeModal();
      loadCourts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar quadra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta quadra?')) {
      return;
    }

    try {
      await courtService.delete(id);
      setSuccess('Quadra excluída com sucesso!');
      loadCourts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao excluir quadra');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      AVAILABLE: { class: 'badge-success', text: 'Disponível' },
      OCCUPIED: { class: 'badge-danger', text: 'Ocupada' },
      MAINTENANCE: { class: 'badge-warning', text: 'Manutenção' }
    };
    return badges[status] || badges.AVAILABLE;
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
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Quadras</h1>
            <p className="text-muted">Cadastre e gerencie as quadras do seu complexo</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={18} />
            Nova Quadra
          </button>
        </div>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && !showModal && (
          <div className="alert alert-danger">{error}</div>
        )}

        {courts.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <MapPin size={64} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
            <h3 className="font-bold" style={{ marginBottom: '0.5rem' }}>Nenhuma quadra cadastrada</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Comece cadastrando sua primeira quadra
            </p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <PlusCircle size={18} />
              Cadastrar Primeira Quadra
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {courts.map((court) => {
              const statusBadge = getStatusBadge(court.status);
              return (
                <div key={court.id} className="card">
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3 className="font-bold">{court.name}</h3>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p className="text-sm" style={{ marginBottom: '0.5rem' }}>
                      <strong>Modalidade:</strong> {court.sportType}
                    </p>
                    <p className="text-sm" style={{ marginBottom: '0.5rem' }}>
                      <strong>Capacidade:</strong> {court.capacity} jogadores
                    </p>
                    <p className="text-sm font-bold text-primary">
                      R$ {court.pricePerHour.toFixed(2)}/hora
                    </p>
                    {court.description && (
                      <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                        {court.description}
                      </p>
                    )}
                  </div>

                  <div className="flex" style={{ gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '0.5rem' }}
                      onClick={() => openModal(court)}
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.5rem' }}
                      onClick={() => handleDelete(court.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card" style={{ margin: 0 }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl font-bold">
                  {editingCourt ? 'Editar Quadra' : 'Nova Quadra'}
                </h2>
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
                <div className="input-group">
                  <label htmlFor="name">Nome da Quadra *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Quadra 1 - Society"
                  />
                </div>

                <div className="grid grid-2">
                  <div className="input-group">
                    <label htmlFor="sportType">Modalidade *</label>
                    <input
                      type="text"
                      id="sportType"
                      name="sportType"
                      value={formData.sportType}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Futebol, Vôlei, Tênis"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="capacity">Capacidade (Linha)*</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="Nº de jogadores"
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="input-group">
                    <label htmlFor="pricePerHour">Preço por Hora (R$) *</label>
                    <input
                      type="number"
                      id="pricePerHour"
                      name="pricePerHour"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="AVAILABLE">Disponível</option>
                      <option value="OCCUPIED">Ocupada</option>
                      <option value="MAINTENANCE">Manutenção</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="description">Descrição</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Informações adicionais sobre a quadra"
                  />
                </div>

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
                    {editingCourt ? 'Atualizar' : 'Cadastrar'}
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

export default Courts;