import { useState, useRef, useEffect } from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { DEFAULT_PIPELINE_STAGES } from '../../types';
import type { PipelineStage } from '../../types';

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FilterBar() {
  const { orderFilters, setOrderFilters, orders } = useOrderStore();
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Get all unique tags from orders
  const allTags = [...new Set(orders.flatMap(o => o.tags))].sort();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) {
        setShowStageDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count active filters
  const activeFilterCount = [
    orderFilters.shipByDate,
    orderFilters.stages?.length,
    orderFilters.tags?.length,
    orderFilters.hasIssue,
  ].filter(Boolean).length;

  const handleShipByFilter = (value: 'overdue' | 'today' | 'tomorrow' | 'this_week' | undefined) => {
    setOrderFilters({ shipByDate: orderFilters.shipByDate === value ? undefined : value });
  };

  const handleStageToggle = (stage: PipelineStage) => {
    const currentStages = orderFilters.stages || [];
    const newStages = currentStages.includes(stage)
      ? currentStages.filter(s => s !== stage)
      : [...currentStages, stage];
    setOrderFilters({ stages: newStages.length > 0 ? newStages : undefined });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = orderFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setOrderFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleIssueFilter = () => {
    setOrderFilters({ hasIssue: orderFilters.hasIssue ? undefined : true });
  };

  const clearAllFilters = () => {
    setOrderFilters({
      shipByDate: undefined,
      stages: undefined,
      tags: undefined,
      hasIssue: undefined,
      search: undefined,
    });
  };

  return (
    <div className="relative z-20 flex items-center gap-2 px-[12px] md:px-[18px] py-2 bg-white border-b border-gray-100">
      {/* Filter Icon */}
      <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
        <FilterIcon />
        <span className="text-xs font-medium">Filters</span>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => handleShipByFilter('overdue')}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
            orderFilters.shipByDate === 'overdue'
              ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>
        <button
          onClick={() => handleShipByFilter('today')}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
            orderFilters.shipByDate === 'today'
              ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Due Today
        </button>
        <button
          onClick={() => handleShipByFilter('this_week')}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
            orderFilters.shipByDate === 'this_week'
              ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={handleIssueFilter}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
            orderFilters.hasIssue
              ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Has Issues
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Stage Dropdown */}
      <div className="relative flex-shrink-0" ref={stageRef}>
        <button
          onClick={() => setShowStageDropdown(!showStageDropdown)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
            orderFilters.stages?.length
              ? 'bg-[#6e6af0]/10 text-[#6e6af0] ring-1 ring-[#6e6af0]/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Stage {orderFilters.stages?.length ? `(${orderFilters.stages.length})` : ''}
          <ChevronDownIcon />
        </button>
        {showStageDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100]">
            {DEFAULT_PIPELINE_STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => handleStageToggle(stage.id as PipelineStage)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="w-4">
                  {orderFilters.stages?.includes(stage.id as PipelineStage) && <CheckIcon />}
                </span>
                <span>{stage.emoji}</span>
                <span>{stage.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag Dropdown */}
      {allTags.length > 0 && (
        <div className="relative flex-shrink-0" ref={tagRef}>
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
              orderFilters.tags?.length
                ? 'bg-[#6e6af0]/10 text-[#6e6af0] ring-1 ring-[#6e6af0]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tags {orderFilters.tags?.length ? `(${orderFilters.tags.length})` : ''}
            <ChevronDownIcon />
          </button>
          {showTagDropdown && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] max-h-60 overflow-y-auto">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-4">
                    {orderFilters.tags?.includes(tag) && <CheckIcon />}
                  </span>
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Filter Pills */}
      {orderFilters.stages?.map(stage => {
        const stageConfig = DEFAULT_PIPELINE_STAGES.find(s => s.id === stage);
        return (
          <span
            key={stage}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-[#6e6af0]/10 text-[#6e6af0] rounded-full flex-shrink-0"
          >
            {stageConfig?.emoji} {stageConfig?.name}
            <button onClick={() => handleStageToggle(stage)} className="hover:text-[#5b57d1]">
              <CloseIcon />
            </button>
          </span>
        );
      })}
      {orderFilters.tags?.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded-full flex-shrink-0"
        >
          {tag}
          <button onClick={() => handleTagToggle(tag)} className="hover:text-gray-900">
            <CloseIcon />
          </button>
        </span>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
        >
          <CloseIcon />
          Clear all
        </button>
      )}
    </div>
  );
}
