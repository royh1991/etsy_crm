import { useMemo } from 'react';
import { subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { DEFAULT_PIPELINE_STAGES, isOrderOverdue, getDaysUntilShipBy } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ShippingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 23v-1M18.36 4.93l.71-.71M23 12h-1M18.36 19.07l.71.71"/>
    <path d="M15 9.34a4 4 0 1 0-6 5.17V17a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.49a4 4 0 0 0 0-5.17z"/>
  </svg>
);

// Mini Sparkline Chart
function MiniSparkline({ data, color = '#6e6af0' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 60;
  const height = 20;
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
  comparison?: string;
  sparklineData?: number[];
}

function StatCard({ title, value, subtitle, icon, iconBg, trend, comparison, sparklineData }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sparklineData && sparklineData.length > 1 && (
              <MiniSparkline data={sparklineData} />
            )}
          </div>
          {comparison && <p className="text-xs text-gray-400 mt-0.5">{comparison}</p>}
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface InsightCardProps {
  emoji: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  variant: 'warning' | 'info' | 'success';
}

function InsightCard({ emoji, title, description, action, variant }: InsightCardProps) {
  const variants = {
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`p-3 rounded-lg border ${variants[variant]} flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 text-xs font-medium text-[#6e6af0] hover:underline flex-shrink-0"
        >
          {action.label}
          <ArrowRightIcon />
        </button>
      )}
    </div>
  );
}

interface PipelineBarProps {
  stage: { id: string; name: string; emoji: string; color: string };
  count: number;
  total: number;
}

function PipelineBar({ stage, count, total }: PipelineBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 flex items-center gap-2 flex-shrink-0">
        <span className="text-sm">{stage.emoji}</span>
        <span className="text-xs text-gray-600 truncate">{stage.name}</span>
      </div>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: stage.color }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const { orders, customers, setActiveView } = useOrderStore();

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const yesterdayEnd = endOfDay(subDays(now, 1));
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);
    const monthAgo = subDays(now, 30);

    // Today's orders
    const ordersToday = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: todayStart, end: todayEnd })
    );

    // Yesterday's orders (for comparison)
    const ordersYesterday = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: yesterdayStart, end: yesterdayEnd })
    );

    // This week's orders
    const ordersThisWeek = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: weekAgo, end: now })
    );

    // Last week's orders (for comparison)
    const ordersLastWeek = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: twoWeeksAgo, end: weekAgo })
    );

    // This month's orders
    const ordersThisMonth = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: monthAgo, end: now })
    );

    // Daily order counts for sparkline (last 7 days)
    const dailyOrders: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(subDays(now, i));
      const dayEnd = endOfDay(subDays(now, i));
      const count = orders.filter(o =>
        isWithinInterval(new Date(o.orderDate), { start: dayStart, end: dayEnd })
      ).length;
      dailyOrders.push(count);
    }

    // Daily revenue for sparkline (last 7 days)
    const dailyRevenue: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(subDays(now, i));
      const dayEnd = endOfDay(subDays(now, i));
      const revenue = orders
        .filter(o => isWithinInterval(new Date(o.orderDate), { start: dayStart, end: dayEnd }))
        .reduce((sum, o) => sum + o.totalAmount, 0);
      dailyRevenue.push(revenue);
    }

    // Shipped today
    const shippedToday = orders.filter(o =>
      o.isShipped &&
      o.history.some(h =>
        h.type === 'shipped' &&
        isWithinInterval(new Date(h.timestamp), { start: todayStart, end: todayEnd })
      )
    );

    // Overdue orders
    const overdueOrders = orders.filter(o => isOrderOverdue(o));

    // Orders due today
    const dueToday = orders.filter(o => {
      if (o.isShipped) return false;
      const days = getDaysUntilShipBy(o);
      return days === 0;
    });

    // New orders (in 'new' stage)
    const newOrders = orders.filter(o => o.pipelineStage === 'new');

    // Ready to ship
    const readyToShip = orders.filter(o => o.pipelineStage === 'ready-to-ship');

    // Revenue calculations
    const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueYesterday = ordersYesterday.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueLastWeek = ordersLastWeek.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.totalAmount, 0);

    // Average order value
    const averageOrderValue = orders.length > 0
      ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
      : 0;

    // Repeat customer rate
    const repeatCustomers = customers.filter(c => c.isRepeatCustomer);
    const repeatCustomerRate = customers.length > 0
      ? (repeatCustomers.length / customers.length) * 100
      : 0;

    // VIP customers
    const vipCustomers = customers.filter(c => c.tier === 'vip');

    // Trend calculations
    const weekTrend = ordersLastWeek.length > 0
      ? Math.round(((ordersThisWeek.length - ordersLastWeek.length) / ordersLastWeek.length) * 100)
      : 0;

    const revenueTrend = revenueLastWeek > 0
      ? Math.round(((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100)
      : 0;

    return {
      ordersToday: ordersToday.length,
      ordersYesterday: ordersYesterday.length,
      revenueToday,
      revenueYesterday,
      shippedToday: shippedToday.length,
      overdueOrders: overdueOrders.length,
      dueToday: dueToday.length,
      newOrders: newOrders.length,
      readyToShip: readyToShip.length,
      ordersThisWeek: ordersThisWeek.length,
      revenueThisWeek,
      ordersThisMonth: ordersThisMonth.length,
      revenueThisMonth,
      averageOrderValue,
      repeatCustomerRate,
      weekTrend,
      revenueTrend,
      vipCustomers: vipCustomers.length,
      dailyOrders,
      dailyRevenue
    };
  }, [orders, customers]);

  const ordersByStage = useMemo(() => {
    return DEFAULT_PIPELINE_STAGES.map(stage => ({
      stage,
      count: orders.filter(o => o.pipelineStage === stage.id).length
    }));
  }, [orders]);

  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [customers]);

  // Generate actionable insights
  const insights = useMemo(() => {
    const items: InsightCardProps[] = [];

    if (stats.overdueOrders > 0) {
      items.push({
        emoji: '🚨',
        title: `${stats.overdueOrders} order${stats.overdueOrders > 1 ? 's' : ''} overdue`,
        description: 'Ship these orders immediately to avoid negative reviews',
        action: { label: 'View', onClick: () => setActiveView('pipeline') },
        variant: 'warning'
      });
    }

    if (stats.dueToday > 0) {
      items.push({
        emoji: '⏰',
        title: `${stats.dueToday} order${stats.dueToday > 1 ? 's' : ''} due today`,
        description: 'Make sure to ship these before end of day',
        action: { label: 'View', onClick: () => setActiveView('pipeline') },
        variant: 'warning'
      });
    }

    if (stats.readyToShip > 0) {
      items.push({
        emoji: '📦',
        title: `${stats.readyToShip} order${stats.readyToShip > 1 ? 's' : ''} ready to ship`,
        description: 'Create shipping labels for these orders',
        action: { label: 'Ship Now', onClick: () => setActiveView('pipeline') },
        variant: 'info'
      });
    }

    if (stats.vipCustomers > 0 && stats.newOrders > 0) {
      const vipOrders = orders.filter(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return customer?.tier === 'vip' && o.pipelineStage === 'new';
      });
      if (vipOrders.length > 0) {
        items.push({
          emoji: '⭐',
          title: `${vipOrders.length} VIP order${vipOrders.length > 1 ? 's' : ''} waiting`,
          description: 'Prioritize these high-value customers',
          action: { label: 'View', onClick: () => setActiveView('pipeline') },
          variant: 'info'
        });
      }
    }

    if (items.length === 0 && stats.newOrders === 0) {
      items.push({
        emoji: '✅',
        title: 'All caught up!',
        description: 'No urgent orders - great job keeping on top of things',
        variant: 'success'
      });
    }

    return items.slice(0, 3);
  }, [stats, orders, customers, setActiveView]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Overview of your Etsy shop performance
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Last updated</p>
            <p className="text-sm font-medium text-gray-600">Just now</p>
          </div>
        </div>

        {/* Actionable Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LightbulbIcon />
              <span>Insights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} {...insight} />
              ))}
            </div>
          </div>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Orders Today"
            value={stats.ordersToday}
            comparison={stats.ordersYesterday > 0 ? `vs ${stats.ordersYesterday} yesterday` : 'No orders yesterday'}
            icon={<PackageIcon />}
            iconBg="bg-blue-100 text-blue-600"
            sparklineData={stats.dailyOrders}
          />
          <StatCard
            title="Revenue Today"
            value={`$${stats.revenueToday.toFixed(2)}`}
            comparison={stats.revenueYesterday > 0 ? `vs $${stats.revenueYesterday.toFixed(2)} yesterday` : undefined}
            icon={<DollarIcon />}
            iconBg="bg-green-100 text-green-600"
            sparklineData={stats.dailyRevenue}
          />
          <StatCard
            title="Shipped Today"
            value={stats.shippedToday}
            subtitle={stats.readyToShip > 0 ? `${stats.readyToShip} ready to ship` : undefined}
            icon={<ShippingIcon />}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Needs Attention"
            value={stats.overdueOrders + stats.dueToday}
            subtitle={stats.overdueOrders > 0 ? `${stats.overdueOrders} overdue` : stats.dueToday > 0 ? `${stats.dueToday} due today` : 'All on track'}
            icon={<AlertIcon />}
            iconBg={stats.overdueOrders > 0 ? "bg-red-100 text-red-600" : stats.dueToday > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}
          />
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="This Week"
            value={stats.ordersThisWeek}
            subtitle={`$${stats.revenueThisWeek.toFixed(2)} revenue`}
            icon={<PackageIcon />}
            iconBg="bg-indigo-100 text-indigo-600"
            trend={stats.weekTrend !== 0 ? { value: stats.weekTrend, label: 'vs last week' } : undefined}
          />
          <StatCard
            title="This Month"
            value={stats.ordersThisMonth}
            subtitle={`$${stats.revenueThisMonth.toFixed(2)} revenue`}
            icon={<PackageIcon />}
            iconBg="bg-cyan-100 text-cyan-600"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${stats.averageOrderValue.toFixed(2)}`}
            subtitle={`${stats.repeatCustomerRate.toFixed(0)}% repeat customers`}
            icon={<UsersIcon />}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h2>
            <div className="space-y-3">
              {ordersByStage.map(({ stage, count }) => (
                <PipelineBar
                  key={stage.id}
                  stage={stage}
                  count={count}
                  total={orders.length}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-900">{orders.length} orders</span>
              </p>
              <button
                onClick={() => setActiveView('pipeline')}
                className="text-sm text-[#6e6af0] hover:underline flex items-center gap-1"
              >
                View Pipeline <ArrowRightIcon />
              </button>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
            {topCustomers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">👥</span>
                <p className="text-sm text-gray-500">No customer data yet</p>
                <p className="text-xs text-gray-400">Sync orders to see customer insights</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${customer.totalSpent.toFixed(2)}
                        </p>
                        {customer.tier === 'vip' && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            VIP
                          </span>
                        )}
                        {customer.tier === 'gold' && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            Gold
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setActiveView('customers')}
                    className="text-sm text-[#6e6af0] hover:underline flex items-center gap-1"
                  >
                    View All Customers <ArrowRightIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveView('pipeline')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left"
            >
              <span className="text-2xl mb-2 block">🆕</span>
              <p className="text-sm font-medium text-gray-900">New Orders</p>
              <p className="text-xs text-gray-500">{stats.newOrders} waiting</p>
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left"
            >
              <span className="text-2xl mb-2 block">📦</span>
              <p className="text-sm font-medium text-gray-900">Ready to Ship</p>
              <p className="text-xs text-gray-500">{stats.readyToShip} orders</p>
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left"
            >
              <span className="text-2xl mb-2 block">⚠️</span>
              <p className="text-sm font-medium text-gray-900">Needs Attention</p>
              <p className="text-xs text-gray-500">
                {orders.filter(o => o.pipelineStage === 'needs-attention').length} issues
              </p>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left">
              <span className="text-2xl mb-2 block">🔄</span>
              <p className="text-sm font-medium text-gray-900">Sync Orders</p>
              <p className="text-xs text-gray-500">From Etsy</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
