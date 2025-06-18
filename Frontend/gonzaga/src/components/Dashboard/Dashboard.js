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
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ExitToApp,
  Refresh,
  Add,
  Sports,
  SportsTennis,
  SportsSoccer,
  People,
  CalendarToday,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { quadrasService, reservasService, healthService } from '../../services/api';
import { quadraColors } from '../../theme/theme';
import QuadraDetalhes from '../QuadraDetalhes/QuadraDetalhes';
import GestaoClientes from '../GestaoClientes/GestaoClientes';
import ReservaForm from '../ReservaForm/ReservaForm';
import ReservaDetalhes from '../ReservaDetalhes/ReservaDetalhes';

const Dashboard = () => {
  const [quadras, setQuadras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'quadra', 'clientes'
  const [quadraSelecionada, setQuadraSelecionada] = useState(null);
  const [proximasReservas, setProximasReservas] = useState([]);
  const [modalReserva, setModalReserva] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  
  // Estados para cancelamento
  const [modalDetalhesReserva, setModalDetalhesReserva] = useState(false);
  const [reservaDetalhes, setReservaDetalhes] = useState(null);
  const [modalCancelamentoRapido, setModalCancelamentoRapido] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelandoReserva, setCancelandoReserva] = useState(false);
  
  const { logout } = useAuth();

  useEffect(() => {
    if (viewMode === 'dashboard') {
      loadDashboardData();
      
      // Atualizar dados a cada 30 segundos apenas no dashboard
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  const loadDashboardData = async () => {
    try {
      setError('');
      
      // Verificar conectividade
      await healthService.check();
      
      // Carregar dados das quadras
      const quadrasResponse = await quadrasService.getDashboardStatus();
      
      if (quadrasResponse.success) {
        setQuadras(quadrasResponse.data);
        setLastUpdate(new Date());
      }

      // Carregar próximas reservas
      const proximasResponse = await reservasService.getProximas(5);
      if (proximasResponse.success) {
        setProximasReservas(proximasResponse.data);
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

  const handleQuadraClick = (quadra) => {
    setQuadraSelecionada(quadra.id);
    setViewMode('quadra');
  };

  const handleVoltarDashboard = () => {
    setViewMode('dashboard');
    setQuadraSelecionada(null);
    loadDashboardData(); // Recarregar dados ao voltar
  };

  const handleGerenciarClientes = () => {
    setViewMode('clientes');
  };

  const handleNovaReserva = () => {
    setReservaSelecionada(null);
    setModalReserva(true);
  };

  const handleSuccessReserva = () => {
    loadDashboardData(); // Recarregar dados após criar reserva
  };

  // Funções para cancelamento de reservas
  const handleVerDetalhesReserva = async (reserva) => {
    try {
      // Buscar dados completos da reserva
      const response = await reservasService.getById(reserva.id);
      if (response.success) {
        setReservaDetalhes(response.data);
        setModalDetalhesReserva(true);
      }
    } catch (error) {
      setError('Erro ao carregar detalhes da reserva');
    }
  };

  const handleCancelarReservaRapida = (reserva) => {
    setReservaParaCancelar(reserva);
    setMotivoCancelamento('');
    setModalCancelamentoRapido(true);
  };

  const confirmarCancelamentoRapido = async () => {
    try {
      setCancelandoReserva(true);
      const response = await reservasService.cancelar(reservaParaCancelar.id, motivoCancelamento.trim());
      
      if (response.success) {
        setModalCancelamentoRapido(false);
        setReservaParaCancelar(null);
        setMotivoCancelamento('');
        loadDashboardData(); // Recarregar dados
      } else {
        setError(response.message || 'Erro ao cancelar reserva');
      }
    } catch (error) {
      setError(error.message || 'Erro ao cancelar reserva');
    } finally {
      setCancelandoReserva(false);
    }
  };

  const handleReservaAtualizada = () => {
    loadDashboardData(); // Recarregar dados do dashboard
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

  // Renderizar view específica
  if (viewMode === 'quadra' && quadraSelecionada) {
    return (
      <QuadraDetalhes 
        quadraId={quadraSelecionada} 
        onVoltar={handleVoltarDashboard}
      />
    );
  }

  if (viewMode === 'clientes') {
    return (
      <GestaoClientes 
        onVoltar={handleVoltarDashboard}
      />
    );
  }

  // Dashboard principal
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
            title="Atualizar dados"
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
        {/* Tabs */}
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Visão Geral" icon={<Assessment />} />
          <Tab label="Próximas Reservas" icon={<CalendarToday />} />
        </Tabs>

        {tabValue === 0 && (
          <>
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

            {/* Botões de ação principais */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  color="primary"
                  fullWidth
                  onClick={handleNovaReserva}
                  size="large"
                >
                  Nova Reserva
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  fullWidth
                  onClick={handleGerenciarClientes}
                  size="large"
                >
                  Gerenciar Clientes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  fullWidth
                  size="large"
                  onClick={() => setTabValue(1)}
                >
                  Ver Agenda
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  size="large"
                >
                  Relatórios
                </Button>
              </Grid>
            </Grid>

            {/* Loading */}
            {loading && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}

            {/* Lista de Quadras */}
            {!loading && (
              <>
                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                  Quadras Disponíveis
                </Typography>
                <Grid container spacing={3}>
                  {quadras.map((quadra) => (
                    <Grid item xs={12} sm={6} md={4} key={quadra.id}>
                      <Card 
                        sx={{ 
                          borderLeft: `4px solid ${quadraColors[quadra.tipo] || '#ccc'}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => handleQuadraClick(quadra)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuadraClick(quadra);
                            }}
                            startIcon={<CalendarToday />}
                          >
                            Ver Calendário
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">
                Próximas Reservas
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleNovaReserva}
              >
                Nova Reserva
              </Button>
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : proximasReservas.length === 0 ? (
              <Alert severity="info">
                Não há reservas próximas
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {proximasReservas.map((reserva) => (
                  <Grid item xs={12} md={6} lg={4} key={reserva.id}>
                    <Card sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6">
                            {reserva.cliente_nome}
                          </Typography>
                          <Chip 
                            label={reserva.quadra_nome}
                            size="small"
                            sx={{ 
                              backgroundColor: quadraColors[reserva.quadra_tipo] || '#ccc',
                              color: 'white' 
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📅 {new Date(reserva.data).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          🕐 {reserva.hora_inicio} às {reserva.hora_fim}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📞 {reserva.cliente_telefone}
                        </Typography>
                        
                        {reserva.observacoes && (
                          <Typography variant="body2" sx={{ 
                            mt: 1,
                            p: 1,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            💬 {reserva.observacoes}
                          </Typography>
                        )}

                        <Box display="flex" gap={1} mt={2}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleVerDetalhesReserva(reserva)}
                          >
                            Detalhes
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleCancelarReservaRapida(reserva)}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Footer info */}
        <Box textAlign="center" mt={6}>
          <Typography variant="caption" color="text.secondary">
            Sistema de Gerenciamento de Quadras Esportivas v1.0 - Desenvolvido para otimizar o controle de reservas
          </Typography>
        </Box>
      </Box>

      {/* Modal de Nova Reserva */}
      <ReservaForm
        open={modalReserva}
        onClose={() => setModalReserva(false)}
        onSuccess={handleSuccessReserva}
        reservaEditando={reservaSelecionada}
      />

      {/* Modal de Detalhes da Reserva */}
      <ReservaDetalhes
        open={modalDetalhesReserva}
        onClose={() => setModalDetalhesReserva(false)}
        reserva={reservaDetalhes}
        onReservaAtualizada={handleReservaAtualizada}
        onEditarReserva={(reserva) => {
          setReservaSelecionada(reserva);
          setModalReserva(true);
          setModalDetalhesReserva(false);
        }}
      />

      {/* Modal de Cancelamento Rápido */}
      <Dialog open={modalCancelamentoRapido} onClose={() => setModalCancelamentoRapido(false)}>
        <DialogTitle>Cancelar Reserva</DialogTitle>
        <DialogContent>
          {reservaParaCancelar && (
            <>
              <Typography gutterBottom>
                Cancelar reserva de <strong>{reservaParaCancelar.cliente_nome}</strong> 
                {' '}para {new Date(reservaParaCancelar.data).toLocaleDateString('pt-BR')} 
                {' '}às {reservaParaCancelar.hora_inicio}?
              </Typography>
              
              <TextField
                fullWidth
                label="Motivo (opcional)"
                multiline
                rows={2}
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Ex: Cliente solicitou cancelamento"
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setModalCancelamentoRapido(false)}
            disabled={cancelandoReserva}
          >
            Voltar
          </Button>
          <Button 
            onClick={confirmarCancelamentoRapido}
            color="error"
            variant="contained"
            disabled={cancelandoReserva}
          >
            {cancelandoReserva ? <CircularProgress size={20} /> : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;