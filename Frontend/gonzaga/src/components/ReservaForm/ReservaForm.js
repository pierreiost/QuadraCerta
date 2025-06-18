import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/pt-br';

import { reservasService, clientesService, quadrasService } from '../../services/api';

moment.locale('pt-br');

const ReservaForm = ({ 
  open, 
  onClose, 
  onSuccess, 
  quadraId = null, 
  dataInicial = null,
  horaInicial = null,
  reservaEditando = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quadras, setQuadras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  const [verificandoConflito, setVerificandoConflito] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    quadra_id: quadraId || '',
    cliente_id: '',
    data: dataInicial ? moment(dataInicial) : moment(),
    hora_inicio: horaInicial ? moment(horaInicial, 'HH:mm') : moment().hour(9).minute(0),
    hora_fim: horaInicial ? moment(horaInicial, 'HH:mm').add(1, 'hour') : moment().hour(10).minute(0),
    tipo: 'pontual',
    observacoes: ''
  });
  
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [conflito, setConflito] = useState(false);

  useEffect(() => {
    if (open) {
      carregarDados();
      if (reservaEditando) {
        preencherFormularioEdicao();
      }
    }
  }, [open, reservaEditando]);

  useEffect(() => {
    // Verificar conflito quando mudar dados relevantes
    if (formData.quadra_id && formData.data && formData.hora_inicio && formData.hora_fim) {
      verificarConflito();
    }
  }, [formData.quadra_id, formData.data, formData.hora_inicio, formData.hora_fim]);

  const carregarDados = async () => {
    try {
      // Carregar quadras
      const quadrasResponse = await quadrasService.getAll();
      if (quadrasResponse.success) {
        setQuadras(quadrasResponse.data);
      }

      // Carregar clientes
      await buscarClientes('');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const preencherFormularioEdicao = async () => {
    try {
      const reserva = reservaEditando;
      
      // Buscar dados do cliente
      const clienteResponse = await clientesService.getById(reserva.cliente_id);
      if (clienteResponse.success) {
        setClienteSelecionado(clienteResponse.data);
      }

      setFormData({
        quadra_id: reserva.quadra_id,
        cliente_id: reserva.cliente_id,
        data: moment(reserva.data),
        hora_inicio: moment(reserva.hora_inicio, 'HH:mm'),
        hora_fim: moment(reserva.hora_fim, 'HH:mm'),
        tipo: reserva.tipo || 'pontual',
        observacoes: reserva.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
    }
  };

  const buscarClientes = async (termo) => {
    try {
      setBuscandoClientes(true);
      const response = await clientesService.getAll(termo);
      if (response.success) {
        setClientes(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setBuscandoClientes(false);
    }
  };

  const verificarConflito = async () => {
    try {
      setVerificandoConflito(true);
      
      const dadosVerificacao = {
        quadra_id: formData.quadra_id,
        data: formData.data.format('YYYY-MM-DD'),
        hora_inicio: formData.hora_inicio.format('HH:mm'),
        hora_fim: formData.hora_fim.format('HH:mm'),
        excluir_id: reservaEditando?.id || null
      };

      const response = await reservasService.verificarConflito(dadosVerificacao);
      if (response.success) {
        setConflito(response.conflito);
      }
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
    } finally {
      setVerificandoConflito(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validações básicas
      if (!formData.quadra_id || !formData.cliente_id) {
        setError('Quadra e cliente são obrigatórios');
        return;
      }

      if (formData.hora_inicio.isSameOrAfter(formData.hora_fim)) {
        setError('Hora de início deve ser anterior à hora de fim');
        return;
      }

      if (conflito) {
        setError('Existe conflito de horário. Escolha outro horário.');
        return;
      }

      const dadosReserva = {
        quadra_id: formData.quadra_id,
        cliente_id: formData.cliente_id,
        data: formData.data.format('YYYY-MM-DD'),
        hora_inicio: formData.hora_inicio.format('HH:mm'),
        hora_fim: formData.hora_fim.format('HH:mm'),
        tipo: formData.tipo,
        observacoes: formData.observacoes.trim() || null
      };

      console.log('Enviando dados da reserva:', dadosReserva);

      let response;
      if (reservaEditando) {
        response = await reservasService.update(reservaEditando.id, dadosReserva);
      } else {
        response = await reservasService.create(dadosReserva);
      }

      if (response.success) {
        onSuccess(response.data || dadosReserva);
        handleClose();
      } else {
        setError(response.message || 'Erro ao salvar reserva');
      }
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setError(error.message || 'Erro ao salvar reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      quadra_id: quadraId || '',
      cliente_id: '',
      data: moment(),
      hora_inicio: moment().hour(9).minute(0),
      hora_fim: moment().hour(10).minute(0),
      tipo: 'pontual',
      observacoes: ''
    });
    setClienteSelecionado(null);
    setError('');
    setConflito(false);
    onClose();
  };

  const handleHoraInicioChange = (novaHora) => {
    if (novaHora) {
      const horaFim = novaHora.clone().add(1, 'hour');
      setFormData(prev => ({
        ...prev,
        hora_inicio: novaHora,
        hora_fim: horaFim
      }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="pt-br">
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {reservaEditando ? 'Editar Reserva' : 'Nova Reserva'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {conflito && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ Conflito de horário detectado! Já existe uma reserva neste período.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Quadra */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Quadra</InputLabel>
                <Select
                  value={formData.quadra_id}
                  label="Quadra"
                  onChange={(e) => setFormData(prev => ({ ...prev, quadra_id: e.target.value }))}
                  disabled={!!quadraId}
                >
                  {quadras.map((quadra) => (
                    <MenuItem key={quadra.id} value={quadra.id}>
                      {quadra.nome} ({quadra.tipo})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Cliente */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={clientes}
                getOptionLabel={(cliente) => `${cliente.nome} - ${cliente.telefone}`}
                value={clienteSelecionado}
                onChange={(event, novoCliente) => {
                  setClienteSelecionado(novoCliente);
                  setFormData(prev => ({ 
                    ...prev, 
                    cliente_id: novoCliente ? novoCliente.id : '' 
                  }));
                }}
                onInputChange={(event, novoTexto) => {
                  if (novoTexto.length >= 2) {
                    buscarClientes(novoTexto);
                  }
                }}
                loading={buscandoClientes}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    placeholder="Digite para buscar cliente..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {buscandoClientes ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, cliente) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{cliente.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cliente.telefone}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Data - SEM RESTRIÇÃO DE DATA MÍNIMA */}
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Data"
                value={formData.data}
                onChange={(novaData) => setFormData(prev => ({ ...prev, data: novaData }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
                // Removido minDate para permitir qualquer data
              />
            </Grid>

            {/* Hora Início */}
            <Grid item xs={12} md={4}>
              <TimePicker
                label="Hora Início"
                value={formData.hora_inicio}
                onChange={handleHoraInicioChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minutesStep={15}
                ampm={false}
              />
            </Grid>

            {/* Hora Fim */}
            <Grid item xs={12} md={4}>
              <TimePicker
                label="Hora Fim"
                value={formData.hora_fim}
                onChange={(novaHora) => setFormData(prev => ({ ...prev, hora_fim: novaHora }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minutesStep={15}
                ampm={false}
              />
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                >
                  <MenuItem value="pontual">Pontual</MenuItem>
                  <MenuItem value="recorrente">Recorrente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status de verificação */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" height="100%">
                {verificandoConflito ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">Verificando conflitos...</Typography>
                  </Box>
                ) : (
                  <Chip
                    label={conflito ? "Conflito detectado" : "Horário disponível"}
                    color={conflito ? "error" : "success"}
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </Grid>

            {/* Debug Info */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Debug: {formData.data.format('DD/MM/YYYY')} às {formData.hora_inicio.format('HH:mm')}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || conflito || !formData.quadra_id || !formData.cliente_id}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              reservaEditando ? 'Atualizar' : 'Criar Reserva'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReservaForm;