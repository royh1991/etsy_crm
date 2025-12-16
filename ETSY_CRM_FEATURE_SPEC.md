# Etsy CRM - Complete Feature Specification

## For LLM Implementation Guide

**Version 2.0 | December 2024**

---

## Table of Contents

1. [Current Application State](#1-current-application-state)
2. [Component Architecture Map](#2-component-architecture-map)
3. [Core CRM Features Required](#3-core-crm-features-required)
4. [Customer Intelligence Features](#4-customer-intelligence-features)
5. [Order Management Features](#5-order-management-features)
6. [Shipping Integration](#6-shipping-integration)
7. [Analytics & Reporting](#7-analytics--reporting)
8. [Etsy API Integration Reference](#8-etsy-api-integration-reference)
9. [Implementation Priority Matrix](#9-implementation-priority-matrix)
10. [Technical Implementation Details](#10-technical-implementation-details)

---

## 1. Current Application State

### Screenshot Reference
![Current App State](/.playwright-mcp/etsy-crm-current-state.png)

### What's Built (UI Shell)

| Feature | Status | Component |
|---------|--------|-----------|
| Kanban board layout | Done | `src/components/kanban/KanbanBoard.tsx` |
| Draggable task cards | Done | `src/components/kanban/TaskCard.tsx` |
| Draggable columns | Done | `src/components/kanban/KanbanBoard.tsx` |
| Column rename (double-click) | Done | `src/components/kanban/KanbanBoard.tsx` |
| Left icon sidebar | Done | `src/components/sidebar/IconSidebar.tsx` |
| Project sidebar with analytics | Done | `src/components/sidebar/ProjectSidebar.tsx` |
| Header with search | Done | `src/components/header/Header.tsx` |
| Project header with tabs | Done | `src/components/header/ProjectHeader.tsx` |
| Responsive layout | Done | `src/App.tsx` |

### What's NOT Built (Backend & Data)

- No backend server
- No database
- No Etsy API integration
- No real order data
- No customer data
- No shipping integration
- Static/mock data only

---

## 2. Component Architecture Map

```
src/
├── App.tsx                              # Main layout, responsive state
├── main.tsx                             # React entry point
├── index.css                            # Global styles, Tailwind
│
├── components/
│   ├── sidebar/
│   │   ├── IconSidebar.tsx              # Left 65px icon navigation
│   │   │   └── Features: Collapsible, mobile overlay, nav icons
│   │   │
│   │   └── ProjectSidebar.tsx           # 205px project list + analytics
│   │       └── Features: Project list, Total Time card,
│   │           Commits chart, Time pie chart
│   │
│   ├── header/
│   │   ├── Header.tsx                   # Top bar with search
│   │   │   └── Features: Search input, email/bell icons,
│   │   │       user avatar, hamburger menu
│   │   │
│   │   └── ProjectHeader.tsx            # Project info bar
│   │       └── Features: Progress bar, tabs (Description,
│   │           Board, Notes, Test), team avatars, Add board btn
│   │
│   └── kanban/
│       ├── KanbanBoard.tsx              # Main kanban board
│       │   └── Features: DnD context, column management,
│       │       drag handlers, column rename
│       │   └── Dependencies: @dnd-kit/core, @dnd-kit/sortable
│       │
│       └── TaskCard.tsx                 # Individual task card
│           └── Features: Title, description, tags, assignees,
│               hover states, menu button
```

### Component → Feature Mapping for Etsy CRM

| Current Component | Needs to Become | Changes Required |
|-------------------|-----------------|------------------|
| `TaskCard.tsx` | `OrderCard.tsx` | Add order data, customer info, shipping button, product images |
| `KanbanBoard.tsx` | `OrderPipeline.tsx` | Connect to order API, real-time sync, order stages |
| `ProjectSidebar.tsx` | `CustomerSidebar.tsx` | Customer list, filters, CRM analytics |
| `Header.tsx` | `CRMHeader.tsx` | Order search, sync button, notifications |
| `IconSidebar.tsx` | `NavigationSidebar.tsx` | CRM navigation (Orders, Customers, Shipping, Reports) |

---

## 3. Core CRM Features Required

### 3.1 Order Management Pipeline

**Component:** `src/components/kanban/KanbanBoard.tsx`

**Current State:** Generic task kanban with mock data

**Required Changes:**

```typescript
// NEW: Order interface (replace Task interface)
interface Order {
  id: string;
  etsyReceiptId: number;
  pipelineStageId: string;

  // Customer Info
  buyerUserId: number;
  buyerName: string;
  buyerEmail: string;
  shippingAddress: Address;

  // Order Details
  items: OrderItem[];
  totalAmount: number;
  currencyCode: string;
  orderDate: Date;
  shipByDate: Date;

  // Status
  etsyStatus: 'paid' | 'completed' | 'canceled';
  isPaid: boolean;
  isShipped: boolean;

  // Shipping
  trackingNumber?: string;
  carrierName?: string;
  labelUrl?: string;

  // Flags
  isGift: boolean;
  giftMessage?: string;
  hasIssue: boolean;
  issueType?: 'delivery_dispute' | 'refund_request' | 'low_review';

  // CRM Fields
  customerTags: string[];
  internalNotes: string;
  isRepeatCustomer: boolean;
  customerLifetimeValue: number;
}
```

**API Endpoints Required:**
- `GET /api/orders` - Fetch orders with filters
- `PATCH /api/orders/:id/stage` - Move order between stages
- `POST /api/orders/:id/ship` - Create label and mark shipped
- `POST /api/sync/orders` - Sync from Etsy

**Etsy API:**
```
GET https://api.etsy.com/v3/application/shops/{shop_id}/receipts
```

---

### 3.2 Order Card Redesign

**Component:** `src/components/kanban/TaskCard.tsx`

**Current State:** Simple task card with title, description, tags, assignees

**Required Redesign:**

```
┌────────────────────────────────────────┐
│ ┌────────┐  Order #12345    [⋮]       │
│ │ [IMG]  │  John Smith                │
│ │  60x60 │  San Francisco, CA    🔁   │ ← 🔁 = repeat customer
│ └────────┘                             │
│  Handmade Ceramic Mug x2              │
│  + 1 more item                        │
│ ──────────────────────────────────────│
│  $47.50        Ship by: Dec 18   🎁   │
│  ⭐ VIP Customer ($500+ spent)        │ ← Customer tier badge
│ [⚡ Create Label]  [💬 Message]       │
└────────────────────────────────────────┘
```

**New Props Required:**
```typescript
interface OrderCardProps {
  order: Order;
  customer: Customer;
  onCreateLabel: (orderId: string) => void;
  onMessageCustomer: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  onFlagIssue: (orderId: string, issueType: string) => void;
}
```

---

## 4. Customer Intelligence Features

### 4.1 Repeat Customer Identification

**Priority:** HIGH (Most requested feature)

**Implementation Location:** New service + UI indicators

**Required:**

1. **Backend Service:** `server/src/services/customer.service.ts`
```typescript
async function identifyRepeatCustomers(shopId: string): Promise<Customer[]> {
  // Query orders grouped by buyer_user_id
  // Return customers with order_count > 1
}
```

2. **Database Schema:**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  etsy_buyer_id BIGINT UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),

  -- CRM Fields
  order_count INTEGER DEFAULT 1,
  total_spent DECIMAL(10,2) DEFAULT 0,
  first_order_date TIMESTAMP,
  last_order_date TIMESTAMP,
  average_order_value DECIMAL(10,2),

  -- Flags
  is_repeat_customer BOOLEAN DEFAULT false,
  is_vip BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason VARCHAR(100),

  -- Tags
  tags TEXT[],
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_repeat ON customers(shop_id, is_repeat_customer);
CREATE INDEX idx_customers_total_spent ON customers(shop_id, total_spent);
```

3. **API Endpoints:**
```
GET /api/customers?filter=repeat           # All repeat customers
GET /api/customers?min_spent=50            # Spent over $50
GET /api/customers?min_spent=100           # Spent over $100
GET /api/customers?min_spent=200           # Spent over $200
GET /api/customers/:id/orders              # Customer order history
```

4. **UI Component:** `src/components/customers/CustomerList.tsx`
```typescript
// Filter options
const filters = [
  { label: 'All Customers', value: 'all' },
  { label: 'Repeat Customers', value: 'repeat' },
  { label: 'Spent $50+', value: 'spent_50' },
  { label: 'Spent $100+', value: 'spent_100' },
  { label: 'Spent $200+', value: 'spent_200' },
  { label: 'VIP Customers', value: 'vip' },
  { label: 'Flagged', value: 'flagged' },
];
```

---

### 4.2 Customer Rating & Review Tracking

**Priority:** HIGH

**Implementation:**

1. **Etsy API for Reviews:**
```
GET https://api.etsy.com/v3/application/shops/{shop_id}/reviews
```

2. **Database Extension:**
```sql
ALTER TABLE customers ADD COLUMN average_rating DECIMAL(2,1);
ALTER TABLE customers ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN has_left_review BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN last_review_rating INTEGER;

CREATE TABLE customer_reviews (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES orders(id),
  etsy_review_id BIGINT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  shop_response TEXT,
  created_at TIMESTAMP
);
```

3. **UI Features:**
- Badge on OrderCard showing customer's average rating
- Filter customers by rating (5-star, 4-star, below 4-star)
- "Great Reviewers" quick filter
- Alert for customers with history of low reviews

---

### 4.3 Troublesome Customer Flagging

**Priority:** HIGH

**Flag Types:**
```typescript
enum CustomerFlagType {
  DELIVERY_DISPUTE = 'delivery_dispute',      // "Package delivered but claims not received"
  REFUND_REQUESTER = 'refund_requester',      // Frequent refund requests
  DIGITAL_REFUND = 'digital_refund',          // Refunded digital items (suspicious)
  CUSTOM_CANCEL = 'custom_cancel',            // Orders custom then cancels after shipping
  LOW_REVIEWER = 'low_reviewer',              // Consistently gives low reviews
  CHARGEBACK = 'chargeback',                  // Filed chargebacks
  COMMUNICATION_ISSUE = 'communication_issue' // Difficult to communicate with
}
```

**UI Component:** `src/components/customers/CustomerFlagModal.tsx`

**Features:**
- Quick flag button on order cards
- Flag reason dropdown
- Notes field for details
- Auto-flag based on patterns (e.g., 2+ delivery disputes)
- Warning popup when flagged customer places new order

---

## 5. Order Management Features

### 5.1 Order Detail Drawer

**Component:** `src/components/order/OrderDetailDrawer.tsx` (NEW)

**Trigger:** Click on order card

**Contents:**
```
┌─────────────────────────────────────────────────┐
│ Order #12345                              [X]   │
├─────────────────────────────────────────────────┤
│ CUSTOMER                                        │
│ John Smith                           🔁 Repeat  │
│ john@email.com                                  │
│ 123 Main St, San Francisco, CA 94102           │
│ [View Customer Profile] [Message]              │
├─────────────────────────────────────────────────┤
│ ITEMS                                           │
│ ┌──────┐ Handmade Ceramic Mug                  │
│ │ IMG  │ Qty: 2 × $12.00 = $24.00              │
│ └──────┘ SKU: MUG-001 | Blue, Large            │
│                                                 │
│ ┌──────┐ Matching Coaster Set                  │
│ │ IMG  │ Qty: 1 × $8.00 = $8.00                │
│ └──────┘ SKU: COAST-001                        │
├─────────────────────────────────────────────────┤
│ ORDER SUMMARY                                   │
│ Subtotal:              $32.00                   │
│ Shipping:               $5.50                   │
│ Tax:                    $2.88                   │
│ Total:                 $40.38                   │
├─────────────────────────────────────────────────┤
│ SHIPPING                                        │
│ Ship by: December 18, 2024                      │
│ [⚡ Create Shipping Label]                      │
│                                                 │
│ Or enter tracking manually:                     │
│ [Carrier ▼] [Tracking Number    ] [Submit]      │
├─────────────────────────────────────────────────┤
│ GIFT MESSAGE                              🎁    │
│ "Happy Birthday Mom! Love, Sarah"              │
├─────────────────────────────────────────────────┤
│ INTERNAL NOTES                                  │
│ [Add note about this order...]                 │
├─────────────────────────────────────────────────┤
│ HISTORY                                         │
│ • Dec 15, 10:30 AM - Order received            │
│ • Dec 15, 2:00 PM - Moved to Processing        │
│ • Dec 16, 9:00 AM - Label created              │
└─────────────────────────────────────────────────┘
```

---

### 5.2 Bulk Operations

**Component:** `src/components/order/BulkActionBar.tsx` (NEW)

**Features:**
- Select multiple orders (checkbox on cards)
- Bulk actions:
  - Move to stage
  - Create labels for all
  - Print packing slips
  - Export to CSV
  - Add tag

---

### 5.3 Order Search & Filtering

**Component:** Enhance `src/components/header/Header.tsx`

**Search Fields:**
- Order number
- Customer name
- Customer email
- Product name
- SKU
- Tracking number

**Filter Options:**
```typescript
interface OrderFilters {
  stage?: string[];
  dateRange?: { start: Date; end: Date };
  shipByDate?: 'overdue' | 'today' | 'tomorrow' | 'this_week';
  isGift?: boolean;
  hasIssue?: boolean;
  isRepeatCustomer?: boolean;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}
```

---

## 6. Shipping Integration

### 6.1 Shippo Integration

**Component:** `src/components/shipping/ShippingModal.tsx` (NEW)

**Flow:**
1. Click "Create Label" on order card
2. Modal opens with pre-filled addresses
3. Select package dimensions (or use saved defaults)
4. View rate options from carriers
5. Select rate and purchase label
6. Label PDF opens, tracking auto-submitted to Etsy

**API Endpoints:**
```
POST /api/shipping/rates
  Body: { orderId, parcel: { length, width, height, weight } }
  Returns: Array of ShippingRate

POST /api/shipping/label
  Body: { orderId, rateId }
  Returns: { trackingNumber, labelUrl, carrierName }
```

**Shippo API Reference:**
```
POST https://api.goshippo.com/shipments/     # Get rates
POST https://api.goshippo.com/transactions/  # Purchase label
```

**Etsy API (Submit Tracking):**
```
POST https://api.etsy.com/v3/application/shops/{shop_id}/receipts/{receipt_id}/tracking
Body: { tracking_code, carrier_name }
```

---

### 6.2 Shipping Defaults

**Component:** `src/components/settings/ShippingSettings.tsx` (NEW)

**Settings:**
- Default "from" address
- Default package dimensions (Small, Medium, Large presets)
- Preferred carriers
- Insurance preferences
- Signature confirmation rules

---

## 7. Analytics & Reporting

### 7.1 Dashboard Analytics

**Component:** Redesign `src/components/sidebar/ProjectSidebar.tsx`

**Metrics to Display:**
- Orders today / this week / this month
- Revenue today / this week / this month
- Average order value
- Orders pending shipment
- Overdue orders (ship by date passed)
- Repeat customer rate
- Top customers by spend

---

### 7.2 Customer Analytics

**Component:** `src/components/analytics/CustomerAnalytics.tsx` (NEW)

**Visualizations:**
- Customer acquisition over time
- Repeat customer trend
- Customer lifetime value distribution
- Geographic heatmap of customers
- Top products by customer segment

---

### 7.3 Sales Reports

**Component:** `src/components/reports/SalesReport.tsx` (NEW)

**Reports:**
- Daily/Weekly/Monthly sales summary
- Product performance
- Category performance (requires listing data)
- Shipping cost analysis
- Refund/cancellation rate

---

## 8. Etsy API Integration Reference

### 8.1 Required OAuth Scopes

```
transactions_r    # Read orders/receipts
transactions_w    # Submit tracking, mark shipped
shops_r           # Read shop info
listings_r        # Read product listings
reviews_r         # Read reviews (if available)
```

### 8.2 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/shops/{shop_id}/receipts` | GET | Fetch orders |
| `/shops/{shop_id}/receipts/{id}` | GET | Single order detail |
| `/shops/{shop_id}/receipts/{id}/tracking` | POST | Submit tracking |
| `/listings/{listing_id}` | GET | Product details |
| `/listings/{listing_id}/images` | GET | Product images |
| `/shops/{shop_id}/reviews` | GET | Shop reviews |
| `/users/{user_id}` | GET | Buyer info |

### 8.3 Webhook Events (Future)

Etsy doesn't have webhooks, so implement polling:
```typescript
// Sync service - run every 5 minutes
async function syncOrders() {
  const lastSync = await getLastSyncTime();
  const receipts = await etsy.getReceipts({
    min_created: lastSync.toISOString()
  });
  // Process new/updated orders
}
```

---

## 9. Implementation Priority Matrix

### Phase 1: Foundation (Week 1-2)
| Feature | Component | Priority | Effort |
|---------|-----------|----------|--------|
| Backend server setup | `server/` | CRITICAL | Medium |
| Database schema | `prisma/schema.prisma` | CRITICAL | Medium |
| Etsy OAuth flow | `server/src/routes/auth.ts` | CRITICAL | High |
| Order sync service | `server/src/services/sync.ts` | CRITICAL | High |
| Order API endpoints | `server/src/routes/orders.ts` | CRITICAL | Medium |

### Phase 2: Order Management (Week 2-3)
| Feature | Component | Priority | Effort |
|---------|-----------|----------|--------|
| OrderCard redesign | `TaskCard.tsx` → `OrderCard.tsx` | HIGH | Medium |
| Order detail drawer | `OrderDetailDrawer.tsx` | HIGH | High |
| Real-time order display | `KanbanBoard.tsx` | HIGH | Medium |
| Order search | `Header.tsx` | HIGH | Medium |

### Phase 3: Customer Intelligence (Week 3-4)
| Feature | Component | Priority | Effort |
|---------|-----------|----------|--------|
| Customer data model | Database + API | HIGH | Medium |
| Repeat customer detection | `customer.service.ts` | HIGH | Medium |
| Spend threshold filters | Customer API | HIGH | Low |
| Customer flagging | `CustomerFlagModal.tsx` | HIGH | Medium |
| Customer list view | `CustomerList.tsx` | MEDIUM | High |

### Phase 4: Shipping (Week 4-5)
| Feature | Component | Priority | Effort |
|---------|-----------|----------|--------|
| Shippo integration | `shippo.service.ts` | HIGH | High |
| Shipping modal | `ShippingModal.tsx` | HIGH | High |
| Auto-submit tracking | `shipping.service.ts` | HIGH | Medium |
| Shipping defaults | `ShippingSettings.tsx` | MEDIUM | Low |

### Phase 5: Analytics & Polish (Week 5-6)
| Feature | Component | Priority | Effort |
|---------|-----------|----------|--------|
| Dashboard metrics | `ProjectSidebar.tsx` | MEDIUM | Medium |
| Customer analytics | `CustomerAnalytics.tsx` | MEDIUM | High |
| Bulk operations | `BulkActionBar.tsx` | MEDIUM | Medium |
| Export functionality | Various | LOW | Low |

---

## 10. Technical Implementation Details

### 10.1 State Management

**Recommended:** Zustand + React Query

```typescript
// stores/orderStore.ts
import { create } from 'zustand';

interface OrderStore {
  orders: Order[];
  selectedOrderId: string | null;
  filters: OrderFilters;
  setOrders: (orders: Order[]) => void;
  moveOrder: (orderId: string, stageId: string, position: number) => void;
  selectOrder: (orderId: string | null) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
}

// hooks/useOrders.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => api.getOrders(filters),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}
```

### 10.2 Real-time Updates

**Option A:** Polling (Simpler)
```typescript
// Poll Etsy every 5 minutes, update UI every 30 seconds
useQuery({
  queryKey: ['orders'],
  refetchInterval: 30000,
});
```

**Option B:** WebSocket (Better UX)
```typescript
// server/src/websocket.ts
io.on('connection', (socket) => {
  socket.join(`shop:${shopId}`);
});

// After sync completes
io.to(`shop:${shopId}`).emit('orders:updated', { count: newOrders.length });
```

### 10.3 Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/etsy_crm
ETSY_API_KEY=your_keystring
ETSY_SHARED_SECRET=your_secret
ETSY_REDIRECT_URI=http://localhost:3001/api/auth/etsy/callback
SHIPPO_API_TOKEN=shippo_live_xxx
SESSION_SECRET=random_32_char_string
ENCRYPTION_KEY=32_byte_encryption_key
```

### 10.4 File Structure (Target)

```
etsy_crm_claude/
├── src/                          # Frontend (existing)
│   ├── components/
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx   # Update for orders
│   │   │   └── OrderCard.tsx     # New (from TaskCard)
│   │   ├── order/
│   │   │   ├── OrderDetailDrawer.tsx
│   │   │   └── BulkActionBar.tsx
│   │   ├── customer/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerProfile.tsx
│   │   │   └── CustomerFlagModal.tsx
│   │   ├── shipping/
│   │   │   ├── ShippingModal.tsx
│   │   │   └── ShippingSettings.tsx
│   │   ├── analytics/
│   │   │   └── Dashboard.tsx
│   │   ├── sidebar/              # Existing
│   │   └── header/               # Existing
│   ├── hooks/
│   │   ├── useOrders.ts
│   │   ├── useCustomers.ts
│   │   └── useShipping.ts
│   ├── stores/
│   │   └── orderStore.ts
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
│
├── server/                       # Backend (NEW)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── orders.ts
│   │   │   ├── customers.ts
│   │   │   ├── shipping.ts
│   │   │   └── sync.ts
│   │   ├── services/
│   │   │   ├── etsy.service.ts
│   │   │   ├── shippo.service.ts
│   │   │   ├── customer.service.ts
│   │   │   └── sync.service.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma
│
└── package.json
```

---

## Quick Reference: Component Changes Summary

| Existing Component | Action | New Name/Purpose |
|--------------------|--------|------------------|
| `App.tsx` | UPDATE | Add routing, auth context |
| `KanbanBoard.tsx` | UPDATE | Connect to order API |
| `TaskCard.tsx` | RENAME/UPDATE | `OrderCard.tsx` - display order data |
| `IconSidebar.tsx` | UPDATE | CRM navigation icons |
| `ProjectSidebar.tsx` | UPDATE | Customer list + CRM metrics |
| `Header.tsx` | UPDATE | Order search, sync button |
| `ProjectHeader.tsx` | UPDATE | Order pipeline tabs |

---

## Final Notes for Implementation

1. **Start with the backend** - The UI shell exists, but needs real data
2. **Etsy OAuth is the gatekeeper** - Nothing works until auth is complete
3. **Customer intelligence is the differentiator** - This is what sellers actually want
4. **Ship fast, iterate** - Get order sync working first, then add features

---

*End of Specification Document*
