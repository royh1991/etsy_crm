import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { syncOrders } from '../services/orderSync.js';

export const syncRouter = Router();

// All routes require authentication
syncRouter.use(requireAuth);

// POST /api/sync/orders - Trigger manual sync
syncRouter.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shopId }
    });

    if (!shop) {
      throw new AppError(404, 'Shop not found');
    }

    if (!shop.etsyAccessToken) {
      throw new AppError(400, 'Etsy not connected. Please connect your Etsy account first.');
    }

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        shopId: shop.id,
        type: 'MANUAL',
        status: 'IN_PROGRESS'
      }
    });

    try {
      // Perform sync
      const result = await syncOrders(shop.id);

      // Update sync log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'COMPLETED',
          ordersCreated: result.ordersCreated,
          ordersUpdated: result.ordersUpdated,
          customersCreated: result.customersCreated,
          customersUpdated: result.customersUpdated,
          completedAt: new Date()
        }
      });

      // Update shop last sync time
      await prisma.shop.update({
        where: { id: shop.id },
        data: { lastSyncAt: new Date() }
      });

      res.json({
        success: true,
        syncLogId: syncLog.id,
        ...result
      });
    } catch (syncError: any) {
      // Update sync log with error
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          errorMessage: syncError.message,
          completedAt: new Date()
        }
      });

      throw syncError;
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/sync/status - Get last sync status
syncRouter.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shopId },
      select: {
        lastSyncAt: true,
        etsyAccessToken: true,
        autoSyncEnabled: true,
        syncIntervalMins: true
      }
    });

    if (!shop) {
      throw new AppError(404, 'Shop not found');
    }

    const lastSync = await prisma.syncLog.findFirst({
      where: { shopId: req.user!.shopId },
      orderBy: { startedAt: 'desc' }
    });

    res.json({
      etsyConnected: !!shop.etsyAccessToken,
      lastSyncAt: shop.lastSyncAt,
      autoSyncEnabled: shop.autoSyncEnabled,
      syncIntervalMins: shop.syncIntervalMins,
      lastSync: lastSync ? {
        id: lastSync.id,
        status: lastSync.status,
        ordersCreated: lastSync.ordersCreated,
        ordersUpdated: lastSync.ordersUpdated,
        customersCreated: lastSync.customersCreated,
        customersUpdated: lastSync.customersUpdated,
        errorMessage: lastSync.errorMessage,
        startedAt: lastSync.startedAt,
        completedAt: lastSync.completedAt
      } : null
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sync/logs - Get sync history
syncRouter.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        where: { shopId: req.user!.shopId },
        orderBy: { startedAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.syncLog.count({ where: { shopId: req.user!.shopId } })
    ]);

    res.json({ logs, total });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sync/settings - Update sync settings
syncRouter.patch('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { autoSyncEnabled, syncIntervalMins } = req.body;

    const updates: any = {};
    if (typeof autoSyncEnabled === 'boolean') updates.autoSyncEnabled = autoSyncEnabled;
    if (typeof syncIntervalMins === 'number' && syncIntervalMins >= 5) {
      updates.syncIntervalMins = syncIntervalMins;
    }

    const shop = await prisma.shop.update({
      where: { id: req.user!.shopId },
      data: updates,
      select: { autoSyncEnabled: true, syncIntervalMins: true }
    });

    res.json(shop);
  } catch (error) {
    next(error);
  }
});
