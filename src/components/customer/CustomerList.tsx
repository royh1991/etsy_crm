import { useState } from 'react';
import { format } from 'date-fns';
import type { CustomerTier, Customer } from '../../types';
import { getTierLabel, getFlagLabel } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-10 5L2 7"/>
  </svg>
);

const OrdersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h6"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

interface CustomerListProps {
  onSelectCustomer?: (customerId: string) => void;
}

type FilterOption = 'all' | 'repeat' | 'spent_50' | 'spent_100' | 'spent_200' | 'vip' | 'flagged';

// Customer row component with hover actions
function CustomerRow({
  customer,
  onSelect,
  getTierBadgeClass,
  getCustomerOrders
}: {
  customer: Customer;
  onSelect: () => void;
  getTierBadgeClass: (tier: CustomerTier) => string;
  getCustomerOrders: (customerId: string) => number;
}) {
  const [showActions, setShowActions] = useState(false);
  const customerOrderCount = getCustomerOrders(customer.id);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${customer.email}`;
  };

  const handleViewOrdersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative group"
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {customer.name}
            </span>
            {customer.isRepeatCustomer && (
              <span className="text-[#6e6af0]" title={`${customer.orderCount} orders`}>
                <RepeatIcon />
              </span>
            )}
            {customer.isFlagged && (
              <span className="text-orange-500" title="Flagged">
                <FlagIcon />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{customer.email}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{customer.orderCount} orders</span>
            <span>Last: {format(new Date(customer.lastOrderDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Right side: Stats or Quick Actions */}
        <div className="text-right flex-shrink-0 ml-3">
          {showActions ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleEmailClick}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#6e6af0] hover:text-white text-gray-600 transition-colors"
                title="Send Email"
              >
                <MailIcon />
              </button>
              <button
                onClick={handleViewOrdersClick}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#6e6af0] hover:text-white text-gray-600 transition-colors"
                title={`View ${customerOrderCount} Orders`}
              >
                <OrdersIcon />
              </button>
            </div>
          ) : (
            <>
              <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
              {customer.tier !== 'regular' && customer.tier !== 'new' && (
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${getTierBadgeClass(customer.tier)}`}>
                  {getTierLabel(customer.tier)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Flags */}
      {customer.isFlagged && (
        <div className="mt-2 flex flex-wrap gap-1">
          {customer.flags.map((flag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full"
            >
              {getFlagLabel(flag.type)}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {customer.hasLeftReview && customer.averageRating && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <span className="text-yellow-500">
            <StarIcon />
          </span>
          <span>{customer.averageRating.toFixed(1)} avg rating ({customer.reviewCount} reviews)</span>
        </div>
      )}
    </div>
  );
}

export default function CustomerList({ onSelectCustomer }: CustomerListProps) {
  const { customers, orders } = useOrderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'orderCount' | 'lastOrderDate'>('lastOrderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All Customers' },
    { value: 'repeat', label: 'Repeat Customers' },
    { value: 'spent_50', label: 'Spent $50+' },
    { value: 'spent_100', label: 'Spent $100+' },
    { value: 'spent_200', label: 'Spent $200+' },
    { value: 'vip', label: 'VIP ($500+)' },
    { value: 'flagged', label: 'Flagged' },
  ];

  // Filter customers
  let filteredCustomers = [...customers];

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredCustomers = filteredCustomers.filter(
      c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    );
  }

  // Category filter
  switch (activeFilter) {
    case 'repeat':
      filteredCustomers = filteredCustomers.filter(c => c.isRepeatCustomer);
      break;
    case 'spent_50':
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= 50);
      break;
    case 'spent_100':
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= 100);
      break;
    case 'spent_200':
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= 200);
      break;
    case 'vip':
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= 500);
      break;
    case 'flagged':
      filteredCustomers = filteredCustomers.filter(c => c.isFlagged);
      break;
  }

  // Sort customers
  filteredCustomers.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'totalSpent':
        comparison = a.totalSpent - b.totalSpent;
        break;
      case 'orderCount':
        comparison = a.orderCount - b.orderCount;
        break;
      case 'lastOrderDate':
        comparison = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
        break;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Get customer orders count
  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId).length;
  };

  const getTierBadgeClass = (tier: CustomerTier) => {
    switch (tier) {
      case 'vip':
        return 'bg-purple-100 text-purple-700';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700';
      case 'silver':
        return 'bg-gray-200 text-gray-700';
      case 'bronze':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Toggle selection
  const toggleSelection = (customerId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedIds(newSelected);
  };

  // Select all visible
  const selectAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  // Email selected customers
  const emailSelected = () => {
    const selectedCustomers = customers.filter(c => selectedIds.has(c.id));
    const emails = selectedCustomers.map(c => c.email).join(',');
    window.location.href = `mailto:${emails}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">{filteredCustomers.length} customers</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
            <button
              onClick={emailSelected}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#6e6af0] text-white rounded-lg hover:bg-[#5b57d1] transition-colors"
            >
              <MailIcon />
              Email Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-3 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6e6af0]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === option.value
                  ? 'bg-[#6e6af0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort and Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-[#6e6af0]"
            >
              <option value="lastOrderDate">Last Order</option>
              <option value="totalSpent">Total Spent</option>
              <option value="orderCount">Order Count</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          <button
            onClick={selectAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#6e6af0] transition-colors"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
              selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0
                ? 'bg-[#6e6af0] border-[#6e6af0] text-white'
                : 'border-gray-300'
            }`}>
              {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 && (
                <CheckIcon />
              )}
            </div>
            <span>Select All</span>
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2">👥</span>
            <p className="text-sm text-gray-500">No customers found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="flex items-start">
                {/* Selection Checkbox */}
                <div className="pl-4 py-4 flex items-start">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(customer.id);
                    }}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedIds.has(customer.id)
                        ? 'bg-[#6e6af0] border-[#6e6af0] text-white'
                        : 'border-gray-300 hover:border-[#6e6af0]'
                    }`}
                  >
                    {selectedIds.has(customer.id) && <CheckIcon />}
                  </button>
                </div>

                {/* Customer Row */}
                <div className="flex-1">
                  <CustomerRow
                    customer={customer}
                    onSelect={() => onSelectCustomer?.(customer.id)}
                    getTierBadgeClass={getTierBadgeClass}
                    getCustomerOrders={getCustomerOrders}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
