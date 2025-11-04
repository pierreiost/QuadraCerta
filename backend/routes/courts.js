const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { courtValidators, validateId } = require('../validators/validators');

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
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ error: 'Erro ao buscar quadras' });
  }
});

// Buscar quadra por ID (com validação de UUID)
router.get('/:id', authMiddleware, validateId, async (req, res) => {
  try {
    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada' });
    }

    res.json(court);
  } catch (error) {
    console.error('Erro ao buscar quadra:', error);
    res.status(500).json({ error: 'Erro ao buscar quadra' });
  }
});

// Criar nova quadra (com validação completa)
router.post('/', authMiddleware, courtValidators.create, async (req, res) => {
  try {
    const { name, sportType, capacity, pricePerHour, description } = req.body;

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
    console.error('Erro ao criar quadra:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Já existe uma quadra com este nome' 
      });
    }

    res.status(500).json({ error: 'Erro ao criar quadra' });
  }
});

// Atualizar quadra (com validação)
router.put('/:id', authMiddleware, courtValidators.update, async (req, res) => {
  try {
    const { name, sportType, capacity, pricePerHour, description, status } = req.body;

    // Verificar se quadra existe e pertence ao complexo
    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada' });
    }

    // Atualizar apenas campos fornecidos
    const updatedCourt = await prisma.court.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(sportType && { sportType }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(pricePerHour && { pricePerHour: parseFloat(pricePerHour) }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    res.json(updatedCourt);
  } catch (error) {
    console.error('Erro ao atualizar quadra:', error);
    res.status(500).json({ error: 'Erro ao atualizar quadra' });
  }
});

// Deletar quadra (com validação)
router.delete('/:id', authMiddleware, validateId, async (req, res) => {
  try {
    // Verificar se quadra existe e pertence ao complexo
    const court = await prisma.court.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      },
      include: {
        reservations: {
          where: {
            status: { not: 'CANCELLED' },
            startTime: { gte: new Date() }
          }
        }
      }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada' });
    }

    // Verificar se há reservas futuras
    if (court.reservations.length > 0) {
      return res.status(409).json({ 
        error: 'Não é possível deletar quadra com reservas futuras ativas',
        activeReservations: court.reservations.length
      });
    }

    await prisma.court.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Quadra deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar quadra:', error);
    res.status(500).json({ error: 'Erro ao deletar quadra' });
  }
});

module.exports = router;
