// Zustand store for Order and Customer management
import { create } from 'zustand';
import type { Order, Customer, PipelineStage, OrderFilters, CustomerFilters, OrderNote, CustomerFlag, CustomerFlagType, Address } from '../types';
import { mockOrders, mockCustomers } from '../services/mockData';

// API base URL - use backend in development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// Transform backend order data to frontend Order type
function transformBackendOrder(order: any): Order {
  // Transform shipping address to frontend format
  const shippingAddress: Address = {
    name: order.shippingAddress?.name || order.buyerName,
    addressLine1: order.shippingAddress?.first_line || '',
    addressLine2: order.shippingAddress?.second_line,
    city: order.shippingAddress?.city || '',
    state: order.shippingAddress?.state || '',
    postalCode: order.shippingAddress?.zip || '',
    country: order.shippingAddress?.country_iso === 'US' ? 'United States' :
             order.shippingAddress?.country_iso === 'CA' ? 'Canada' :
             order.shippingAddress?.country_iso || '',
    countryCode: order.shippingAddress?.country_iso || 'US',
  };

  // Transform variations from Etsy API format to frontend format
  const transformVariations = (variations: any[]): { name: string; value: string }[] => {
    if (!variations || !Array.isArray(variations)) return [];
    return variations.map((v: any) => ({
      name: v.property_name || '',
      value: Array.isArray(v.values) ? v.values[0] : v.values || '',
    }));
  };

  return {
    id: order.id,
    etsyReceiptId: parseInt(order.etsyReceiptId) || 0,
    orderNumber: order.orderNumber,
    pipelineStage: order.pipelineStage?.replace('_', '-') as PipelineStage,
    customerId: order.customerId,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    shippingAddress,
    items: order.items?.map((item: any) => ({
      id: item.id,
      listingId: item.listingId || parseInt(item.etsyListingId) || 0,
      title: item.title,
      description: item.description || item.personalization || '',
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl,
      sku: item.sku,
      variations: transformVariations(item.variations),
    })) || [],
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.taxAmount || order.tax || 0,
    totalAmount: order.totalAmount,
    currencyCode: order.currency || 'USD',
    orderDate: new Date(order.orderDate || order.orderedAt),
    shipByDate: new Date(order.shipByDate),
    etsyStatus: 'paid', // Default to paid since these are real orders
    isPaid: true,
    isShipped: order.isShipped || false,
    trackingNumber: order.trackingNumber,
    carrierName: order.carrierName,
    labelUrl: order.labelUrl,
    trackingStatus: order.isShipped ? (order.deliveredAt ? 'delivered' : 'in_transit') : undefined,
    estimatedDeliveryDate: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
    isGift: order.isGift || false,
    giftMessage: order.giftMessage,
    buyerNote: order.buyerNote,
    tags: order.tags || [],
    notes: order.notes?.map((n: any) => ({
      id: n.id,
      content: n.content,
      createdAt: new Date(n.createdAt),
    })) || [],
    history: order.history?.map((h: any) => ({
      id: h.id,
      type: h.type?.toLowerCase() as any,
      description: h.description,
      timestamp: new Date(h.createdAt || h.timestamp),
      metadata: h.metadata,
    })) || [],
    hasIssue: order.hasIssue || false,
    issueType: order.issueDescription ? 'delivery_dispute' as CustomerFlagType : undefined,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  };
}

// Transform backend customer data to frontend Customer type
function transformBackendCustomer(customer: any): Customer {
  return {
    id: customer.id,
    etsyBuyerId: parseInt(customer.etsyBuyerId) || 0,
    name: customer.name,
    email: customer.email,
    orderCount: customer.orderCount || 0,
    totalSpent: customer.totalSpent || 0,
    firstOrderDate: customer.firstOrderAt ? new Date(customer.firstOrderAt) : new Date(),
    lastOrderDate: customer.lastOrderAt ? new Date(customer.lastOrderAt) : new Date(),
    averageOrderValue: customer.averageOrderValue || 0,
    isRepeatCustomer: customer.isRepeatCustomer || false,
    tier: customer.tier?.toLowerCase() as any || 'regular',
    averageRating: customer.rating,
    reviewCount: customer.reviewCount || 0,
    hasLeftReview: (customer.reviewCount || 0) > 0,
    flags: customer.flags?.map((f: any) => ({
      type: f.type?.toLowerCase() as CustomerFlagType,
      reason: f.reason,
      createdAt: new Date(f.createdAt),
    })) || [],
    isFlagged: customer.isFlagged || (customer.flags?.length || 0) > 0,
    notes: customer.notes || '',
    createdAt: new Date(customer.createdAt),
    updatedAt: new Date(customer.updatedAt),
  };
}

