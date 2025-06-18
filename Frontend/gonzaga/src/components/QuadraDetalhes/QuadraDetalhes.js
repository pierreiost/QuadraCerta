import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Add,
  Settings,
  CalendarToday,
  Edit,
  Delete
} from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { quadrasService, reservasService } from '../../services/api';
import { quadraColors } from '../../theme/theme';
import ReservaForm from '../ReservaForm/ReservaForm';
import ReservaDetalhes from '../ReservaDetalhes/ReservaDetalhes';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const QuadraDetalhes = ({ quadraId, onVoltar }) => {
  const [quadra, setQuadra] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogStatus, setDialogStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  
  // Estados para reservas
  const [modalReserva, setModalReserva] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [dataInicialReserva, setDataInicialReserva] = useState(null);
  const [horaInicialReserva, setHoraInicialReserva] = useState(null);

  useEffect(() => {
    if (quadraId) {
      carregarDados();
    }
  }, [quadraId]);

  const carregarDados = async () => {
    try {
      setError('');
      setLoading(true);

      // Carregar dados da quadra
      const quadraResponse = await quadrasService.getById(quadraId);
      if (quadraResponse.success) {
        setQuadra(quadraResponse.data);
        setNovoStatus(quadraResponse.data.status);
      }

      // Carregar eventos do calendário (próximos 30 dias)
      const hoje = new Date();
      const daqui30Dias = new Date();
      daqui30Dias.setDate(hoje.getDate() + 30);

      const calendarioResponse = await reservasService.getCalendarioQuadra(
        quadraId,
        hoje.toISOString().split('T')[0],
        daqui30Dias.toISOString().split('T')[0]
      );

      if (calendarioResponse.success) {
        // Converter eventos para formato do react-big-calendar
        const eventosFormatados = calendarioResponse.data.map(evento => ({
          id: evento.id,
          title: evento.title,
          start: new Date(evento.start),
          end: new Date(evento.end),
          resource: evento
        }));
        
        setEventos(eventosFormatados);
      }

    } catch (error) {
      setError('Erro ao carregar dados da quadra');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async () => {
    try {
      setAtualizandoStatus(true);
      const response = await quadrasService.updateStatus(quadraId, novoStatus);
      
      if (response.success) {
        setQuadra(prev => ({ ...prev, status: novoStatus }));
        setDialogStatus(false);
      } else {
        setError('Erro ao atualizar status da quadra');
      }
    } catch (error) {
      setError('Erro ao atualizar status da quadra');
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const handleNovaReserva = () => {
    setReservaSelecionada(null);
    setDataInicialReserva(null);
    setHoraInicialReserva(null);
    setModalReserva(true);
  };

  const handleSelecionarSlot = (slotInfo) => {
    // Quando clicar em um horário vazio, abrir modal de nova reserva
    setReservaSelecionada(null);
    setDataInicialReserva(slotInfo.start);
    setHoraInicialReserva(moment(slotInfo.start).format('HH:mm'));
    setModalReserva(true);
  };

  const handleSelecionarEvento = async (evento) => {
    try {
      // Buscar dados completos da reserva
      const response = await reservasService.getById(evento.id);
      if (response.success) {
        setReservaSelecionada(response.data);
        setModalDetalhes(true);
      }
    } catch (error) {
      setError('Erro ao carregar detalhes da reserva');
    }
  };

  const handleEditarReserva = (reserva) => {
    setReservaSelecionada(reserva);
    setModalReserva(true);
    setModalDetalhes(false);
  };

  const handleSuccessReserva = (dadosReserva) => {
    // Recarregar dados após criar/editar reserva
    carregarDados();
  };

  const handleReservaAtualizada = () => {
    // Recarregar dados após cancelar/atualizar reserva
    carregarDados();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel': return 'success';
      case 'ocupada': return 'error';
      case 'manutencao': return 'warning';
      case 'bloqueada': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'ocupada': return 'Ocupada';
      case 'manutencao': return 'Manutenção';
      case 'bloqueada': return 'Bloqueada';
      default: return status;
    }
  };

  const messages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: total => `+ Ver mais (${total})`
  };

  // Estilo personalizado para eventos
  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = quadra ? quadraColors[quadra.tipo] || '#3174ad' : '#3174ad';
    
    // Diferentes cores baseadas no status
    if (event.resource?.status === 'cancelada') {
      backgroundColor = '#DC3545';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource?.status === 'cancelada' ? 0.5 : 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'pointer'
      }
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!quadra) {
    return (
      <Box p={3}>
        <Alert severity="error">Quadra não encontrada</Alert>
        <Button onClick={onVoltar} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onVoltar} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {quadra.nome}
          </Typography>
          <Chip
            label={getStatusText(quadra.status)}
            color={getStatusColor(quadra.status)}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setDialogStatus(true)}
          >
            Alterar Status
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={handleNovaReserva}
          >
            Nova Reserva
          </Button>
          <IconButton onClick={carregarDados}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Informações da Quadra */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                Informações da Quadra
              </Typography>
              <Typography variant="body1">
                <strong>Tipo:</strong> {quadra.tipo}
              </Typography>
              <Typography variant="body1">
                <strong>Horário de funcionamento:</strong> {quadra.horario_abertura} às {quadra.horario_fechamento}
              </Typography>
              <Typography variant="body1">
                <strong>Intervalo entre reservas:</strong> {quadra.intervalo_reservas} minutos
              </Typography>
              {quadra.observacoes && (
                <Typography variant="body1">
                  <strong>Observações:</strong> {quadra.observacoes}
                </Typography>
              )}
            </Box>
            
            <Box textAlign="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: quadraColors[quadra.tipo] || '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1
                }}
              >
                <CalendarToday sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="caption">
                {eventos.length} reservas
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Calendário de Reservas
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              Clique em uma reserva para ver detalhes ou cancelar
            </Typography>
          </Typography>
          
          <Box sx={{ height: 600, mt: 2 }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
              step={30}
              timeslots={2}
              min={new Date(0, 0, 0, 6, 0, 0)} // 06:00
              max={new Date(0, 0, 0, 23, 0, 0)} // 23:00
              onSelectEvent={handleSelecionarEvento}
              onSelectSlot={handleSelecionarSlot}
              selectable
              popup
            />
          </Box>
        </CardContent>
      </Card>

      {/* FAB para nova reserva */}
      <Fab
        color="primary"
        aria-label="nova reserva"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
        onClick={handleNovaReserva}
      >
        <Add />
      </Fab>

      {/* Dialog para alterar status */}
      <Dialog open={dialogStatus} onClose={() => setDialogStatus(false)}>
        <DialogTitle>Alterar Status da Quadra</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={novoStatus}
              label="Status"
              onChange={(e) => setNovoStatus(e.target.value)}
            >
              <MenuItem value="disponivel">Disponível</MenuItem>
              <MenuItem value="ocupada">Ocupada</MenuItem>
              <MenuItem value="manutencao">Manutenção</MenuItem>
              <MenuItem value="bloqueada">Bloqueada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogStatus(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAtualizarStatus}
            variant="contained"
            disabled={atualizandoStatus}
          >
            {atualizandoStatus ? <CircularProgress size={20} /> : 'Atualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Reserva */}
      <ReservaForm
        open={modalReserva}
        onClose={() => setModalReserva(false)}
        onSuccess={handleSuccessReserva}
        quadraId={quadraId}
        dataInicial={dataInicialReserva}
        horaInicial={horaInicialReserva}
        reservaEditando={reservaSelecionada}
      />

      {/* Modal de Detalhes da Reserva */}
      <ReservaDetalhes
        open={modalDetalhes}
        onClose={() => setModalDetalhes(false)}
        reserva={reservaSelecionada}
        onReservaAtualizada={handleReservaAtualizada}
        onEditarReserva={handleEditarReserva}
      />
    </Box>
  );
};

export default QuadraDetalhes;