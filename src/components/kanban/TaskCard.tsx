const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.5" fill="#959BA3"/>
    <circle cx="8" cy="8" r="1.5" fill="#959BA3"/>
    <circle cx="8" cy="13" r="1.5" fill="#959BA3"/>
  </svg>
);

export interface TaskTag {
  label: string;
  type: 'must' | 'medium' | 'tiny' | 'huge';
}

export interface TaskCardProps {
  title: string;
  description: string;
  tags: TaskTag[];
  assignees: { color: string }[];
}

function TagBadge({ tag }: { tag: TaskTag }) {
  const styles: Record<TaskTag['type'], { bg: string; text: string }> = {
    must: { bg: '#fbe4e1', text: '#ef887f' },
    medium: { bg: '#eef1ff', text: '#6e6af0' },
    tiny: { bg: '#edfaf6', text: '#60bf9d' },
    huge: { bg: '#edfaf6', text: '#60bf9d' },
  };

  const style = styles[tag.type];

  return (
    <div
      className="px-[10px] md:px-[12px] py-[4px] rounded-[10px] transition-transform duration-200 hover:scale-105"
      style={{ backgroundColor: style.bg }}
    >
      <span
        className="text-[8px] font-medium leading-[14px] tracking-[-0.08px]"
        style={{ color: style.text }}
      >
        {tag.label}
      </span>
    </div>
  );
}

function AssigneeAvatar({ color, index }: { color: string; index: number }) {
  return (
    <div
      className="w-[20px] h-[20px] rounded-full border border-white overflow-hidden transition-transform duration-200 hover:scale-110 hover:z-10"
      style={{
        backgroundColor: color,
        marginLeft: index > 0 ? '-9px' : '0',
        zIndex: 10 - index
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="5" r="3" fill={color === '#ffb6b6' ? '#d88' : color === '#b6edff' ? '#6bc' : '#8a8'}/>
          <ellipse cx="7" cy="13" rx="5" ry="4" fill={color === '#ffb6b6' ? '#d88' : color === '#b6edff' ? '#6bc' : '#8a8'}/>
        </svg>
      </div>
    </div>
  );
}

export default function TaskCard({ title, description, tags, assignees }: TaskCardProps) {
  return (
    <div className="bg-white rounded-[6px] p-[12px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
      {/* Header - Assignees and title with menu */}
      <div className="flex items-center justify-between mb-[7px]">
        <div className="flex items-center gap-[6px] min-w-0">
          {/* Assignee avatars */}
          <div className="flex items-center flex-shrink-0">
            {assignees.map((assignee, i) => (
              <AssigneeAvatar key={i} color={assignee.color} index={i} />
            ))}
          </div>
          <span className="text-[13px] md:text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] truncate group-hover:text-[#6e6af0] transition-colors">
            {title}
          </span>
        </div>
        <button className="p-[4px] hover:bg-[#f7f7f7] rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
          <MenuIcon />
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] md:text-[12px] text-[#959ba3] leading-[18px] md:leading-[20px] tracking-[-0.12px] mb-[7px] line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-[6px] md:gap-[7px] flex-wrap">
        {tags.map((tag, i) => (
          <TagBadge key={i} tag={tag} />
        ))}
      </div>
    </div>
  );
}
