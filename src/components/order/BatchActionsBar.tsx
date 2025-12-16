import { useState } from 'react';
import type { PipelineStage } from '../../types';
import { DEFAULT_PIPELINE_STAGES } from '../../types';

interface BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onMoveToStage: (stage: PipelineStage) => void;
  onAddTag: (tag: string) => void;
  onBulkPrint: () => void;
  onBulkCreateLabels: () => void;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.7071 7.29289L8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2H3C2.44772 2 2 2.44772 2 3V8C2 8.26522 2.10536 8.51957 2.29289 8.70711L7.29289 13.7071C7.68342 14.0976 8.31658 14.0976 8.70711 13.7071L13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="5" cy="5" r="1" fill="currentColor"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6V2H12V6M4 12H3C2.44772 12 2 11.5523 2 11V7C2 6.44772 2.44772 6 3 6H13C13.5523 6 14 6.44772 14 7V11C14 11.5523 13.5523 12 13 12H12M4 9H12V14H4V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShippingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10.667 2H12.222C12.599 2 12.935 2.229 13.078 2.580L14.333 5.833M10.667 2V9.167M10.667 2H1.333V10.667C1.333 11.219 1.781 11.667 2.333 11.667H3.333M10.667 9.167H14.667V6.667M10.667 9.167V11.667M14.667 6.667H12M14.667 6.667V5.833M12 5.833H10.667V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.333" cy="12.667" r="1.333" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12.333" cy="12.667" r="1.333" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BatchActionsBar({
  selectedCount,
  onClearSelection,
  onMoveToStage,
  onAddTag,
  onBulkPrint,
  onBulkCreateLabels
}: BatchActionsBarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newTag, setNewTag] = useState('');

  const commonTags = ['Priority', 'Rush', 'Fragile', 'Custom', 'Hold', 'Review'];

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-3 shadow-2xl">
        {/* Selected count */}
        <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
          <span className="font-medium">{selectedCount} selected</span>
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Clear selection"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Move to stage */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMoveMenu(!showMoveMenu);
              setShowTagMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoveIcon />
            <span className="text-sm">Move to</span>
            <ChevronIcon />
          </button>

          {showMoveMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]">
              {DEFAULT_PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    onMoveToStage(stage.id as PipelineStage);
                    setShowMoveMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>{stage.emoji}</span>
                  <span>{stage.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add tag */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTagMenu(!showTagMenu);
              setShowMoveMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <TagIcon />
            <span className="text-sm">Add tag</span>
            <ChevronIcon />
          </button>

          {showTagMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    onAddTag(newTag.trim());
                    setNewTag('');
                    setShowTagMenu(false);
                  }
                }}
                placeholder="Type tag name..."
                className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-200 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                autoFocus
              />
              <div className="flex flex-wrap gap-1">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onAddTag(tag);
                      setShowTagMenu(false);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Print packing slips */}
        <button
          onClick={onBulkPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          title="Print packing slips"
        >
          <PrintIcon />
          <span className="text-sm">Print</span>
        </button>

        {/* Create labels */}
        <button
          onClick={onBulkCreateLabels}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6e6af0] hover:bg-[#5b57d1] rounded-lg transition-colors"
        >
          <ShippingIcon />
          <span className="text-sm font-medium">Create Labels</span>
        </button>
      </div>
    </div>
  );
}
