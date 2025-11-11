import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Clock, XCircle, Ban } from 'lucide-react';
import logo from '../utils/complex.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
      setErrorType(result.status || 'error');
    }

    setLoading(false);
  };

  const getErrorIcon = () => {
    switch(errorType) {
      case 'PENDING':
        return <Clock size={20} color="#fbbc04" />;
      case 'REJECTED':
        return <XCircle size={20} color="#ea4335" />;
      case 'SUSPENDED':
        return <Ban size={20} color="#ea4335" />;
      default:
        return <AlertCircle size={20} color="#ea4335" />;
    }
  };

  const getErrorColor = () => {
    switch(errorType) {
      case 'PENDING':
        return { bg: '#fff4e5', border: '#fbbc04', text: '#c77700' };
      case 'REJECTED':
      case 'SUSPENDED':
        return { bg: '#ffebee', border: '#ea4335', text: '#c62828' };
      default:
        return { bg: '#ffebee', border: '#ea4335', text: '#c62828' };
    }
  };

  const errorColors = getErrorColor();

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .login-container {
          width: 85vw;
          height: 85vh;
          max-width: 1200px;
          max-height: 700px;
          min-height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          overflow: hidden;
        }
        
        .illustration-panel {
          flex: 1;
          background: linear-gradient(135deg, #34a853 0%, #2d8f47 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        
        .login-panel {
          flex: 1;
          background: #f5f5f5;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow-y: auto;
        }
        
        @media (max-width: 968px) {
          .illustration-panel {
            display: none !important;
          }
          .login-container {
            width: 90vw !important;
            max-width: 450px !important;
          }
          .login-panel {
            padding: 50px 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          .login-container {
            width: 95vw !important;
            height: auto !important;
            min-height: 500px !important;
          }
          .login-panel {
            padding: 40px 20px !important;
          }
        }
      `}</style>

      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #34a853 0%, #2d8f47 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        <div className="login-container">
          <div className="illustration-panel">
            <div style={{
              textAlign: 'center',
              color: 'white',
              zIndex: 1
            }}>
              <img
                src={logo}
                alt="QuadraCerta"
                style={{
                  width: '120px',
                  height: '120px',
                  marginBottom: '30px',
                  opacity: 0.95
                }}
              />
              <h1 style={{
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                QuadraCerta
              </h1>
              <p style={{
                fontSize: '18px',
                fontWeight: '300',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Gestão completa para complexos esportivos
              </p>
            </div>
          </div>

          <div className="login-panel">
            <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                BEM-VINDO
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Entre com suas credenciais
              </p>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  background: errorColors.bg,
                  border: `1px solid ${errorColors.border}`,
                  borderRadius: '10px',
                  marginBottom: '20px',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{ marginTop: '2px' }}>
                    {getErrorIcon()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '13px',
                      color: errorColors.text,
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {error}
                    </p>
                    {errorType === 'SUSPENDED' && (
                      <p style={{
                        fontSize: '12px',
                        color: errorColors.text,
                        margin: '8px 0 0 0',
                        lineHeight: '1.5'
                      }}>
                        <strong>Dúvidas?</strong> Entre em contato com o administrador do sistema.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '8px',
                      outline: 'none',
                      background: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 2px 10px rgba(52, 168, 83, 0.2)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Senha
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '8px',
                      outline: 'none',
                      background: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 2px 10px rgba(52, 168, 83, 0.2)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '25px',
                  fontSize: '13px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#666'
                  }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ marginRight: '6px' }}
                    />
                    Lembrar-me
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: '#34a853',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'white',
                    background: loading ? '#999' : 'linear-gradient(135deg, #34a853 0%, #2d8f47 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(52, 168, 83, 0.3)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(52, 168, 83, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(52, 168, 83, 0.3)';
                    }
                  }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <div style={{
                  marginTop: '25px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  Não tem uma conta?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#34a853',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Cadastre-se
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
