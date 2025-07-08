import axios from 'axios';

const api = axios.create({
  baseURL: 'https://abc123.ngrok.io/api',  // ← URL do ngrok
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logs de requisições
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas - detectar se usuário foi desconectado
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    
    // Se receber 401 ou 403, pode ser que a sessão expirou
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentAuth = localStorage.getItem('quadras_auth');
      if (currentAuth) {
        console.warn('Possível expiração de sessão detectada');
        // Aqui você poderia forçar logout, mas vamos deixar o AuthContext gerenciar
      }
    }
    
    return Promise.reject(error);
  }
);

// Resto dos serviços permanecem iguais...
export const authService = {
  async login(pin) {
    try {
      const response = await api.post('/auth/login', { pin });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getStatus() {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getLogs() {
    try {
      const response = await api.get('/auth/logs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  }
};

// Serviços de quadras
export const quadrasService = {
  async getAll() {
    try {
      const response = await api.get('/quadras');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/quadras/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await api.put(`/quadras/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getDashboardStatus() {
    try {
      const response = await api.get('/quadras/status/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  }
};

// Serviços de clientes
export const clientesService = {
  async getAll(search = '') {
    try {
      const url = search ? `/clientes?search=${encodeURIComponent(search)}` : '/clientes';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async create(clienteData) {
    try {
      const response = await api.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async update(id, clienteData) {
    try {
      const response = await api.put(`/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getHistorico(id) {
    try {
      const response = await api.get(`/clientes/${id}/historico`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  }
};

// Serviços de reservas
export const reservasService = {
  async getAll(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });
      
      const url = params.toString() ? `/reservas?${params}` : '/reservas';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async create(reservaData) {
    try {
      const response = await api.post('/reservas', reservaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async update(id, reservaData) {
    try {
      const response = await api.put(`/reservas/${id}`, reservaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async cancelar(id, motivo = '') {
    try {
      const response = await api.delete(`/reservas/${id}`, {
        data: { motivo }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getCalendarioQuadra(quadraId, dataInicio, dataFim) {
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      
      const url = `/reservas/quadra/${quadraId}/calendario?${params}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getHoje() {
    try {
      const response = await api.get('/reservas/especiais/hoje');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async getProximas(limite = 10) {
    try {
      const response = await api.get(`/reservas/especiais/proximas?limite=${limite}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  },

  async verificarConflito(dadosReserva) {
    try {
      const response = await api.post('/reservas/verificar-conflito', dadosReserva);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro de conexão' };
    }
  }
};

// Serviço para health check
export const healthService = {
  async check() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Servidor indisponível' };
    }
  }
};

export default api;