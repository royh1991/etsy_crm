import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const customersRouter = Router();

// All routes require authentication
customersRouter.use(requireAuth);

// Validation schemas
const addFlagSchema = z.object({
  type: z.enum(['DIFFICULT', 'VIP', 'FRAUD_RISK', 'SPECIAL_INSTRUCTIONS', 'DELIVERY_ISSUE', 'QUALITY_ISSUE']),
  reason: z.string().min(1)
});

const updateNotesSchema = z.object({
  notes: z.string()
});

// GET /api/customers
customersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, tier, isRepeat, isFlagged, minSpent, sortBy = 'lastOrderAt', sortOrder = 'desc', limit = '50', offset = '0' } = req.query;

    const where: any = { shopId: req.user!.shopId };

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tier) where.tier = tier;
    if (isRepeat === 'true') where.isRepeatCustomer = true;
    if (isFlagged === 'true') {
      where.flags = { some: { resolvedAt: null } };
    }
    if (minSpent) where.totalSpent = { gte: parseFloat(minSpent as string) };

    const orderByField = ['lastOrderAt', 'totalSpent', 'orderCount', 'name'].includes(sortBy as string)
      ? sortBy as string
      : 'lastOrderAt';

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          flags: { where: { resolvedAt: null } },
          _count: { select: { orders: true } }
        },
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.customer.count({ where })
    ]);

    res.json({ customers, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
customersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId },
      include: {
        flags: { orderBy: { createdAt: 'desc' } },
        orders: {
          include: { items: true },
          orderBy: { orderedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id/orders
customersRouter.get('/:id/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { orderedAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/customers/:id
customersRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notes } = updateNotesSchema.parse(req.body);

    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: { notes, updatedAt: new Date() }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/:id/flags
customersRouter.post('/:id/flags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, reason } = addFlagSchema.parse(req.body);

    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    // Check if flag of this type already exists and is unresolved
    const existingFlag = await prisma.customerFlag.findFirst({
      where: { customerId: customer.id, type, resolvedAt: null }
    });

    if (existingFlag) {
      throw new AppError(409, 'Customer already has an unresolved flag of this type');
    }

    const flag = await prisma.customerFlag.create({
      data: { customerId: customer.id, type, reason }
    });

    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id/flags/:flagId
customersRouter.delete('/:id/flags/:flagId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    const flag = await prisma.customerFlag.findFirst({
      where: { id: req.params.flagId, customerId: customer.id }
    });

    if (!flag) {
      throw new AppError(404, 'Flag not found');
    }

    await prisma.customerFlag.update({
      where: { id: flag.id },
      data: { resolvedAt: new Date() }
    });

    res.json({ resolved: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/stats/top
customersRouter.get('/stats/top', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '5' } = req.query;

    const topCustomers = await prisma.customer.findMany({
      where: { shopId: req.user!.shopId },
      orderBy: { totalSpent: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        name: true,
        email: true,
        orderCount: true,
        totalSpent: true,
        tier: true,
        isRepeatCustomer: true
      }
    });

    res.json(topCustomers);
  } catch (error) {
    next(error);
  }
});
