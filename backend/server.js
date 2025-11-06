require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const courtRoutes = require('./routes/courts');
const clientRoutes = require('./routes/clients');
const reservationRoutes = require('./routes/reservations');
const productRoutes = require('./routes/products');
const tabRoutes = require('./routes/tabs');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const prisma = new PrismaClient();

// Configuração de segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado de forma segura
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser com limite de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 100, 
  max: 1000,
  message: {
    error: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 2 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  message: {
    error: 'Muitas criações de recursos. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting geral
app.use('/api/', generalLimiter);

// Disponibilizar Prisma globalmente
app.locals.prisma = prisma;

// Rotas com rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
// Rota de health check (sem rate limit)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'QuadraCerta API is running',
    timestamp: new Date().toISOString()
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling melhorado
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de CORS
  if (err.message === 'Origem não permitida pelo CORS') {
    return res.status(403).json({ 
      error: 'Acesso negado - origem não permitida' 
    });
  }

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Já existe um registro com estes dados únicos' 
    });
  }

  // Erro de JSON inválido
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'JSON inválido na requisição' 
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📅 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Segurança ativada:`);
  console.log(`   ✓ Helmet (Headers seguros)`);
  console.log(`   ✓ CORS restritivo`);
  console.log(`   ✓ Rate limiting`);
  console.log(`   ✓ XSS Protection`);
  console.log(`   ✓ NoSQL Injection Protection`);
  console.log(`   ✓ HPP Protection\n`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recebido. Encerrando servidor...`);
  
  server.close(async () => {
    console.log('Servidor HTTP encerrado');
    
    try {
      await prisma.$disconnect();
      console.log('Prisma desconectado');
      process.exit(0);
    } catch (error) {
      console.error('Erro ao desconectar Prisma:', error);
      process.exit(1);
    }
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error('Tempo esgotado. Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
