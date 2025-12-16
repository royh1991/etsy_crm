# Etsy CRM Follow-up: Product Manager & UX Analysis

This document provides a comprehensive analysis of the Etsy CRM application from both Product Manager and UX Designer perspectives, with specific recommendations for improvements.

---

## Part 1: Product Manager Analysis

### User Persona: Etsy Shop Owner

**Primary Users:**
- Solo Etsy sellers managing 10-100+ orders/month
- Small teams (2-5 people) with a shop owner + assistants
- Handmade/vintage sellers who need to track custom orders
- Digital product sellers with different fulfillment needs

**Key Pain Points:**
1. Etsy's native interface doesn't provide a pipeline view
2. No way to track customer lifetime value natively
3. Difficult to identify VIP customers vs problem customers
4. Shipping label creation requires multiple clicks
5. No internal notes system for orders
6. Hard to see "at a glance" what needs attention today

---

### Feature Gap Analysis

#### Currently Implemented (MVP)

| Feature | Component | Status |
|---------|-----------|--------|
| Order Pipeline (Kanban) | `src/components/kanban/KanbanBoard.tsx` | Complete |
| Order Detail Drawer | `src/components/order/OrderDetailDrawer.tsx` | Complete |
| Shipping Label Modal | `src/components/shipping/ShippingModal.tsx` | Complete |
| Customer List + Filters | `src/components/customer/CustomerList.tsx` | Complete |
| Customer Detail Drawer | `src/components/customer/CustomerDetailDrawer.tsx` | Complete |
| Dashboard Analytics | `src/components/analytics/Dashboard.tsx` | Complete |
| Order Cards with Badges | `src/components/order/OrderCard.tsx` | Complete |
| Customer Tier System | `src/types/index.ts:290-308` | Complete |

#### Missing High-Priority Features

##### 1. Batch Operations
**User Story:** "As an Etsy shop owner, I want to select multiple orders and perform bulk actions (print labels, move stage, add tag) so I can process orders faster."

**Implementation Location:** `src/components/kanban/KanbanBoard.tsx`
- Add checkbox selection to `OrderCard.tsx`
- Add floating action bar when items selected
- Bulk actions: Move to Stage, Print Labels, Add Tag, Export

##### 2. Etsy API Integration
**User Story:** "As an Etsy shop owner, I want my orders to automatically sync from Etsy so I don't have to manually enter data."

**Implementation Location:** New service `src/services/etsyApi.ts`
- OAuth 2.0 flow for Etsy authentication
- Webhook receiver for new order notifications
- Periodic sync for order status updates
- Real-time inventory sync

##### 3. Saved Views / Filters
**User Story:** "As an Etsy shop owner, I want to save custom filter combinations (e.g., 'Overdue VIP Orders') so I can quickly access them."

**Implementation Location:** `src/stores/orderStore.ts`
- Add `savedFilters` state
- Filter presets in `KanbanBoard.tsx` toolbar
- Quick filter dropdown in header

##### 4. Keyboard Shortcuts
**User Story:** "As a power user, I want keyboard shortcuts to navigate and perform common actions quickly."

**Priority Shortcuts:**
- `N` - New order (manual entry)
- `S` - Focus search
- `1-6` - Switch pipeline columns
- `Arrow keys` - Navigate cards
- `Enter` - Open selected order
- `L` - Create label (when order open)
- `Esc` - Close drawer/modal

##### 5. Print Packing Slips
**User Story:** "As an Etsy shop owner, I want to print packing slips for orders so I can include them in packages."

**Implementation Location:** New component `src/components/order/PackingSlip.tsx`
- Packing slip template with order details
- Gift message display (when applicable)
- Batch print multiple slips

##### 6. Team Collaboration
**User Story:** "As a shop owner with employees, I want to assign orders to team members and see who's working on what."

**Implementation:**
- Add `assignedTo` field in `Order` type (`src/types/index.ts:53`)
- Team member avatars on order cards
- Filter by assignee
- Activity log showing who did what

##### 7. Inventory Tracking
**User Story:** "As an Etsy shop owner, I want to see which items are running low so I can restock before running out."

**Implementation Location:** New components
- `src/components/inventory/InventoryList.tsx`
- `src/components/inventory/LowStockAlert.tsx`
- Link SKUs to inventory counts

##### 8. Communication Templates
**User Story:** "As an Etsy shop owner, I want saved message templates for common situations (shipping delay, thank you, custom order follow-up)."

**Implementation:**
- Template management in Settings
- Quick-insert in order drawer
- Variable substitution ({customer_name}, {order_number}, etc.)

##### 9. Order Timeline / Activity Feed
**User Story:** "As an Etsy shop owner, I want to see a timeline of all activity on an order including Etsy messages."

**Current:** Basic history in `OrderDetailDrawer.tsx:1480-1487`
**Enhancement:**
- Pull Etsy conversations into timeline
- Show tracking status updates
- Display customer reviews when received

