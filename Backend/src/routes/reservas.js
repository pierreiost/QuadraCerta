const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

// Função auxiliar para validar data e hora
function validarDataHora(data, horaInicio) {
  try {
    // Obter data/hora atual no fuso horário local
    const agora = new Date();
    
    // Criar data da reserva
    const partesData = data.split('-'); // YYYY-MM-DD
    const partesHora = horaInicio.split(':'); // HH:MM
    
    const dataReserva = new Date(
      parseInt(partesData[0]), // ano
      parseInt(partesData[1]) - 1, // mês (0-based)
      parseInt(partesData[2]), // dia
      parseInt(partesHora[0]), // hora
      parseInt(partesHora[1]), // minuto
      0 // segundos
    );

    console.log('Validação de data/hora:');
    console.log('  Agora:', agora.toLocaleString('pt-BR'));
    console.log('  Reserva:', dataReserva.toLocaleString('pt-BR'));
    console.log('  Válida:', dataReserva > agora);

    // Retornar se a data da reserva é posterior ao momento atual
    return dataReserva > agora;
  } catch (error) {
    console.error('Erro ao validar data/hora:', error);
    return false;
  }
}

// GET /api/reservas - Listar reservas com filtros
router.get('/', async (req, res) => {
  try {
    const { quadra_id, data, data_inicio, data_fim, status } = req.query;
    
    const filtros = {};
    if (quadra_id) filtros.quadra_id = quadra_id;
    if (data) filtros.data = data;
    if (data_inicio && data_fim) {
      filtros.data_inicio = data_inicio;
      filtros.data_fim = data_fim;
    }
    if (status) filtros.status = status;

    const reservas = await Reserva.getAll(filtros);

    res.json({
      success: true,
      data: reservas
    });
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar reservas' 
    });
  }
});

// GET /api/reservas/:id - Buscar reserva específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.getById(id);
    
    if (!reserva) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva não encontrada' 
      });
    }

    res.json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar reserva' 
    });
  }
});

// POST /api/reservas - Criar nova reserva
router.post('/', async (req, res) => {
  try {
    const { 
      quadra_id, 
      cliente_id, 
      data, 
      hora_inicio, 
      hora_fim, 
      tipo,
      recorrencia,
      observacoes 
    } = req.body;

    console.log('=== CRIANDO NOVA RESERVA ===');
    console.log('Data:', data);
    console.log('Hora início:', hora_inicio);
    console.log('Hora fim:', hora_fim);

    // Validações básicas
    if (!quadra_id || !cliente_id || !data || !hora_inicio || !hora_fim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quadra, cliente, data, hora início e hora fim são obrigatórios' 
      });
    }

    // Validar formato de hora
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(hora_inicio) || !horaRegex.test(hora_fim)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de hora inválido (use HH:MM)' 
      });
    }

    // Validar se hora fim é após hora início
    if (hora_inicio >= hora_fim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hora de fim deve ser posterior à hora de início' 
      });
    }

    // VALIDAÇÃO DE DATA/HORA CORRIGIDA
    if (!validarDataHora(data, hora_inicio)) {
      const agora = new Date();
      const agoraFormatada = agora.toLocaleString('pt-BR');
      
      return res.status(400).json({ 
        success: false, 
        message: `O horário selecionado já passou. Horário atual: ${agoraFormatada}. Escolha um horário futuro.` 
      });
    }

    const reserva = await Reserva.create({
      quadra_id,
      cliente_id,
      data,
      hora_inicio,
      hora_fim,
      tipo: tipo || 'pontual',
      recorrencia,
      observacoes
    });

    console.log('✅ Reserva criada com sucesso');

    res.status(201).json({
      success: true,
      data: reserva,
      message: 'Reserva criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar reserva:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao criar reserva'
    });
  }
});

