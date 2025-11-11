const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Listar quadras do complexo
router.get('/', authMiddleware, checkPermission('courts', 'view'), async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      where: { complexId: req.user.complexId },
      include: {
        courtType: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(courts);
  } catch (error) {
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ error: 'Erro ao buscar quadras' });
  }
});

// Buscar quadra por ID
router.get('/:id', 
  authMiddleware, 
  checkPermission('courts', 'view'),
  [
    param('id').isUUID().withMessage('ID inválido'),
    validate
  ],
  async (req, res) => {
    try {
      const court = await prisma.court.findFirst({
        where: {
          id: req.params.id,
          complexId: req.user.complexId
        },
        include: {
          courtType: true
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
  }
);

// Criar nova quadra
router.post('/', 
  authMiddleware, 
  checkPermission('courts', 'create'),
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Nome da quadra é obrigatório')
      .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('courtTypeId')
      .notEmpty().withMessage('Tipo de quadra é obrigatório')
      .isUUID().withMessage('Tipo de quadra inválido'),
    
    body('pricePerHour')
      .notEmpty().withMessage('Preço por hora é obrigatório')
      .isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Descrição muito longa (máximo 500 caracteres)'),
    
    validate
  ],
  async (req, res) => {
    try {
      const { name, courtTypeId, pricePerHour, description } = req.body;

      // Verificar se o tipo de quadra existe e pertence ao complexo ou é padrão
      const courtType = await prisma.courtType.findFirst({
        where: {
          id: courtTypeId,
          OR: [
            { isDefault: true },
            { complexId: req.user.complexId }
          ]
        }
      });

      if (!courtType) {
        return res.status(404).json({ error: 'Tipo de quadra não encontrado' });
      }

      const court = await prisma.court.create({
        data: {
          name: name.trim(),
          courtTypeId,
          capacity: 10, // Sempre 10
          pricePerHour: parseFloat(pricePerHour),
          description: description?.trim() || null,
          complexId: req.user.complexId
        },
        include: {
          courtType: true
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
  }
);

// Atualizar quadra
router.put('/:id',
  authMiddleware,
  checkPermission('courts', 'edit'),
  [
    param('id').isUUID().withMessage('ID inválido'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('courtTypeId')
      .optional()
      .isUUID().withMessage('Tipo de quadra inválido'),
    
    body('pricePerHour')
      .optional()
      .isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
      .withMessage('Status inválido'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Descrição muito longa (máximo 500 caracteres)'),
    
    validate
  ],
  async (req, res) => {
    try {
      const { name, courtTypeId, pricePerHour, description, status } = req.body;

      const court = await prisma.court.findFirst({
        where: {
          id: req.params.id,
          complexId: req.user.complexId
        }
      });

      if (!court) {
        return res.status(404).json({ error: 'Quadra não encontrada' });
      }

      // Se estiver alterando o tipo, verificar se existe
      if (courtTypeId) {
        const courtType = await prisma.courtType.findFirst({
          where: {
            id: courtTypeId,
            OR: [
              { isDefault: true },
              { complexId: req.user.complexId }
            ]
          }
        });

        if (!courtType) {
          return res.status(404).json({ error: 'Tipo de quadra não encontrado' });
        }
      }

      const updatedCourt = await prisma.court.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(courtTypeId && { courtTypeId }),
          ...(pricePerHour && { pricePerHour: parseFloat(pricePerHour) }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(status && { status })
        },
        include: {
          courtType: true
        }
      });

      res.json(updatedCourt);
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      res.status(500).json({ error: 'Erro ao atualizar quadra' });
    }
  }
);

// Deletar quadra
router.delete('/:id',
  authMiddleware,
  checkPermission('courts', 'delete'),
  [
    param('id').isUUID().withMessage('ID inválido'),
    validate
  ],
  async (req, res) => {
    try {
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
  }
);

module.exports = router;