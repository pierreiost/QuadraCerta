import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Sports
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, authStatus, isLoading, checkAuthStatus } = useAuth();

  // Verificar status periodicamente se estiver bloqueado
  useEffect(() => {
    let interval;
    if (authStatus?.bloqueado) {
      interval = setInterval(() => {
        checkAuthStatus();
      }, 30000); // Verificar a cada 30 segundos
    }
    return () => interval && clearInterval(interval);
  }, [authStatus?.bloqueado, checkAuthStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validações básicas
    if (!pin) {
      setError('Por favor, digite o PIN');
      return;
    }
    
    if (pin.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(pin);
      
      if (!result.success) {
        setError(result.message);
        if (result.bloqueado) {
          setPin(''); // Limpar PIN se foi bloqueado
        }
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value.length <= 8) { // Máximo 8 dígitos
      setPin(value);
      setError(''); // Limpar erro ao digitar
    }
  };

  const toggleShowPin = () => {
    setShowPin(!showPin);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={2}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Sports sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Sistema de Quadras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerenciamento de Quadras Esportivas
            </Typography>
          </Box>

          {/* Status de bloqueio */}
          {authStatus?.bloqueado && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Sistema temporariamente bloqueado. Tente novamente em alguns minutos.
            </Alert>
          )}

          {/* Tentativas restantes */}
          {authStatus?.tentativas > 0 && !authStatus?.bloqueado && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {3 - authStatus.tentativas} tentativas restantes
            </Alert>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="PIN de Acesso"
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={handlePinChange}
              disabled={isSubmitting || authStatus?.bloqueado}
              placeholder="Digite seu PIN"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleShowPin}
                      disabled={isSubmitting || authStatus?.bloqueado}
                      edge="end"
                    >
                      {showPin ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              autoFocus
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || authStatus?.bloqueado || !pin}
              sx={{ mb: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Acessar Sistema'
              )}
            </Button>
          </form>

          {/* Info adicional */}
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Acesso restrito ao administrador
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;