import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { clientesService } from '../../services/api';

const ClienteForm = ({ 
  open, 
  onClose, 
  onSuccess, 
  clienteEditando = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    observacoes: ''
  });

  useEffect(() => {
    if (open) {
      if (clienteEditando) {
        setFormData({
          nome: clienteEditando.nome || '',
          telefone: clienteEditando.telefone || '',
          email: clienteEditando.email || '',
          cpf: clienteEditando.cpf || '',
          observacoes: clienteEditando.observacoes || ''
        });
      } else {
        limparFormulario();
      }
      setError('');
    }
  }, [open, clienteEditando]);

  const limparFormulario = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      cpf: '',
      observacoes: ''
    });
  };

  const handleChange = (campo) => (event) => {
    let valor = event.target.value;
    
    // Formatação específica para telefone
    if (campo === 'telefone') {
      valor = valor.replace(/\D/g, ''); // Remove não dígitos
      if (valor.length <= 11) {
        // Formato: (11) 99999-9999
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        valor = valor.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        valor = valor.replace(/^(\d{2})(\d{1,5})/, '($1) $2');
        valor = valor.replace(/^(\d{1,2})/, '($1');
      }
    }
    
    // Formatação para CPF
    if (campo === 'cpf') {
      valor = valor.replace(/\D/g, ''); // Remove não dígitos
      if (valor.length <= 11) {
        valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        valor = valor.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
      }
    }

    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (formData.nome.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }

    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    const telefoneNumeros = formData.telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      setError('Telefone deve ter pelo menos 10 dígitos');
      return false;
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Email inválido');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!validarFormulario()) {
        return;
      }

      const dadosCliente = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.replace(/\D/g, ''), // Salvar apenas números
        email: formData.email.trim() || null,
        cpf: formData.cpf.replace(/\D/g, '') || null, // Salvar apenas números
        observacoes: formData.observacoes.trim() || null
      };

      let response;
      if (clienteEditando) {
        response = await clientesService.update(clienteEditando.id, dadosCliente);
      } else {
        response = await clientesService.create(dadosCliente);
      }

      if (response.success) {
        onSuccess(response.data || dadosCliente);
        handleClose();
      } else {
        setError(response.message || 'Erro ao salvar cliente');
      }
    } catch (error) {
      setError(error.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    limparFormulario();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Nome */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome *"
              value={formData.nome}
              onChange={handleChange('nome')}
              placeholder="Nome completo do cliente"
              disabled={loading}
            />
          </Grid>

          {/* Telefone */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone *"
              value={formData.telefone}
              onChange={handleChange('telefone')}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="cliente@email.com"
              disabled={loading}
            />
          </Grid>

          {/* CPF */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPF"
              value={formData.cpf}
              onChange={handleChange('cpf')}
              placeholder="000.000.000-00"
              disabled={loading}
            />
          </Grid>

          {/* Observações */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={handleChange('observacoes')}
              placeholder="Observações adicionais sobre o cliente..."
              disabled={loading}
            />
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
          disabled={loading || !formData.nome.trim() || !formData.telefone.trim()}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            clienteEditando ? 'Atualizar' : 'Criar Cliente'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteForm;