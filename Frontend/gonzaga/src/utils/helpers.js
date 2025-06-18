// Funções utilitárias
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const validatePin = (pin) => {
  const pinStr = String(pin);
  return {
    isValid: /^\d{4,8}$/.test(pinStr),
    message: 'PIN deve conter entre 4 e 8 dígitos'
  };
};

export const getQuadraDisplayName = (tipo) => {
  return QUADRA_TYPES[tipo] || tipo;
};

export const getStatusDisplayName = (status) => {
  return STATUS_TYPES[status] || status;
};

// Função para lidar com erros de API
export const handleApiError = (error) => {
  if (error.response) {
    // Erro com resposta do servidor
    return error.response.data?.message || 'Erro no servidor';
  } else if (error.request) {
    // Erro de rede
    return 'Erro de conexão com o servidor';
  } else {
    // Outro tipo de erro
    return error.message || 'Erro desconhecido';
  }
};
