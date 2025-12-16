import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const ordersRouter = Router();

// ============================================
// DEVELOPMENT-ONLY PUBLIC ENDPOINTS
// These bypass auth for frontend testing
// ============================================
if (process.env.NODE_ENV === 'development') {
  // GET /api/orders/dev/all - Get all orders without auth (dev only)
  ordersRouter.get('/dev/all', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: {
            select: { id: true, name: true, email: true, tier: true, isRepeatCustomer: true, orderCount: true }
          },
          items: true,
          _count: { select: { notes: true } }
        },
        orderBy: [{ pipelineStage: 'asc' }, { sortOrder: 'asc' }, { orderedAt: 'desc' }],
      });

      // Transform to match frontend Order type
      const transformedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        etsyReceiptId: order.etsyReceiptId,
        customerId: order.customerId,
        buyerName: order.customer.name,
        buyerEmail: order.customer.email,
        totalAmount: parseFloat(order.totalAmount.toString()),
        subtotal: parseFloat(order.subtotal.toString()),
        shippingCost: parseFloat(order.shippingCost.toString()),
        taxAmount: parseFloat(order.taxAmount.toString()),
        discountAmount: parseFloat(order.discountAmount.toString()),
        currency: order.currency,
        pipelineStage: order.pipelineStage.toLowerCase().replace('_', '-') as any,
        orderDate: order.orderedAt,
        shipByDate: order.shipByDate,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        isGift: order.isGift,
        giftMessage: order.giftMessage,
        buyerNote: order.buyerNote,
        hasIssue: order.hasIssue,
        issueDescription: order.issueDescription,
        isShipped: order.isShipped,
        trackingNumber: order.trackingNumber,
        carrierName: order.carrierName,
        trackingUrl: order.trackingUrl,
        shippingAddress: order.shippingAddress,
        tags: order.tags,
        items: order.items.map(item => ({
          id: item.id,
          listingId: parseInt(item.etsyListingId || '0'),
          transactionId: item.etsyTransactionId,
          title: item.title,
          description: item.personalization || '',
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
          imageUrl: item.imageUrl,
          sku: item.sku,
          variations: item.variations,
        })),
        notes: [],
        history: [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        sortOrder: order.sortOrder,  // Include sort order for frontend
        // Customer tier info
        customerTier: order.customer.tier.toLowerCase(),
        isRepeatCustomer: order.customer.isRepeatCustomer,
        customerOrderCount: order.customer.orderCount,
      }));

      res.json({ orders: transformedOrders, total: transformedOrders.length });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/orders/dev/customers - Get all customers without auth (dev only)
  ordersRouter.get('/dev/customers', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          flags: true,
          _count: { select: { orders: true } }
        },
        orderBy: { totalSpent: 'desc' },
      });

      const transformedCustomers = customers.map(customer => ({
        id: customer.id,
        etsyBuyerId: customer.etsyBuyerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        orderCount: customer.orderCount,
        totalSpent: parseFloat(customer.totalSpent.toString()),
        averageOrderValue: parseFloat(customer.averageOrderValue.toString()),
        isRepeatCustomer: customer.isRepeatCustomer,
        tier: customer.tier.toLowerCase(),
        rating: customer.rating ? parseFloat(customer.rating.toString()) : null,
        reviewCount: customer.reviewCount,
        notes: customer.notes,
        isFlagged: customer.flags.length > 0,
        flags: customer.flags.map(f => ({
          type: f.type.toLowerCase(),
          reason: f.reason,
          createdAt: f.createdAt,
        })),
        firstOrderAt: customer.firstOrderAt,
        lastOrderAt: customer.lastOrderAt,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }));

      res.json({ customers: transformedCustomers, total: transformedCustomers.length });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /api/orders/dev/:id/stage - Update order stage without auth (dev only)
  ordersRouter.patch('/dev/:id/stage', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineStage } = req.body;

      if (!pipelineStage) {
        return res.status(400).json({ error: 'pipelineStage is required' });
      }

      // Convert frontend format to DB format: "ready-to-ship" -> "READY_TO_SHIP"
      const dbStage = pipelineStage.toUpperCase().replace(/-/g, '_');

      const validStages = ['NEW', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'NEEDS_ATTENTION'];
      if (!validStages.includes(dbStage)) {
        return res.status(400).json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
      }

      const order = await prisma.order.findUnique({
        where: { id: req.params.id }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          pipelineStage: dbStage as any,
          updatedAt: new Date()
        },
        include: {
          customer: {
            select: { id: true, name: true, email: true, tier: true }
          },
          items: true
        }
      });

      // Also create history entry
      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          type: 'STAGE_CHANGED',
          description: `Stage changed from ${order.pipelineStage} to ${dbStage}`
        }
      });

      res.json({
        id: updatedOrder.id,
        pipelineStage: updatedOrder.pipelineStage.toLowerCase().replace('_', '-'),
        updatedAt: updatedOrder.updatedAt
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /api/orders/dev/reorder - Reorder cards within a column (dev only)
  ordersRouter.patch('/dev/reorder', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { stageId, orderIds } = req.body;

      if (!stageId || !orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ error: 'stageId and orderIds array are required' });
      }

      // Convert frontend stage format to DB format
      const dbStage = stageId.toUpperCase().replace(/-/g, '_');

      // Update sortOrder for each order in the array
      await prisma.$transaction(
        orderIds.map((orderId: string, index: number) =>
          prisma.order.update({
            where: { id: orderId },
            data: { sortOrder: index }
          })
        )
      );

      console.log(`Reordered ${orderIds.length} orders in stage ${dbStage}`);
      res.json({ success: true, reordered: orderIds.length });
    } catch (error) {
      next(error);
    }
  });

  console.log('📦 Development endpoints enabled: /api/orders/dev/all, /api/orders/dev/customers, /api/orders/dev/:id/stage, /api/orders/dev/reorder');
}

