import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    cnpj: '',
    complexName: ''
  });
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

    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.phone || !formData.cnpj || !formData.complexName) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('A senha deve conter letras minúsculas');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('A senha deve conter letras maiúsculas');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('A senha deve conter números');
      return;
    }

    if (!/[@$!%*?&#]/.test(formData.password)) {
      setError('A senha deve conter caracteres especiais (@$!%*?&#)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError('Telefone inválido. Use (XX) XXXXX-XXXX');
      return;
    }

    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        setError('CPF inválido. Use XXX.XXX.XXX-XX');
        return;
      }
    }

    const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      setError('CNPJ inválido. Use XX.XXX.XXX/XXXX-XX');
      return;
    }

    setLoading(true);

    const result = await register(formData);
    
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
        
        .register-container {
          width: 85vw;
          height: 85vh;
          max-width: 1200px;
          max-height: 750px;
          min-height: 550px;
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
        
        .register-panel {
          flex: 1;
          background: #f5f5f5;
          padding: 40px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow-y: auto;
        }
        
        @media (max-width: 968px) {
          .illustration-panel {
            display: none !important;
          }
          .register-container {
            width: 90vw !important;
            max-width: 500px !important;
          }
          .register-panel {
            padding: 40px 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          .register-container {
            width: 95vw !important;
            height: 90vh !important;
          }
          .register-panel {
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
        <div className="register-container">
          
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
                width: '120px',
                height: '120px',
                margin: '0 auto 30px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>

              <div style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: '600',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginBottom: '16px'
              }}>
                Bem-vindo ao QuadraCerta
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                maxWidth: '320px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Crie sua conta e comece a gerenciar suas quadras de forma profissional
              </div>

              <div style={{
                marginTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '280px',
                margin: '40px auto 0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: '14px', color: 'white' }}>Agendamento Online</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: '14px', color: 'white' }}>Controle Financeiro</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: '14px', color: 'white' }}>Gestão de Clientes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="register-panel">
            <div style={{
              maxWidth: '400px',
              margin: '0 auto',
              width: '100%'
            }}>
              <h2 style={{
                fontSize: '26px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                CRIAR CONTA
              </h2>
              <p style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Preencha seus dados para começar
              </p>

              {error && (
                <div style={{
                  padding: '10px 12px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  color: '#c33',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="João"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
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

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Silva"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
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
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Email *
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
                      padding: '10px 12px',
                      fontSize: '13px',
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
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
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

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
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
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    CNPJ do Complexo *
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    required
                    maxLength="18"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
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

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Nome do Complexo *
                  </label>
                  <input
                    type="text"
                    name="complexName"
                    value={formData.complexName}
                    onChange={handleChange}
                    placeholder="Arena Sports Center"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
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

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Senha *
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
                      padding: '10px 12px',
                      fontSize: '13px',
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
                  <small style={{ fontSize: '10px', color: '#999', display: 'block', marginTop: '3px' }}>
                    Mín. 8 caracteres, maiúsculas, minúsculas, números e especiais
                  </small>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
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

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
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
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </button>

                <div style={{
                  marginTop: '15px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#34a853',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Fazer Login
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

export default Register;