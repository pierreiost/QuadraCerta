const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

// Listar produtos
router.get('/', authMiddleware, checkPermission('products', 'view'), async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { complexId: req.user.complexId },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
});

// Buscar produto específico
router.get('/:id', authMiddleware, checkPermission('products', 'view'), async (req, res) => {
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

// Criar produto
router.post('/', authMiddleware, checkPermission('products', 'create'), async (req, res) => {
  try {
    const { name, description, price, stock, unit, expiryDate } = req.body;

    if (!name || !price || !unit) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        unit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        complexId: req.user.complexId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// Atualizar produto
router.put('/:id', authMiddleware, checkPermission('products', 'edit'), async (req, res) => {
  try {
    const { name, description, price, stock, unit, expiryDate } = req.body;

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
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Deletar produto
router.delete('/:id', authMiddleware, checkPermission('products', 'delete'), async (req, res) => {
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

// Adicionar estoque
router.post('/:id/stock/add', authMiddleware, checkPermission('products', 'stock'), async (req, res) => {
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

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: product.stock + parseInt(quantity)
      }
    });

    await prisma.stockMovement.create({
      data: {
        productId: req.params.id,
        type: 'ENTRADA',
        quantity: parseInt(quantity),
        reason
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar estoque.' });
  }
});

// Remover estoque
router.post('/:id/stock/remove', authMiddleware, checkPermission('products', 'stock'), async (req, res) => {
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

    if (product.stock < parseInt(quantity)) {
      return res.status(400).json({ error: 'Estoque insuficiente.' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: product.stock - parseInt(quantity)
      }
    });

    await prisma.stockMovement.create({
      data: {
        productId: req.params.id,
        type: 'SAIDA',
        quantity: parseInt(quantity),
        reason
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover estoque.' });
  }
});

module.exports = router;