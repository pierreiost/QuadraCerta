// Constantes da aplicação
export const APP_CONFIG = {
  name: 'Sistema de Quadras Esportivas',
  version: '1.0.0',
  apiBaseUrl: 'http://localhost:3001/api',
  refreshInterval: 30000, // 30 segundos
  loginTimeout: 1800000, // 30 minutos
};

export const QUADRA_TYPES = {
  futebol: 'Futebol',
  beach_tenis: 'Beach Tênis',
  society: 'Society'
};

export const STATUS_TYPES = {
  disponivel: 'Disponível',
  ocupada: 'Ocupada',
  manutencao: 'Manutenção',
  bloqueada: 'Bloqueada'
};

export const COLORS = {
  primary: '#FF0000',
  secondary: '#DCDCDC',
  background: '#FFFFFF',
  futebol: '#28A745',
  beachTenis: '#FFC107',
  society: '#007BFF'
};