// PUT /api/reservas/:id - Atualizar reserva
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dadosReserva = req.body;

    console.log('=== ATUALIZANDO RESERVA ===');
    console.log('ID:', id);
    console.log('Dados:', dadosReserva);

    // Validar formato de hora se fornecido
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (dadosReserva.hora_inicio && !horaRegex.test(dadosReserva.hora_inicio)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de hora início inválido (use HH:MM)' 
      });
    }

    if (dadosReserva.hora_fim && !horaRegex.test(dadosReserva.hora_fim)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de hora fim inválido (use HH:MM)' 
      });
    }

    // Validar data/hora se fornecidas
    if (dadosReserva.data && dadosReserva.hora_inicio) {
      if (!validarDataHora(dadosReserva.data, dadosReserva.hora_inicio)) {
        const agora = new Date();
        const agoraFormatada = agora.toLocaleString('pt-BR');
        
        return res.status(400).json({ 
          success: false, 
          message: `O horário selecionado já passou. Horário atual: ${agoraFormatada}. Escolha um horário futuro.` 
        });
      }
    }

    const sucesso = await Reserva.update(id, dadosReserva);

    if (!sucesso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva não encontrada' 
      });
    }

    console.log('✅ Reserva atualizada com sucesso');

    res.json({
      success: true,
      message: 'Reserva atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar reserva:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao atualizar reserva'
    });
  }
});

// DELETE /api/reservas/:id - Cancelar reserva
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const sucesso = await Reserva.cancelar(id, motivo);

    if (!sucesso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reserva não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Reserva cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cancelar reserva' 
    });
  }
});

// GET /api/reservas/quadra/:quadra_id/calendario - Reservas da quadra para calendário
router.get('/quadra/:quadra_id/calendario', async (req, res) => {
  try {
    const { quadra_id } = req.params;
    const { data_inicio, data_fim } = req.query;

    // Definir período padrão (próximos 30 dias)
    const inicio = data_inicio || new Date().toISOString().split('T')[0];
    const fim = data_fim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const reservas = await Reserva.getReservasPorQuadra(quadra_id, inicio, fim);

    // Formatar para o calendário
    const eventos = reservas.map(reserva => ({
      id: reserva.id,
      title: `${reserva.cliente_nome}`,
      start: `${reserva.data}T${reserva.hora_inicio}`,
      end: `${reserva.data}T${reserva.hora_fim}`,
      cliente: {
        nome: reserva.cliente_nome,
        telefone: reserva.cliente_telefone
      },
      observacoes: reserva.observacoes,
      status: reserva.status
    }));

    res.json({
      success: true,
      data: eventos
    });
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar dados do calendário' 
    });
  }
});

// GET /api/reservas/hoje - Reservas de hoje
router.get('/especiais/hoje', async (req, res) => {
  try {
    const reservas = await Reserva.getReservasHoje();

    res.json({
      success: true,
      data: reservas
    });
  } catch (error) {
    console.error('Erro ao buscar reservas de hoje:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar reservas de hoje' 
    });
  }
});

// GET /api/reservas/proximas - Próximas reservas
router.get('/especiais/proximas', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const reservas = await Reserva.getProximasReservas(parseInt(limite));

    res.json({
      success: true,
      data: reservas
    });
  } catch (error) {
    console.error('Erro ao buscar próximas reservas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar próximas reservas' 
    });
  }
});

// POST /api/reservas/verificar-conflito - Verificar conflito de horário
router.post('/verificar-conflito', async (req, res) => {
  try {
    const { quadra_id, data, hora_inicio, hora_fim, excluir_id } = req.body;

    if (!quadra_id || !data || !hora_inicio || !hora_fim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quadra, data, hora início e hora fim são obrigatórios' 
      });
    }

    const temConflito = await Reserva.verificarConflito(quadra_id, data, hora_inicio, hora_fim, excluir_id);

    res.json({
      success: true,
      conflito: temConflito
    });
  } catch (error) {
    console.error('Erro ao verificar conflito:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar conflito' 
    });
  }
});

// GET /api/reservas/debug/agora - Debug do horário atual (TEMPORÁRIO)
router.get('/debug/agora', (req, res) => {
  const agora = new Date();
  res.json({
    success: true,
    agora: {
      timestamp: agora.getTime(),
      iso: agora.toISOString(),
      local: agora.toLocaleString('pt-BR'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
});

module.exports = router;