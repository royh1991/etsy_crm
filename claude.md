# Claude.md - Project Context for LLMs

## Quick Start

```bash
cd /Users/rhu/etsy_crm_claude
npm install
npm run dev
# App runs at http://localhost:5173 (or 5174 if 5173 is in use)
```

---

## What Is This?

An **Etsy CRM/Order Management System** for Etsy sellers. Currently a **frontend with mock data** - no backend yet. The UI is fully functional with:
- Order pipeline (Kanban board)
- Customer management
- Analytics dashboard
- Shipping label creation (mock)

---

## Current State: What's Built

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │IconSidebar│  │ProjectSidebar│  │     Main Content      │ │
│  │  (nav)    │  │  (projects)  │  │  ┌─────────────────┐  │ │
│  │           │  │              │  │  │     Header      │  │ │
│  │ Dashboard │  │              │  │  ├─────────────────┤  │ │
│  │ Orders    │  │              │  │  │  Active View:   │  │ │
│  │ Customers │  │              │  │  │  - KanbanBoard  │  │ │
│  │           │  │              │  │  │  - CustomerList │  │ │
│  │           │  │              │  │  │  - Dashboard    │  │ │
│  └──────────┘  └──────────────┘  │  └─────────────────┘  │ │
└─────────────────────────────────────────────────────────────┘
```

### State Management: Zustand Store

**File:** `src/stores/orderStore.ts`

The entire app state is managed by a single Zustand store:

```typescript
interface OrderStore {
  // Data
  orders: Order[];
  customers: Customer[];

  // UI State
  activeView: 'pipeline' | 'customers' | 'analytics';
  selectedOrderId: string | null;
  isOrderDrawerOpen: boolean;
  isShippingModalOpen: boolean;
  shippingOrderId: string | null;

  // Actions
  setActiveView(view): void;
  moveOrder(orderId, newStage): void;
  openOrderDrawer(orderId): void;
  closeOrderDrawer(): void;
  openShippingModal(orderId): void;
  closeShippingModal(): void;
  addOrderNote(orderId, note): void;
  addOrderTag(orderId, tag): void;
  updateOrderTracking(orderId, carrier, trackingNumber): void;
  addCustomerFlag(customerId, flag): void;
}
```

**Usage pattern:**
```typescript
import { useOrderStore } from '../stores/orderStore';

