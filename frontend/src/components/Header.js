import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div className="container">
        <div className="flex-between" style={{
          padding: '1rem 0',
          position: 'relative'
        }}>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              background: 'white',
              padding: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '50px',
              height: '50px'
            }}>
              <img
                src="/logo.png"
                alt="QuadraCerta Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--primary-color)'
            }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className="header-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease'
              }}
              className="profile-link-enhanced"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    marginBottom: '2px'
                  }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {user?.role}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}>
                  <User size={24} />
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="mobile-menu"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '1rem',
              paddingBottom: '1rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem',
              marginTop: '1rem'
            }}
          >
            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '0.75rem',
                background: 'white',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid #e5e7eb'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <User size={20} />
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {user?.role}
                </p>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
          
          .header-actions {
            display: none !important;
          }
          
          .mobile-menu {
            display: flex !important;
          }
        }

        .profile-link-enhanced:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </header>
  );
};

export default Header;