import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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

          { }
          { }
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
              <div>
                { }
                <h2 className="font-bold text-lg" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
                  QuadraCerta
                </h2>
                {user?.complex && (
                  <p className="text-sm text-muted">{user.complex.name}</p>
                )}
              </div>
            </div>
          </Link>
          { }


          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            { }
            { }
            <Link to="/profile" className="profile-link" style={{ textDecoration: 'none', color: 'inherit' }}>
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
              </div>
            </Link>
            { }

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