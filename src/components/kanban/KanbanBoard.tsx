import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OrderCard from '../order/OrderCard';
import OrderDetailDrawer from '../order/OrderDetailDrawer';
import ShippingModal from '../shipping/ShippingModal';
import BatchActionsBar from '../order/BatchActionsBar';
import { BatchPackingSlips } from '../order/PackingSlip';
import AddOrderModal from '../order/AddOrderModal';
import FilterBar from '../order/FilterBar';
import MobilePipeline from './MobilePipeline';
import type { Order, PipelineStage, PipelineStageConfig } from '../../types';
import { DEFAULT_PIPELINE_STAGES } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Empty state for columns
function EmptyColumnState({ stageName, stageEmoji }: { stageName: string; stageEmoji: string }) {
  const messages: Record<string, string> = {
    'New Orders': 'New orders from Etsy will appear here',
    'Processing': 'Move orders here when you start working on them',
    'Ready to Ship': 'Orders ready for shipping labels',
    'Shipped': 'Orders with tracking numbers',
    'Delivered': 'Successfully delivered orders',
    'Needs Attention': 'Orders requiring your attention'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
      <span className="text-2xl mb-2">{stageEmoji}</span>
      <p className="text-xs text-gray-500">{messages[stageName] || `No orders in ${stageName}`}</p>
    </div>
  );
}

// Sortable Order Card
function SortableOrderCard({
  order,
  onViewDetails,
  onCreateLabel,
  isSelected,
  onSelect,
  showCheckbox
}: {
  order: Order;
  onViewDetails: () => void;
  onCreateLabel: () => void;
  isSelected?: boolean;
  onSelect?: (orderId: string, selected: boolean) => void;
  showCheckbox?: boolean;
}) {
  const { customers } = useOrderStore();
  const customer = customers.find(c => c.id === order.customerId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard
        order={order}
        customer={customer}
        onViewDetails={onViewDetails}
        onCreateLabel={onCreateLabel}
        isDragging={isDragging}
        isSelected={isSelected}
        onSelect={onSelect}
        showCheckbox={showCheckbox}
      />
    </div>
  );
}

