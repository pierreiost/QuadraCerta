const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as permissões disponíveis
router.get('/', authMiddleware, async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    // Agrupar por módulo
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    res.json({
      permissions,
      grouped
    });
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({ error: 'Erro ao listar permissões' });
  }
});

// Obter permissões de um usuário específico
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Apenas ADMIN pode ver permissões de outros usuários
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Sem permissão para visualizar' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const permissionIds = user.permissions.map(up => up.permissionId);
    const permissionsList = user.permissions.map(up => ({
      id: up.permission.id,
      module: up.permission.module,
      action: up.permission.action,
      name: up.permission.name
    }));

    res.json({
      userId: user.id,
      role: user.role,
      permissions: permissionsList,
      permissionIds
    });
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar permissões' });
  }
});

// Atualizar permissões de um usuário
router.put('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Apenas ADMIN pode alterar permissões
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para alterar permissões' });
    }

    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ error: 'permissionIds deve ser um array' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não permite alterar permissões de ADMIN ou SUPER_ADMIN
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ 
        error: 'Administradores têm todas as permissões automaticamente' 
      });
    }

    // Remover permissões antigas
    await prisma.userPermission.deleteMany({
      where: { userId: req.params.userId }
    });

    // Adicionar novas permissões
    if (permissionIds.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionIds.map(permissionId => ({
          userId: req.params.userId,
          permissionId
        }))
      });
    }

    // Buscar permissões atualizadas
    const updatedPermissions = await prisma.userPermission.findMany({
      where: { userId: req.params.userId },
      include: {
        permission: true
      }
    });

    res.json({
      message: 'Permissões atualizadas com sucesso',
      permissions: updatedPermissions.map(up => ({
        id: up.permission.id,
        module: up.permission.module,
        action: up.permission.action,
        name: up.permission.name
      }))
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
});

// Verificar se usuário tem permissão específica
router.post('/check', authMiddleware, async (req, res) => {
  try {
    const { module, action } = req.body;

    // ADMIN e SUPER_ADMIN sempre têm permissão
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return res.json({ hasPermission: true });
    }

    const hasPermission = await prisma.userPermission.findFirst({
      where: {
        userId: req.user.userId,
        permission: {
          module,
          action
        }
      }
    });

    res.json({ hasPermission: !!hasPermission });
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    res.status(500).json({ error: 'Erro ao verificar permissão' });
  }
});

module.exports = router;
