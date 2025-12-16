interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const DefaultIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#F3F4F6"/>
    <path d="M24 16V32M16 24H32" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OrdersIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#EEF2FF"/>
    <path d="M32 20L40 25V35L32 40L24 35V25L32 20Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 40V30" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
    <path d="M40 25L32 30L24 25" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CustomersIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#FEF3C7"/>
    <circle cx="32" cy="26" r="6" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M22 42C22 37.5817 26.4772 34 32 34C37.5228 34 42 37.5817 42 42" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#F3F4F6"/>
    <circle cx="30" cy="30" r="8" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M36 36L42 42" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SyncIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#ECFDF5"/>
    <path d="M38 26L42 22L38 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 32C22 26.4772 26.4772 22 32 22H42" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 38L22 42L26 46" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42 32C42 37.5228 37.5228 42 32 42H22" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-[#6e6af0] text-white text-sm font-medium rounded-lg hover:bg-[#5b57d1] transition-colors"
          >
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Preset empty states
export function NoOrdersEmptyState({ onSync }: { onSync?: () => void }) {
  return (
    <EmptyState
      icon={<OrdersIcon />}
      title="No orders yet"
      description="Orders will appear here once you sync from Etsy or create them manually."
      action={onSync ? { label: 'Sync from Etsy', onClick: onSync } : undefined}
    />
  );
}

export function NoCustomersEmptyState({ onSync }: { onSync?: () => void }) {
  return (
    <EmptyState
      icon={<CustomersIcon />}
      title="No customers yet"
      description="Customer profiles are created automatically when you sync orders from Etsy."
      action={onSync ? { label: 'Sync Orders', onClick: onSync } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
    />
  );
}

export function NotConnectedEmptyState({ onConnect }: { onConnect?: () => void }) {
  return (
    <EmptyState
      icon={<SyncIcon />}
      title="Connect your Etsy shop"
      description="Link your Etsy account to automatically import orders and customer data."
      action={onConnect ? { label: 'Connect Etsy', onClick: onConnect } : undefined}
    />
  );
}

export function EmptyStageEmptyState({ stageName }: { stageName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <span className="text-xl">📦</span>
      </div>
      <p className="text-sm text-gray-500">No orders in {stageName}</p>
    </div>
  );
}
