const express = require('express');
const router = express.Router();
const Quadra = require('../models/Quadra');

// GET /api/quadras - Listar todas as quadras
router.get('/', async (req, res) => {
  try {
    const quadras = await Quadra.getAll();
    res.json({
      success: true,
      data: quadras
    });
  } catch (error) {
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar quadras' 
    });
  }
});

// GET /api/quadras/:id - Buscar quadra específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quadra = await Quadra.getById(id);
    
    if (!quadra) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quadra não encontrada' 
      });
    }

    res.json({
      success: true,
      data: quadra
    });
  } catch (error) {
    console.error('Erro ao buscar quadra:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar quadra' 
    });
  }
});

// PUT /api/quadras/:id/status - Atualizar status da quadra
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar status
    const statusValidos = ['disponivel', 'ocupada', 'manutencao', 'bloqueada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status inválido' 
      });
    }

    const sucesso = await Quadra.updateStatus(id, status);
    
    if (!sucesso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quadra não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status' 
    });
  }
});

// GET /api/quadras/status/dashboard - Status para dashboard
router.get('/status/dashboard', async (req, res) => {
  try {
    const status = await Quadra.getStatusAtual();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar status do dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar status' 
    });
  }
});

module.exports = router;