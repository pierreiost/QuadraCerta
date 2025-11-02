const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar comandas do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, clientId } = req.query;
    
    const where = {
      client: { complexId: req.user.complexId }
    };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const tabs = await prisma.tab.findMany({
      where,
      include: {
        client: true,
        reservation: { include: { court: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tabs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar comandas.' });
  }
});

// Buscar comanda por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tab = await prisma.tab.findFirst({
      where: {
        id: req.params.id,
        client: { complexId: req.user.complexId }
      },
      include: {
        client: true,
        reservation: { include: { court: true } },
        items: { include: { product: true } }
      }
    });

    if (!tab) {
      return res.status(404).json({ error: 'Comanda não encontrada.' });
    }

    res.json(tab);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar comanda.' });
  }
});

// Criar nova comanda
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clientId, reservationId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Cliente é obrigatório.' });
    }

    // Verificar se cliente pertence ao complexo
    const client = await prisma.client.findFirst({
      where: { id: clientId, complexId: req.user.complexId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Verificar reserva se fornecida
    if (reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          court: { complexId: req.user.complexId }
        }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Reserva não encontrada.' });
      }
    }

    const tab = await prisma.tab.create({
      data: {
        clientId,
        reservationId,
        status: 'OPEN'
      },
      include: {
        client: true,
        reservation: { include: { court: true } }
      }
    });

    res.status(201).json(tab);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar comanda.' });
  }
});

// Adicionar item à comanda
router.post('/:id/items', authMiddleware, async (req, res) => {
  try {
    const { productId, description, quantity, unitPrice } = req.body;

    if (!description || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const tab = await prisma.tab.findFirst({
      where: {
        id: req.params.id,
        client: { complexId: req.user.complexId }
      }
    });

    if (!tab) {
      return res.status(404).json({ error: 'Comanda não encontrada.' });
    }

    if (tab.status !== 'OPEN') {
      return res.status(400).json({ error: 'Comanda não está aberta.' });
    }

    const qty = parseInt(quantity);
    const price = parseFloat(unitPrice);
    const total = qty * price;

    const item = await prisma.tabItem.create({
      data: {
        tabId: tab.id,
        productId,
        description,
        quantity: qty,
        unitPrice: price,
        total
      },
      include: {
        product: true
      }
    });

    // Atualizar total da comanda
    await prisma.tab.update({
      where: { id: tab.id },
      data: {
        total: tab.total + total
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar item.' });
  }
});

// Remover item da comanda
router.delete('/:id/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const tab = await prisma.tab.findFirst({
      where: {
        id: req.params.id,
        client: { complexId: req.user.complexId }
      }
    });

    if (!tab) {
      return res.status(404).json({ error: 'Comanda não encontrada.' });
    }

    if (tab.status !== 'OPEN') {
      return res.status(400).json({ error: 'Comanda não está aberta.' });
    }

    const item = await prisma.tabItem.findUnique({
      where: { id: req.params.itemId }
    });

    if (!item || item.tabId !== tab.id) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    await prisma.tabItem.delete({
      where: { id: req.params.itemId }
    });

    // Atualizar total da comanda
    await prisma.tab.update({
      where: { id: tab.id },
      data: {
        total: tab.total - item.total
      }
    });

    res.json({ message: 'Item removido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover item.' });
  }
});

// Fechar comanda (finalizar pagamento)
router.post('/:id/close', authMiddleware, async (req, res) => {
  try {
    const tab = await prisma.tab.findFirst({
      where: {
        id: req.params.id,
        client: { complexId: req.user.complexId }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    if (!tab) {
      return res.status(404).json({ error: 'Comanda não encontrada.' });
    }

    if (tab.status !== 'OPEN') {
      return res.status(400).json({ error: 'Comanda já está fechada.' });
    }

    // Atualizar estoque dos produtos
    for (const item of tab.items) {
      if (item.productId) {
        const product = item.product;
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para ${product.name}` 
          });
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity
          }
        });

        // Registrar movimentação de estoque
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SAIDA',
            quantity: item.quantity,
            reason: `Venda - Comanda #${tab.id.substring(0, 8)}`
          }
        });
      }
    }

    // Fechar comanda
    const closedTab = await prisma.tab.update({
      where: { id: tab.id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      },
      include: {
        client: true,
        reservation: { include: { court: true } },
        items: { include: { product: true } }
      }
    });

    res.json(closedTab);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fechar comanda.' });
  }
});

// Cancelar comanda
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tab = await prisma.tab.findFirst({
      where: {
        id: req.params.id,
        client: { complexId: req.user.complexId }
      }
    });

    if (!tab) {
      return res.status(404).json({ error: 'Comanda não encontrada.' });
    }

    await prisma.tab.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Comanda cancelada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar comanda.' });
  }
});

module.exports = router;