##### 10. Smart Notifications
**User Story:** "As an Etsy shop owner, I want to be notified about important events (overdue orders, VIP orders, issues) without having to constantly check."

**Implementation:**
- Browser notifications for new orders
- Daily digest email option
- Urgent alerts for overdue VIP orders
- Desktop app notifications (if using Electron)

---

### Feature Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Etsy API Integration | High | Critical |
| P0 | Batch Operations | Medium | High |
| P1 | Keyboard Shortcuts | Low | Medium |
| P1 | Print Packing Slips | Low | High |
| P1 | Saved Views/Filters | Medium | Medium |
| P2 | Team Collaboration | High | Medium |
| P2 | Communication Templates | Medium | Medium |
| P2 | Inventory Tracking | High | Medium |
| P3 | Smart Notifications | Medium | Low |

---

## Part 2: UX Designer Analysis

### Visual Audit Summary

After reviewing all views via Playwright screenshots, here are the critical UX issues and recommendations:

---

### Issue 1: Order Cards - Information Density Too High

**Location:** `src/components/order/OrderCard.tsx`

**Current State:**
- Cards show: order number, customer name, location, product title, price, overdue status, tier badge, tags, action buttons
- Everything competes for attention
- Hard to scan quickly

**Recommendations:**

```
BEFORE (current card):
┌─────────────────────────────────┐
│ #591035                         │
│ Emily Rodriguez ↗️ [12x icon]    │
│ Austin, TX                      │
│ Custom Name Necklace - Sterling │
│ $53.55    363 days overdue 🎁   │
│ [VIP] [Gift Order] [Custom]     │
│ [Create Label] [💬]             │
└─────────────────────────────────┘

AFTER (recommended):
┌─────────────────────────────────┐
│ [VIP] Emily Rodriguez      $53.55│
│ Custom Name Necklace...         │
│ ⚠️ 363 days overdue  [Ship →]   │
└─────────────────────────────────┘
```

**Specific Changes:**
1. Remove order number from main view (show on hover/drawer)
2. Remove city/state (available in drawer)
3. Condense tier badge + name to single line
4. Move secondary tags to hover tooltip
5. Single primary action button ("Ship" not "Create Label")
6. Use color coding instead of text for urgency (red border for overdue)

**Code Change Location:** `src/components/order/OrderCard.tsx:85-200`

---

### Issue 2: Pipeline Columns - Header Clutter

**Location:** `src/components/kanban/KanbanBoard.tsx:180-230`

**Current State:**
- Drag handle icon (6 dots) on each column header
- Emoji + "Double-click to rename" tooltip
- Count badge
- Takes up vertical space

