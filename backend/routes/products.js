const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar produtos do complexo
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { complexId: req.user.complexId },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

// Buscar produto por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
});

// Criar novo produto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, unit, expiryDate } = req.body;

    if (!name || price === undefined || stock === undefined || !unit) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        complexId: req.user.complexId
      }
    });

    // Registrar movimentação inicial de estoque
    if (stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ENTRADA',
          quantity: parseInt(stock),
          reason: 'Estoque inicial'
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// Atualizar produto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, unit, expiryDate } = req.body;

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        unit,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Adicionar estoque (entrada)
router.post('/:id/stock/add', authMiddleware, async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    // Atualizar estoque
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: product.stock + parseInt(quantity)
      }
    });

    // Registrar movimentação
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'ENTRADA',
        quantity: parseInt(quantity),
        reason: reason || 'Entrada manual'
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar estoque.' });
  }
});

// Remover estoque (saída)
router.post('/:id/stock/remove', authMiddleware, async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente.' });
    }

    // Atualizar estoque
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: product.stock - parseInt(quantity)
      }
    });

    // Registrar movimentação
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'SAIDA',
        quantity: parseInt(quantity),
        reason: reason || 'Saída manual'
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover estoque.' });
  }
});

// Deletar produto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        complexId: req.user.complexId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Produto deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
});

module.exports = router;