function MyComponent() {
  const { orders, moveOrder, activeView, setActiveView } = useOrderStore();
}
```

---

## Component → Feature Mapping

### 1. Navigation & Routing

| Feature | Component | File |
|---------|-----------|------|
| View switching (Dashboard/Orders/Customers) | `IconSidebar` | `src/components/sidebar/IconSidebar.tsx` |
| Active view state | `useOrderStore().activeView` | `src/stores/orderStore.ts` |
| View rendering | `App.renderMainContent()` | `src/App.tsx:56-76` |

**How routing works:**
- `IconSidebar` has nav buttons that call `setActiveView('pipeline' | 'customers' | 'analytics')`
- `App.tsx` reads `activeView` from store and renders the corresponding component
- No React Router - just conditional rendering based on store state

### 2. Order Pipeline (Kanban Board)

| Feature | Component | File | Key Lines |
|---------|-----------|------|-----------|
| Kanban columns | `KanbanBoard` | `src/components/kanban/KanbanBoard.tsx` | Full file |
| Order cards | `OrderCard` | `src/components/order/OrderCard.tsx` | Full file |
| Drag-and-drop | `@dnd-kit` integration | `KanbanBoard.tsx` | Lines 1-50 |
| Column rendering | `PipelineColumn` | `KanbanBoard.tsx` | Lines 80-150 |

**Pipeline stages defined in:** `src/types/index.ts:83-120`
```typescript
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'new', name: 'New Orders', emoji: '🆕', color: '#3b82f6', etsyStatus: 'paid' },
  { id: 'processing', name: 'Processing', emoji: '🏗️', color: '#f59e0b', etsyStatus: 'paid' },
  { id: 'ready-to-ship', name: 'Ready to Ship', emoji: '📦', color: '#8b5cf6', etsyStatus: 'paid' },
  { id: 'shipped', name: 'Shipped', emoji: '🚚', color: '#10b981', etsyStatus: 'completed' },
  { id: 'delivered', name: 'Delivered', emoji: '✅', color: '#06b6d4', etsyStatus: 'completed' },
  { id: 'needs-attention', name: 'Needs Attention', emoji: '⚠️', color: '#ef4444', etsyStatus: 'open' },
];
```

**OrderCard displays:**
- Order number, customer name, location
- First item name + "more items" count
- Total price
- Ship-by date / overdue warning (red text if overdue)
- Customer badges (VIP/Gold/Silver/Bronze tier)
- Repeat customer icon (if `customer.isRepeatCustomer`)
- Flagged customer warning (if `customer.flags.length > 0`)
- Gift order indicator
- Action buttons: Create Label, Message

### 3. Order Detail Drawer

| Feature | Component | File |
|---------|-----------|------|
| Slide-out drawer | `OrderDetailDrawer` | `src/components/order/OrderDetailDrawer.tsx` |
| Open trigger | Click on `OrderCard` | `KanbanBoard.tsx` |
| Close trigger | X button or click outside | `OrderDetailDrawer.tsx` |

**Drawer sections:**
1. **Header** - Order number, date, stage dropdown
2. **Customer** - Name, email (mailto link), shipping address, lifetime value
3. **Items** - Product images, names, quantities, prices, SKUs, variations
4. **Order Summary** - Subtotal, shipping, tax, total
5. **Shipping** - Overdue warning, Create Label button, manual tracking input
6. **Gift Message** - If `order.giftMessage` exists
7. **Buyer's Note** - If `order.buyerNote` exists
8. **Internal Notes** - Add/view internal notes (stored in `order.notes[]`)
9. **Tags** - Add/remove tags (stored in `order.tags[]`)
10. **History** - Timeline of order events (from `order.history[]`)
11. **Actions** - Flag Issue, Archive buttons

**State connections:**
```typescript
// Opening drawer (in KanbanBoard):
const handleCardClick = (orderId: string) => {
  openOrderDrawer(orderId);
};

// In OrderDetailDrawer:
const { selectedOrderId, isOrderDrawerOpen, closeOrderDrawer } = useOrderStore();
const order = orders.find(o => o.id === selectedOrderId);
```

### 4. Shipping Modal

| Feature | Component | File |
|---------|-----------|------|
| Shipping label creation | `ShippingModal` | `src/components/shipping/ShippingModal.tsx` |
| Open trigger | "Create Label" button | `OrderCard.tsx` or `OrderDetailDrawer.tsx` |

**Modal sections:**
1. **FROM address** - Seller's default address (hardcoded for now)
2. **TO address** - Customer shipping address from order
3. **Package presets** - Small/Medium/Large Box, Flat Envelope
4. **Custom dimensions** - Length/Width/Height/Weight inputs
5. **Shipping rates** - Mock rates from USPS/UPS/FedEx
6. **Additional options** - Signature confirmation, Insurance checkboxes
7. **Footer** - Total, Cancel, Purchase Label buttons

**State connections:**
```typescript
// Opening modal:
openShippingModal(orderId);