**Recommendations:**
1. Remove drag handles (columns shouldn't be reorderable in a fixed pipeline)
2. Remove "double-click to rename" - stages are fixed for Etsy workflow
3. Make count badge more prominent
4. Add column-level actions: "Select All", "Ship All Ready"

**Mockup:**
```
┌─ 📦 Ready to Ship (2) ─────────────┐
│ [□ Select All]  [🚚 Ship All]      │
├────────────────────────────────────┤
│ [Order Card]                       │
│ [Order Card]                       │
└────────────────────────────────────┘
```

---

### Issue 3: Dashboard - Data Without Context

**Location:** `src/components/analytics/Dashboard.tsx`

**Current State:**
- "Orders Today: 0" - no historical comparison
- "Revenue Today: $0.00" - no goal or average
- Stats feel empty/useless with low numbers

**Recommendations:**

1. **Add Comparisons:**
   - "Orders Today: 0 (avg: 3.2/day)"
   - "Revenue: $0 vs $127 this time last week"

2. **Add Sparklines:**
   - Mini 7-day trend chart next to each metric

3. **Smart Empty States:**
   - When 0 orders today: "No orders yet today. Yesterday you had 5 orders by this time."

4. **Goal Tracking:**
   - "Monthly Revenue: $2,340 / $5,000 goal (47%)"

5. **Actionable Insights:**
   - "3 orders are overdue - [View Now]"
   - "2 VIP customers haven't ordered in 30+ days - [Send Follow-up]"

**Code Change Location:** `src/components/analytics/Dashboard.tsx:45-150`

---

### Issue 4: Customer List - Missing Quick Actions

**Location:** `src/components/customer/CustomerList.tsx`

**Current State:**
- Click customer → opens drawer
- No quick actions from list view
- Can't email multiple customers at once

**Recommendations:**

1. **Hover Actions:**
   ```
   Emily Rodriguez ↗️                    $623.00
   emily.rod@outlook.com                 [VIP]
   12 orders  Last: Dec 11, 2024
                            [📧 Email] [📋 View Orders]
   ```

2. **Bulk Selection:**
   - Checkbox on each row
   - "Email Selected (3)" action
   - "Export Selected" action

3. **Inline Customer Health:**
   - Show last 3 order statuses as dots: 🟢🟢🟡
   - Quick indicator if any open issues

**Code Change Location:** `src/components/customer/CustomerList.tsx:100-200`

---

### Issue 5: Search - Not Prominent Enough

**Location:** `src/components/header/Header.tsx`

**Current State:**
- Small search box in header
- Only searches within current view
- No keyboard shortcut indicator

**Recommendations:**

1. **Global Command Palette (Cmd+K):**
   - Search orders, customers, actions all in one
   - "Go to order #591035"
   - "Find customer Emily"
   - "Show overdue orders"

2. **Search Suggestions:**
   - Recent searches
   - Smart suggestions: "orders shipping today", "VIP customers"

3. **Visual Enhancement:**
   - Larger search bar on focus
   - Show keyboard shortcut hint: "⌘K to search"

**New Component:** `src/components/common/CommandPalette.tsx`

---

### Issue 6: Mobile Experience - Pipeline Unusable

**Location:** `src/components/kanban/KanbanBoard.tsx`

**Observed via Screenshot:** `analysis-9-mobile-pipeline.png`

**Current State:**
- Horizontal scroll through 6 columns
- Cards are cut off
- Hard to drag-drop on touch
- Sidebar overlaps content

**Recommendations:**

1. **Mobile-First View:**
   - Single column view with stage filter tabs
   - Swipe gestures to change stages
   - Bottom sheet for order details (not side drawer)

2. **Stage Tabs:**
   ```
   [New (3)] [Processing (2)] [Ready (2)] [Shipped (2)] [Done (2)]
   ─────────────────────────────────────────────────────────────
   [Order Card - Full Width]
   [Order Card - Full Width]
   [Order Card - Full Width]
   ```

3. **Quick Actions:**
   - Swipe left on card: Move to next stage
   - Swipe right on card: Open detail
   - Long press: Multi-select mode

**Code Change Location:**
- `src/components/kanban/KanbanBoard.tsx` - Add mobile detection
- New component: `src/components/kanban/MobileOrderList.tsx`

---

### Issue 7: Shipping Modal - Too Many Steps

**Location:** `src/components/shipping/ShippingModal.tsx`

**Current State:**
- Must select package size
- Must select carrier
- Must click "Purchase Label"
- Three separate decision points

**Recommendations:**

1. **Smart Defaults:**
   - Remember last package size per product SKU
   - Pre-select cheapest rate matching ship-by date
   - One-click "Ship with USPS First Class - $4.50"

2. **Package Memory:**
   - "You usually ship this item in 'Small Box'"
   - Auto-select based on order history

3. **Batch Label Creation:**
   - "Create labels for all 2 Ready to Ship orders"
   - Single confirmation, multiple labels

**Code Change Location:** `src/components/shipping/ShippingModal.tsx:50-200`

---

### Issue 8: Navigation - Settings Has No Content

**Location:** `src/components/sidebar/IconSidebar.tsx`

**Current State:**
- Settings icon in sidebar
- Profile dropdown has "Settings" option
- Neither goes anywhere

**Recommendations:**

Create Settings page with sections:
1. **Shop Profile** - Name, logo, return address
2. **Shipping Defaults** - Default package sizes, carrier preferences
3. **Notifications** - Email/push notification preferences
4. **Team** - Invite team members, manage roles
5. **Integrations** - Etsy connection, shipping carriers
6. **Billing** - Subscription status (if applicable)

**New Component:** `src/components/settings/SettingsPage.tsx`

---

### Issue 9: Order Detail Drawer - Information Hierarchy

**Location:** `src/components/order/OrderDetailDrawer.tsx`

**Current State:**
- Long scrolling drawer
- All sections same visual weight
- Shipping section buried below items

**Recommendations:**

1. **Priority Reorder:**
   ```
   1. Status + Primary Action (Ship / Mark Delivered)
   2. Shipping Address (collapsible if already shipped)
   3. Items (collapsible after shipped)
   4. Order Summary
   5. Notes & History (tabbed)
   ```

2. **Sticky Action Bar:**
   - Keep primary action visible at bottom of drawer
   - "Create Shipping Label" or "Mark as Delivered"

3. **Collapsible Sections:**
   - Auto-collapse shipped orders' address/items
   - Expand notes/history for shipped orders

**Code Change Location:** `src/components/order/OrderDetailDrawer.tsx:1370-1490`

---

### Issue 10: Empty States - No Guidance

**Current State:**
- No empty state designs for:
  - Zero orders in a pipeline stage
  - No search results
  - No customers matching filter
  - First-time user experience

**Recommendations:**

1. **Empty Pipeline Column:**
   ```
   ┌─────────────────────────┐
   │                         │
   │    📦 No orders here    │
   │                         │
   │  Orders move here when  │
   │  they're ready to ship  │
   │                         │
   └─────────────────────────┘
   ```

2. **First-Time User:**
   - Onboarding checklist
   - "Connect your Etsy shop to get started"
   - Sample data toggle for exploration

3. **No Search Results:**
   - Suggestions for broader search
   - "Try searching by order number or customer name"

**New Component:** `src/components/common/EmptyState.tsx`

---

## Part 3: Technical Debt & Code Quality

### Files to Delete (Deprecated)
- `src/components/sidebar/ProjectSidebar.tsx` - No longer used
- `src/components/header/ProjectHeader.tsx` - No longer used
- `src/components/kanban/TaskCard.tsx` - Replaced by OrderCard

### Code Improvements Needed

1. **Type Safety:**
   - `src/stores/orderStore.ts` - Add proper TypeScript generics for Zustand
   - Several `any` types should be properly typed

2. **Component Size:**
   - `OrderDetailDrawer.tsx` (500+ lines) - Split into subcomponents
   - `KanbanBoard.tsx` (400+ lines) - Extract column component

3. **Performance:**
   - Add `React.memo` to `OrderCard.tsx`
   - Add virtualization for large customer lists
   - Implement proper loading states

4. **Accessibility:**
   - Add ARIA labels to icon buttons
   - Keyboard navigation for pipeline
   - Screen reader support for drag-drop

---

## Part 4: Implementation Roadmap

### Phase 1: Polish MVP (1-2 weeks)
- [ ] Fix mobile responsiveness (`KanbanBoard.tsx`)
- [ ] Add empty states (`EmptyState.tsx`)
- [ ] Improve card information density (`OrderCard.tsx`)
- [ ] Add keyboard shortcuts
- [ ] Delete deprecated files

### Phase 2: Core Features (2-4 weeks)
- [ ] Etsy API integration (`etsyApi.ts`)
- [ ] Batch operations (select, bulk move, bulk ship)
- [ ] Print packing slips
- [ ] Settings page

### Phase 3: Power Features (4-6 weeks)
- [ ] Command palette search
- [ ] Saved views/filters
- [ ] Communication templates
- [ ] Team collaboration

### Phase 4: Advanced (6-8 weeks)
- [ ] Inventory tracking
- [ ] Smart notifications
- [ ] Analytics enhancements
- [ ] Mobile app (React Native)

---

## Part 5: Backend Implementation

### Current State: No Backend

The application is currently a **frontend-only prototype**:

| Layer | Current State | What's Needed |
|-------|---------------|---------------|
| Database | None | PostgreSQL |
| API Server | None | Node.js (Express/Fastify) or Python (FastAPI) |
| ORM | None | Prisma or Drizzle |
| Authentication | None | JWT + Etsy OAuth |
| Data | Hardcoded in `src/services/mockData.ts` | Real database |
| State | Zustand (in-memory, lost on refresh) | Server-persisted |

---

### Database Schema (PostgreSQL)

#### Core Tables

```sql
-- ============================================
-- SHOPS (Multi-tenant support)
-- ============================================
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etsy_shop_id BIGINT UNIQUE NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,

    -- Etsy OAuth tokens
    etsy_access_token TEXT,
    etsy_refresh_token TEXT,
    etsy_token_expires_at TIMESTAMP WITH TIME ZONE,

    -- Shop settings
    default_return_address JSONB,
    shipping_preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- USERS (Team members)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- NULL if OAuth-only
    role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member'
    avatar_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(shop_id, email)
);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    etsy_buyer_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),

    -- CRM Metrics (denormalized for performance)
    order_count INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    first_order_date TIMESTAMP WITH TIME ZONE,
    last_order_date TIMESTAMP WITH TIME ZONE,

    -- Calculated tier: 'new', 'regular', 'bronze', 'silver', 'gold', 'vip'
    tier VARCHAR(20) DEFAULT 'new',
    is_repeat_customer BOOLEAN DEFAULT FALSE,

    -- Reviews
    average_rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,

    -- Flags
    is_flagged BOOLEAN DEFAULT FALSE,

    -- Internal notes
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(shop_id, etsy_buyer_id)
);

CREATE INDEX idx_customers_shop_tier ON customers(shop_id, tier);
CREATE INDEX idx_customers_shop_flagged ON customers(shop_id, is_flagged);
CREATE INDEX idx_customers_last_order ON customers(shop_id, last_order_date DESC);

-- ============================================
-- CUSTOMER FLAGS
-- ============================================
CREATE TABLE customer_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

    flag_type VARCHAR(50) NOT NULL, -- 'delivery_dispute', 'refund_requester', etc.
    reason TEXT,
    created_by UUID REFERENCES users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),

    -- Etsy identifiers
    etsy_receipt_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL, -- Display number like "#591035"

    -- Pipeline stage
    pipeline_stage VARCHAR(30) DEFAULT 'new',
    -- Values: 'new', 'processing', 'ready-to-ship', 'shipped', 'delivered', 'needs-attention'

    -- Customer info (denormalized for display)
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255),

    -- Shipping address (JSONB for flexibility)
    shipping_address JSONB NOT NULL,

    -- Financials
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'USD',

    -- Dates
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ship_by_date TIMESTAMP WITH TIME ZONE,
    shipped_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,

    -- Status
    etsy_status VARCHAR(30), -- 'open', 'paid', 'completed', 'canceled'
    is_paid BOOLEAN DEFAULT FALSE,
    is_shipped BOOLEAN DEFAULT FALSE,

    -- Shipping tracking
    tracking_number VARCHAR(100),
    carrier_name VARCHAR(50),
    label_url TEXT,
    tracking_status VARCHAR(30), -- 'pending', 'in_transit', 'delivered', etc.

    -- Gift
    is_gift BOOLEAN DEFAULT FALSE,
    gift_message TEXT,

    -- Buyer's note from Etsy
    buyer_note TEXT,

    -- Issue tracking
    has_issue BOOLEAN DEFAULT FALSE,
    issue_type VARCHAR(50),

    -- Tags (array)
    tags TEXT[] DEFAULT '{}',

    -- Assignment
    assigned_to UUID REFERENCES users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(shop_id, etsy_receipt_id)
);

CREATE INDEX idx_orders_shop_stage ON orders(shop_id, pipeline_stage);
CREATE INDEX idx_orders_shop_date ON orders(shop_id, order_date DESC);
CREATE INDEX idx_orders_ship_by ON orders(shop_id, ship_by_date) WHERE is_shipped = FALSE;
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_assigned ON orders(assigned_to) WHERE assigned_to IS NOT NULL;

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    etsy_listing_id BIGINT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    sku VARCHAR(100),

    -- Variations as JSONB array: [{"name": "Color", "value": "Blue"}]
    variations JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- ORDER NOTES (Internal notes by team)
-- ============================================
CREATE TABLE order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    content TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_notes_order ON order_notes(order_id);

-- ============================================
-- ORDER HISTORY (Activity log)
-- ============================================
CREATE TABLE order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL if system-generated

    event_type VARCHAR(50) NOT NULL,
    -- Values: 'created', 'stage_changed', 'shipped', 'note_added', 'label_created', 'delivered', 'assigned'

    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Additional context

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_history(order_id);

-- ============================================
-- SAVED FILTERS
-- ============================================
CREATE TABLE saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL if shared with team

    name VARCHAR(100) NOT NULL,
    filter_config JSONB NOT NULL, -- The filter criteria
    is_shared BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGE TEMPLATES
-- ============================================
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    category VARCHAR(50), -- 'shipping', 'thank_you', 'issue', 'custom'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SHIPPING LABELS (Purchased labels history)
-- ============================================
CREATE TABLE shipping_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    carrier VARCHAR(50) NOT NULL,
    service VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    label_url TEXT NOT NULL,

    package_weight DECIMAL(6, 2),
    package_dimensions JSONB, -- {length, width, height}

    cost DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SYNC LOG (Etsy sync history)
-- ============================================
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,

    sync_type VARCHAR(50) NOT NULL, -- 'orders', 'receipts', 'reviews'
    status VARCHAR(20) NOT NULL, -- 'started', 'completed', 'failed'

    orders_synced INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',

    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

#### Database Diagram (ASCII)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   shops     │       │    users    │       │  customers  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ shop_id(FK) │       │ id (PK)     │
│ etsy_shop_id│       │ id (PK)     │       │ shop_id(FK) │──►┐
│ shop_name   │       │ email       │       │ etsy_buyer_id   │
│ oauth_tokens│       │ role        │       │ tier        │   │
└─────────────┘       └─────────────┘       │ order_count │   │
       │                     │              └─────────────┘   │
       │                     │                    ▲           │
       ▼                     ▼                    │           │
┌─────────────────────────────────────────────────┴───────────┘
│                         orders                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)              │ customer_id (FK)                     │
│ shop_id (FK)         │ assigned_to (FK) ──► users           │
│ etsy_receipt_id      │ pipeline_stage                       │
│ shipping_address     │ tracking_number                      │
│ total_amount         │ tags[]                               │
└─────────────────────────────────────────────────────────────┘
       │                     │                    │
       ▼                     ▼                    ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ order_items │       │ order_notes │       │order_history│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ order_id(FK)│       │ order_id(FK)│       │ order_id(FK)│
│ title       │       │ user_id(FK) │       │ event_type  │
│ quantity    │       │ content     │       │ description │
│ price       │       └─────────────┘       └─────────────┘
└─────────────┘
```

---

### API Design (REST)

#### Authentication Endpoints

```
POST   /api/auth/login              # Email/password login
POST   /api/auth/register           # New shop registration
POST   /api/auth/etsy/connect       # Start Etsy OAuth flow
GET    /api/auth/etsy/callback      # Etsy OAuth callback
POST   /api/auth/refresh            # Refresh JWT token
POST   /api/auth/logout             # Invalidate session
GET    /api/auth/me                 # Get current user
```

#### Shop Endpoints

```
GET    /api/shop                    # Get shop details
PUT    /api/shop                    # Update shop settings
GET    /api/shop/team               # List team members
POST   /api/shop/team/invite        # Invite team member
DELETE /api/shop/team/:userId       # Remove team member
```

#### Order Endpoints

```
GET    /api/orders                  # List orders (with filters)
GET    /api/orders/:id              # Get single order
PUT    /api/orders/:id              # Update order (stage, tags, etc.)
PUT    /api/orders/:id/stage        # Move to different stage
POST   /api/orders/:id/notes        # Add internal note
POST   /api/orders/:id/ship         # Create shipping label
PUT    /api/orders/:id/tracking     # Manual tracking entry
POST   /api/orders/:id/flag         # Flag order with issue

# Batch operations
POST   /api/orders/batch/stage      # Move multiple orders
POST   /api/orders/batch/ship       # Create multiple labels
POST   /api/orders/batch/tag        # Add tag to multiple
```

#### Customer Endpoints

```
GET    /api/customers               # List customers (with filters)
GET    /api/customers/:id           # Get customer detail
PUT    /api/customers/:id           # Update customer notes
POST   /api/customers/:id/flags     # Add customer flag
DELETE /api/customers/:id/flags/:flagId  # Remove flag
GET    /api/customers/:id/orders    # Get customer's orders
```

#### Sync Endpoints

```
POST   /api/sync/orders             # Trigger manual order sync
GET    /api/sync/status             # Get last sync status
GET    /api/sync/logs               # Sync history
```

#### Analytics Endpoints

```
GET    /api/analytics/dashboard     # Dashboard stats
GET    /api/analytics/revenue       # Revenue over time
GET    /api/analytics/pipeline      # Orders by stage
GET    /api/analytics/customers     # Customer metrics
```

#### Settings Endpoints

```
GET    /api/settings/templates      # List message templates
POST   /api/settings/templates      # Create template
PUT    /api/settings/templates/:id  # Update template
DELETE /api/settings/templates/:id  # Delete template

GET    /api/settings/filters        # Saved filters
POST   /api/settings/filters        # Save filter
DELETE /api/settings/filters/:id    # Delete filter
```

---

### Etsy API Integration

#### OAuth 2.0 Flow

```typescript
// File: server/src/services/etsyAuth.ts

const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect';
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';

interface EtsyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

// Step 1: Generate auth URL
export function getEtsyAuthUrl(state: string, codeVerifier: string): string {
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ETSY_CLIENT_ID!,
    redirect_uri: process.env.ETSY_REDIRECT_URI!,
    scope: 'transactions_r transactions_w shops_r shops_w',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${ETSY_AUTH_URL}?${params}`;
}

