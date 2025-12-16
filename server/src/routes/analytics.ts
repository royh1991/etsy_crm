import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const analyticsRouter = Router();

// All routes require authentication
analyticsRouter.use(requireAuth);

// GET /api/analytics/dashboard
analyticsRouter.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user!.shopId;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Today's stats
    const [ordersToday, revenueToday, shippedToday] = await Promise.all([
      prisma.order.count({
        where: { shopId, orderedAt: { gte: today } }
      }),
      prisma.order.aggregate({
        where: { shopId, orderedAt: { gte: today } },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { shopId, shippedAt: { gte: today } }
      })
    ]);

    // This week's stats
    const [ordersThisWeek, revenueThisWeek] = await Promise.all([
      prisma.order.count({
        where: { shopId, orderedAt: { gte: weekAgo } }
      }),
      prisma.order.aggregate({
        where: { shopId, orderedAt: { gte: weekAgo } },
        _sum: { totalAmount: true }
      })
    ]);

    // This month's stats
    const [ordersThisMonth, revenueThisMonth] = await Promise.all([
      prisma.order.count({
        where: { shopId, orderedAt: { gte: monthAgo } }
      }),
      prisma.order.aggregate({
        where: { shopId, orderedAt: { gte: monthAgo } },
        _sum: { totalAmount: true }
      })
    ]);

    // Overdue orders
    const overdueOrders = await prisma.order.count({
      where: {
        shopId,
        isShipped: false,
        shipByDate: { lt: today }
      }
    });

    // Pipeline counts
    const pipelineCounts = await prisma.order.groupBy({
      by: ['pipelineStage'],
      where: { shopId },
      _count: true
    });

    // Average order value
    const avgOrderValue = await prisma.order.aggregate({
      where: { shopId },
      _avg: { totalAmount: true }
    });

    // Repeat customer percentage
    const [totalCustomers, repeatCustomers] = await Promise.all([
      prisma.customer.count({ where: { shopId } }),
      prisma.customer.count({ where: { shopId, isRepeatCustomer: true } })
    ]);

    // Top customers
    const topCustomers = await prisma.customer.findMany({
      where: { shopId },
      orderBy: { totalSpent: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        orderCount: true,
        totalSpent: true,
        tier: true
      }
    });

    res.json({
      today: {
        orders: ordersToday,
        revenue: revenueToday._sum.totalAmount || 0,
        shipped: shippedToday,
        overdue: overdueOrders
      },
      thisWeek: {
        orders: ordersThisWeek,
        revenue: revenueThisWeek._sum.totalAmount || 0
      },
      thisMonth: {
        orders: ordersThisMonth,
        revenue: revenueThisMonth._sum.totalAmount || 0
      },
      pipeline: pipelineCounts.reduce((acc, p) => {
        acc[p.pipelineStage] = p._count;
        return acc;
      }, {} as Record<string, number>),
      avgOrderValue: avgOrderValue._avg.totalAmount || 0,
      repeatCustomerPercent: totalCustomers > 0
        ? Math.round((repeatCustomers / totalCustomers) * 100)
        : 0,
      topCustomers
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/revenue
analyticsRouter.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user!.shopId;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get daily revenue for the period
    const orders = await prisma.order.findMany({
      where: { shopId, orderedAt: { gte: startDate } },
      select: { orderedAt: true, totalAmount: true }
    });

    // Group by day
    const dailyRevenue: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyRevenue[key] = 0;
    }

    orders.forEach(order => {
      const key = order.orderedAt.toISOString().split('T')[0];
      if (dailyRevenue[key] !== undefined) {
        dailyRevenue[key] += Number(order.totalAmount);
      }
    });

    res.json({
      period: days,
      data: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/pipeline
analyticsRouter.get('/pipeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user!.shopId;

    const [counts, avgTimeInStage] = await Promise.all([
      prisma.order.groupBy({
        by: ['pipelineStage'],
        where: { shopId },
        _count: true
      }),
      // This would require more complex querying with order history
      // For now, return counts only
      Promise.resolve([])
    ]);

    res.json({
      stages: counts.map(c => ({
        stage: c.pipelineStage,
        count: c._count
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/customers
analyticsRouter.get('/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user!.shopId;

    const [tierCounts, totalSpent, newCustomers] = await Promise.all([
      prisma.customer.groupBy({
        by: ['tier'],
        where: { shopId },
        _count: true
      }),
      prisma.customer.aggregate({
        where: { shopId },
        _sum: { totalSpent: true }
      }),
      prisma.customer.count({
        where: {
          shopId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      })
    ]);

    res.json({
      tiers: tierCounts.reduce((acc, t) => {
        acc[t.tier] = t._count;
        return acc;
      }, {} as Record<string, number>),
      lifetimeValue: totalSpent._sum.totalSpent || 0,
      newCustomersLast30Days: newCustomers
    });
  } catch (error) {
    next(error);
  }
});
