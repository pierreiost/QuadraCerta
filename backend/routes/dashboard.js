const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard - Visão Geral
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    // Total de quadras
    const totalCourts = await prisma.court.count({
      where: { complexId: req.user.complexId }
    });

    // Quadras disponíveis
    const availableCourts = await prisma.court.count({
      where: {
        complexId: req.user.complexId,
        status: 'AVAILABLE'
      }
    });

    // Quadras ocupadas
    const occupiedCourts = await prisma.court.count({
      where: {
        complexId: req.user.complexId,
        status: 'OCCUPIED'
      }
    });

    // Total de clientes
    const totalClients = await prisma.client.count({
      where: { complexId: req.user.complexId }
    });

    // Total de reservas (ativas)
    const totalReservations = await prisma.reservation.count({
      where: {
        court: { complexId: req.user.complexId },
        status: { not: 'CANCELLED' },
        startTime: { gte: new Date() }
      }
    });

    // Comandas abertas
    const openTabs = await prisma.tab.count({
      where: {
        client: { complexId: req.user.complexId },
        status: 'OPEN'
      }
    });

    // Produtos com estoque baixo (menos de 10 unidades)
    const lowStockProducts = await prisma.product.count({
      where: {
        complexId: req.user.complexId,
        stock: { lt: 10 }
      }
    });

    res.json({
      courts: {
        total: totalCourts,
        available: availableCourts,
        occupied: occupiedCourts
      },
      clients: totalClients,
      reservations: totalReservations,
      tabs: openTabs,
      lowStockProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

// Próximos horários
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        court: { complexId: req.user.complexId },
        status: 'CONFIRMED',
        startTime: { gte: now }
      },
      include: {
        court: true,
        client: true
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    res.json(upcomingReservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar próximos horários.' });
  }
});

// Relatório de receitas
router.get('/revenue', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      client: { complexId: req.user.complexId },
      status: 'PAID'
    };

    if (startDate && endDate) {
      where.paidAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const tabs = await prisma.tab.findMany({
      where,
      include: {
        items: true
      }
    });

    const totalRevenue = tabs.reduce((sum, tab) => sum + tab.total, 0);
    const totalTabs = tabs.length;

    res.json({
      totalRevenue,
      totalTabs,
      averageTicket: totalTabs > 0 ? totalRevenue / totalTabs : 0,
      tabs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar relatório de receitas.' });
  }
});

// Relatório de ocupação
router.get('/occupancy', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      court: { complexId: req.user.complexId },
      status: { not: 'CANCELLED' }
    };

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        court: true
      }
    });

    const courtOccupancy = {};

    reservations.forEach(reservation => {
      const courtId = reservation.court.id;
      const courtName = reservation.court.name;
      
      if (!courtOccupancy[courtId]) {
        courtOccupancy[courtId] = {
          courtName,
          totalReservations: 0,
          totalHours: 0
        };
      }

      courtOccupancy[courtId].totalReservations++;
      
      const hours = (new Date(reservation.endTime) - new Date(reservation.startTime)) / (1000 * 60 * 60);
      courtOccupancy[courtId].totalHours += hours;
    });

    res.json(Object.values(courtOccupancy));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar relatório de ocupação.' });
  }
});

module.exports = router;
