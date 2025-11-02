import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { clientService } from '../services/api';
import { Users, Edit2, Trash2, PlusCircle, X, Phone, Mail, CreditCard } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cpf: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      cpf: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await clientService.delete(id);
      setSuccess('Cliente excluído com sucesso!');
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao excluir cliente');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
            <p className="text-muted">Cadastre e gerencie seus clientes</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={18} />
            Novo Cliente
          </button>
        </div>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && !showModal && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="card" style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <Users size={64} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
            <h3 className="font-bold" style={{ marginBottom: '0.5rem' }}>
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              {searchTerm 
                ? 'Tente buscar com outros termos' 
                : 'Comece cadastrando seu primeiro cliente'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => openModal()}>
                <PlusCircle size={18} />
                Cadastrar Primeiro Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome Completo</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Reservas</th>
                    <th>Comandas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="font-bold">{client.fullName}</td>
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
                      <td>
                        {client.cpf ? (
                          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={14} style={{ color: 'var(--text-light)' }} />
                            {client.cpf}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {client._count?.reservations || 0}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {client._count?.tabs || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => openModal(client)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card" style={{ margin: 0 }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl font-bold">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
                  <label htmlFor="fullName">Nome Completo *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo do cliente"
                  />
                </div>

                <div className="grid grid-2">
                  <div className="input-group">
                    <label htmlFor="phone">Telefone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
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
                    {editingClient ? 'Atualizar' : 'Cadastrar'}
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

export default Clients;