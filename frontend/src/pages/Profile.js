import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Shield, MapPin, Users } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="flex" style={{ alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              <User size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-muted">{user?.email}</p>
              <span className="badge badge-info" style={{ marginTop: '0.5rem' }}>
                {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'SEMI_ADMIN' ? 'Funcionário' : user?.role}
              </span>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'var(--bg-dark)',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>Informações do Perfil</p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <p className="text-sm"><strong>Telefone:</strong> {user?.phone}</p>
              {user?.cpf && <p className="text-sm"><strong>CPF:</strong> {user?.cpf}</p>}
              {user?.complex && (
                <p className="text-sm"><strong>Complexo:</strong> {user?.complex.name}</p>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-bold" style={{ marginBottom: '1rem' }}>Configurações</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-outline" 
              style={{ justifyContent: 'flex-start' }}
              onClick={() => alert('Funcionalidade em desenvolvimento')}
            >
              <Settings size={18} />
              Editar Perfil
            </button>
            <button 
              className="btn btn-outline" 
              style={{ justifyContent: 'flex-start' }}
              onClick={() => alert('Funcionalidade em desenvolvimento')}
            >
              <Shield size={18} />
              Alterar Senha
            </button>
            
            {/* Apenas ADMIN pode gerenciar usuários */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/users')}
              >
                <Users size={18} />
                Gerenciar Usuários
              </button>
            )}
            
            <button 
              className="btn btn-outline" 
              style={{ justifyContent: 'flex-start' }}
              onClick={() => alert('Funcionalidade em desenvolvimento')}
            >
              <MapPin size={18} />
              Gerenciar Complexo
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;