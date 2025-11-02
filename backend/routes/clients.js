const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar clientes do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { complexId: req.user.complexId },
      orderBy: { fullName: 'asc' },
      include: {
        _count: {
          select: { reservations: true, tabs: true }
        }
      }
    });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});

// Buscar cliente por ID com histórico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      },
      include: {
        reservations: {
          include: { court: true },
          orderBy: { startTime: 'desc' }
        },
        tabs: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
});

// Criar novo cliente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, email, cpf } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    }

    const client = await prisma.client.create({
      data: {
        fullName,
        phone,
        email,
        cpf,
        complexId: req.user.complexId
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
});

// Atualizar cliente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, email, cpf } = req.body;

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: { fullName, phone, email, cpf }
    });

    res.json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

// Deletar cliente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    await prisma.client.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Cliente deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar cliente.' });
  }
});

module.exports = router;
