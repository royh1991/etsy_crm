import { useMemo } from 'react';
import { subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { DEFAULT_PIPELINE_STAGES, isOrderOverdue } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
}

function StatCard({ title, value, subtitle, icon, iconBg, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
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
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: stage.color }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-12 text-right">{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const { orders, customers } = useOrderStore();

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    // Today's orders
    const ordersToday = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: todayStart, end: todayEnd })
    );

    // This week's orders
    const ordersThisWeek = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: weekAgo, end: now })
    );

    // This month's orders
    const ordersThisMonth = orders.filter(o =>
      isWithinInterval(new Date(o.orderDate), { start: monthAgo, end: now })
    );

    // Shipped today
    const shippedToday = orders.filter(o =>
      o.isShipped &&
      o.history.some(h =>
        h.type === 'shipped' &&
        isWithinInterval(new Date(h.timestamp), { start: todayStart, end: todayEnd })
      )
    );

    // Delivered
    const deliveredToday = orders.filter(o =>
      o.trackingStatus === 'delivered' &&
      o.pipelineStage === 'delivered'
    );

    // Overdue
    const overdueOrders = orders.filter(o => isOrderOverdue(o));

    // New orders (in 'new' stage)
    const newOrders = orders.filter(o => o.pipelineStage === 'new');

    // Revenue calculations
    const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.totalAmount, 0);
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

    return {
      ordersToday: ordersToday.length,
      revenueToday,
      shippedToday: shippedToday.length,
      deliveredToday: deliveredToday.length,
      overdueOrders: overdueOrders.length,
      newOrders: newOrders.length,
      ordersThisWeek: ordersThisWeek.length,
      revenueThisWeek,
      ordersThisMonth: ordersThisMonth.length,
      revenueThisMonth,
      averageOrderValue,
      repeatCustomerRate
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

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of your Etsy shop performance
          </p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Orders Today"
            value={stats.ordersToday}
            icon={<PackageIcon />}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Revenue Today"
            value={`$${stats.revenueToday.toFixed(2)}`}
            icon={<DollarIcon />}
            iconBg="bg-green-100 text-green-600"
          />
          <StatCard
            title="Shipped Today"
            value={stats.shippedToday}
            icon={<ShippingIcon />}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Overdue Orders"
            value={stats.overdueOrders}
            icon={<AlertIcon />}
            iconBg={stats.overdueOrders > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="This Week"
            value={stats.ordersThisWeek}
            subtitle={`$${stats.revenueThisWeek.toFixed(2)} revenue`}
            icon={<PackageIcon />}
            iconBg="bg-indigo-100 text-indigo-600"
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
            <div className="space-y-4">
              {ordersByStage.map(({ stage, count }) => (
                <PipelineBar
                  key={stage.id}
                  stage={stage}
                  count={count}
                  total={orders.length}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Total Orders: <span className="font-medium text-gray-900">{orders.length}</span>
              </p>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left">
              <span className="text-2xl mb-2 block">🆕</span>
              <p className="text-sm font-medium text-gray-900">New Orders</p>
              <p className="text-xs text-gray-500">{stats.newOrders} waiting</p>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left">
              <span className="text-2xl mb-2 block">📦</span>
              <p className="text-sm font-medium text-gray-900">Ready to Ship</p>
              <p className="text-xs text-gray-500">
                {orders.filter(o => o.pipelineStage === 'ready-to-ship').length} orders
              </p>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-colors text-left">
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