// In ShippingModal:
const { shippingOrderId, isShippingModalOpen, closeShippingModal } = useOrderStore();
```

### 5. Customer List

| Feature | Component | File |
|---------|-----------|------|
| Customer table/cards | `CustomerList` | `src/components/customer/CustomerList.tsx` |
| Search | Search input in component | `CustomerList.tsx:40-60` |
| Filters | Filter chip buttons | `CustomerList.tsx:70-100` |
| Sorting | Sort dropdown | `CustomerList.tsx:100-130` |

**Filter options:**
- All Customers
- Repeat Customers (`customer.isRepeatCustomer === true`)
- Spent $50+ (`customer.totalSpent >= 50`)
- Spent $100+ (`customer.totalSpent >= 100`)
- Spent $200+ (`customer.totalSpent >= 200`)
- VIP ($500+) (`customer.tier === 'vip'`)
- Flagged (`customer.flags.length > 0`)

**Sort options:**
- Last Order (date descending)
- Total Spent (amount descending)
- Order Count (count descending)
- Name (alphabetical)

**Customer card displays:**
- Name with repeat customer icon
- Email
- Order count + last order date
- Total spent
- Tier badge (VIP/Gold/Silver/Bronze)
- Flag badges (e.g., "Delivery Dispute")
- Average rating

### 6. Analytics Dashboard

| Feature | Component | File |
|---------|-----------|------|
| Dashboard view | `Dashboard` | `src/components/analytics/Dashboard.tsx` |
| Stat cards | `StatCard` component | `Dashboard.tsx:66-87` |
| Pipeline bars | `PipelineBar` component | `Dashboard.tsx:95-113` |

**Stats calculated:**
- Orders Today
- Revenue Today
- Shipped Today
- Overdue Orders
- This Week (orders + revenue)
- This Month (orders + revenue)
- Average Order Value
- Repeat Customer Rate

**Dashboard sections:**
1. **Today's Stats** - 4 stat cards
2. **Secondary Stats** - 3 stat cards (week/month/AOV)
3. **Pipeline Overview** - Horizontal bars showing orders by stage
4. **Top Customers** - Top 5 by total spent
5. **Quick Actions** - New Orders, Ready to Ship, Needs Attention, Sync

---

## Type System

**File:** `src/types/index.ts`

### Core Types

```typescript
interface Order {
  id: string;
  etsyOrderId: string;
  etsyReceiptId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  pipelineStage: PipelineStageId;
  etsyStatus: EtsyOrderStatus;
  orderDate: string;
  shipByDate: string;
  isShipped: boolean;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingStatus?: TrackingStatus;
  isGift: boolean;
  giftMessage?: string;
  buyerNote?: string;
  notes: OrderNote[];
  tags: string[];
  history: OrderHistoryEvent[];
}

interface Customer {
  id: string;
  etsyUserId: string;
  name: string;
  email: string;
  shippingAddress: Address;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  isRepeatCustomer: boolean;
  tier: CustomerTier; // 'vip' | 'gold' | 'silver' | 'bronze' | 'new'
  flags: CustomerFlag[];
  notes: string[];
  averageRating?: number;
  reviewCount?: number;
}
```

### Helper Functions

```typescript
// Get customer tier based on spend
getCustomerTier(totalSpent: number): CustomerTier

// Check if order is overdue
isOrderOverdue(order: Order): boolean