// Step 2: Exchange code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<EtsyTokenResponse> {
  const response = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_CLIENT_ID!,
      redirect_uri: process.env.ETSY_REDIRECT_URI!,
      code,
      code_verifier: codeVerifier,
    }),
  });

  return response.json();
}

// Step 3: Refresh expired tokens
export async function refreshAccessToken(
  refreshToken: string
): Promise<EtsyTokenResponse> {
  const response = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_CLIENT_ID!,
      refresh_token: refreshToken,
    }),
  });

  return response.json();
}
```

#### Etsy API Endpoints Used

```typescript
// File: server/src/services/etsyApi.ts

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

export class EtsyApiClient {
  constructor(private accessToken: string, private shopId: number) {}

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${ETSY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'x-api-key': process.env.ETSY_CLIENT_ID!,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new EtsyApiError(response.status, await response.text());
    }

    return response.json();
  }

  // Get shop receipts (orders)
  async getReceipts(params: {
    min_created?: number;
    max_created?: number;
    was_shipped?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any);
    return this.request(`/application/shops/${this.shopId}/receipts?${query}`);
  }

  // Get single receipt
  async getReceipt(receiptId: number) {
    return this.request(`/application/shops/${this.shopId}/receipts/${receiptId}`);
  }

  // Get receipt transactions (line items)
  async getReceiptTransactions(receiptId: number) {
    return this.request(`/application/shops/${this.shopId}/receipts/${receiptId}/transactions`);
  }

  // Update receipt (mark shipped, add tracking)
  async updateReceipt(receiptId: number, data: {
    was_shipped?: boolean;
    tracking_code?: string;
    carrier_name?: string;
  }) {
    return this.request(`/application/shops/${this.shopId}/receipts/${receiptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Get shop reviews
  async getReviews(limit = 25) {
    return this.request(`/application/shops/${this.shopId}/reviews?limit=${limit}`);
  }

  // Get buyer info
  async getBuyer(buyerId: number) {
    return this.request(`/application/users/${buyerId}`);
  }
}
```

#### Order Sync Service

```typescript
// File: server/src/services/orderSync.ts

export class OrderSyncService {
  constructor(
    private db: Database,
    private etsyClient: EtsyApiClient
  ) {}

  async syncOrders(shopId: string, since?: Date): Promise<SyncResult> {
    const syncLog = await this.db.syncLogs.create({
      shop_id: shopId,
      sync_type: 'orders',
      status: 'started',
    });

    try {
      const receipts = await this.etsyClient.getReceipts({
        min_created: since ? Math.floor(since.getTime() / 1000) : undefined,
        limit: 100,
      });

      let synced = 0;

      for (const receipt of receipts.results) {
        await this.upsertOrder(shopId, receipt);
        synced++;
      }

      await this.db.syncLogs.update(syncLog.id, {
        status: 'completed',
        orders_synced: synced,
        completed_at: new Date(),
      });

      return { success: true, synced };

    } catch (error) {
      await this.db.syncLogs.update(syncLog.id, {
        status: 'failed',
        errors: [{ message: error.message }],
        completed_at: new Date(),
      });

      throw error;
    }
  }

  private async upsertOrder(shopId: string, receipt: EtsyReceipt) {
    // Find or create customer
    const customer = await this.findOrCreateCustomer(shopId, receipt);

    // Map Etsy receipt to our order format
    const orderData = this.mapReceiptToOrder(receipt, customer.id);

    // Upsert order
    const order = await this.db.orders.upsert({
      where: { shop_id_etsy_receipt_id: { shop_id: shopId, etsy_receipt_id: receipt.receipt_id } },
      create: { shop_id: shopId, ...orderData },
      update: orderData,
    });

    // Sync order items
    await this.syncOrderItems(order.id, receipt.transactions);

    // Update customer metrics
    await this.updateCustomerMetrics(customer.id);

    return order;
  }

  private mapReceiptToOrder(receipt: EtsyReceipt, customerId: string) {
    return {
      etsy_receipt_id: receipt.receipt_id,
      order_number: `#${receipt.receipt_id}`,
      customer_id: customerId,
      buyer_name: receipt.name,
      buyer_email: receipt.buyer_email,
      shipping_address: {
        name: receipt.name,
        addressLine1: receipt.first_line,
        addressLine2: receipt.second_line,
        city: receipt.city,
        state: receipt.state,
        postalCode: receipt.zip,
        country: receipt.country_iso,
        countryCode: receipt.country_iso,
      },
      subtotal: parseFloat(receipt.subtotal.amount) / receipt.subtotal.divisor,
      shipping_cost: parseFloat(receipt.total_shipping_cost.amount) / receipt.total_shipping_cost.divisor,
      tax: parseFloat(receipt.total_tax_cost.amount) / receipt.total_tax_cost.divisor,
      total_amount: parseFloat(receipt.grandtotal.amount) / receipt.grandtotal.divisor,
      currency_code: receipt.grandtotal.currency_code,
      order_date: new Date(receipt.created_timestamp * 1000),
      etsy_status: receipt.status,
      is_paid: receipt.status === 'paid' || receipt.status === 'completed',
      is_shipped: receipt.was_shipped,
      is_gift: receipt.is_gift,
      gift_message: receipt.gift_message,
      buyer_note: receipt.message_from_buyer,
      // Determine pipeline stage
      pipeline_stage: this.determinePipelineStage(receipt),
    };
  }

  private determinePipelineStage(receipt: EtsyReceipt): PipelineStage {
    if (receipt.status === 'canceled') return 'needs-attention';
    if (receipt.was_delivered) return 'delivered';
    if (receipt.was_shipped) return 'shipped';
    if (receipt.status === 'paid') return 'new';
    return 'new';
  }
}
```

---

### Backend Technology Stack Options

#### Option A: Node.js + Prisma (Recommended)

```
server/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # SQL migrations
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express/Fastify setup
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   └── sync.ts
│   ├── services/
│   │   ├── etsyAuth.ts
│   │   ├── etsyApi.ts
│   │   ├── orderSync.ts
│   │   └── shipping.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT validation
│   │   └── shopContext.ts    # Multi-tenant context
│   └── utils/
│       └── errors.ts
├── package.json
└── tsconfig.json
```

**Dependencies:**
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "express": "^4.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "zod": "^3.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "@types/node": "^20.x"
  }
}
```

