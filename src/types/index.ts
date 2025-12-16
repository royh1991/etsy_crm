// Etsy CRM Types

// ============ Address Types ============
export interface Address {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

// ============ Order Item Types ============
export interface OrderItem {
  id: string;
  listingId: number;
  title: string;
  description: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  sku?: string;
  variations?: { name: string; value: string }[];
}

// ============ Order Types ============
export type EtsyStatus = 'open' | 'payment_processing' | 'paid' | 'completed' | 'canceled';

export type PipelineStage =
  | 'new'
  | 'processing'
  | 'ready-to-ship'
  | 'shipped'
  | 'delivered'
  | 'needs-attention';

export interface OrderNote {
  id: string;
  content: string;
  createdAt: Date;
}

export interface OrderHistoryEvent {
  id: string;
  type: 'created' | 'moved' | 'shipped' | 'note_added' | 'label_created' | 'delivered';
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  etsyReceiptId: number;
  orderNumber: string;
  pipelineStage: PipelineStage;

  // Customer Info
  customerId: string;
  buyerName: string;
  buyerEmail: string;
  shippingAddress: Address;

  // Order Details
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  currencyCode: string;
  orderDate: Date;
  shipByDate: Date;

  // Status
  etsyStatus: EtsyStatus;
  isPaid: boolean;
  isShipped: boolean;

  // Shipping
  trackingNumber?: string;
  carrierName?: string;
  labelUrl?: string;
  trackingStatus?: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  estimatedDeliveryDate?: Date;

  // Gift
  isGift: boolean;
  giftMessage?: string;

  // Buyer's message
  buyerNote?: string;

  // CRM Fields
  tags: string[];
  notes: OrderNote[];
  history: OrderHistoryEvent[];
  hasIssue: boolean;
  issueType?: CustomerFlagType;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============ Customer Types ============
export type CustomerFlagType =
  | 'delivery_dispute'
  | 'refund_requester'
  | 'digital_refund'
  | 'custom_cancel'
  | 'low_reviewer'
  | 'chargeback'
  | 'communication_issue';

export type CustomerTier = 'new' | 'regular' | 'bronze' | 'silver' | 'gold' | 'vip';

export interface CustomerFlag {
  type: CustomerFlagType;
  reason: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  etsyBuyerId: number;
  name: string;
  email: string;

  // CRM Metrics
  orderCount: number;
  totalSpent: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  averageOrderValue: number;

  // Status
  isRepeatCustomer: boolean;
  tier: CustomerTier;

  // Reviews
  averageRating?: number;
  reviewCount: number;
  hasLeftReview: boolean;

  // Flags
  flags: CustomerFlag[];
  isFlagged: boolean;

  // Notes
  notes: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============ Pipeline Stage Config ============
export interface PipelineStageConfig {
  id: PipelineStage;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: 'new',
    name: 'New Orders',
    emoji: '🆕',
    color: '#3B82F6',
    description: 'Orders just received, not yet started'
  },
  {
    id: 'processing',
    name: 'Processing',
    emoji: '🏗️',
    color: '#F59E0B',
    description: 'Currently making/preparing items'
  },
  {
    id: 'ready-to-ship',
    name: 'Ready to Ship',
    emoji: '📦',
    color: '#10B981',
    description: 'Items ready, needs shipping label'
  },
  {
    id: 'shipped',
    name: 'Shipped',
    emoji: '🚚',
    color: '#8B5CF6',
    description: 'Label created, in transit'
  },
  {
    id: 'delivered',
    name: 'Delivered',
    emoji: '✅',
    color: '#059669',
    description: 'Package confirmed delivered'
  },
  {
    id: 'needs-attention',
    name: 'Needs Attention',
    emoji: '⚠️',
    color: '#EF4444',
    description: 'Issues requiring resolution'
  }
];

// ============ Shipping Types ============
export interface PackagePreset {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  weightUnit: 'oz' | 'lb';
  dimensionUnit: 'in' | 'cm';
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: string;
  deliveryDate?: Date;
}

export interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  carrier: string;
  service: string;
  price: number;
  createdAt: Date;
}

// ============ Analytics Types ============
export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  shippedToday: number;
  deliveredToday: number;
  overdueOrders: number;
  newOrders: number;

  ordersThisWeek: number;
  revenueThisWeek: number;

  ordersThisMonth: number;
  revenueThisMonth: number;

  averageOrderValue: number;
  repeatCustomerRate: number;
}

export interface OrdersByStage {
  stage: PipelineStage;
  count: number;
}

// ============ Filter Types ============
export interface OrderFilters {
  stages?: PipelineStage[];
  dateRange?: { start: Date; end: Date };
  shipByDate?: 'overdue' | 'today' | 'tomorrow' | 'this_week';
  isGift?: boolean;
  hasIssue?: boolean;
  isRepeatCustomer?: boolean;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
}

export interface CustomerFilters {
  isRepeat?: boolean;
  minSpent?: number;
  tier?: CustomerTier;
  isFlagged?: boolean;
  search?: string;
}

// ============ Utility Functions ============
export function getCustomerTier(totalSpent: number): CustomerTier {
  if (totalSpent >= 500) return 'vip';
  if (totalSpent >= 200) return 'gold';
  if (totalSpent >= 100) return 'silver';
  if (totalSpent >= 50) return 'bronze';
  return 'regular';
}

export function getTierLabel(tier: CustomerTier): string {
  const labels: Record<CustomerTier, string> = {
    new: 'New Customer',
    regular: 'Regular',
    bronze: 'Bronze ($50+)',
    silver: 'Silver ($100+)',
    gold: 'Gold ($200+)',
    vip: 'VIP ($500+)'
  };
  return labels[tier];
}

export function getFlagLabel(flagType: CustomerFlagType): string {
  const labels: Record<CustomerFlagType, string> = {
    delivery_dispute: 'Delivery Dispute',
    refund_requester: 'Refund Requester',
    digital_refund: 'Digital Refund',
    custom_cancel: 'Custom Canceler',
    low_reviewer: 'Low Reviewer',
    chargeback: 'Chargeback',
    communication_issue: 'Communication Issue'
  };
  return labels[flagType];
}

export function isOrderOverdue(order: Order): boolean {
  return !order.isShipped && new Date(order.shipByDate) < new Date();
}

export function getDaysUntilShipBy(order: Order): number {
  const now = new Date();
  const shipBy = new Date(order.shipByDate);
  const diffTime = shipBy.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
