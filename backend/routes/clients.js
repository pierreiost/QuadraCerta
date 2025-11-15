const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, checkPermission('clients', 'view'), async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { complexId: req.user.complexId },
      orderBy: { fullName: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar clientes.' });
  }
});

router.get('/:id', authMiddleware, checkPermission('clients', 'view'), async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      },
      include: {
        reservations: {
          include: {
            court: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        tabs: {
          orderBy: { createdAt: 'desc' },
          take: 10
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

router.post('/', authMiddleware, checkPermission('clients', 'create'), async (req, res) => {
  try {
    const { fullName, phone, email, cpf } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    }

    const client = await prisma.client.create({
      data: {
        fullName,
        phone,
        email: email || null,
        cpf: cpf || null,
        complexId: req.user.complexId
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
});

router.put('/:id', authMiddleware, checkPermission('clients', 'edit'), async (req, res) => {
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
      data: {
        fullName,
        phone,
        email: email || null,
        cpf: cpf || null
      }
    });

    res.json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('clients', 'delete'), async (req, res) => {
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

    const now = new Date();

    const activeReservations = await prisma.reservation.count({
      where: {
        clientId: req.params.id,
        status: { not: 'CANCELLED' },
        endTime: { gte: now }
      }
    });

    if (activeReservations > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar cliente com reservas ativas. Cancele as reservas primeiro.',
        activeReservations
      });
    }

    const openTabs = await prisma.tab.count({
      where: {
        clientId: req.params.id,
        status: 'OPEN'
      }
    });

    if (openTabs > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar cliente com comandas abertas. Feche as comandas primeiro.',
        openTabs
      });
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