// Pipeline Column
function PipelineColumn({
  stage,
  orders,
  onViewDetails,
  onCreateLabel,
  selectedOrderIds,
  onToggleSelection,
  showCheckboxes,
  onAddOrder
}: {
  stage: PipelineStageConfig;
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  onCreateLabel: (orderId: string) => void;
  selectedOrderIds: string[];
  onToggleSelection: (orderId: string) => void;
  showCheckboxes: boolean;
  onAddOrder?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-[12px] flex-1 min-w-[260px] max-w-[340px]"
    >
      {/* Column Header - Simplified */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between py-2 px-1 sticky top-0 bg-[#f7f7f7] z-10 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{stage.emoji}</span>
          <span className="text-sm font-semibold text-gray-800">{stage.name}</span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: stage.color + '20', color: stage.color }}
          >
            {orders.length}
          </span>
        </div>
      </div>

      {/* Orders Container */}
      <SortableContext
        items={orders.map(o => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-2 min-h-[80px]">
          {orders.length === 0 ? (
            <EmptyColumnState stageName={stage.name} stageEmoji={stage.emoji} />
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onViewDetails={() => onViewDetails(order.id)}
                onCreateLabel={() => onCreateLabel(order.id)}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelect={() => onToggleSelection(order.id)}
                showCheckbox={showCheckboxes}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add Order Button - only for New Orders column */}
      {stage.id === 'new' && onAddOrder && (
        <button
          onClick={onAddOrder}
          className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 rounded-lg py-2 hover:border-[#6e6af0] hover:bg-[#6e6af0]/5 transition-all w-full"
        >
          <PlusIcon />
          <span className="text-xs font-medium text-gray-500">Add Order</span>
        </button>
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const {
    orders,
    customers,
    isOrderDrawerOpen,
    isShippingModalOpen,
    selectedOrderId,
    selectedOrderIds,
    moveOrder,
    reorderOrders,
    openOrderDrawer,
    closeOrderDrawer,
    openShippingModal,
    closeShippingModal,
    toggleOrderSelection,
    clearOrderSelection,
    batchMoveOrders,
    batchAddTag,
    addOrder,
    getFilteredOrders
  } = useOrderStore();

  const [columns, setColumns] = useState<PipelineStageConfig[]>(DEFAULT_PIPELINE_STAGES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'order' | 'column' | null>(null);
  const [showPackingSlips, setShowPackingSlips] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);

  // Get filtered orders
  const filteredOrders = getFilteredOrders();

  // Helper to get filtered orders by stage
  const getFilteredOrdersByStage = (stage: PipelineStage) => {
    return filteredOrders.filter(o => o.pipelineStage === stage);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getOrdersByStage = (stageId: PipelineStage): Order[] => {
    return orders.filter(o => o.pipelineStage === stageId);
  };

  const findOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = active.id as string;

    // Check if it's a column or an order
    const isColumn = columns.some(col => col.id === activeIdStr);
    setActiveId(activeIdStr);
    setActiveType(isColumn ? 'column' : 'order');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Only handle order movement
    if (activeType !== 'order') return;

    const activeOrder = findOrderById(activeIdStr);
    if (!activeOrder) return;

    // Check if dropping over a column
    const overColumn = columns.find(col => col.id === overIdStr);
    if (overColumn && activeOrder.pipelineStage !== overColumn.id) {
      moveOrder(activeIdStr, overColumn.id as PipelineStage);
      return;
    }

    // Check if dropping over another order
    const overOrder = findOrderById(overIdStr);
    if (overOrder && activeOrder.pipelineStage !== overOrder.pipelineStage) {
      moveOrder(activeIdStr, overOrder.pipelineStage);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeIdStr === overIdStr) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    if (activeType === 'column') {
      // Check if over is a column directly
      let overColumnId = overIdStr;

      // If over is not a column, it might be an order - find which column it belongs to
      const isOverAColumn = columns.some(col => col.id === overIdStr);
      if (!isOverAColumn) {
        const overOrder = findOrderById(overIdStr);
        if (overOrder) {
          overColumnId = overOrder.pipelineStage;
        }
      }

      const oldIndex = columns.findIndex(col => col.id === activeIdStr);
      const newIndex = columns.findIndex(col => col.id === overColumnId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setColumns(cols => arrayMove(cols, oldIndex, newIndex));
      }
    } else if (activeType === 'order') {
      // Handle order reordering within the same column
      const activeOrder = findOrderById(activeIdStr);
      const overOrder = findOrderById(overIdStr);

      if (activeOrder && overOrder && activeOrder.pipelineStage === overOrder.pipelineStage) {
        // Reorder orders within the same column
        const stageOrders = getOrdersByStage(activeOrder.pipelineStage);
        const oldIndex = stageOrders.findIndex(o => o.id === activeIdStr);
        const newIndex = stageOrders.findIndex(o => o.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Reorder in the store
          reorderOrders(activeOrder.pipelineStage, oldIndex, newIndex);
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  const handleViewDetails = (orderId: string) => {
    openOrderDrawer(orderId);
  };

  const handleCreateLabel = (orderId: string) => {
    openShippingModal(orderId);
  };

  const activeOrder = activeId && activeType === 'order' ? findOrderById(activeId) : null;
  const activeColumn = activeId && activeType === 'column' ? columns.find(c => c.id === activeId) : null;

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;
  const selectedCustomer = selectedOrder ? customers.find(c => c.id === selectedOrder.customerId) : undefined;

  const isMobile = useIsMobile();

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex-1 bg-[#f7f7f7] overflow-hidden flex flex-col min-h-0">
        <MobilePipeline
          onViewDetails={handleViewDetails}
          onCreateLabel={handleCreateLabel}
        />

        {/* Order Detail Drawer */}
        {selectedOrder && (
          <OrderDetailDrawer
            order={selectedOrder}
            customer={selectedCustomer}
            isOpen={isOrderDrawerOpen}
            onClose={closeOrderDrawer}
            onCreateLabel={() => {
              closeOrderDrawer();
              openShippingModal(selectedOrder.id);
            }}
          />
        )}

        {/* Shipping Modal */}
        {selectedOrder && (
          <ShippingModal
            order={selectedOrder}
            isOpen={isShippingModalOpen}
            onClose={closeShippingModal}
          />
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex-1 bg-[#f7f7f7] overflow-hidden flex flex-col min-h-0">
      {/* Filter Bar */}
      <FilterBar />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-auto p-[12px] md:p-[18px]">
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-[16px] md:gap-[24px] h-full">
              {columns.map(column => (
                <PipelineColumn
                  key={column.id}
                  stage={column}
                  orders={getFilteredOrdersByStage(column.id as PipelineStage)}
                  onViewDetails={handleViewDetails}
                  onCreateLabel={handleCreateLabel}
                  selectedOrderIds={selectedOrderIds}
                  onToggleSelection={toggleOrderSelection}
                  showCheckboxes={selectedOrderIds.length > 0}
                  onAddOrder={column.id === 'new' ? () => setShowAddOrderModal(true) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeOrder && (
            <div className="rotate-3 shadow-xl">
              <OrderCard
                order={activeOrder}
                customer={customers.find(c => c.id === activeOrder.customerId)}
                onViewDetails={() => {}}
                onCreateLabel={() => {}}
                isDragging
              />
            </div>
          )}
          {activeColumn && (
            <div className="opacity-80 bg-[#f7f7f7] p-4 rounded-lg shadow-lg min-w-[280px]">
              <div className="flex items-center gap-2">
                <span>{activeColumn.emoji}</span>
                <span className="font-medium">{activeColumn.name}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          customer={selectedCustomer}
          isOpen={isOrderDrawerOpen}
          onClose={closeOrderDrawer}
          onCreateLabel={() => {
            closeOrderDrawer();
            openShippingModal(selectedOrder.id);
          }}
        />
      )}

      {/* Shipping Modal */}
      {selectedOrder && (
        <ShippingModal
          order={selectedOrder}
          isOpen={isShippingModalOpen}
          onClose={closeShippingModal}
        />
      )}

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedOrderIds.length}
        onClearSelection={clearOrderSelection}
        onMoveToStage={batchMoveOrders}
        onAddTag={batchAddTag}
        onBulkPrint={() => setShowPackingSlips(true)}
        onBulkCreateLabels={() => {
          // Open shipping modal for first selected order
          if (selectedOrderIds.length > 0) {
            openShippingModal(selectedOrderIds[0]);
          }
        }}
      />

      {/* Batch Packing Slips Modal */}
      {showPackingSlips && selectedOrderIds.length > 0 && (
        <BatchPackingSlips
          orders={orders.filter(o => selectedOrderIds.includes(o.id))}
          customers={customers}
          onClose={() => setShowPackingSlips(false)}
        />
      )}

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
        onAdd={(order) => {
          addOrder(order);
          setShowAddOrderModal(false);
        }}
      />
    </div>
  );
}
