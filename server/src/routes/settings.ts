import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const settingsRouter = Router();

// All routes require authentication
settingsRouter.use(requireAuth);

// Validation schemas
const updateShopSchema = z.object({
  shopName: z.string().min(2).optional(),
  defaultFromAddress: z.object({
    name: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional()
});

const createTemplateSchema = z.object({
  name: z.string().min(2),
  subject: z.string().optional(),
  body: z.string().min(1),
  category: z.string().optional(),
  variables: z.array(z.string()).optional()
});

const createFilterSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['ORDER', 'CUSTOMER']),
  filters: z.record(z.any()),
  isDefault: z.boolean().optional()
});

// GET /api/settings/shop
settingsRouter.get('/shop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shopId },
      select: {
        id: true,
        shopName: true,
        shopUrl: true,
        iconUrl: true,
        defaultFromAddress: true,
        autoSyncEnabled: true,
        syncIntervalMins: true,
        lastSyncAt: true,
        etsyShopId: true
      }
    });

    if (!shop) {
      throw new AppError(404, 'Shop not found');
    }

    res.json(shop);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/settings/shop
settingsRouter.patch('/shop', requireRole('OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateShopSchema.parse(req.body);

    const shop = await prisma.shop.update({
      where: { id: req.user!.shopId },
      data,
      select: {
        id: true,
        shopName: true,
        defaultFromAddress: true
      }
    });

    res.json(shop);
  } catch (error) {
    next(error);
  }
});

// ===== MESSAGE TEMPLATES =====

// GET /api/settings/templates
settingsRouter.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { shopId: req.user!.shopId },
      orderBy: { usageCount: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/templates
settingsRouter.post('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTemplateSchema.parse(req.body);

    const template = await prisma.messageTemplate.create({
      data: {
        shopId: req.user!.shopId,
        ...data
      }
    });

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/settings/templates/:id
settingsRouter.patch('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTemplateSchema.partial().parse(req.body);

    const template = await prisma.messageTemplate.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!template) {
      throw new AppError(404, 'Template not found');
    }

    const updated = await prisma.messageTemplate.update({
      where: { id: template.id },
      data
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/settings/templates/:id
settingsRouter.delete('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!template) {
      throw new AppError(404, 'Template not found');
    }

    await prisma.messageTemplate.delete({ where: { id: template.id } });

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/templates/:id/use - Increment usage count
settingsRouter.post('/templates/:id/use', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!template) {
      throw new AppError(404, 'Template not found');
    }

    const updated = await prisma.messageTemplate.update({
      where: { id: template.id },
      data: { usageCount: { increment: 1 } }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ===== SAVED FILTERS =====

// GET /api/settings/filters
settingsRouter.get('/filters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    const where: any = { shopId: req.user!.shopId };
    if (type) where.type = type;

    const filters = await prisma.savedFilter.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
    });

    res.json(filters);
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/filters
settingsRouter.post('/filters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createFilterSchema.parse(req.body);

    // If this is a default filter, unset other defaults of same type
    if (data.isDefault) {
      await prisma.savedFilter.updateMany({
        where: { shopId: req.user!.shopId, type: data.type },
        data: { isDefault: false }
      });
    }

    const filter = await prisma.savedFilter.create({
      data: {
        shopId: req.user!.shopId,
        ...data
      }
    });

    res.status(201).json(filter);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/settings/filters/:id
settingsRouter.patch('/filters/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createFilterSchema.partial().parse(req.body);

    const filter = await prisma.savedFilter.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!filter) {
      throw new AppError(404, 'Filter not found');
    }

    // If setting as default, unset others
    if (data.isDefault) {
      await prisma.savedFilter.updateMany({
        where: { shopId: req.user!.shopId, type: filter.type, id: { not: filter.id } },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.savedFilter.update({
      where: { id: filter.id },
      data
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/settings/filters/:id
settingsRouter.delete('/filters/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = await prisma.savedFilter.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!filter) {
      throw new AppError(404, 'Filter not found');
    }

    await prisma.savedFilter.delete({ where: { id: filter.id } });

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

// ===== TEAM MANAGEMENT =====

// GET /api/settings/team
settingsRouter.get('/team', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { shopId: req.user!.shopId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /api/settings/team/invite
settingsRouter.post('/team/invite', requireRole('OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app, this would send an email invitation
    // For now, just return a placeholder
    res.json({ message: 'Team invitations not implemented yet' });
  } catch (error) {
    next(error);
  }
});
