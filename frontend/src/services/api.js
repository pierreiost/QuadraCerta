import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Serviços de Quadras
export const courtService = {
  getAll: () => api.get('/courts'),
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post('/courts', data),
  update: (id, data) => api.put(`/courts/${id}`, data),
  delete: (id) => api.delete(`/courts/${id}`),
};

// Serviços de Clientes
export const clientService = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Serviços de Reservas
export const reservationService = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  cancel: (id) => api.delete(`/reservations/${id}`),
};

// Serviços de Produtos
export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addStock: (id, quantity, reason) =>
    api.post(`/products/${id}/stock/add`, { quantity, reason }),
  removeStock: (id, quantity, reason) =>
    api.post(`/products/${id}/stock/remove`, { quantity, reason }),
};

// Serviços de Comandas
export const tabService = {
  getAll: (params) => api.get('/tabs', { params }),
  getById: (id) => api.get(`/tabs/${id}`),
  create: (data) => api.post('/tabs', data),
  addItem: (id, data) => api.post(`/tabs/${id}/items`, data),
  removeItem: (id, itemId) => api.delete(`/tabs/${id}/items/${itemId}`),
  close: (id) => api.post(`/tabs/${id}/close`),
  cancel: (id) => api.delete(`/tabs/${id}`),
};

// Serviços de Dashboard
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getUpcoming: () => api.get('/dashboard/upcoming'),
  getRevenue: (params) => api.get('/dashboard/revenue', { params }),
  getOccupancy: (params) => api.get('/dashboard/occupancy', { params }),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, newPassword) =>
    api.put(`/users/${id}/reset-password`, { newPassword }),
};

export default api;
