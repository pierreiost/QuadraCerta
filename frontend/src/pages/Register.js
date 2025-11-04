// frontend/src/pages/Register.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Building2, LogIn } from 'lucide-react';
import MaskedInput from '../components/MaskedInput';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    // Validar campos obrigatórios
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.phone || !formData.cnpj || !formData.complexName) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    // Validar senha forte
    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('A senha deve conter letras minúsculas');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('A senha deve conter letras maiúsculas');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('A senha deve conter números');
      return false;
    }

    if (!/[@$!%*?&#]/.test(formData.password)) {
      setError('A senha deve conter caracteres especiais (@$!%*?&#)');
      return false;
    }

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    // Validar telefone (deve ter 14 ou 15 caracteres com máscara)
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError('Telefone inválido. Use (XX) XXXXX-XXXX');
      return false;
    }

    // Validar CPF (se preenchido)
    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        setError('CPF inválido. Use XXX.XXX.XXX-XX');
        return false;
      }
    }

    // Validar CNPJ
    const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      setError('CNPJ inválido. Use XX.XXX.XXX/XXXX-XX');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cpf: formData.cpf || undefined,
        cnpj: formData.cnpj,
        complexName: formData.complexName
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="card" style={{ maxWidth: '600px', width: '90%', margin: '2rem' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--primary-color)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white'
          }}>
            <Building2 size={32} />
          </div>
          <h1 className="font-bold text-2xl">Criar Conta</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Cadastre seu complexo esportivo
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="firstName">Nome *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="João"
              />
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Sobrenome *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Silva"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="••••••••"
              />
              <small className="text-muted">
                Mín. 8 caracteres, maiúsculas, minúsculas, números e especiais
              </small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="phone">Telefone *</label>
              <MaskedInput
                mask="phone"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="input-group">
              <label htmlFor="cpf">CPF (Opcional)</label>
              <MaskedInput
                mask="cpf"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="cnpj">CNPJ do Complexo *</label>
            <MaskedInput
              mask="cnpj"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="input-group">
            <label htmlFor="complexName">Nome do Complexo *</label>
            <input
              type="text"
              id="complexName"
              name="complexName"
              value={formData.complexName}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Arena Sports Center"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span className="loading"></span>
            ) : (
              <>
                <LogIn size={18} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <p className="text-sm text-muted">
            Já tem uma conta?{' '}
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
