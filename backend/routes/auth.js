const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ✅ CORRIGIDO - Rate limiter compatível com IPv6
const loginFailureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de login incorretas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
  // ❌ REMOVIDO keyGenerator - usa o padrão que já trata IPv6
});

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Sobrenome é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/[a-z]/).withMessage('Senha deve conter letras minúsculas')
    .matches(/[A-Z]/).withMessage('Senha deve conter letras maiúsculas')
    .matches(/[0-9]/).withMessage('Senha deve conter números')
    .matches(/[@$!%*?&#]/).withMessage('Senha deve conter caracteres especiais (@$!%*?&#)'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/).withMessage('Telefone inválido. Use (XX) XXXXX-XXXX'),
  
  body('complexName')
    .trim()
    .notEmpty().withMessage('Nome do complexo é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome do complexo deve ter entre 3 e 100 caracteres'),
  
  body('cnpj')
    .trim()
    .notEmpty().withMessage('CNPJ é obrigatório')
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('CNPJ inválido. Use XX.XXX.XXX/XXXX-XX')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Registro de novo complexo
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { firstName, lastName, email, password, phone, cpf, cnpj, complexName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    const existingComplex = await prisma.complex.findUnique({
      where: { cnpj }
    });

    if (existingComplex) {
      return res.status(409).json({ error: 'CNPJ já está cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const complex = await tx.complex.create({
        data: {
          name: complexName,
          cnpj
        }
      });

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone,
          cpf,
          cnpj,
          role: 'ADMIN',
          status: 'PENDING',
          complexId: complex.id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          phone: true,
          cpf: true,
          cnpj: true,
          complex: {
            select: {
              id: true,
              name: true,
              cnpj: true
            }
          }
        }
      });

      return { user, complex };
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso! Sua conta está aguardando aprovação. Você receberá um email quando for aprovada.',
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        status: result.user.status,
        complex: result.user.complex
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta. Tente novamente.' });
  }
});

// Login
router.post('/login', loginFailureLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar status do usuário
    if (user.status === 'PENDING') {
      return res.status(403).json({ 
        error: 'Sua conta está aguardando aprovação. Você receberá um email quando for aprovada.',
        status: 'PENDING'
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({ 
        error: 'Sua conta foi rejeitada. Entre em contato com o suporte para mais informações.',
        status: 'REJECTED'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ 
        error: 'Sua conta está suspensa. Entre em contato com o suporte.',
        status: 'SUSPENDED'
      });
    }

    // SUPER_ADMIN não tem complexId
    if (user.role !== 'SUPER_ADMIN' && !user.complexId) {
      return res.status(403).json({ 
        error: 'Erro na configuração da conta. Entre em contato com o suporte.' 
      });
    }
    
    const token = jwt.sign(
      { 
        userId: user.id,
        complexId: user.complexId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login. Tente novamente.' });
  }
});

// Obter dados do usuário logado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        cpf: true,
        cnpj: true,
        complex: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

// Atualizar senha
router.put('/change-password', 
  authMiddleware,
  [
    body('currentPassword')
      .notEmpty().withMessage('Senha atual é obrigatória'),
    
    body('newPassword')
      .notEmpty().withMessage('Nova senha é obrigatória')
      .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Senha deve conter letras minúsculas')
      .matches(/[A-Z]/).withMessage('Senha deve conter letras maiúsculas')
      .matches(/[0-9]/).withMessage('Senha deve conter números')
      .matches(/[@$!%*?&#]/).withMessage('Senha deve conter caracteres especiais'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: errors.array().map(err => err.msg)
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
);

module.exports = router;