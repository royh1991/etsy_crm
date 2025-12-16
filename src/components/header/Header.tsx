import { useState, useRef, useEffect } from 'react';
import { useOrderStore } from '../../stores/orderStore';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="#404656" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#959BA3" strokeWidth="1.5"/>
    <path d="M11 11L14 14" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// Avatar placeholder - yellow background with cartoon character
const UserAvatar = () => (
  <div className="w-[32px] h-[32px] rounded-full bg-[#fff2ab] overflow-hidden flex items-center justify-center flex-shrink-0">
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
      <circle cx="13.5" cy="10" r="6" fill="#f0c674"/>
      <ellipse cx="13.5" cy="25" rx="10" ry="8" fill="#f0c674"/>
      <circle cx="10" cy="9" r="1.5" fill="#333"/>
      <circle cx="17" cy="9" r="1.5" fill="#333"/>
      <path d="M11 13C11 13 12.5 15 13.5 15C14.5 15 16 13 16 13" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function Header({ onMenuClick, title }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { orderFilters, setOrderFilters, activeView } = useOrderStore();
  const searchValue = orderFilters.search || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-[60px] md:h-[70px] bg-white border-b-2 border-[#f7f7f7] flex items-center justify-between px-[16px] md:px-[24px] flex-shrink-0">
      {/* Left side - Menu button (mobile), Title, and Search Bar */}
      <div className="flex items-center gap-[12px] md:gap-[16px]">
        {/* Menu button for toggling sidebar */}
        <button
          onClick={onMenuClick}
          className="p-[8px] hover:bg-[#f7f7f7] rounded-[6px] transition-colors lg:hidden"
        >
          <MenuIcon />
        </button>

        {/* Page Title */}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 hidden md:block">
            {title}
          </h1>
        )}

        {/* Search Bar - only show on pipeline view */}
        {activeView === 'pipeline' && (
          <div className="flex items-center gap-[6px] bg-[#f7f7f7] rounded-[6px] px-[8px] py-[6px] w-[140px] sm:w-[220px]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchValue}
              onChange={(e) => setOrderFilters({ search: e.target.value })}
              className="bg-transparent text-[12px] text-gray-900 leading-[20px] tracking-[-0.1px] outline-none w-full placeholder-[#959ba3]"
            />
            {searchValue && (
              <button
                onClick={() => setOrderFilters({ search: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right side - User Profile */}
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-[8px] p-2 hover:bg-[#f7f7f7] rounded-lg transition-colors"
        >
          <UserAvatar />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px]">
              My Shop
            </span>
            <span className="text-[10px] text-[#959ba3] leading-[14px] tracking-[-0.1px]">
              Owner
            </span>
          </div>
          <ChevronIcon />
        </button>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Shop Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f56400]/10 flex items-center justify-center text-[#f56400]">
                  <StoreIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">My Etsy Shop</p>
                  <p className="text-xs text-gray-500">Connected to Etsy</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsProfileOpen(false);
                  // Settings action - for future implementation
                }}
              >
                <span className="text-gray-400"><SettingsIcon /></span>
                Settings
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsProfileOpen(false);
                  // Help action
                }}
              >
                <span className="text-gray-400"><HelpIcon /></span>
                Help & Support
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => {
                  setIsProfileOpen(false);
                  // Logout action - for future implementation
                }}
              >
                <LogoutIcon />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
