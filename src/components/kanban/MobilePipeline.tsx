import { useState, useRef, useEffect } from 'react';
import OrderCard from '../order/OrderCard';
import type { PipelineStage } from '../../types';
import { DEFAULT_PIPELINE_STAGES } from '../../types';
import { useOrderStore } from '../../stores/orderStore';
import { EmptyStageEmptyState } from '../common/EmptyState';

interface MobilePipelineProps {
  onViewDetails: (orderId: string) => void;
  onCreateLabel: (orderId: string) => void;
}

export default function MobilePipeline({ onViewDetails, onCreateLabel }: MobilePipelineProps) {
  const { orders, customers } = useOrderStore();
  const [activeStage, setActiveStage] = useState<PipelineStage>('new');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get orders for current stage
  const stageOrders = orders.filter(o => o.pipelineStage === activeStage);

  // Get stage config
  const currentStageConfig = DEFAULT_PIPELINE_STAGES.find(s => s.id === activeStage);

  // Count orders per stage
  const stageCounts = DEFAULT_PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = orders.filter(o => o.pipelineStage === stage.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Scroll active tab into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeTab = scrollRef.current.querySelector(`[data-stage="${activeStage}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStage]);

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const currentIndex = DEFAULT_PIPELINE_STAGES.findIndex(s => s.id === activeStage);

      if (diff > 0 && currentIndex < DEFAULT_PIPELINE_STAGES.length - 1) {
        // Swipe left - go to next stage
        setActiveStage(DEFAULT_PIPELINE_STAGES[currentIndex + 1].id as PipelineStage);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous stage
        setActiveStage(DEFAULT_PIPELINE_STAGES[currentIndex - 1].id as PipelineStage);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="flex flex-col h-full bg-[#f7f7f7]">
      {/* Stage Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-2 px-3 gap-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DEFAULT_PIPELINE_STAGES.map(stage => {
            const isActive = stage.id === activeStage;
            const count = stageCounts[stage.id] || 0;

            return (
              <button
                key={stage.id}
                data-stage={stage.id}
                onClick={() => setActiveStage(stage.id as PipelineStage)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#6e6af0] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm">{stage.emoji}</span>
                <span className="text-sm font-medium">{stage.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div
        className="flex-1 overflow-y-auto p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {stageOrders.length === 0 ? (
          <EmptyStageEmptyState stageName={currentStageConfig?.name || 'this stage'} />
        ) : (
          <div className="flex flex-col gap-3">
            {stageOrders.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  customer={customer}
                  onViewDetails={() => onViewDetails(order.id)}
                  onCreateLabel={() => onCreateLabel(order.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Swipe Indicator */}
      <div className="flex justify-center items-center gap-1.5 py-3 bg-white border-t border-gray-200">
        {DEFAULT_PIPELINE_STAGES.map(stage => (
          <div
            key={stage.id}
            className={`w-2 h-2 rounded-full transition-all ${
              stage.id === activeStage
                ? 'bg-[#6e6af0] w-4'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
