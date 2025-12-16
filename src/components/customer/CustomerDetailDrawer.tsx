import { format } from 'date-fns';
import type { Customer, Order } from '../../types';
import { getTierLabel, getFlagLabel } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
  </svg>
);

interface CustomerDetailDrawerProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailDrawer({
  customer,
  isOpen,
  onClose
}: CustomerDetailDrawerProps) {
  const { orders, openOrderDrawer, closeCustomerDrawer } = useOrderStore();

  // Get orders for this customer
  const customerOrders = orders
    .filter(o => o.customerId === customer.id)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-purple-100 text-purple-700';
      case 'gold': return 'bg-yellow-100 text-yellow-700';
      case 'silver': return 'bg-gray-200 text-gray-700';
      case 'bronze': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.pipelineStage === 'delivered') {
      return { text: 'Delivered', className: 'bg-green-100 text-green-700' };
    }
    if (order.isShipped) {
      return { text: 'Shipped', className: 'bg-blue-100 text-blue-700' };
    }
    if (order.pipelineStage === 'needs-attention') {
      return { text: 'Issue', className: 'bg-red-100 text-red-700' };
    }
    return { text: 'Processing', className: 'bg-yellow-100 text-yellow-700' };
  };

  const handleViewOrder = (orderId: string) => {
    closeCustomerDrawer();
    openOrderDrawer(orderId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6e6af0]/10 flex items-center justify-center text-[#6e6af0]">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Stats Cards */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <PackageIcon />
                <span>Total Orders</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{customer.orderCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <DollarIcon />
                <span>Total Spent</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <CalendarIcon />
                <span>Customer Since</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(customer.firstOrderDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <DollarIcon />
                <span>Avg Order</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                ${customer.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {customer.tier !== 'regular' && customer.tier !== 'new' && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTierBadgeClass(customer.tier)}`}>
                {getTierLabel(customer.tier)}
              </span>
            )}
            {customer.isRepeatCustomer && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#6e6af0]/10 text-[#6e6af0] flex items-center gap-1">
                <RepeatIcon />
                Repeat Customer
              </span>
            )}
            {customer.hasLeftReview && customer.averageRating && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-50 text-yellow-700 flex items-center gap-1">
                <StarIcon />
                {customer.averageRating.toFixed(1)} ({customer.reviewCount} reviews)
              </span>
            )}
          </div>

          {/* Flags */}
          {customer.isFlagged && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FlagIcon />
                Flags
              </h3>
              <div className="space-y-2">
                {customer.flags.map((flag, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        {getFlagLabel(flag.type)}
                      </p>
                      {flag.reason && (
                        <p className="text-xs text-orange-600">{flag.reason}</p>
                      )}
                    </div>
                    <span className="text-xs text-orange-500">
                      {format(new Date(flag.createdAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order History */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <PackageIcon />
              Order History ({customerOrders.length})
            </h3>
            {customerOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {customerOrders.map((order) => {
                  const status = getStatusBadge(order);
                  return (
                    <button
                      key={order.id}
                      onClick={() => handleViewOrder(order.id)}
                      className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            #{order.orderNumber.slice(-6)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {order.items[0]?.title}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(order.orderDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLinkIcon />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping Address (from most recent order) */}
          {customerOrders.length > 0 && customerOrders[0].shippingAddress && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Last Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p>{customerOrders[0].shippingAddress.name}</p>
                <p>{customerOrders[0].shippingAddress.addressLine1}</p>
                {customerOrders[0].shippingAddress.addressLine2 && (
                  <p>{customerOrders[0].shippingAddress.addressLine2}</p>
                )}
                <p>
                  {customerOrders[0].shippingAddress.city}, {customerOrders[0].shippingAddress.state} {customerOrders[0].shippingAddress.postalCode}
                </p>
                <p>{customerOrders[0].shippingAddress.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            onClick={() => {
              // Future: Open flag modal
            }}
          >
            <FlagIcon />
            Add Flag
          </button>
          <a
            href={`mailto:${customer.email}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6e6af0] text-white rounded-lg hover:bg-[#5b57d1] transition-colors text-sm font-medium"
          >
            Send Message
          </a>
        </div>
      </div>
    </>
  );
}