// All other routes require authentication
ordersRouter.use(requireAuth);

// Validation schemas
const updateOrderSchema = z.object({
  pipelineStage: z.enum(['NEW', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'NEEDS_ATTENTION']).optional(),
  tags: z.array(z.string()).optional(),
  hasIssue: z.boolean().optional(),
  issueDescription: z.string().optional(),
  assignedToId: z.string().nullable().optional()
});

const addNoteSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional()
});

const updateTrackingSchema = z.object({
  carrierName: z.string(),
  trackingNumber: z.string(),
  trackingUrl: z.string().optional()
});

const batchUpdateSchema = z.object({
  orderIds: z.array(z.string()),
  pipelineStage: z.enum(['NEW', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'NEEDS_ATTENTION']).optional(),
  addTags: z.array(z.string()).optional(),
  removeTags: z.array(z.string()).optional(),
  assignedToId: z.string().nullable().optional()
});

const reorderSchema = z.object({
  orderId: z.string(),
  newIndex: z.number()
});

// GET /api/orders
ordersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stage, search, shipBy, hasIssue, isGift, tags, limit = '50', offset = '0' } = req.query;

    const where: any = { shopId: req.user!.shopId };

    if (stage) {
      where.pipelineStage = stage;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (shipBy === 'overdue') {
      where.shipByDate = { lt: new Date() };
      where.isShipped = false;
    } else if (shipBy === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.shipByDate = { gte: today, lt: tomorrow };
    }

    if (hasIssue === 'true') where.hasIssue = true;
    if (isGift === 'true') where.isGift = true;

    if (tags && typeof tags === 'string') {
      where.tags = { hasSome: tags.split(',') };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, tier: true, isRepeatCustomer: true }
          },
          items: true,
          assignedTo: {
            select: { id: true, name: true, avatarUrl: true }
          },
          _count: { select: { notes: true } }
        },
        orderBy: [{ pipelineStage: 'asc' }, { sortOrder: 'asc' }, { orderedAt: 'desc' }],
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id
ordersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId },
      include: {
        customer: true,
        items: true,
        notes: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        history: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        shippingLabel: true
      }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id
ordersRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateOrderSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const updates: any = { ...data, updatedAt: new Date() };
    const historyEntries: any[] = [];

    // Track stage change
    if (data.pipelineStage && data.pipelineStage !== order.pipelineStage) {
      historyEntries.push({
        orderId: order.id,
        userId: req.user!.id,
        type: 'STAGE_CHANGED',
        description: `Stage changed from ${order.pipelineStage} to ${data.pipelineStage}`
      });
    }

    // Track issue flag
    if (data.hasIssue !== undefined && data.hasIssue !== order.hasIssue) {
      historyEntries.push({
        orderId: order.id,
        userId: req.user!.id,
        type: data.hasIssue ? 'ISSUE_FLAGGED' : 'ISSUE_RESOLVED',
        description: data.hasIssue
          ? `Issue flagged: ${data.issueDescription || 'No description'}`
          : 'Issue resolved'
      });
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: req.params.id },
        data: updates,
        include: { customer: true, items: true }
      }),
      ...(historyEntries.length > 0
        ? [prisma.orderHistory.createMany({ data: historyEntries })]
        : [])
    ]);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/:id/notes
