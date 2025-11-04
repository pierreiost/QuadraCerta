import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

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
            max-width: 500px !important;
          }
          .login-panel {
            padding: 40px 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          .login-container {
            width: 95vw !important;
            height: 90vh !important;
          }
          .login-panel {
            padding: 30px 20px !important;
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
        padding: '0',
        margin: '0',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        <div className="login-container">

          <div className="illustration-panel">
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>

            <div style={{
              position: 'absolute',
              bottom: '-80px',
              right: '-80px',
              width: '250px',
              height: '250px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>

            <div style={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center'
            }}>
              <div style={{
                width: '280px',
                height: '280px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px'
                }}>
                  <img
                    src={logo}
                    alt="QuadraCerta Logo"
                    style={{
                      width: '320px',
                      height: '320px',
                      objectFit: 'contain',
                      marginBottom: '40px',
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '30px',
                color: 'white',
                fontSize: '28px',
                fontWeight: '600',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                QuadraCerta
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                marginTop: '8px'
              }}>
                Gerencie suas quadras com facilidade
              </div>
            </div>
          </div>

          <div className="login-panel">
            <div style={{
              maxWidth: '350px',
              margin: '0 auto',
              width: '100%'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                LOGIN
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Entre com suas credenciais
              </p>

              {error && (
                <div style={{
                  padding: '12px 15px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#c33',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '6px',
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
                      padding: '12px 15px',
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
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '6px',
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
                      padding: '12px 15px',
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
                      style={{
                        marginRight: '6px',
                        cursor: 'pointer',
                        width: '15px',
                        height: '15px'
                      }}
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
    </div>
  );
};

export default Login;