#### Option B: Python + FastAPI

```
server/
├── alembic/                  # Database migrations
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app
│   ├── config.py             # Settings
│   ├── database.py           # SQLAlchemy setup
│   ├── models/
│   │   ├── shop.py
│   │   ├── order.py
│   │   └── customer.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── orders.py
│   │   └── customers.py
│   ├── services/
│   │   ├── etsy_client.py
│   │   └── order_sync.py
│   └── schemas/              # Pydantic models
├── requirements.txt
└── pyproject.toml
```

---

### Frontend Integration Changes

#### Replace Mock Data with API Calls

```typescript
// File: src/services/api.ts (NEW)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration
        this.token = null;
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  // Orders
  getOrders(filters?: OrderFilters) {
    const params = new URLSearchParams(filters as any);
    return this.request<{ orders: Order[]; total: number }>(`/orders?${params}`);
  }

  getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  updateOrderStage(id: string, stage: PipelineStage) {
    return this.request<Order>(`/orders/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    });
  }

  addOrderNote(orderId: string, content: string) {
    return this.request<OrderNote>(`/orders/${orderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Customers
  getCustomers(filters?: CustomerFilters) {
    const params = new URLSearchParams(filters as any);
    return this.request<{ customers: Customer[]; total: number }>(`/customers?${params}`);
  }

  getCustomer(id: string) {
    return this.request<Customer>(`/customers/${id}`);
  }

  // Sync
  triggerSync() {
    return this.request<{ success: boolean }>('/sync/orders', { method: 'POST' });
  }
}

export const api = new ApiClient();
```

#### Update Zustand Store

```typescript
// File: src/stores/orderStore.ts (MODIFIED)

import { create } from 'zustand';
import { api } from '../services/api';

interface OrderStore {
  orders: Order[];
  customers: Customer[];
  isLoading: boolean;
  error: string | null;

  // API-backed actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>;
  moveOrder: (orderId: string, stage: PipelineStage) => Promise<void>;
  addNote: (orderId: string, content: string) => Promise<void>;
  syncFromEtsy: () => Promise<void>;

  // UI state (unchanged)
  activeView: 'pipeline' | 'customers' | 'analytics';
  setActiveView: (view: string) => void;
  // ... rest of UI state
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  customers: [],
  isLoading: false,
  error: null,

  fetchOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const { orders } = await api.getOrders(filters);
      set({ orders, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  moveOrder: async (orderId, stage) => {
    // Optimistic update
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, pipelineStage: stage } : o
      ),
    }));

    try {
      await api.updateOrderStage(orderId, stage);
    } catch (e) {
      // Revert on error
      get().fetchOrders();
      set({ error: e.message });
    }
  },

  syncFromEtsy: async () => {
    set({ isLoading: true });
    try {
      await api.triggerSync();
      await get().fetchOrders();
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  // ... rest
}));
```

---

### Environment Variables

```bash
# .env.example (server)

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/etsy_crm"

# Etsy API
ETSY_CLIENT_ID="your_etsy_keystring"
ETSY_CLIENT_SECRET="your_etsy_secret"  # If using confidential client
ETSY_REDIRECT_URI="http://localhost:3001/api/auth/etsy/callback"

# Auth
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Shipping APIs (optional)
SHIPPO_API_KEY=""
EASYPOST_API_KEY=""

# Server
PORT=3001
NODE_ENV=development
```

```bash
# .env.example (frontend)

VITE_API_URL="http://localhost:3001/api"
```

---

### Backend Implementation Roadmap

#### Phase 1: Foundation (Week 1)
- [ ] Set up Node.js project with TypeScript
- [ ] Configure Prisma with PostgreSQL
- [ ] Create database schema and migrations
- [ ] Basic CRUD endpoints for orders/customers
- [ ] JWT authentication (email/password)

#### Phase 2: Etsy Integration (Week 2)
- [ ] Etsy OAuth 2.0 flow
- [ ] Order sync service
- [ ] Customer sync from orders
- [ ] Webhook endpoint for new orders (if available)

#### Phase 3: Frontend Integration (Week 3)
- [ ] Create API client service
- [ ] Update Zustand store to use API
- [ ] Add loading states and error handling
- [ ] Real-time updates via polling or WebSocket

#### Phase 4: Advanced Features (Week 4+)
- [ ] Shipping label integration (Shippo/EasyPost)
- [ ] Team collaboration (invites, roles)
- [ ] Saved filters persistence
- [ ] Message templates

---

## Appendix: File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `src/App.tsx` | Main app layout, view routing | ~150 |
| `src/types/index.ts` | All TypeScript interfaces | ~333 |
| `src/stores/orderStore.ts` | Zustand state management | ~200 |
| `src/services/mockData.ts` | Mock orders/customers | ~300 |
| `src/components/kanban/KanbanBoard.tsx` | Pipeline view | ~400 |
| `src/components/order/OrderCard.tsx` | Order card component | ~200 |
| `src/components/order/OrderDetailDrawer.tsx` | Order details slide-out | ~500 |
| `src/components/shipping/ShippingModal.tsx` | Label creation modal | ~350 |
| `src/components/customer/CustomerList.tsx` | Customer list + filters | ~300 |
| `src/components/customer/CustomerDetailDrawer.tsx` | Customer details | ~320 |
| `src/components/analytics/Dashboard.tsx` | Analytics dashboard | ~250 |
| `src/components/header/Header.tsx` | Top header with profile | ~150 |
| `src/components/sidebar/IconSidebar.tsx` | Left navigation | ~150 |

---

*Document generated: December 15, 2024*
*For LLM consumption - be specific when referencing changes*
