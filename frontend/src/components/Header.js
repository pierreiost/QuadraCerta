import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container">
        <div className="flex-between" style={{ padding: '1rem 0' }}>
          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              QC
            </div>
            <div>
              <h2 className="font-bold text-lg">QuadraCerta</h2>
              {user?.complex && (
                <p className="text-sm text-muted">{user.complex.name}</p>
              )}
            </div>
          </div>

          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p className="font-bold text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted">{user?.role}</p>
            </div>
            
            <div style={{
              width: '45px',
              height: '45px',
              background: 'var(--bg-dark)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-color)'
            }}>
              <User size={24} />
            </div>

            <button 
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem' }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
