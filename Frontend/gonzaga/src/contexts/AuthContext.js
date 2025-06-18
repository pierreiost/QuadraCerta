import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    checkAuthStatus();
    
    // Verificar se há sessão salva
    const savedAuth = localStorage.getItem('quadras_auth');
    const sessionStart = localStorage.getItem('quadras_session_start');
    
    if (savedAuth && sessionStart) {
      const sessionTime = Date.now() - parseInt(sessionStart);
      const maxSessionTime = 30 * 60 * 1000; // 30 minutos
      
      if (sessionTime < maxSessionTime) {
        console.log('Restaurando sessão válida');
        setIsAuthenticated(true);
        startSessionTimeout();
      } else {
        console.log('Sessão expirou, removendo...');
        clearSession();
      }
    }
    
    setIsLoading(false);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.getStatus();
      setAuthStatus(status);
      
      // Se está bloqueado, deslogar
      if (status.bloqueado) {
        clearSession();
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const startSessionTimeout = () => {
    // Limpar timeout anterior se existir
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Configurar novo timeout para 30 minutos
    const timeout = setTimeout(() => {
      console.log('Sessão expirou por tempo');
      logout();
    }, 30 * 60 * 1000); // 30 minutos

    setSessionTimeout(timeout);
  };

  const clearSession = () => {
    localStorage.removeItem('quadras_auth');
    localStorage.removeItem('quadras_session_start');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  const login = async (pin) => {
    try {
      setIsLoading(true);
      const result = await authService.login(pin);
      
      if (result.success) {
        // Salvar sessão no localStorage
        localStorage.setItem('quadras_auth', 'true');
        localStorage.setItem('quadras_session_start', Date.now().toString());
        
        setIsAuthenticated(true);
        startSessionTimeout();
        
        console.log('Login realizado com sucesso');
        return { success: true };
      } else {
        await checkAuthStatus(); // Atualizar status após falha
        return result;
      }
    } catch (error) {
      await checkAuthStatus();
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Fazendo logout...');
    clearSession();
    setIsAuthenticated(false);
    setAuthStatus(null);
  };

  // Função para renovar sessão (quando usuário faz alguma ação)
  const renewSession = () => {
    if (isAuthenticated) {
      localStorage.setItem('quadras_session_start', Date.now().toString());
      startSessionTimeout();
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    authStatus,
    login,
    logout,
    checkAuthStatus,
    renewSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};