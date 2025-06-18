import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
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

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    return Promise.reject(error);
  }
);

// Serviços de autenticação
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