// Get days until ship-by date (negative if overdue)
getDaysUntilShipBy(order: Order): number
```

---

## Mock Data

**File:** `src/services/mockData.ts`

Contains:
- `MOCK_CUSTOMERS` - 8 customers with varying tiers and flags
- `MOCK_ORDERS` - 12 orders across all pipeline stages
- `getCustomerById(id)` - Helper to fetch customer
- `getOrdersByStage(stage)` - Helper to filter orders

---

## File Structure

```
/Users/rhu/etsy_crm_claude/
├── src/
│   ├── App.tsx                           # Main layout + view routing
│   ├── main.tsx                          # React entry point
│   ├── index.css                         # Tailwind imports
│   │
│   ├── types/
│   │   └── index.ts                      # ⭐ All TypeScript interfaces
│   │
│   ├── stores/
│   │   └── orderStore.ts                 # ⭐ Zustand state management
│   │
│   ├── services/
│   │   └── mockData.ts                   # ⭐ Mock orders & customers
│   │
│   └── components/
│       ├── kanban/
│       │   └── KanbanBoard.tsx           # ⭐ Order pipeline with DnD
│       │
│       ├── order/
│       │   ├── OrderCard.tsx             # ⭐ Card in kanban columns
│       │   └── OrderDetailDrawer.tsx     # ⭐ Slide-out order details
│       │
│       ├── shipping/
│       │   └── ShippingModal.tsx         # ⭐ Create shipping label
│       │
│       ├── customer/
│       │   └── CustomerList.tsx          # ⭐ Customer management view
│       │
│       ├── analytics/
│       │   └── Dashboard.tsx             # ⭐ Analytics dashboard
│       │
│       ├── sidebar/
│       │   ├── IconSidebar.tsx           # Left nav (view switching)
│       │   └── ProjectSidebar.tsx        # Project list sidebar
│       │
│       └── header/
│           ├── Header.tsx                # Top bar with search
│           └── ProjectHeader.tsx         # Project tabs + progress
│
├── package.json                          # Dependencies
├── ETSY_CRM_FEATURE_SPEC.md             # Full feature specification
├── ETSY_CRM_USER_STORIES.md             # User stories
└── Etsy_CRM_Design_Document.md          # API integration specs
```

---

## Dependencies

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@tanstack/react-query": "^5.x",
  "date-fns": "^4.x",
  "react": "^18.x",
  "zustand": "^5.x"
}
```

---

## How to Extend

### To add a new pipeline stage:
1. Add to `DEFAULT_PIPELINE_STAGES` in `src/types/index.ts`
2. Add to `PipelineStageId` type union
3. Columns will auto-render in `KanbanBoard`

### To add fields to Order:
1. Update `Order` interface in `src/types/index.ts`
2. Add mock data in `src/services/mockData.ts`
3. Display in `OrderCard.tsx` and/or `OrderDetailDrawer.tsx`

### To add customer filters:
1. Add filter logic in `CustomerList.tsx` `getFilteredCustomers()`
2. Add filter button in the filter chips section

### To connect real Etsy API:
1. Create backend (no backend exists yet)
2. Replace mock data in `orderStore.ts` with API calls
3. Add `@tanstack/react-query` for data fetching
4. See `Etsy_CRM_Design_Document.md` for API specs

### To connect real Shippo API:
1. Create backend endpoint for label creation
2. Update `ShippingModal.tsx` to call backend
3. Store tracking number via `updateOrderTracking()` action
4. See `Etsy_CRM_Design_Document.md` for Shippo integration

---

## State Flow Examples

### Opening an order detail:
```
User clicks OrderCard
  → KanbanBoard.handleCardClick(orderId)
    → openOrderDrawer(orderId)          // store action
      → selectedOrderId = orderId
      → isOrderDrawerOpen = true
        → OrderDetailDrawer renders with order data
```

### Creating a shipping label:
```
User clicks "Create Label" on OrderCard
  → OrderCard.handleCreateLabel(e)
    → e.stopPropagation()               // prevent drawer open
    → openShippingModal(orderId)        // store action
      → shippingOrderId = orderId
      → isShippingModalOpen = true
        → ShippingModal renders
          → User selects options, clicks "Purchase Label"
            → updateOrderTracking(orderId, carrier, trackingNumber)
            → closeShippingModal()
```

### Moving an order (drag-and-drop):
```
User drags OrderCard to new column
  → KanbanBoard.handleDragEnd(event)
    → moveOrder(orderId, newStageId)    // store action
      → order.pipelineStage = newStageId
      → order.history.push({ type: 'stage_change', ... })
```

---

## NOT Built Yet (Backend Required)

- [ ] Etsy OAuth authentication
- [ ] Etsy API order sync
- [ ] Real shipping label purchase (Shippo)
- [ ] Tracking auto-submission to Etsy
- [ ] Database persistence
- [ ] Multi-user support
- [ ] Real-time updates (WebSocket)

---

## Common Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

---

*Last updated: December 2024*
