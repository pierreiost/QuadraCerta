const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Registro de novo complexo (Admin)
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      cpf,
      cnpj,
      complexName,
      phone
    } = req.body;

    // Validações
    if (!firstName || !lastName || !email || !password || !cnpj || !complexName || !phone) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    // Verificar se CNPJ já existe
    const existingComplex = await prisma.complex.findUnique({ where: { cnpj } });
    if (existingComplex) {
      return res.status(400).json({ error: 'CNPJ já cadastrado.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar complexo
    const complex = await prisma.complex.create({
      data: {
        name: complexName,
        cnpj
      }
    });

    // Criar usuário Admin
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        cpf,
        cnpj,
        phone,
        role: 'ADMIN',
        complexId: complex.id
      }
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, role: user.role, complexId: user.complexId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário e complexo cadastrados com sucesso!',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        complexId: user.complexId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { complex: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, role: user.role, complexId: user.complexId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        complexId: user.complexId,
        complex: user.complex
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Obter dados do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { complex: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cpf: true,
        phone: true,
        role: true,
        complexId: true,
        complex: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
});

module.exports = router;
