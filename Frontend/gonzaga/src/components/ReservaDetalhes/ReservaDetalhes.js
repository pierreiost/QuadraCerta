import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Person,
  Phone,
  Schedule,
  CalendarToday,
  Cancel,
  Edit,
  SportsFootball
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/pt-br';

import { reservasService } from '../../services/api';
import { quadraColors } from '../../theme/theme';

moment.locale('pt-br');

const ReservaDetalhes = ({ 
  open, 
  onClose, 
  reserva, 
  onReservaAtualizada,
  onEditarReserva 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  if (!reserva) return null;

  const handleCancelarReserva = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await reservasService.cancelar(reserva.id, motivoCancelamento.trim());
      
      if (response.success) {
        setShowCancelDialog(false);
        setMotivoCancelamento('');
        onReservaAtualizada();
        onClose();
      } else {
        setError(response.message || 'Erro ao cancelar reserva');
      }
    } catch (error) {
      setError(error.message || 'Erro ao cancelar reserva');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return moment(data).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const formatarHorario = (horaInicio, horaFim) => {
    return `${horaInicio} às ${horaFim}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'success';
      case 'cancelada': return 'error';
      case 'pendente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const podeEditar = () => {
    return reserva.status === 'confirmada';
  };

  const podeCancelar = () => {
    return reserva.status === 'confirmada';
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Detalhes da Reserva
            </Typography>
            <Chip
              label={getStatusText(reserva.status)}
              color={getStatusColor(reserva.status)}
              size="small"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ py: 1 }}>
            {/* Cliente */}
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {reserva.cliente?.nome || reserva.cliente_nome}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {reserva.cliente?.telefone || reserva.cliente_telefone}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Quadra */}
            <Box display="flex" alignItems="center" mb={2}>
              <SportsFootball sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {reserva.quadra_nome}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipo: {reserva.quadra_tipo}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Data e Horário */}
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {formatarData(reserva.data)}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatarHorario(reserva.hora_inicio, reserva.hora_fim)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Observações */}
            {reserva.observacoes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Observações:
                  </Typography>
                  <Typography variant="body1">
                    {reserva.observacoes}
                  </Typography>
                </Box>
              </>
            )}

            {/* Tipo */}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Tipo de reserva:
              </Typography>
              <Chip
                label={reserva.tipo === 'pontual' ? 'Pontual' : 'Recorrente'}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Fechar
          </Button>
          
          {podeEditar() && onEditarReserva && (
            <Button
              startIcon={<Edit />}
              onClick={() => {
                onEditarReserva(reserva);
                onClose();
              }}
              variant="outlined"
            >
              Editar
            </Button>
          )}
          
          {podeCancelar() && (
            <Button
              startIcon={<Cancel />}
              onClick={() => setShowCancelDialog(true)}
              color="error"
              variant="outlined"
            >
              Cancelar Reserva
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancelar Reserva</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Tem certeza que deseja cancelar a reserva de{' '}
            <strong>{reserva.cliente?.nome || reserva.cliente_nome}</strong>{' '}
            para {formatarData(reserva.data)} às {reserva.hora_inicio}?
          </Typography>
          
          <TextField
            fullWidth
            label="Motivo do cancelamento (opcional)"
            multiline
            rows={3}
            value={motivoCancelamento}
            onChange={(e) => setMotivoCancelamento(e.target.value)}
            placeholder="Ex: Cliente solicitou cancelamento, chuva, etc."
            sx={{ mt: 2 }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowCancelDialog(false)}
            disabled={loading}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleCancelarReserva}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReservaDetalhes;