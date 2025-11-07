import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPermissions();
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      // ADMIN e SUPER_ADMIN têm todas as permissões
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        setPermissions(['*']); // Wildcard = todas as permissões
        setLoading(false);
        return;
      }

      // Carregar permissões do usuário
      const response = await api.get(`/permissions/user/${user.id}`);
      const userPermissions = response.data.permissions.map(
        p => `${p.module}.${p.action}`
      );
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module, action) => {
    // ADMIN sempre tem permissão
    if (permissions.includes('*')) return true;
    
    // Verificar permissão específica
    return permissions.includes(`${module}.${action}`);
  };

  const hasAnyPermission = (permissionsList) => {
    if (permissions.includes('*')) return true;
    
    return permissionsList.some(perm => {
      const [module, action] = perm.split('.');
      return permissions.includes(`${module}.${action}`);
    });
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  };
};
