const express = require('express');
const router = express.Router();
const Auth = require('../models/Auth');

// Middleware para capturar IP
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.headers['x-forwarded-for'] ||
         'unknown';
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { pin } = req.body;
    const clientIP = getClientIP(req);

    // Validar entrada
    if (!pin || pin.length < 4) {
      await Auth.logarAcesso('LOGIN_FALHA', 'PIN inválido ou muito curto', clientIP);
      return res.status(400).json({ 
        success: false, 
        message: 'PIN deve ter pelo menos 4 dígitos' 
      });
    }

    // Verificar se está bloqueado
    const estaBloqueado = await Auth.verificarBloqueio();
    if (estaBloqueado) {
      await Auth.logarAcesso('LOGIN_BLOQUEADO', 'Tentativa durante bloqueio', clientIP);
      return res.status(423).json({ 
        success: false, 
        message: 'Sistema temporariamente bloqueado. Tente novamente em 15 minutos.' 
      });
    }

    // Validar PIN
    const pinValido = await Auth.validatePin(pin);

    if (pinValido) {
      // Login bem-sucedido
      await Auth.resetarTentativas();
      await Auth.logarAcesso('LOGIN_SUCESSO', 'Login realizado com sucesso', clientIP);
      
      res.json({ 
        success: true, 
        message: 'Login realizado com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      // PIN incorreto
      const tentativas = await Auth.incrementarTentativas();
      await Auth.logarAcesso('LOGIN_FALHA', `PIN incorreto - Tentativa ${tentativas}`, clientIP);

      if (tentativas >= 3) {
        await Auth.bloquearLogin(15);
        await Auth.logarAcesso('SISTEMA_BLOQUEADO', 'Sistema bloqueado por 3 tentativas', clientIP);
        
        return res.status(423).json({ 
          success: false, 
          message: 'Muitas tentativas incorretas. Sistema bloqueado por 15 minutos.',
          tentativas: tentativas,
          bloqueado: true
        });
      }

      res.status(401).json({ 
        success: false, 
        message: `PIN incorreto. ${3 - tentativas} tentativas restantes.`,
        tentativas: tentativas
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/auth/status
router.get('/status', async (req, res) => {
  try {
    const estaBloqueado = await Auth.verificarBloqueio();
    const tentativas = await Auth.getTentativasLogin();

    res.json({
      success: true,
      bloqueado: estaBloqueado,
      tentativas: tentativas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar status' 
    });
  }
});

// GET /api/auth/logs (últimos 50 logs)
router.get('/logs', async (req, res) => {
  try {
    const database = require('../config/database');
    const logs = await database.query(`
      SELECT acao, detalhes, ip_address, created_at
      FROM logs_acesso 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    res.json({
      success: true,
      logs: logs
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar logs' 
    });
  }
});

module.exports = router;
