import { useState, useEffect, useRef, useMemo } from 'react';
import { useOrderStore } from '../../stores/orderStore';

interface CommandItem {
  id: string;
  type: 'action' | 'order' | 'customer' | 'navigation';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M17.5 17.5L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    orders,
    customers,
    setActiveView,
    openOrderDrawer,
    openCustomerDrawer
  } = useOrderStore();

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation commands
      {
        id: 'nav-pipeline',
        type: 'navigation',
        title: 'Go to Pipeline',
        subtitle: 'View order pipeline',
        keywords: ['orders', 'kanban', 'board'],
        action: () => setActiveView('pipeline')
      },
      {
        id: 'nav-customers',
        type: 'navigation',
        title: 'Go to Customers',
        subtitle: 'View customer list',
        keywords: ['people', 'buyers'],
        action: () => setActiveView('customers')
      },
      {
        id: 'nav-dashboard',
        type: 'navigation',
        title: 'Go to Dashboard',
        subtitle: 'View analytics',
        keywords: ['stats', 'analytics', 'reports'],
        action: () => setActiveView('analytics')
      },
      // Action commands
      {
        id: 'action-sync',
        type: 'action',
        title: 'Sync Orders',
        subtitle: 'Import orders from Etsy',
        keywords: ['import', 'fetch', 'etsy'],
        action: () => window.dispatchEvent(new CustomEvent('sync-orders'))
      },
      {
        id: 'action-settings',
        type: 'action',
        title: 'Open Settings',
        subtitle: 'Configure your shop',
        keywords: ['config', 'preferences'],
        action: () => setActiveView('settings' as any)
      }
    ];

    // Add orders
    orders.slice(0, 20).forEach(order => {
      items.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `Order #${order.orderNumber}`,
        subtitle: `${order.buyerName} - $${order.totalAmount.toFixed(2)}`,
        keywords: [order.buyerEmail, ...order.items.map(i => i.title)],
        action: () => {
          setActiveView('pipeline');
          openOrderDrawer(order.id);
        }
      });
    });

    // Add customers
    customers.slice(0, 20).forEach(customer => {
      items.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        title: customer.name,
        subtitle: `${customer.email} - ${customer.orderCount} orders`,
        keywords: [],
        action: () => {
          setActiveView('customers');
          openCustomerDrawer(customer.id);
        }
      });
    });

    return items;
  }, [orders, customers, setActiveView, openOrderDrawer, openCustomerDrawer]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show navigation and action commands by default
      return commands.filter(c => c.type === 'navigation' || c.type === 'action');
    }

    const q = query.toLowerCase();
    return commands.filter(cmd => {
      const titleMatch = cmd.title.toLowerCase().includes(q);
      const subtitleMatch = cmd.subtitle?.toLowerCase().includes(q);
      const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(q));
      return titleMatch || subtitleMatch || keywordMatch;
    }).slice(0, 10);
  }, [commands, query]);

  // Handle open/close
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
      setQuery('');
      setSelectedIndex(0);
    };

    window.addEventListener('toggle-command-palette', handleToggle);
    return () => window.removeEventListener('toggle-command-palette', handleToggle);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[600px] mx-4 overflow-hidden border border-gray-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <span className="text-gray-400">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search orders, customers, or commands..."
            className="flex-1 outline-none text-[15px] placeholder:text-gray-400"
          />
          <kbd className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-[#6e6af0] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  index === selectedIndex ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {cmd.type === 'order' && '📦'}
                  {cmd.type === 'customer' && '👤'}
                  {cmd.type === 'navigation' && '→'}
                  {cmd.type === 'action' && '⚡'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    index === selectedIndex ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cmd.title}
                  </div>
                  {cmd.subtitle && (
                    <div className={`text-xs truncate ${
                      index === selectedIndex ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {cmd.subtitle}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  index === selectedIndex ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cmd.type}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Enter</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">K</kbd>
            to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
