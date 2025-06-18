// ===== frontend/src/contexts/AuthContext.js =====
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

  // Verificar status de autenticação ao inicializar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.getStatus();
      setAuthStatus(status);
      
      // Se está bloqueado, não permitir acesso
      if (status.bloqueado) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (pin) => {
    try {
      setIsLoading(true);
      const result = await authService.login(pin);
      
      if (result.success) {
        setIsAuthenticated(true);
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
    setIsAuthenticated(false);
    setAuthStatus(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    authStatus,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
