const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { addHours, subMinutes, isAfter, isBefore, format } = require('date-fns');

const router = express.Router();
const prisma = new PrismaClient();

// Obter todas as notificações do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = [];
    const now = new Date();
    const in30Minutes = addHours(now, 0.5);
    const in24Hours = addHours(now, 24);

    // 1. ESTOQUE BAIXO (< 10 unidades)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        complexId: req.user.complexId,
        stock: { lt: 10 }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        unit: true
      }
    });

    lowStockProducts.forEach(product => {
      notifications.push({
        id: `stock-${product.id}`,
        type: 'LOW_STOCK',
        priority: product.stock === 0 ? 'HIGH' : 'MEDIUM',
        title: product.stock === 0 ? 'Produto sem estoque' : 'Estoque baixo',
        message: `${product.name}: ${product.stock} ${product.unit}`,
        link: '/products',
        createdAt: now
      });
    });

    // 2. RESERVAS PRÓXIMAS (próximos 30 minutos)
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        court: { complexId: req.user.complexId },
        status: 'CONFIRMED',
        startTime: {
          gte: now,
          lte: in30Minutes
        }
      },
      include: {
        court: { select: { name: true } },
        client: { select: { fullName: true, phone: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    upcomingReservations.forEach(reservation => {
      const minutesUntil = Math.round((new Date(reservation.startTime) - now) / (1000 * 60));
      notifications.push({
        id: `reservation-${reservation.id}`,
        type: 'UPCOMING_RESERVATION',
        priority: minutesUntil <= 10 ? 'HIGH' : 'MEDIUM',
        title: 'Reserva próxima',
        message: `${reservation.client.fullName} - ${reservation.court.name} em ${minutesUntil} min`,
        link: '/reservations',
        createdAt: now
      });
    });

    // 3. COMANDAS ABERTAS HÁ MUITO TEMPO (> 4 horas)
    const fourHoursAgo = subMinutes(now, 240);
    const oldOpenTabs = await prisma.tab.findMany({
      where: {
        client: { complexId: req.user.complexId },
        status: 'OPEN',
        createdAt: { lte: fourHoursAgo }
      },
      include: {
        client: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    oldOpenTabs.forEach(tab => {
      const hoursOpen = Math.round((now - new Date(tab.createdAt)) / (1000 * 60 * 60));
      notifications.push({
        id: `tab-${tab.id}`,
        type: 'OLD_OPEN_TAB',
        priority: 'MEDIUM',
        title: 'Comanda aberta há muito tempo',
        message: `${tab.client.fullName} - ${hoursOpen}h aberta - R$ ${tab.total.toFixed(2)}`,
        link: `/tabs/${tab.id}`,
        createdAt: tab.createdAt
      });
    });

    // 4. QUADRAS EM MANUTENÇÃO
    const maintenanceCourts = await prisma.court.findMany({
      where: {
        complexId: req.user.complexId,
        status: 'MAINTENANCE'
      },
      select: {
        id: true,
        name: true,
        sportType: true
      }
    });

    maintenanceCourts.forEach(court => {
      notifications.push({
        id: `maintenance-${court.id}`,
        type: 'MAINTENANCE',
        priority: 'LOW',
        title: 'Quadra em manutenção',
        message: `${court.name} - ${court.sportType}`,
        link: '/courts',
        createdAt: now
      });
    });

    // 5. PRODUTOS PRÓXIMOS DO VENCIMENTO (próximos 7 dias)
    const in7Days = addHours(now, 168);
    const expiringProducts = await prisma.product.findMany({
      where: {
        complexId: req.user.complexId,
        expiryDate: {
          gte: now,
          lte: in7Days
        }
      },
      select: {
        id: true,
        name: true,
        expiryDate: true,
        stock: true
      }
    });

    expiringProducts.forEach(product => {
      const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - now) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `expiry-${product.id}`,
        type: 'EXPIRING_PRODUCT',
        priority: daysUntilExpiry <= 2 ? 'HIGH' : 'MEDIUM',
        title: 'Produto próximo do vencimento',
        message: `${product.name} vence em ${daysUntilExpiry} dia(s)`,
        link: '/products',
        createdAt: now
      });
    });

    // 6. RESERVAS PENDENTES
    const pendingReservations = await prisma.reservation.findMany({
      where: {
        court: { complexId: req.user.complexId },
        status: 'PENDING',
        startTime: { gte: now }
      },
      include: {
        court: { select: { name: true } },
        client: { select: { fullName: true } }
      }
    });

    pendingReservations.forEach(reservation => {
      notifications.push({
        id: `pending-${reservation.id}`,
        type: 'PENDING_RESERVATION',
        priority: 'MEDIUM',
        title: 'Reserva pendente de confirmação',
        message: `${reservation.client.fullName} - ${reservation.court.name}`,
        link: '/reservations',
        createdAt: reservation.createdAt
      });
    });

    // Ordenar por prioridade e data
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    notifications.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      notifications,
      count: notifications.length,
      unreadCount: notifications.length,
      summary: {
        high: notifications.filter(n => n.priority === 'HIGH').length,
        medium: notifications.filter(n => n.priority === 'MEDIUM').length,
        low: notifications.filter(n => n.priority === 'LOW').length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Obter resumo de notificações (para o badge no header)
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    let count = 0;

    // Contar alertas críticos
    const criticalAlerts = await Promise.all([
      // Estoque zerado
      prisma.product.count({
        where: {
          complexId: req.user.complexId,
          stock: 0
        }
      }),
      // Reservas nos próximos 15 minutos
      prisma.reservation.count({
        where: {
          court: { complexId: req.user.complexId },
          status: 'CONFIRMED',
          startTime: {
            gte: now,
            lte: addHours(now, 0.25)
          }
        }
      }),
      // Comandas abertas há mais de 6 horas
      prisma.tab.count({
        where: {
          client: { complexId: req.user.complexId },
          status: 'OPEN',
          createdAt: { lte: subMinutes(now, 360) }
        }
      })
    ]);

    count = criticalAlerts.reduce((sum, val) => sum + val, 0);

    res.json({ count });

  } catch (error) {
    console.error('Erro ao buscar resumo de notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

module.exports = router;