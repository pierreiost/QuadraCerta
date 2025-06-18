const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const database = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const quadrasRoutes = require('./routes/quadras');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/quadras', quadrasRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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

// Inicializar servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para encerramento graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  database.close();
  process.exit(0);
});

startServer();