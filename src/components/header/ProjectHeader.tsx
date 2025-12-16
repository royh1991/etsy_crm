const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C12.5 3 14.7 4.3 16 6.3" stroke="#404656" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 3V7H13" stroke="#404656" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 7L10 2L15 7" stroke="#404656" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 13L10 18L15 13" stroke="#404656" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 2V18" stroke="#404656" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 5H17M5 10H15M7 15H13" stroke="#404656" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Team member avatars
const avatarColors = ['#fff2ab', '#b6edff', '#ffb6b6', '#cdffb6', '#b2bffa'];

interface AvatarProps {
  color: string;
  zIndex: number;
  isCount?: boolean;
  count?: number;
}

function Avatar({ color, zIndex, isCount, count }: AvatarProps) {
  if (isCount) {
    return (
      <div
        className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border-2 border-white flex items-center justify-center -ml-[12px] md:-ml-[16px]"
        style={{ backgroundColor: color, zIndex }}
      >
        <span className="text-[10px] md:text-[12px] font-medium text-white leading-[20px] tracking-[-0.12px]">
          +{count}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border-2 border-white overflow-hidden first:ml-0 -ml-[12px] md:-ml-[16px]"
      style={{ backgroundColor: color, zIndex }}
    >
      {/* Placeholder for avatar image */}
      <div className="w-full h-full flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="4" fill={color === '#fff2ab' ? '#e0b340' : '#666'}/>
          <ellipse cx="10" cy="18" rx="7" ry="5" fill={color === '#fff2ab' ? '#e0b340' : '#666'}/>
        </svg>
      </div>
    </div>
  );
}

export default function ProjectHeader() {
  return (
    <div className="bg-white border-b-2 border-[#f7f7f7] px-[16px] md:px-[27px] py-[16px] md:py-[22px] flex-shrink-0">
      {/* Top Row - Project info and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[12px] md:gap-0">
        {/* Left side - Project icon, progress, completion */}
        <div className="flex items-center gap-[12px] md:gap-[23px]">
          <div className="flex items-center gap-[10px] flex-1 min-w-0">
            {/* Project Icon */}
            <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-[26px] bg-[#dbeeff] flex items-center justify-center flex-shrink-0">
              <span className="text-[20px] md:text-[26px]">🏙</span>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-[255px] h-[6px] bg-[#eee] rounded-[6px] overflow-hidden">
              <div className="h-full w-[57%] bg-[#6e6af0] rounded-[6px] transition-all duration-500" />
            </div>
          </div>

          {/* Completion percentage */}
          <span className="text-[11px] md:text-[12px] font-medium text-[#959ba3] leading-[20px] tracking-[-0.12px] whitespace-nowrap">
            68% complete
          </span>
        </div>

        {/* Right side - Team avatars and Add board button */}
        <div className="flex items-center gap-[12px] md:gap-[20px]">
          {/* Team Avatars */}
          <div className="flex items-center">
            {avatarColors.slice(0, 4).map((color, i) => (
              <Avatar key={i} color={color} zIndex={5 - i} />
            ))}
            <Avatar color="#b2bffa" zIndex={0} isCount count={1} />
          </div>

          {/* Add board button */}
          <button className="flex items-center gap-[6px] bg-[#6e6af0] rounded-[6px] px-[12px] md:px-[14px] py-[6px] hover:bg-[#5a56d6] transition-colors flex-shrink-0">
            <PlusIcon />
            <span className="text-[11px] md:text-[12px] font-medium text-white leading-[20px] tracking-[-0.12px]">
              Add board
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Row - Tabs and action icons */}
      <div className="flex items-center justify-between mt-[12px] md:mt-[15px]">
        {/* Tabs */}
        <div className="flex items-center gap-[20px] md:gap-[37px] overflow-x-auto">
          <span className="text-[11px] md:text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px] cursor-pointer hover:text-[#6e6af0] transition-colors whitespace-nowrap">
            Description
          </span>
          <span className="text-[11px] md:text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px] cursor-pointer border-b-2 border-[#6e6af0] py-[8px] whitespace-nowrap">
            Board
          </span>
          <span className="text-[11px] md:text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px] cursor-pointer hover:text-[#6e6af0] transition-colors whitespace-nowrap">
            Notes
          </span>
          <span className="text-[11px] md:text-[12px] font-medium text-black leading-[20px] tracking-[-0.12px] cursor-pointer hover:text-[#6e6af0] transition-colors whitespace-nowrap">
            Test
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-[8px] md:gap-[12px] flex-shrink-0">
          <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors">
            <RefreshIcon />
          </button>
          <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors hidden sm:block">
            <MoveIcon />
          </button>
          <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors">
            <FilterIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