interface OrderStore {
  // Order state
  orders: Order[];
  selectedOrderId: string | null;
  selectedOrderIds: string[];  // For batch selection
  orderFilters: OrderFilters;
  isLoadingOrders: boolean;
  ordersError: string | null;

  // Customer state
  customers: Customer[];
  selectedCustomerId: string | null;
  customerFilters: CustomerFilters;
  isLoadingCustomers: boolean;
  customersError: string | null;

  // UI state
  isOrderDrawerOpen: boolean;
  isShippingModalOpen: boolean;
  isCustomerDrawerOpen: boolean;
  isFlagModalOpen: boolean;
  activeView: 'pipeline' | 'customers' | 'analytics' | 'settings';

  // API actions
  fetchOrders: () => Promise<void>;
  fetchCustomers: () => Promise<void>;

  // Order actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
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
  // Initial state - start empty, fetch from API on load
  orders: [],
  selectedOrderId: null,
  selectedOrderIds: [],
  orderFilters: {},
  isLoadingOrders: true,  // Start as loading
  ordersError: null,

  customers: [],
  selectedCustomerId: null,
  customerFilters: {},
  isLoadingCustomers: true,  // Start as loading
  customersError: null,

  isOrderDrawerOpen: false,
  isShippingModalOpen: false,
  isCustomerDrawerOpen: false,
  isFlagModalOpen: false,
  activeView: 'pipeline',

  // API actions
  fetchOrders: async () => {
    set({ isLoadingOrders: true, ordersError: null });
    try {
      const response = await fetch(`${API_BASE}/orders/dev/all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      const orders = data.orders.map(transformBackendOrder);
      set({ orders, isLoadingOrders: false });
      console.log(`Loaded ${orders.length} orders from backend`);
    } catch (error) {
      console.warn('Failed to fetch from backend, using mock data:', error);
      set({ orders: mockOrders, isLoadingOrders: false, ordersError: (error as Error).message });
    }
  },

  fetchCustomers: async () => {
    set({ isLoadingCustomers: true, customersError: null });
    try {
      const response = await fetch(`${API_BASE}/orders/dev/customers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }
      const data = await response.json();
      const customers = data.customers.map(transformBackendCustomer);
      set({ customers, isLoadingCustomers: false });
      console.log(`Loaded ${customers.length} customers from backend`);
    } catch (error) {
      console.warn('Failed to fetch from backend, using mock data:', error);
      set({ customers: mockCustomers, isLoadingCustomers: false, customersError: (error as Error).message });
    }
  },

  // Order actions
  setOrders: (orders) => set({ orders }),

  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),

  moveOrder: (orderId, newStage) => {
    // Optimistically update UI first
    set((state) => ({
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
    }));

    // Persist to backend
    fetch(`${API_BASE}/orders/dev/${orderId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineStage: newStage })
    })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to persist order stage change:', res.statusText);
        } else {
          console.log(`Order ${orderId} stage persisted to ${newStage}`);
        }
      })
      .catch(err => {
        console.error('Failed to persist order stage change:', err);
      });
  },

  reorderOrders: (stageId, sourceIndex, destIndex) => {
    // Get current state to compute new order
    const state = get();
    const stageOrders = state.orders.filter(o => o.pipelineStage === stageId);
    const otherOrders = state.orders.filter(o => o.pipelineStage !== stageId);

    const [moved] = stageOrders.splice(sourceIndex, 1);
    stageOrders.splice(destIndex, 0, moved);

    // Optimistically update UI
    set({ orders: [...otherOrders, ...stageOrders] });

    // Persist to backend - send array of order IDs in new order
    const orderIds = stageOrders.map(o => o.id);
    fetch(`${API_BASE}/orders/dev/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId, orderIds })
    })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to persist order reordering:', res.statusText);
        } else {
          console.log(`Reordered ${orderIds.length} orders in ${stageId}`);
        }
      })
      .catch(err => {
        console.error('Failed to persist order reordering:', err);
      });
  },

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
