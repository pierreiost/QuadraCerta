const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

const userValidation = [
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
    .optional()
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/[a-z]/).withMessage('Senha deve conter letras minúsculas')
    .matches(/[A-Z]/).withMessage('Senha deve conter letras maiúsculas')
    .matches(/[0-9]/).withMessage('Senha deve conter números')
    .matches(/[@$!%*?&#]/).withMessage('Senha deve conter caracteres especiais (@$!%*?&#)'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/).withMessage('Telefone inválido. Use (XX) XXXXX-XXXX'),
  
  body('role')
    .notEmpty().withMessage('Função é obrigatória')
    .isIn(['ADMIN', 'SEMI_ADMIN']).withMessage('Função inválida'),
  
  body('cpf')
    .optional()
    .trim()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF inválido. Use XXX.XXX.XXX-XX')
];

// Listar todos os usuários do complexo
router.get('/', authMiddleware, checkPermission('users', 'view'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { 
        complexId: req.user.complexId,
        role: { not: 'SUPER_ADMIN' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { firstName: 'asc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Buscar usuário por ID
router.get('/:id', authMiddleware, checkPermission('users', 'view'), async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId,
        role: { not: 'SUPER_ADMIN' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
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
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar novo funcionário
router.post('/', authMiddleware, checkPermission('users', 'create'), userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { firstName, lastName, email, password, phone, cpf, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    if (role === 'ADMIN' && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para criar administradores' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        cpf,
        role,
        complexId: req.user.complexId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Atualizar funcionário
router.put('/:id', authMiddleware, checkPermission('users', 'edit'), userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { firstName, lastName, email, phone, cpf, role } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId,
        role: { not: 'SUPER_ADMIN' }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.id === req.user.userId) {
      return res.status(403).json({ error: 'Não é possível editar seu próprio usuário por aqui. Use a página de perfil.' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingEmail) {
        return res.status(409).json({ error: 'Email já está em uso' });
      }
    }

    if (role === 'ADMIN' && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para promover a administrador' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        email: email ? email.toLowerCase() : undefined,
        phone,
        cpf,
        role
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Resetar senha de funcionário
router.put('/:id/reset-password', authMiddleware, checkPermission('users', 'edit'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId,
        role: { not: 'SUPER_ADMIN' }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.id === req.user.userId) {
      return res.status(403).json({ error: 'Use a página de perfil para alterar sua própria senha' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Senha resetada com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

// Deletar funcionário
router.delete('/:id', authMiddleware, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId,
        role: { not: 'SUPER_ADMIN' }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.id === req.user.userId) {
      return res.status(403).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

module.exports = router;