ordersRouter.post('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, isInternal = true } = addNoteSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const [note] = await prisma.$transaction([
      prisma.orderNote.create({
        data: {
          orderId: order.id,
          userId: req.user!.id,
          content,
          isInternal
        },
        include: { user: { select: { id: true, name: true } } }
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          userId: req.user!.id,
          type: 'NOTE_ADDED',
          description: 'Note added'
        }
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { updatedAt: new Date() }
      })
    ]);

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/:id/ship
ordersRouter.post('/:id/ship', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { carrierName, trackingNumber, trackingUrl } = updateTrackingSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const now = new Date();

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          carrierName,
          trackingNumber,
          trackingUrl,
          isShipped: true,
          shippedAt: now,
          pipelineStage: 'SHIPPED',
          updatedAt: now
        },
        include: { customer: true, items: true }
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          userId: req.user!.id,
          type: 'SHIPPED',
          description: `Shipped via ${carrierName}: ${trackingNumber}`
        }
      })
    ]);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/:id/tags
ordersRouter.post('/:id/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag } = z.object({ tag: z.string() }).parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.tags.includes(tag)) {
      return res.json(order);
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { tags: [...order.tags, tag], updatedAt: new Date() }
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          userId: req.user!.id,
          type: 'TAG_ADDED',
          description: `Tag added: ${tag}`
        }
      })
    ]);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id/tags/:tag
ordersRouter.delete('/:id/tags/:tag', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          tags: order.tags.filter(t => t !== req.params.tag),
          updatedAt: new Date()
        }
      }),
      prisma.orderHistory.create({
        data: {
          orderId: order.id,
          userId: req.user!.id,
          type: 'TAG_REMOVED',
          description: `Tag removed: ${req.params.tag}`
        }
      })
    ]);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/batch - Batch update orders
ordersRouter.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderIds, pipelineStage, addTags, removeTags, assignedToId } = batchUpdateSchema.parse(req.body);

    // Verify all orders belong to the shop
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, shopId: req.user!.shopId }
    });

    if (orders.length !== orderIds.length) {
      throw new AppError(400, 'Some orders not found or not accessible');
    }

    const updates: any = { updatedAt: new Date() };
    const historyType = pipelineStage ? 'STAGE_CHANGED' : 'TAG_ADDED';

    if (pipelineStage) updates.pipelineStage = pipelineStage;
    if (assignedToId !== undefined) updates.assignedToId = assignedToId;

    // Update orders
    await prisma.$transaction(async (tx) => {
      for (const order of orders) {
        let orderUpdates = { ...updates };

        if (addTags || removeTags) {
          let newTags = [...order.tags];
          if (addTags) newTags = [...new Set([...newTags, ...addTags])];
          if (removeTags) newTags = newTags.filter(t => !removeTags.includes(t));
          orderUpdates.tags = newTags;
        }

        await tx.order.update({
          where: { id: order.id },
          data: orderUpdates
        });

        await tx.orderHistory.create({
          data: {
            orderId: order.id,
            userId: req.user!.id,
            type: historyType,
            description: `Batch update: ${pipelineStage ? `Stage → ${pipelineStage}` : ''} ${addTags ? `+tags: ${addTags.join(', ')}` : ''}`
          }
        });
      }
    });

    res.json({ updated: orders.length });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/reorder
ordersRouter.patch('/:id/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newIndex } = reorderSchema.parse({ ...req.body, orderId: req.params.id });

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, shopId: req.user!.shopId }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Get all orders in the same stage
    const stageOrders = await prisma.order.findMany({
      where: { shopId: req.user!.shopId, pipelineStage: order.pipelineStage },
      orderBy: { sortOrder: 'asc' }
    });

    // Calculate new sort orders
    const oldIndex = stageOrders.findIndex(o => o.id === order.id);
    if (oldIndex === -1 || oldIndex === newIndex) {
      return res.json(order);
    }

    // Reorder
    const reordered = [...stageOrders];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update all sort orders
    await prisma.$transaction(
      reordered.map((o, index) =>
        prisma.order.update({
          where: { id: o.id },
          data: { sortOrder: index }
        })
      )
    );

    res.json({ reordered: true });
  } catch (error) {
    next(error);
  }
});
