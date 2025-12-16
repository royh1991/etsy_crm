import { format } from 'date-fns';
import type { Order, Customer } from '../../types';
import { isOrderOverdue, getDaysUntilShipBy } from '../../types';

// Icons
const GiftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

const ShippingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);


const FlagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface OrderCardProps {
  order: Order;
  customer?: Customer;
  onViewDetails: () => void;
  onCreateLabel: () => void;
  onMessageCustomer?: () => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (orderId: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

export default function OrderCard({
  order,
  customer,
  onViewDetails,
  onCreateLabel,
  isDragging = false,
  isSelected = false,
  onSelect,
  showCheckbox = false
}: OrderCardProps) {
  const isOverdue = isOrderOverdue(order);
  const daysUntilShipBy = getDaysUntilShipBy(order);
  const isRepeat = customer?.isRepeatCustomer || false;
  const isFlagged = customer?.isFlagged || false;
  

  // Format ship-by date display
  const getShipByDisplay = () => {
    if (order.isShipped) return null;
    if (isOverdue) {
      return { text: `${Math.abs(daysUntilShipBy)} days overdue`, className: 'text-red-600 font-medium' };
    }
    if (daysUntilShipBy === 0) {
      return { text: 'Ship today', className: 'text-orange-600 font-medium' };
    }
    if (daysUntilShipBy === 1) {
      return { text: 'Ship tomorrow', className: 'text-yellow-600' };
    }
    return { text: `Ship by ${format(new Date(order.shipByDate), 'MMM d')}`, className: 'text-gray-500' };
  };

  const shipByDisplay = getShipByDisplay();

  // Get tier badge
  const getTierBadge = () => {
    if (!customer) return null;
    if (customer.tier === 'vip') return { text: 'VIP', className: 'bg-purple-100 text-purple-700' };
    if (customer.tier === 'gold') return { text: 'Gold', className: 'bg-yellow-100 text-yellow-700' };
    if (customer.tier === 'silver') return { text: 'Silver', className: 'bg-gray-100 text-gray-600' };
    return null;
  };

  const tierBadge = getTierBadge();

  // First item image (placeholder if none)
  const firstItemImage = order.items[0]?.imageUrl;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const additionalItems = itemCount - (order.items[0]?.quantity || 0);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(order.id, !isSelected);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-[#6e6af0] transition-all duration-200
        cursor-pointer group relative
        ${isDragging ? 'rotate-2 shadow-lg' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50/30' : ''}
        ${isFlagged ? 'border-orange-300' : ''}
        ${isSelected ? 'ring-2 ring-[#6e6af0] border-[#6e6af0]' : ''}
      `}
      onClick={onViewDetails}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div
          className={`absolute -left-2 -top-2 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${
            isSelected
              ? 'bg-[#6e6af0] border-[#6e6af0] text-white'
              : 'bg-white border-gray-300 hover:border-[#6e6af0] opacity-0 group-hover:opacity-100'
          }`}
          onClick={handleCheckboxClick}
        >
          {isSelected && <CheckIcon />}
        </div>
      )}

      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="w-[50px] h-[50px] rounded-md bg-gray-100 flex-shrink-0 overflow-hidden">
            {firstItemImage ? (
              <img src={firstItemImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                IMG
              </div>
            )}
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-gray-500 font-medium">
              #{order.orderNumber.slice(-6)}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[13px] font-medium text-gray-900 truncate">
                {order.buyerName}
              </span>
              {isRepeat && (
                <span className="text-[#6e6af0]" title={`${customer?.orderCount} orders`}>
                  <RepeatIcon />
                </span>
              )}
              {isFlagged && (
                <span className="text-orange-500" title="Flagged customer">
                  <FlagIcon />
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-2">
          <div className="text-[12px] text-gray-700 truncate">
            {order.items[0]?.title}
            {order.items[0]?.quantity > 1 && ` x${order.items[0].quantity}`}
          </div>
          {additionalItems > 0 && (
            <div className="text-[11px] text-gray-400">
              + {additionalItems} more item{additionalItems > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Footer */}
      <div className="px-3 py-2">
        {/* Price and Ship By */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-gray-900">
            ${order.totalAmount.toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            {shipByDisplay && (
              <span className={shipByDisplay.className}>
                {shipByDisplay.text}
              </span>
            )}
            {order.isGift && (
              <span className="text-pink-500" title="Gift order">
                <GiftIcon />
              </span>
            )}
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {tierBadge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tierBadge.className}`}>
              {tierBadge.text}
            </span>
          )}
          {order.hasIssue && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-0.5">
              <AlertIcon />
              Issue
            </span>
          )}
          {order.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
          {order.tags.length > 2 && (
            <span className="text-[10px] text-gray-400">
              +{order.tags.length - 2}
            </span>
          )}
        </div>

        {/* Action Buttons - only show if not shipped */}
        {!order.isShipped && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-white bg-[#6e6af0] hover:bg-[#5b57d1] rounded py-1.5 px-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCreateLabel();
              }}
            >
              <ShippingIcon />
              Create Label
            </button>
            <button
              className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded py-1.5 px-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Message customer
              }}
            >
              <MessageIcon />
            </button>
          </div>
        )}

        {/* Shipped Status */}
        {order.isShipped && order.trackingNumber && (
          <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <ShippingIcon />
            <span>{order.carrierName}: {order.trackingNumber.slice(0, 12)}...</span>
          </div>
        )}
      </div>
    </div>
  );
}
