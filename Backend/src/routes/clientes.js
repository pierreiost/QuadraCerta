// ===== backend/src/routes/clientes.js =====
const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// GET /api/clientes - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let clientes;
    if (search) {
      clientes = await Cliente.search(search);
    } else {
      clientes = await Cliente.getAll();
    }

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar clientes' 
    });
  }
});

// GET /api/clientes/:id - Buscar cliente específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.getById(id);
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar cliente' 
    });
  }
});

// POST /api/clientes - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, cpf, observacoes } = req.body;

    // Validações
    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
      });
    }

    if (!telefone || telefone.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefone é obrigatório e deve ter pelo menos 10 dígitos' 
      });
    }

    const cliente = await Cliente.create({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email?.trim() || null,
      cpf: cpf?.trim() || null,
      observacoes: observacoes?.trim() || null
    });

    res.status(201).json({
      success: true,
      data: cliente,
      message: 'Cliente criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao criar cliente'
    });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, cpf, observacoes } = req.body;

    // Validações
    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
      });
    }

    if (!telefone || telefone.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefone é obrigatório e deve ter pelo menos 10 dígitos' 
      });
    }

    const sucesso = await Cliente.update(id, {
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email?.trim() || null,
      cpf: cpf?.trim() || null,
      observacoes: observacoes?.trim() || null
    });

    if (!sucesso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao atualizar cliente'
    });
  }
});

// DELETE /api/clientes/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await Cliente.delete(id);

    if (!sucesso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Cliente removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar cliente' 
    });
  }
});

// GET /api/clientes/:id/historico - Histórico de reservas do cliente
router.get('/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    const historico = await Cliente.getHistoricoReservas(id);

    res.json({
      success: true,
      data: historico
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico' 
    });
  }
});

module.exports = router;
