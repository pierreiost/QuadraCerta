const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar reservas do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, courtId, status } = req.query;
    
    const where = {
      court: { complexId: req.user.complexId }
    };

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    }

    if (courtId) {
      where.courtId = courtId;
    }

    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        court: true,
        client: true,
        recurringGroup: true
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reservas.' });
  }
});

// Buscar reserva por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: req.params.id,
        court: { complexId: req.user.complexId }
      },
      include: {
        court: true,
        client: true,
        recurringGroup: true,
        tabs: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reserva.' });
  }
});

// Criar nova reserva (avulsa ou recorrente)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      courtId,
      clientId,
      startTime,
      endTime,
      isRecurring,
      frequency,
      dayOfWeek,
      endDate
    } = req.body;

    if (!courtId || !clientId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    // Verificar se quadra pertence ao complexo
    const court = await prisma.court.findFirst({
      where: { id: courtId, complexId: req.user.complexId }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada.' });
    }

    // Verificar se cliente pertence ao complexo
    const client = await prisma.client.findFirst({
      where: { id: clientId, complexId: req.user.complexId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isRecurring) {
      // Criar grupo de recorrência
      const recurringGroup = await prisma.recurringGroup.create({
        data: {
          frequency: frequency || 'WEEKLY',
          dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : start.getDay(),
          startDate: start,
          endDate: endDate ? new Date(endDate) : null
        }
      });

      // Gerar reservas recorrentes
      const reservations = [];
      let currentDate = new Date(start);
      const finalDate = endDate ? new Date(endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias

      while (currentDate <= finalDate) {
        // Verificar conflitos
        const conflict = await prisma.reservation.findFirst({
          where: {
            courtId,
            status: { not: 'CANCELLED' },
            OR: [
              {
                AND: [
                  { startTime: { lte: currentDate } },
                  { endTime: { gt: currentDate } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: new Date(currentDate.getTime() + (end - start)) } },
                  { endTime: { gte: new Date(currentDate.getTime() + (end - start)) } }
                ]
              }
            ]
          }
        });

        if (!conflict) {
          reservations.push({
            courtId,
            clientId,
            startTime: new Date(currentDate),
            endTime: new Date(currentDate.getTime() + (end - start)),
            isRecurring: true,
            recurringGroupId: recurringGroup.id,
            status: 'CONFIRMED'
          });
        }

        // Próxima ocorrência (adicionar 7 dias)
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const createdReservations = await prisma.reservation.createMany({
        data: reservations
      });

      res.status(201).json({
        message: `${reservations.length} reservas recorrentes criadas com sucesso!`,
        recurringGroupId: recurringGroup.id,
        count: createdReservations.count
      });
    } else {
      // Criar reserva avulsa
      // Verificar conflitos
      const conflict = await prisma.reservation.findFirst({
        where: {
          courtId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            }
          ]
        }
      });

      if (conflict) {
        return res.status(400).json({ error: 'Horário já está reservado.' });
      }

      const reservation = await prisma.reservation.create({
        data: {
          courtId,
          clientId,
          startTime: start,
          endTime: end,
          isRecurring: false,
          status: 'CONFIRMED'
        },
        include: {
          court: true,
          client: true
        }
      });

      res.status(201).json(reservation);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva.' });
  }
});

// Atualizar reserva
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { startTime, endTime, status } = req.body;

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: req.params.id,
        court: { complexId: req.user.complexId }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status
      },
      include: {
        court: true,
        client: true
      }
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar reserva.' });
  }
});

// Cancelar reserva
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: req.params.id,
        court: { complexId: req.user.complexId }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Reserva cancelada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar reserva.' });
  }
});

module.exports = router;
