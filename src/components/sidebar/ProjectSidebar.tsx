interface ProjectSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface Project {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  active?: boolean;
}

const projects: Project[] = [
  { id: '1', name: 'Building enterprise', emoji: '🏙', bgColor: '#6e6af0', active: true },
  { id: '2', name: 'Web platform', emoji: '🌐', bgColor: '#edf6fa' },
  { id: '3', name: 'Mac website', emoji: '🍔', bgColor: '#fce1c6' },
  { id: '4', name: 'Cosmetic web app', emoji: '💅', bgColor: '#f4d7f1' },
];

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

function ProjectItem({ project }: { project: Project }) {
  const isActive = project.active;

  return (
    <div
      className={`flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] overflow-hidden w-full cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-[#6e6af0]'
          : 'bg-white border border-[#f7f7f7] hover:bg-[#f7f7f7] hover:border-[#e5e7eb]'
        }`}
    >
      <div
        className="w-[24px] h-[24px] rounded-[26px] flex items-center justify-center text-[12px] flex-shrink-0"
        style={{ backgroundColor: isActive ? 'white' : project.bgColor }}
      >
        {project.emoji}
      </div>
      <span
        className={`text-[12px] font-medium leading-[20px] tracking-[-0.12px] truncate
          ${isActive ? 'text-white' : 'text-[#404656]'}`}
      >
        {project.name}
      </span>
    </div>
  );
}

function TotalTimeCard() {
  return (
    <div className="bg-white border border-[#f7f7f7] rounded-[6px] p-[12px] overflow-hidden">
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-[#959ba3] leading-[20px] tracking-[-0.1px]">TOTAL TIME</span>
        <div className="flex gap-[14px] text-[24px] font-semibold text-black leading-[24px] tracking-[-0.24px]">
          <span>2d</span>
          <span>3h</span>
        </div>
      </div>
      <div className="mt-[16px] flex items-end gap-[12px]">
        {/* Simple activity chart */}
        <svg width="88" height="38" viewBox="0 0 88 38" fill="none" className="mt-[8px] flex-shrink-0">
          <path d="M2 35L15 28L28 32L42 20L55 25L68 15L86 8" stroke="#6e6af0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-[8px] text-[#959ba3] leading-[14px] tracking-[-0.08px]">
          Activity increased by 30%
        </span>
      </div>
    </div>
  );
}

function CommitsChart() {
  const bars = [
    { height: 103, color: '#6e6af0' },
    { height: 76, color: '#6e6af0' },
    { height: 76, color: '#6e6af0' },
    { height: 33, color: '#ef887f' },
    { height: 33, color: '#6e6af0' },
    { height: 103, color: '#6e6af0' },
    { height: 87, color: '#6e6af0' },
  ];

  return (
    <div className="bg-white border border-[#f7f7f7] rounded-[6px] p-[12px] overflow-hidden">
      <span className="block text-center text-[10px] text-[#959ba3] leading-[20px] tracking-[-0.1px] mb-[8px]">
        COMMITS
      </span>
      <div className="relative h-[103px]">
        {/* Grid lines */}
        {[0, 30, 60, 80].map((y, i) => (
          <div
            key={i}
            className="absolute w-full h-[1px] bg-[#f7f7f7]"
            style={{ top: `${y}%` }}
          />
        ))}
        {/* Bars */}
        <div className="absolute bottom-0 flex items-end gap-[3px] left-[4px]">
          {bars.map((bar, i) => (
            <div
              key={i}
              className="w-[9px] rounded-t-[12px] transition-all duration-300 hover:opacity-80"
              style={{
                height: `${bar.height}px`,
                backgroundColor: bar.color,
                maxHeight: '103px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeChart() {
  return (
    <div className="bg-white border border-[#f7f7f7] rounded-[6px] p-[12px] overflow-hidden">
      <span className="block text-center text-[10px] text-[#959ba3] leading-[20px] tracking-[-0.1px] mb-[8px]">
        TIME
      </span>
      <div className="relative w-full max-w-[145px] mx-auto aspect-square">
        {/* Circular progress */}
        <svg viewBox="0 0 145 145" className="w-full h-full">
          {/* Background circle */}
          <circle cx="72.5" cy="72.5" r="60" fill="none" stroke="#eee" strokeWidth="12"/>
          {/* Purple segment */}
          <circle
            cx="72.5"
            cy="72.5"
            r="60"
            fill="none"
            stroke="#6e6af0"
            strokeWidth="12"
            strokeDasharray="377"
            strokeDashoffset="120"
            strokeLinecap="round"
            transform="rotate(-90 72.5 72.5)"
          />
          {/* Yellow segment */}
          <circle
            cx="72.5"
            cy="72.5"
            r="60"
            fill="none"
            stroke="#ffc107"
            strokeWidth="12"
            strokeDasharray="377"
            strokeDashoffset="300"
            strokeLinecap="round"
            transform="rotate(150 72.5 72.5)"
          />
          {/* Teal segment */}
          <circle
            cx="72.5"
            cy="72.5"
            r="60"
            fill="none"
            stroke="#4ecdc4"
            strokeWidth="12"
            strokeDasharray="377"
            strokeDashoffset="330"
            strokeLinecap="round"
            transform="rotate(50 72.5 72.5)"
          />
        </svg>
        {/* Percentage in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[24px] font-semibold text-black tracking-[-0.24px]">68%</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectSidebar({ collapsed, onToggle }: ProjectSidebarProps) {
  return (
    <div
      className={`
        h-full bg-white border-r-2 border-[#f7f7f7] flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out flex-shrink-0 relative
        ${collapsed ? 'w-0' : 'w-[205px]'}
      `}
    >
      <div className={`flex flex-col h-full overflow-y-auto overflow-x-hidden ${collapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {/* Projects Header */}
        <div className="px-[11px] pt-[17px] pb-[12px] flex-shrink-0">
          <h1 className="text-[18px] font-semibold text-black leading-[24px] tracking-[-0.18px] whitespace-nowrap">
            Projects
          </h1>
        </div>

        {/* Project List */}
        <div className="px-[11px] flex flex-col gap-[8px] flex-shrink-0">
          {projects.map(project => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="px-[11px] mt-[32px] flex-shrink-0">
          <h2 className="text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] mb-[12px] whitespace-nowrap">
            Analytics
          </h2>

          <div className="flex flex-col gap-[11px]">
            <TotalTimeCard />
            <CommitsChart />
            <TimeChart />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[20px]" />
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center shadow-sm hover:bg-[#f7f7f7] transition-colors z-10"
      >
        <ChevronIcon direction={collapsed ? 'right' : 'left'} />
      </button>
    </div>
  );
}
