const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS mais permissivo para produção
app.use(cors({
  origin: true, // Permite qualquer origem
  credentials: true
}));
// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS - permitir apenas frontend local
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logs de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check (antes de conectar ao banco)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Conectar ao banco de dados primeiro
    const database = require('./config/database');
    await database.connect();
    
    // Importar rotas após conexão com banco
    const authRoutes = require('./routes/auth');
    const quadrasRoutes = require('./routes/quadras');
    const clientesRoutes = require('./routes/clientes');
    const reservasRoutes = require('./routes/reservas');
    
    // Configurar rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api/quadras', quadrasRoutes);
    app.use('/api/clientes', clientesRoutes);
    app.use('/api/reservas', reservasRoutes);

    // Middleware de tratamento de erros
    app.use((err, req, res, next) => {
      console.error('Erro na aplicação:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      });
    });

    // Middleware para rotas não encontradas
    app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada' 
      });
    });
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🏟️  Quadras: http://localhost:${PORT}/api/quadras`);
      console.log(`👥 Clientes: http://localhost:${PORT}/api/clientes`);
      console.log(`📅 Reservas: http://localhost:${PORT}/api/reservas`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para encerramento graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  const database = require('./config/database');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  const database = require('./config/database');
  database.close();
  process.exit(0);
});

startServer();