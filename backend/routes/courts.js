const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar quadras do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      where: { complexId: req.user.complexId },
      orderBy: { name: 'asc' }
    });

    res.json(courts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quadras.' });
  }
});

// Buscar quadra por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada.' });
    }

    res.json(court);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quadra.' });
  }
});

// Criar nova quadra
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, sportType, capacity, pricePerHour, description } = req.body;

    if (!name || !sportType || !capacity || !pricePerHour) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const court = await prisma.court.create({
      data: {
        name,
        sportType,
        capacity: parseInt(capacity),
        pricePerHour: parseFloat(pricePerHour),
        description,
        complexId: req.user.complexId
      }
    });

    res.status(201).json(court);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar quadra.' });
  }
});

// Atualizar quadra
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, sportType, capacity, pricePerHour, description, status } = req.body;

    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada.' });
    }

    const updatedCourt = await prisma.court.update({
      where: { id: req.params.id },
      data: {
        name,
        sportType,
        capacity: capacity ? parseInt(capacity) : undefined,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
        description,
        status
      }
    });

    res.json(updatedCourt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar quadra.' });
  }
});

// Deletar quadra
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada.' });
    }

    await prisma.court.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Quadra deletada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar quadra.' });
  }
});

module.exports = router;
