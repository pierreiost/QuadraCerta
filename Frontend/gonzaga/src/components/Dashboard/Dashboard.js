import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  ExitToApp,
  Refresh,
  Add,
  Sports,
  SportsTennis,
  SportsSoccer
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { quadrasService, healthService } from '../../services/api';
import { quadraColors } from '../../theme/theme';

const Dashboard = () => {
  const [quadras, setQuadras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError('');
      
      // Verificar conectividade
      await healthService.check();
      
      // Carregar dados das quadras
      const response = await quadrasService.getDashboardStatus();
      
      if (response.success) {
        setQuadras(response.data);
        setLastUpdate(new Date());
      } else {
        setError('Erro ao carregar dados das quadras');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    logout();
  };

  const getQuadraIcon = (tipo) => {
    switch (tipo) {
      case 'futebol':
        return <SportsSoccer />;
      case 'beach_tenis':
        return <SportsTennis />;
      case 'society':
        return <Sports />;
      default:
        return <Sports />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel':
        return 'success';
      case 'ocupada':
        return 'error';
      case 'manutencao':
        return 'warning';
      case 'bloqueada':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'ocupada':
        return 'Ocupada';
      case 'manutencao':
        return 'Manutenção';
      case 'bloqueada':
        return 'Bloqueada';
      default:
        return status;
    }
  };

  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString('pt-BR');
  };

  const totalQuadras = quadras.length;
  const quadrasDisponiveis = quadras.filter(q => q.status === 'disponivel').length;
  const quadrasOcupadas = quadras.filter(q => q.status === 'ocupada').length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Sports sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Gerenciamento de Quadras
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleRefresh}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            <Refresh />
          </IconButton>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        {/* Resumo */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Quadras
                </Typography>
                <Typography variant="h4" component="div">
                  {totalQuadras}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Disponíveis
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {quadrasDisponiveis}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Ocupadas
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {quadrasOcupadas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Última Atualização
                </Typography>
                <Typography variant="h6" component="div">
                  {formatLastUpdate()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Botões de ação */}
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
          >
            Nova Reserva
          </Button>
          <Button
            variant="outlined"
            startIcon={<Sports />}
          >
            Gerenciar Quadras
          </Button>
        </Box>

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {/* Lista de Quadras */}
        {!loading && (
          <Grid container spacing={3}>
            {quadras.map((quadra) => (
              <Grid item xs={12} sm={6} md={4} key={quadra.id}>
                <Card 
                  sx={{ 
                    borderLeft: `4px solid ${quadraColors[quadra.tipo] || '#ccc'}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box 
                        sx={{ 
                          color: quadraColors[quadra.tipo] || '#ccc',
                          mr: 1 
                        }}
                      >
                        {getQuadraIcon(quadra.tipo)}
                      </Box>
                      <Typography variant="h6" component="div">
                        {quadra.nome}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        label={getStatusText(quadra.status)}
                        color={getStatusColor(quadra.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {quadra.reservas_hoje} reservas hoje
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Footer info */}
        <Box textAlign="center" mt={4}>
          <Typography variant="caption" color="text.secondary">
            Sistema de Gerenciamento de Quadras Esportivas v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;