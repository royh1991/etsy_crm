import type { Order, Customer } from '../../types';
import { isOrderOverdue, getDaysUntilShipBy } from '../../types';

// Icons
const GiftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2L1 21h22L12 2zm0 5l7.5 13h-15L12 7zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
  </svg>
);

const ShipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 18H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
    <path d="M15 13h6l2 2v4a1 1 0 0 1-1 1h-1"/>
    <path d="M15 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>
    <path d="M5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>
    <path d="M15 13V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
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

  // Format urgency display
  const getUrgencyDisplay = () => {
    if (order.isShipped) return null;
    if (isOverdue) {
      const days = Math.abs(daysUntilShipBy);
      return { text: `${days}d overdue`, className: 'text-red-600 bg-red-50', urgent: true };
    }
    if (daysUntilShipBy === 0) {
      return { text: 'Today', className: 'text-orange-600 bg-orange-50', urgent: true };
    }
    if (daysUntilShipBy <= 2) {
      return { text: `${daysUntilShipBy}d left`, className: 'text-yellow-700 bg-yellow-50', urgent: false };
    }
    return null;
  };

  const urgencyDisplay = getUrgencyDisplay();

  // Get tier badge
  const getTierBadge = () => {
    if (!customer) return null;
    if (customer.tier === 'vip') return { text: 'VIP', className: 'bg-purple-500 text-white' };
    if (customer.tier === 'gold') return { text: 'Gold', className: 'bg-amber-500 text-white' };
    if (customer.tier === 'silver') return { text: 'Silver', className: 'bg-gray-400 text-white' };
    return null;
  };

  const tierBadge = getTierBadge();

  // Format product display
  const productDisplay = (() => {
    const firstItem = order.items[0];
    if (!firstItem) return '';
    let text = firstItem.title;
    if (text.length > 35) text = text.slice(0, 35) + '...';
    if (firstItem.quantity > 1) text += ` ×${firstItem.quantity}`;
    return text;
  })();

  const additionalItems = order.items.length > 1 ? order.items.length - 1 : 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(order.id, !isSelected);
    }
  };

  const handleShipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateLabel();
  };

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all duration-150
        cursor-pointer group relative
        ${isDragging ? 'rotate-1 shadow-xl scale-105' : 'hover:shadow-md'}
        ${isOverdue && !order.isShipped ? 'border-red-300 border-l-4 border-l-red-500' : 'border-gray-200'}
        ${order.hasIssue ? 'border-l-4 border-l-orange-500' : ''}
        ${isSelected ? 'ring-2 ring-[#6e6af0] border-[#6e6af0]' : ''}
      `}
      onClick={onViewDetails}
    >
      {/* Selection Checkbox - Only visible on hover or when selected */}
      {showCheckbox && (
        <div
          className={`absolute -left-2 -top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${
            isSelected
              ? 'bg-[#6e6af0] border-[#6e6af0] text-white scale-100'
              : 'bg-white border-gray-300 hover:border-[#6e6af0] scale-0 group-hover:scale-100'
          }`}
          onClick={handleCheckboxClick}
        >
          {isSelected && <CheckIcon />}
        </div>
      )}

      <div className="p-3">
        {/* Top Row: Tier + Name + Price */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {tierBadge && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${tierBadge.className}`}>
                {tierBadge.text}
              </span>
            )}
            <span className="text-[13px] font-medium text-gray-900 truncate">
              {order.buyerName}
            </span>
            {isRepeat && (
              <span className="text-[#6e6af0] flex-shrink-0" title={`${customer?.orderCount} orders`}>
                <RepeatIcon />
              </span>
            )}
            {isFlagged && (
              <span className="text-orange-500 flex-shrink-0" title="Flagged">
                <FlagIcon />
              </span>
            )}
            {order.isGift && (
              <span className="text-pink-500 flex-shrink-0" title="Gift">
                <GiftIcon />
              </span>
            )}
          </div>
          <span className="text-[13px] font-bold text-gray-900 flex-shrink-0">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Product Title */}
        <div className="text-[11px] text-gray-600 mt-1 truncate">
          {productDisplay}
          {additionalItems > 0 && (
            <span className="text-gray-400"> +{additionalItems} more</span>
          )}
        </div>

        {/* Bottom Row: Urgency + Actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {urgencyDisplay && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${urgencyDisplay.className}`}>
                {urgencyDisplay.urgent && '⚠ '}{urgencyDisplay.text}
              </span>
            )}
            {order.hasIssue && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-0.5">
                <AlertIcon /> Issue
              </span>
            )}
          </div>

          {/* Ship Button - Always visible for unshipped orders */}
          {!order.isShipped && (
            <button
              className="flex items-center gap-1 text-[10px] font-medium text-white bg-[#6e6af0] hover:bg-[#5b57d1] rounded px-2 py-1 transition-colors"
              onClick={handleShipClick}
            >
              <ShipIcon />
              Ship
            </button>
          )}

          {/* Shipped Status */}
          {order.isShipped && order.trackingNumber && (
            <div className="text-[10px] text-gray-500 flex items-center gap-1">
              <TruckIcon />
              <span className="truncate max-w-[100px]">
                {order.carrierName}: {order.trackingNumber.slice(0, 10)}...
              </span>
            </div>
          )}
        </div>

        {/* Order Number - Only visible on hover */}
        <div className="absolute top-1 right-1 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-1 rounded">
          #{order.orderNumber.slice(-6)}
        </div>

        {/* Tags tooltip on hover */}
        {order.tags.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-wrap gap-1 bg-white shadow-lg rounded p-1.5 border border-gray-200 z-20 max-w-[200px]">
            {order.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
