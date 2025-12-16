import { useOrderStore } from '../../stores/orderStore';

interface IconSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

// CRM Navigation Icons
const DashboardIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="13" y="3" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="3" y="13" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="13" y="13" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
  </svg>
);

const OrdersIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="3.27 6.96 12 12.01 20.73 6.96"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12" y1="22.08" x2="12" y2="12"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CustomersIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="9" cy="7" r="4"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AnalyticsIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line
      x1="18" y1="20" x2="18" y2="10"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12" y1="20" x2="12" y2="4"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="6" y1="20" x2="6" y2="14"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="12" r="3"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={active ? "#6E6AF0" : "#959BA3"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SyncIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polyline
      points="23 4 23 10 17 10"
      stroke="#959BA3"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="1 20 1 14 7 14"
      stroke="#959BA3"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
      stroke="#959BA3"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logo SVG - Etsy-inspired
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke="url(#logo-gradient)" strokeWidth="3"/>
    <text x="16" y="21" textAnchor="middle" fill="#6E6AF0" fontSize="14" fontWeight="bold">E</text>
    <defs>
      <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F56400"/>
        <stop offset="1" stopColor="#6E6AF0"/>
      </linearGradient>
    </defs>
  </svg>
);

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={`transition-transform duration-200 ${direction === 'left' ? 'rotate-180' : ''}`}
  >
    <path d="M6 4L10 8L6 12" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function IconSidebar({ collapsed, onToggle, isMobile }: IconSidebarProps) {
  const { activeView, setActiveView } = useOrderStore();

  // On mobile, sidebar is an overlay
  if (isMobile && collapsed) {
    return null;
  }

  const navItems = [
    { id: 'analytics' as const, icon: DashboardIcon, label: 'Dashboard' },
    { id: 'pipeline' as const, icon: OrdersIcon, label: 'Orders' },
    { id: 'customers' as const, icon: CustomersIcon, label: 'Customers' },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          ${isMobile ? 'fixed left-0 top-0 z-50' : 'relative'}
          h-full bg-white border-r-2 border-[#f7f7f7] flex flex-col
          transition-all duration-300 ease-in-out flex-shrink-0
          ${collapsed && !isMobile ? 'w-0 overflow-hidden opacity-0' : 'w-[65px]'}
        `}
      >
        {/* Logo */}
        <div className="h-[60px] flex items-center justify-center flex-shrink-0">
          <LogoIcon />
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="flex flex-col items-center gap-[8px]">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-[49px] py-[10px] flex justify-center rounded-[8px] transition-colors
                    ${isActive ? 'bg-[#eef1ff]' : 'hover:bg-[#f7f7f7]'}
                  `}
                  title={item.label}
                >
                  <Icon active={isActive} />
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-8 h-px bg-gray-200 my-2" />

            {/* Sync button */}
            <button
              className="w-[49px] py-[10px] flex justify-center rounded-[8px] hover:bg-[#f7f7f7] transition-colors"
              title="Sync from Etsy"
            >
              <SyncIcon />
            </button>
          </div>

          {/* Settings at bottom */}
          <div className="flex flex-col items-center">
            <button
              className="w-[49px] py-[10px] flex justify-center rounded-[8px] hover:bg-[#f7f7f7] transition-colors"
              title="Settings"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>

        {/* Toggle button - only show on desktop */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center shadow-sm hover:bg-[#f7f7f7] transition-colors z-10"
          >
            <ChevronIcon direction={collapsed ? 'right' : 'left'} />
          </button>
        )}
      </div>
    </>
  );
}
