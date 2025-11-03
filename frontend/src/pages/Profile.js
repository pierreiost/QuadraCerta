import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Shield, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="flex" style={{ alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'var(--bg-dark)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-color)'
            }}>
              <User size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-muted">{user?.email}</p>
              <span className="badge badge-info" style={{ marginTop: '0.5rem' }}>{user?.role}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold" style={{ marginBottom: '1rem' }}>Configurações</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
              <Settings size={18} />
              Editar Perfil
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
              <Shield size={18} />
              Alterar Senha
            </button>
             <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
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