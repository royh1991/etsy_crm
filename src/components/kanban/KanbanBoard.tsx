import { useState, useRef, useEffect } from 'react';
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


const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-40">
    <circle cx="5" cy="4" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="4" r="1.5" fill="#959BA3"/>
    <circle cx="5" cy="8" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="8" r="1.5" fill="#959BA3"/>
    <circle cx="5" cy="12" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="12" r="1.5" fill="#959BA3"/>
  </svg>
);

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

// Editable Column Title
function EditableColumnTitle({
  title,
  onTitleChange
}: {
  title: string;
  onTitleChange: (newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== title) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="text-[13px] md:text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] bg-white border border-[#6e6af0] rounded px-2 py-0.5 outline-none w-full max-w-[120px]"
      />
    );
  }

  return (
    <span
      className="text-[13px] md:text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] cursor-text hover:text-[#6e6af0] transition-colors"
      onDoubleClick={handleDoubleClick}
      title="Double-click to rename"
    >
      {title}
    </span>
  );
}

// Pipeline Column
function PipelineColumn({
  stage,
  orders,
  onTitleChange,
  onViewDetails,
  onCreateLabel,
  selectedOrderIds,
  onToggleSelection,
  showCheckboxes
}: {
  stage: PipelineStageConfig;
  orders: Order[];
  onTitleChange: (newTitle: string) => void;
  onViewDetails: (orderId: string) => void;
  onCreateLabel: (orderId: string) => void;
  selectedOrderIds: string[];
  onToggleSelection: (orderId: string) => void;
  showCheckboxes: boolean;
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
      className="flex flex-col gap-[16px] flex-1 min-w-[280px] max-w-[380px]"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between py-[10px] sticky top-0 bg-[#f7f7f7] z-10">
        <div className="flex items-center gap-[10px] md:gap-[14px]">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white rounded transition-colors"
          >
            <DragHandleIcon />
          </div>
          <div className="flex items-center gap-[6px] md:gap-[8px]">
            <span className="text-[14px]">{stage.emoji}</span>
            <EditableColumnTitle
              title={stage.name}
              onTitleChange={onTitleChange}
            />
          </div>
          <div
            className="rounded-[10px] px-[10px] md:px-[13px] flex items-center justify-center shadow-sm"
            style={{ backgroundColor: stage.color + '20' }}
          >
            <span
              className="text-[10px] font-medium leading-[20px] tracking-[-0.1px]"
              style={{ color: stage.color }}
            >
              {orders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <SortableContext
        items={orders.map(o => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-[10px] flex-1 overflow-y-auto pb-[8px] min-h-[100px]">
          {orders.map((order) => (
            <SortableOrderCard
              key={order.id}
              order={order}
              onViewDetails={() => onViewDetails(order.id)}
              onCreateLabel={() => onCreateLabel(order.id)}
              isSelected={selectedOrderIds.includes(order.id)}
              onSelect={() => onToggleSelection(order.id)}
              showCheckbox={showCheckboxes}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Order Button (optional - for future) */}
      {stage.id === 'new' && (
        <button className="flex items-center justify-center gap-[6px] bg-white border border-[#959ba3] rounded-[6px] px-[14px] py-[6px] hover:bg-[#f7f7f7] hover:border-[#6e6af0] transition-all duration-200 w-full flex-shrink-0">
          <PlusIcon />
          <span className="text-[12px] font-medium text-[#959ba3] leading-[20px] tracking-[-0.12px]">
            Sync Orders
          </span>
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
    batchAddTag
  } = useOrderStore();

  const [columns, setColumns] = useState<PipelineStageConfig[]>(DEFAULT_PIPELINE_STAGES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'order' | 'column' | null>(null);

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

  const handleTitleChange = (columnId: string, newTitle: string) => {
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, name: newTitle } : col
    ));
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
                  orders={getOrdersByStage(column.id as PipelineStage)}
                  onTitleChange={(newTitle) => handleTitleChange(column.id, newTitle)}
                  onViewDetails={handleViewDetails}
                  onCreateLabel={handleCreateLabel}
                  selectedOrderIds={selectedOrderIds}
                  onToggleSelection={toggleOrderSelection}
                  showCheckboxes={selectedOrderIds.length > 0}
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
        onBulkPrint={() => {
          // TODO: Implement bulk print
          console.log('Printing packing slips for:', selectedOrderIds);
        }}
        onBulkCreateLabels={() => {
          // TODO: Implement bulk label creation
          console.log('Creating labels for:', selectedOrderIds);
        }}
      />
    </div>
  );
}
