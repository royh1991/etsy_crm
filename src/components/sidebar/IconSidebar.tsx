interface IconSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

// Icon SVGs matching the Figma design
const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#959BA3" strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#959BA3" strokeWidth="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#959BA3" strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#959BA3" strokeWidth="1.5"/>
  </svg>
);

const LayoutGridIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="13" y="3" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="3" y="13" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
    <rect x="13" y="13" width="8" height="8" rx="2" fill={active ? "#6E6AF0" : "#959BA3"}/>
  </svg>
);

const DocumentsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 6H22L20 16H8L6 6Z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L4 2H2" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="20" r="1.5" stroke="#959BA3" strokeWidth="1.5"/>
    <circle cx="18" cy="20" r="1.5" stroke="#959BA3" strokeWidth="1.5"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Logo SVG
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke="url(#logo-gradient)" strokeWidth="3"/>
    <defs>
      <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6E6AF0"/>
        <stop offset="1" stopColor="#9747FF"/>
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
  // On mobile, sidebar is an overlay
  if (isMobile && collapsed) {
    return null;
  }

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
          <div className="flex flex-col items-center gap-[12px]">
            {/* Grid icon */}
            <button className="w-[65px] py-[10px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
              <GridIcon />
            </button>

            {/* Active layout grid icon */}
            <button className="w-[49px] py-[10px] flex justify-center bg-[#eef1ff] rounded-[8px] transition-colors">
              <LayoutGridIcon active />
            </button>

            {/* Documents icon */}
            <button className="w-[65px] py-[10px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
              <DocumentsIcon />
            </button>

            {/* Shopping icon */}
            <button className="w-[65px] py-[10px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
              <ShoppingIcon />
            </button>

            {/* Chat icon */}
            <button className="w-[65px] py-[10px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
              <ChatIcon />
            </button>

            {/* Moon icon */}
            <button className="w-[65px] py-[10px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
              <MoonIcon />
            </button>
          </div>

          {/* Trash icon at bottom */}
          <button className="w-[65px] py-[14px] flex justify-center hover:bg-[#f7f7f7] transition-colors">
            <TrashIcon />
          </button>
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
