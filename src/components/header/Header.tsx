interface HeaderProps {
  onMenuClick: () => void;
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

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="#959BA3" strokeWidth="1.5"/>
    <path d="M2 6L10 11L18 6" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C7.5 2 5.5 4 5.5 6.5V10L4 12V13H16V12L14.5 10V6.5C14.5 4 12.5 2 10 2Z" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 16C8.5 17.1 9.4 18 10.5 18C11.6 18 12.5 17.1 12.5 16" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Avatar placeholder - yellow background with cartoon character
const UserAvatar = () => (
  <div className="w-[32px] h-[32px] rounded-[26px] bg-[#fff2ab] overflow-hidden flex items-center justify-center flex-shrink-0">
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
      <circle cx="13.5" cy="10" r="6" fill="#f0c674"/>
      <ellipse cx="13.5" cy="25" rx="10" ry="8" fill="#f0c674"/>
      <circle cx="10" cy="9" r="1.5" fill="#333"/>
      <circle cx="17" cy="9" r="1.5" fill="#333"/>
      <path d="M11 13C11 13 12.5 15 13.5 15C14.5 15 16 13 16 13" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <div className="h-[60px] md:h-[70px] bg-white border-b-2 border-[#f7f7f7] flex items-center justify-between px-[16px] md:px-[24px] flex-shrink-0">
      {/* Left side - Menu button (mobile) and Search Bar */}
      <div className="flex items-center gap-[12px]">
        {/* Menu button for toggling sidebar */}
        <button
          onClick={onMenuClick}
          className="p-[8px] hover:bg-[#f7f7f7] rounded-[6px] transition-colors lg:hidden"
        >
          <MenuIcon />
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-[6px] bg-[#f7f7f7] rounded-[6px] px-[8px] py-[6px] w-[140px] sm:w-[182px]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-[10px] text-[#959ba3] leading-[20px] tracking-[-0.1px] outline-none w-full placeholder-[#959ba3]"
          />
        </div>
      </div>

      {/* Right side - Icons and User */}
      <div className="flex items-center gap-[12px] md:gap-[16px]">
        {/* Email and Bell icons */}
        <div className="hidden sm:flex items-center gap-[12px]">
          <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors">
            <EmailIcon />
          </button>
          <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors">
            <BellIcon />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-[8px]">
          <UserAvatar />
          <div className="hidden sm:flex flex-col">
            <span className="text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px]">
              Alexandra C.
            </span>
            <span className="text-[10px] text-[#959ba3] leading-[14px] tracking-[-0.1px]">
              Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
