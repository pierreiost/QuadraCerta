const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { reservationValidators, validateId } = require('../validators/validators');

const router = express.Router();
const prisma = new PrismaClient();

// Listar reservas do complexo com filtros
router.get('/', authMiddleware, checkPermission('reservations', 'view'), reservationValidators.query, async (req, res) => {
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
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

// Buscar reserva por ID
router.get('/:id', authMiddleware, checkPermission('reservations', 'view'), validateId, async (req, res) => {
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
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
});

// Criar nova reserva
router.post('/', authMiddleware, checkPermission('reservations', 'create'), reservationValidators.create, async (req, res) => {
  try {
    const {
      courtId,
      clientId,
      startTime,
      durationInHours = 1,
      isRecurring,
      frequency,
      dayOfWeek,
      endDate
    } = req.body;

    const court = await prisma.court.findFirst({
      where: { id: courtId, complexId: req.user.complexId }
    });

    if (!court) {
      return res.status(404).json({ error: 'Quadra não encontrada' });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, complexId: req.user.complexId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const start = new Date(startTime);
    const duration = parseFloat(durationInHours);
    
    if (isNaN(duration) || duration <= 0 || duration > 12) {
      return res.status(400).json({ 
        error: 'Duração inválida. Deve ser entre 0.5 e 12 horas' 
      });
    }
    
    const durationInMilliseconds = duration * 60 * 60 * 1000;
    const end = new Date(start.getTime() + durationInMilliseconds);

    const now = new Date();
    if (start < now) {
      return res.status(400).json({ 
        error: 'Não é permitido criar reservas em datas ou horários retroativos' 
      });
    }
    
    if (isRecurring) {
      if (!endDate) {
        return res.status(400).json({ 
          error: 'Data final é obrigatória para reservas recorrentes' 
        });
      }

      const recurringGroup = await prisma.recurringGroup.create({
        data: {
          frequency: frequency || 'WEEKLY',
          dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : start.getDay(),
          startDate: start,
          endDate: new Date(endDate)
        }
      });

      const reservations = [];
      let currentDate = new Date(start);
      const finalDate = new Date(endDate);
      const maxDate = new Date(start.getTime() + (365 * 24 * 60 * 60 * 1000));
      const limitDate = finalDate < maxDate ? finalDate : maxDate;

      while (currentDate <= limitDate) {
        const currentEnd = new Date(currentDate.getTime() + durationInMilliseconds);

        const conflict = await prisma.reservation.findFirst({
          where: {
            courtId,
            status: { not: 'CANCELLED' },
            OR: [
              { AND: [{ startTime: { lte: currentDate } }, { endTime: { gt: currentDate } }] },
              { AND: [{ startTime: { lt: currentEnd } }, { endTime: { gte: currentEnd } }] },
              { AND: [{ startTime: { gte: currentDate } }, { endTime: { lte: currentEnd } }] }
            ]
          }
        });

        if (!conflict) {
          reservations.push({
            courtId,
            clientId,
            startTime: new Date(currentDate),
            endTime: currentEnd,
            isRecurring: true,
            recurringGroupId: recurringGroup.id,
            status: 'CONFIRMED'
          });
        }

        if (frequency === 'MONTHLY') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        }
      }

      if (reservations.length === 0) {
        return res.status(400).json({ 
          error: 'Não foi possível criar nenhuma reserva. Todos os horários estão ocupados' 
        });
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
      const conflict = await prisma.reservation.findFirst({
        where: {
          courtId,
          status: { not: 'CANCELLED' },
          OR: [
            { AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }] },
            { AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }] },
            { AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }] }
          ]
        },
        include: { client: true }
      });

      if (conflict) {
        return res.status(409).json({ 
          error: 'Horário já está reservado',
          conflictWith: {
            client: conflict.client.fullName,
            startTime: conflict.startTime,
            endTime: conflict.endTime
          }
        });
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
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// Atualizar reserva
router.put('/:id', authMiddleware, checkPermission('reservations', 'edit'), validateId, async (req, res) => {
  try {
    const { startTime, durationInHours, status } = req.body;

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: req.params.id,
        court: { complexId: req.user.complexId }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({ 
        error: 'Não é possível editar uma reserva cancelada' 
      });
    }
    
    let newStartTime = startTime ? new Date(startTime) : reservation.startTime;
    let newEndTime = reservation.endTime;

    if (durationInHours) {
      const duration = parseFloat(durationInHours);
      if (isNaN(duration) || duration <= 0 || duration > 12) {
        return res.status(400).json({ 
          error: 'Duração inválida. Deve ser entre 0.5 e 12 horas' 
        });
      }
      const durationInMilliseconds = duration * 60 * 60 * 1000;
      newEndTime = new Date(newStartTime.getTime() + durationInMilliseconds);
    }

    if (startTime || durationInHours) {
      const conflict = await prisma.reservation.findFirst({
        where: {
          courtId: reservation.courtId,
          id: { not: req.params.id },
          status: { not: 'CANCELLED' },
          OR: [
            { AND: [{ startTime: { lte: newStartTime } }, { endTime: { gt: newStartTime } }] },
            { AND: [{ startTime: { lt: newEndTime } }, { endTime: { gte: newEndTime } }] }
          ]
        }
      });

      if (conflict) {
        return res.status(409).json({ 
          error: 'Novo horário conflita com outra reserva existente' 
        });
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        ...(startTime && { startTime: newStartTime }),
        ...(durationInHours && { endTime: newEndTime }),
        ...(status && { status })
      },
      include: {
        court: true,
        client: true
      }
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ error: 'Erro ao atualizar reserva' });
  }
});

// Cancelar reserva
router.delete('/:id', authMiddleware, checkPermission('reservations', 'cancel'), validateId, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: req.params.id,
        court: { complexId: req.user.complexId }
      },
      include: {
        tabs: { where: { status: 'OPEN' } }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reservation.tabs.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível cancelar reserva com comandas abertas. Feche as comandas primeiro.',
        openTabs: reservation.tabs.length
      });
    }

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ 
      message: 'Reserva cancelada com sucesso',
      reservationId: req.params.id
    });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

// Cancelar grupo de reservas recorrentes
router.delete('/recurring-group/:groupId', authMiddleware, checkPermission('reservations', 'cancel'), async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.recurringGroup.findFirst({
      where: { id: groupId },
      include: {
        reservations: { include: { court: true } }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Grupo de recorrência não encontrado' });
    }

    if (group.reservations.length > 0 && 
        group.reservations[0].court.complexId !== req.user.complexId) {
      return res.status(403).json({ error: 'Sem permissão para cancelar este grupo' });
    }

    const now = new Date();
    const result = await prisma.reservation.updateMany({
      where: {
        recurringGroupId: groupId,
        startTime: { gte: now },
        status: { not: 'CANCELLED' }
      },
      data: { status: 'CANCELLED' }
    });

    res.json({ 
      message: 'Reservas recorrentes canceladas com sucesso',
      cancelledCount: result.count
    });
  } catch (error) {
    console.error('Erro ao cancelar grupo de reservas:', error);
    res.status(500).json({ error: 'Erro ao cancelar grupo de reservas' });
  }
});

module.exports = router;