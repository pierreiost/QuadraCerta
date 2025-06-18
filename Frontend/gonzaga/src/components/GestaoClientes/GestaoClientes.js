import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Phone,
  Email,
  Person,
  History,
  ArrowBack
} from '@mui/icons-material';

import { clientesService } from '../../services/api';
import ClienteForm from '../ClienteForm/ClienteForm';

const GestaoClientes = ({ onVoltar }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  
  // Estados dos modais
  const [modalForm, setModalForm] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalHistorico, setModalHistorico] = useState(false);
  
  // Cliente selecionado para operações
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    // Busca com debounce
    const timer = setTimeout(() => {
      if (busca.length >= 2 || busca.length === 0) {
        buscarClientes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busca]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientesService.getAll();
      
      if (response.success) {
        setClientes(response.data);
      } else {
        setError('Erro ao carregar clientes');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = async () => {
    try {
      setBuscandoClientes(true);
      const response = await clientesService.getAll(busca);
      
      if (response.success) {
        setClientes(response.data);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setBuscandoClientes(false);
    }
  };

  const handleNovoCliente = () => {
    setClienteSelecionado(null);
    setModalForm(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setModalForm(true);
  };

  const handleExcluirCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setModalExcluir(true);
  };

  const confirmarExclusao = async () => {
    try {
      setLoading(true);
      const response = await clientesService.delete(clienteSelecionado.id);
      
      if (response.success) {
        setClientes(prev => prev.filter(c => c.id !== clienteSelecionado.id));
        setModalExcluir(false);
        setClienteSelecionado(null);
      } else {
        setError('Erro ao excluir cliente');
      }
    } catch (error) {
      setError('Erro ao excluir cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorico = async (cliente) => {
    try {
      setClienteSelecionado(cliente);
      setCarregandoHistorico(true);
      setModalHistorico(true);
      
      const response = await clientesService.getHistorico(cliente.id);
      
      if (response.success) {
        setHistoricoReservas(response.data);
      } else {
        setHistoricoReservas([]);
      }
    } catch (error) {
      setHistoricoReservas([]);
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const handleSuccessForm = (novoCliente) => {
    if (clienteSelecionado) {
      // Editando - atualizar na lista
      setClientes(prev => prev.map(c => 
        c.id === clienteSelecionado.id ? { ...c, ...novoCliente } : c
      ));
    } else {
      // Novo cliente - recarregar lista
      carregarClientes();
    }
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const nums = telefone.replace(/\D/g, '');
    if (nums.length === 11) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    }
    if (nums.length === 10) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onVoltar} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Gestão de Clientes
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNovoCliente}
          color="primary"
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Busca */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome, telefone ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: buscandoClientes && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabela de Clientes */}
      {!loading && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clientes Cadastrados ({clientes.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Contato</TableCell>
                    <TableCell>Reservas</TableCell>
                    <TableCell>Última Reserva</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1" color="text.secondary">
                          {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientes.map((cliente) => (
                      <TableRow key={cliente.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {cliente.nome}
                            </Typography>
                            {cliente.observacoes && (
                              <Typography variant="caption" color="text.secondary">
                                {cliente.observacoes.substring(0, 50)}
                                {cliente.observacoes.length > 50 ? '...' : ''}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatarTelefone(cliente.telefone)}
                              </Typography>
                            </Box>
                            {cliente.email && (
                              <Box display="flex" alignItems="center">
                                <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {cliente.email}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={`${cliente.total_reservas || 0} reservas`}
                            size="small"
                            color={cliente.total_reservas > 0 ? "primary" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {cliente.ultima_reserva ? formatarData(cliente.ultima_reserva) : 'Nunca'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleVerHistorico(cliente)}
                              title="Ver Histórico"
                            >
                              <History />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditarCliente(cliente)}
                              title="Editar"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleExcluirCliente(cliente)}
                              title="Excluir"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Modal de Formulário */}
      <ClienteForm
        open={modalForm}
        onClose={() => setModalForm(false)}
        onSuccess={handleSuccessForm}
        clienteEditando={clienteSelecionado}
      />

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={modalExcluir} onClose={() => setModalExcluir(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o cliente <strong>{clienteSelecionado?.nome}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalExcluir(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={modalHistorico} onClose={() => setModalHistorico(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Histórico de Reservas - {clienteSelecionado?.nome}
        </DialogTitle>
        <DialogContent>
          {carregandoHistorico ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : historicoReservas.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              Nenhuma reserva encontrada
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Quadra</TableCell>
                    <TableCell>Horário</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicoReservas.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>{formatarData(reserva.data)}</TableCell>
                      <TableCell>{reserva.quadra_nome}</TableCell>
                      <TableCell>{reserva.hora_inicio} - {reserva.hora_fim}</TableCell>
                      <TableCell>
                        <Chip
                          label={reserva.status}
                          size="small"
                          color={reserva.status === 'confirmada' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalHistorico(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestaoClientes;