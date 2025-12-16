// Zustand store for Order and Customer management
import { create } from 'zustand';
import type { Order, Customer, PipelineStage, OrderFilters, CustomerFilters, OrderNote, CustomerFlag, CustomerFlagType } from '../types';
import { mockOrders, mockCustomers } from '../services/mockData';

interface OrderStore {
  // Order state
  orders: Order[];
  selectedOrderId: string | null;
  selectedOrderIds: string[];  // For batch selection
  orderFilters: OrderFilters;

  // Customer state
  customers: Customer[];
  selectedCustomerId: string | null;
  customerFilters: CustomerFilters;

  // UI state
  isOrderDrawerOpen: boolean;
  isShippingModalOpen: boolean;
  isCustomerDrawerOpen: boolean;
  isFlagModalOpen: boolean;
  activeView: 'pipeline' | 'customers' | 'analytics' | 'settings';

  // Order actions
  setOrders: (orders: Order[]) => void;
  moveOrder: (orderId: string, newStage: PipelineStage) => void;
  reorderOrders: (stageId: PipelineStage, sourceIndex: number, destIndex: number) => void;
  selectOrder: (orderId: string | null) => void;
  setOrderFilters: (filters: Partial<OrderFilters>) => void;
  addOrderNote: (orderId: string, note: string) => void;
  addOrderTag: (orderId: string, tag: string) => void;
  removeOrderTag: (orderId: string, tag: string) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, carrier: string) => void;
  // Batch selection actions
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: () => void;
  clearOrderSelection: () => void;
  batchMoveOrders: (stage: PipelineStage) => void;
  batchAddTag: (tag: string) => void;

  // Customer actions
  setCustomers: (customers: Customer[]) => void;
  selectCustomer: (customerId: string | null) => void;
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
  addCustomerFlag: (customerId: string, flagType: CustomerFlagType, reason: string) => void;
  removeCustomerFlag: (customerId: string, flagType: CustomerFlagType) => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;

  // UI actions
  openOrderDrawer: (orderId: string) => void;
  closeOrderDrawer: () => void;
  openShippingModal: (orderId: string) => void;
  closeShippingModal: () => void;
  openCustomerDrawer: (customerId: string) => void;
  closeCustomerDrawer: () => void;
  openFlagModal: (customerId: string) => void;
  closeFlagModal: () => void;
  setActiveView: (view: 'pipeline' | 'customers' | 'analytics' | 'settings') => void;

  // Computed getters
  getOrdersByStage: (stage: PipelineStage) => Order[];
  getSelectedOrder: () => Order | null;
  getSelectedCustomer: () => Customer | null;
  getCustomerForOrder: (orderId: string) => Customer | null;
  getFilteredOrders: () => Order[];
  getFilteredCustomers: () => Customer[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Initial state
  orders: mockOrders,
  selectedOrderId: null,
  selectedOrderIds: [],
  orderFilters: {},

  customers: mockCustomers,
  selectedCustomerId: null,
  customerFilters: {},

  isOrderDrawerOpen: false,
  isShippingModalOpen: false,
  isCustomerDrawerOpen: false,
  isFlagModalOpen: false,
  activeView: 'pipeline',

  // Order actions
  setOrders: (orders) => set({ orders }),

  moveOrder: (orderId, newStage) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id === orderId) {
        const now = new Date();
        return {
          ...order,
          pipelineStage: newStage,
          updatedAt: now,
          history: [
            ...order.history,
            {
              id: `hist-${Date.now()}`,
              type: 'moved' as const,
              description: `Moved to ${newStage.replace('-', ' ')}`,
              timestamp: now
            }
          ]
        };
      }
      return order;
    })
  })),

  reorderOrders: (stageId, sourceIndex, destIndex) => set((state) => {
    const stageOrders = state.orders.filter(o => o.pipelineStage === stageId);
    const otherOrders = state.orders.filter(o => o.pipelineStage !== stageId);

    const [moved] = stageOrders.splice(sourceIndex, 1);
    stageOrders.splice(destIndex, 0, moved);

    return { orders: [...otherOrders, ...stageOrders] };
  }),

  selectOrder: (orderId) => set({ selectedOrderId: orderId }),

  setOrderFilters: (filters) => set((state) => ({
    orderFilters: { ...state.orderFilters, ...filters }
  })),

  addOrderNote: (orderId, noteContent) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id === orderId) {
        const newNote: OrderNote = {
          id: `note-${Date.now()}`,
          content: noteContent,
          createdAt: new Date()
        };
        return {
          ...order,
          notes: [...order.notes, newNote],
          updatedAt: new Date(),
          history: [
            ...order.history,
            {
              id: `hist-${Date.now()}`,
              type: 'note_added' as const,
              description: 'Note added',
              timestamp: new Date()
            }
          ]
        };
      }
      return order;
    })
  })),

  addOrderTag: (orderId, tag) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id === orderId && !order.tags.includes(tag)) {
        return {
          ...order,
          tags: [...order.tags, tag],
          updatedAt: new Date()
        };
      }
      return order;
    })
  })),

  removeOrderTag: (orderId, tag) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          tags: order.tags.filter(t => t !== tag),
          updatedAt: new Date()
        };
      }
      return order;
    })
  })),

  updateOrderTracking: (orderId, trackingNumber, carrier) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id === orderId) {
        const now = new Date();
        return {
          ...order,
          trackingNumber,
          carrierName: carrier,
          isShipped: true,
          pipelineStage: 'shipped' as PipelineStage,
          updatedAt: now,
          history: [
            ...order.history,
            {
              id: `hist-${Date.now()}`,
              type: 'shipped' as const,
              description: `Tracking added: ${carrier} ${trackingNumber}`,
              timestamp: now
            }
          ]
        };
      }
      return order;
    })
  })),

  // Batch selection actions
  toggleOrderSelection: (orderId) => set((state) => ({
    selectedOrderIds: state.selectedOrderIds.includes(orderId)
      ? state.selectedOrderIds.filter(id => id !== orderId)
      : [...state.selectedOrderIds, orderId]
  })),

  selectAllOrders: () => set((state) => ({
    selectedOrderIds: state.orders.map(o => o.id)
  })),

  clearOrderSelection: () => set({ selectedOrderIds: [] }),

  batchMoveOrders: (stage) => set((state) => {
    const now = new Date();
    return {
      orders: state.orders.map((order) => {
        if (state.selectedOrderIds.includes(order.id)) {
          return {
            ...order,
            pipelineStage: stage,
            updatedAt: now,
            history: [
              ...order.history,
              {
                id: `hist-${Date.now()}-${order.id}`,
                type: 'moved' as const,
                description: `Batch moved to ${stage.replace('-', ' ')}`,
                timestamp: now
              }
            ]
          };
        }
        return order;
      }),
      selectedOrderIds: []
    };
  }),

  batchAddTag: (tag) => set((state) => ({
    orders: state.orders.map((order) => {
      if (state.selectedOrderIds.includes(order.id) && !order.tags.includes(tag)) {
        return {
          ...order,
          tags: [...order.tags, tag],
          updatedAt: new Date()
        };
      }
      return order;
    }),
    selectedOrderIds: []
  })),

  // Customer actions
  setCustomers: (customers) => set({ customers }),

  selectCustomer: (customerId) => set({ selectedCustomerId: customerId }),

  setCustomerFilters: (filters) => set((state) => ({
    customerFilters: { ...state.customerFilters, ...filters }
  })),

  addCustomerFlag: (customerId, flagType, reason) => set((state) => ({
    customers: state.customers.map((customer) => {
      if (customer.id === customerId) {
        const newFlag: CustomerFlag = {
          type: flagType,
          reason,
          createdAt: new Date()
        };
        return {
          ...customer,
          flags: [...customer.flags, newFlag],
          isFlagged: true,
          updatedAt: new Date()
        };
      }
      return customer;
    })
  })),

  removeCustomerFlag: (customerId, flagType) => set((state) => ({
    customers: state.customers.map((customer) => {
      if (customer.id === customerId) {
        const newFlags = customer.flags.filter(f => f.type !== flagType);
        return {
          ...customer,
          flags: newFlags,
          isFlagged: newFlags.length > 0,
          updatedAt: new Date()
        };
      }
      return customer;
    })
  })),

  updateCustomerNotes: (customerId, notes) => set((state) => ({
    customers: state.customers.map((customer) => {
      if (customer.id === customerId) {
        return {
          ...customer,
          notes,
          updatedAt: new Date()
        };
      }
      return customer;
    })
  })),

  // UI actions
  openOrderDrawer: (orderId) => set({ selectedOrderId: orderId, isOrderDrawerOpen: true }),
  closeOrderDrawer: () => set({ isOrderDrawerOpen: false }),

  openShippingModal: (orderId) => set({ selectedOrderId: orderId, isShippingModalOpen: true }),
  closeShippingModal: () => set({ isShippingModalOpen: false }),

  openCustomerDrawer: (customerId) => set({ selectedCustomerId: customerId, isCustomerDrawerOpen: true }),
  closeCustomerDrawer: () => set({ isCustomerDrawerOpen: false }),

  openFlagModal: (customerId) => set({ selectedCustomerId: customerId, isFlagModalOpen: true }),
  closeFlagModal: () => set({ isFlagModalOpen: false }),

  setActiveView: (view) => set({ activeView: view }),

  // Computed getters
  getOrdersByStage: (stage) => {
    const { orders } = get();
    return orders.filter(o => o.pipelineStage === stage);
  },

  getSelectedOrder: () => {
    const { orders, selectedOrderId } = get();
    return orders.find(o => o.id === selectedOrderId) || null;
  },

  getSelectedCustomer: () => {
    const { customers, selectedCustomerId } = get();
    return customers.find(c => c.id === selectedCustomerId) || null;
  },

  getCustomerForOrder: (orderId) => {
    const { orders, customers } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    return customers.find(c => c.id === order.customerId) || null;
  },

  getFilteredOrders: () => {
    const { orders, orderFilters } = get();
    let filtered = [...orders];

    if (orderFilters.stages && orderFilters.stages.length > 0) {
      filtered = filtered.filter(o => orderFilters.stages!.includes(o.pipelineStage));
    }

    if (orderFilters.isGift !== undefined) {
      filtered = filtered.filter(o => o.isGift === orderFilters.isGift);
    }

    if (orderFilters.hasIssue !== undefined) {
      filtered = filtered.filter(o => o.hasIssue === orderFilters.hasIssue);
    }

    if (orderFilters.search) {
      const search = orderFilters.search.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.buyerName.toLowerCase().includes(search) ||
        o.buyerEmail.toLowerCase().includes(search) ||
        o.items.some(item => item.title.toLowerCase().includes(search))
      );
    }

    if (orderFilters.shipByDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      switch (orderFilters.shipByDate) {
        case 'overdue':
          filtered = filtered.filter(o => !o.isShipped && new Date(o.shipByDate) < today);
          break;
        case 'today':
          filtered = filtered.filter(o => {
            const shipBy = new Date(o.shipByDate);
            return shipBy >= today && shipBy < tomorrow;
          });
          break;
        case 'tomorrow':
          filtered = filtered.filter(o => {
            const shipBy = new Date(o.shipByDate);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            return shipBy >= tomorrow && shipBy < dayAfter;
          });
          break;
        case 'this_week':
          filtered = filtered.filter(o => {
            const shipBy = new Date(o.shipByDate);
            return shipBy >= today && shipBy < endOfWeek;
          });
          break;
      }
    }

    if (orderFilters.tags && orderFilters.tags.length > 0) {
      filtered = filtered.filter(o =>
        orderFilters.tags!.some(tag => o.tags.includes(tag))
      );
    }

    if (orderFilters.minAmount !== undefined) {
      filtered = filtered.filter(o => o.totalAmount >= orderFilters.minAmount!);
    }

    if (orderFilters.maxAmount !== undefined) {
      filtered = filtered.filter(o => o.totalAmount <= orderFilters.maxAmount!);
    }

    return filtered;
  },

  getFilteredCustomers: () => {
    const { customers, customerFilters } = get();
    let filtered = [...customers];

    if (customerFilters.isRepeat !== undefined) {
      filtered = filtered.filter(c => c.isRepeatCustomer === customerFilters.isRepeat);
    }

    if (customerFilters.minSpent !== undefined) {
      filtered = filtered.filter(c => c.totalSpent >= customerFilters.minSpent!);
    }

    if (customerFilters.tier) {
      filtered = filtered.filter(c => c.tier === customerFilters.tier);
    }

    if (customerFilters.isFlagged !== undefined) {
      filtered = filtered.filter(c => c.isFlagged === customerFilters.isFlagged);
    }

    if (customerFilters.search) {
      const search = customerFilters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  }
}));
