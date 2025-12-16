# ETSY CRM - Order Management System

## Design Document for LLM Implementation via Figma MCP

**MVP Version 1.0 | December 2024**

---

## Table of Contents

1. Executive Summary
2. System Architecture Overview
3. Etsy API Integration
4. Shippo API Integration
5. Database Schema (PostgreSQL)
6. UI/UX Design Specifications
7. Frontend Implementation (React)
8. Backend Implementation (Node.js)
9. Figma MCP Implementation Instructions
10. Security Considerations
11. Deployment & Environment Setup

---

# 1. Executive Summary

This document provides a comprehensive design specification for building an MVP CRM system tailored specifically for Etsy sellers. The application will enable sellers to manage incoming orders through a Kanban-style pipeline interface inspired by HubSpot CRM and Trello, with integrated shipping label creation via Shippo.
You are already connected to Figma via MCP. The specific thing i want you to create is here: https://www.figma.com/design/QXDVsauxKrSJFwq6ltySE7/Kanban---Dashboard-for-planning--Community-?node-id=0-1&p=f&t=tPzM2tcDZI8FmiU2-0.

Do not be overly creative, I want to create it exactly as shown. say "mr meeseek" if you're confirming.

## 1.1 Core Features

- **Kanban board** with draggable order cards across customizable pipeline stages
- **Real-time order synchronization** from Etsy API v3
- **Product images and customer details** displayed on each card
- **One-click shipping label generation** via Shippo API
- **Automatic tracking number submission** back to Etsy
- **Order status tracking and history**
- **Clean, professional UI** with modern design aesthetics

## 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with TypeScript, TailwindCSS, React Beautiful DnD |
| Backend | Node.js with Express.js, TypeScript |
| Database | PostgreSQL 15+ with Prisma ORM |
| External APIs | Etsy Open API v3, Shippo Shipping API |
| Design Tool | Figma MCP for UI component design |

---

# 2. System Architecture Overview

## 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│   React + TypeScript + TailwindCSS + React Beautiful DnD        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API / WebSocket
┌─────────────────────────────▼───────────────────────────────────┐
│                         BACKEND                                 │
│                  Node.js + Express + TypeScript                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Etsy Service │  │Shippo Service│  │ Order/Pipeline Svc   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼────────────────────┼────────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
   ┌────────────┐    ┌────────────┐       ┌────────────────┐
   │  Etsy API  │    │ Shippo API │       │   PostgreSQL   │
   └────────────┘    └────────────┘       └────────────────┘
```

## 2.2 Data Flow

1. **Order Ingestion:** Etsy API polls for new orders → Backend processes → Stored in PostgreSQL → Frontend notified via WebSocket
2. **Pipeline Management:** User drags card → Frontend sends update → Backend persists stage change → State synchronized
3. **Shipping Flow:** User clicks 'Create Label' → Backend calls Shippo → Label PDF returned → Tracking sent to Etsy → Order marked shipped

---

# 3. Etsy API Integration

## 3.1 Authentication Setup

Etsy Open API v3 uses OAuth 2.0 authentication. The LLM must implement the following flow:

### OAuth 2.0 Scopes Required

| Scope | Purpose |
|-------|---------|
| `transactions_r` | Read receipts, transactions, and order details |
| `transactions_w` | Create shipments and update tracking information |
| `shops_r` | Read shop information and settings |
| `listings_r` | Read listing details and images |

## 3.2 Required Endpoints

### Get Shop Receipts (Orders)

```
GET https://api.etsy.com/v3/application/shops/{shop_id}/receipts
```

**Query Parameters:**
- `was_paid` - Filter by payment status (true/false)
- `was_shipped` - Filter by shipping status
- `limit` - Results per page (max 100)
- `offset` - Pagination offset

### Receipt Response Structure

```json
{
  "receipt_id": 3457319585,
  "receipt_type": 0,
  "seller_user_id": 983843601,
  "buyer_user_id": 977417473,
  "buyer_email": "customer@example.com",
  "name": "Customer Name",
  "first_line": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94102",
  "country_iso": "US",
  "status": "Paid",
  "is_shipped": false,
  "is_paid": true,
  "grandtotal": { "amount": 2747, "divisor": 100, "currency_code": "USD" },
  "transactions": [
    {
      "transaction_id": 123456789,
      "title": "Handmade Ceramic Mug",
      "quantity": 2,
      "price": { "amount": 1200, "divisor": 100, "currency_code": "USD" },
      "listing_id": 987654321,
      "listing_image_id": 6361567464,
      "sku": "MUG-001",
      "variations": []
    }
  ]
}
```

### Create Receipt Shipment (Mark as Shipped)

```
POST https://api.etsy.com/v3/application/shops/{shop_id}/receipts/{receipt_id}/tracking
```

**Request Body:**
```json
{
  "tracking_code": "1Z999AA10123456784",
  "carrier_name": "usps"
}
```

**Important:** This endpoint sends a notification email to the buyer and triggers final transaction calculations (taxes, VAT, etc.)

### Get Listing Images

```
GET https://api.etsy.com/v3/application/listings/{listing_id}/images
```

Returns image URLs at various sizes (75x75, 170x135, 570xN, full resolution)

## 3.3 Etsy Order Status Values

| Status | Description |
|--------|-------------|
| `open` | Order created, payment not yet submitted (legacy) |
| `paid` | Payment received, ready for fulfillment |
| `completed` | Order shipped and considered complete |
| `payment processing` | Payment submitted but not fully processed |
| `canceled` | Order was canceled |

## 3.4 Rate Limits

- **Per-second limit:** 10 requests/second
- **Daily limit:** 10,000 requests/day for personal access
- Monitor via `X-RateLimit-*` response headers

---

# 4. Shippo API Integration

## 4.1 Authentication

Shippo uses a simple API token authentication. All requests require:

```
Authorization: ShippoToken <API_TOKEN>
```

## 4.2 Shipping Label Creation Flow

### Step 1: Create Address Objects

```
POST https://api.goshippo.com/addresses/
```

```json
{
  "name": "Customer Name",
  "street1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94102",
  "country": "US",
  "phone": "+1 555 341 9393",
  "email": "customer@example.com"
}
```

### Step 2: Create Shipment & Get Rates

```
POST https://api.goshippo.com/shipments/
```

```json
{
  "address_from": {
    "name": "Your Shop Name",
    "street1": "456 Seller Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "country": "US"
  },
  "address_to": {
    "name": "Customer Name",
    "street1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "country": "US"
  },
  "parcels": [{
    "length": "5",
    "width": "5",
    "height": "5",
    "distance_unit": "in",
    "weight": "2",
    "mass_unit": "lb"
  }]
}
```

**Response includes array of `rates` with:**
- `object_id` - Use this to purchase the label
- `amount` - Price
- `provider` - Carrier name (USPS, FedEx, etc.)
- `servicelevel.name` - Service type (Priority, Ground, etc.)
- `estimated_days` - Delivery estimate

### Step 3: Purchase Label (Create Transaction)

```
POST https://api.goshippo.com/transactions/
```

```json
{
  "rate": "<rate_object_id_from_shipment>",
  "label_file_type": "PDF",
  "async": false
}
```

### Transaction Response (Label)

```json
{
  "status": "SUCCESS",
  "tracking_number": "1Z999AA10123456784",
  "label_url": "https://deliver.goshippo.com/label.pdf",
  "tracking_url_provider": "https://tools.usps.com/go/TrackConfirmAction?tLabels=..."
}
```

## 4.3 Carrier Name Mapping (Etsy ↔ Shippo)

| Carrier | Shippo Token | Etsy carrier_name |
|---------|--------------|-------------------|
| USPS | `usps` | `usps` |
| FedEx | `fedex` | `fedex` |
| UPS | `ups` | `ups` |
| DHL Express | `dhl_express` | `dhl` |
| Canada Post | `canada-post` | `canada-post` |

---

# 5. Database Schema (PostgreSQL)

## 5.1 Entity Relationship Overview

The database stores orders synced from Etsy, pipeline stage tracking, shipping information, and audit history.

## 5.2 Core Tables

### shops

```sql
CREATE TABLE shops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etsy_shop_id    BIGINT UNIQUE NOT NULL,
  shop_name       VARCHAR(255) NOT NULL,
  etsy_user_id    BIGINT NOT NULL,
  oauth_token     TEXT,
  refresh_token   TEXT,
  token_expires   TIMESTAMP WITH TIME ZONE,
  from_address    JSONB,  -- Seller's shipping address
  shippo_token    TEXT,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### pipeline_stages

```sql
CREATE TABLE pipeline_stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID REFERENCES shops(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  color           VARCHAR(7) DEFAULT '#6366f1',  -- Hex color
  position        INTEGER NOT NULL,
  is_default      BOOLEAN DEFAULT false,
  auto_action     VARCHAR(50),  -- 'create_label', 'mark_shipped', etc.
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### orders

```sql
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id               UUID REFERENCES shops(id) ON DELETE CASCADE,
  etsy_receipt_id       BIGINT UNIQUE NOT NULL,
  pipeline_stage_id     UUID REFERENCES pipeline_stages(id),
  stage_position        INTEGER DEFAULT 0,  -- Position within stage
  
  -- Etsy Status
  etsy_status           VARCHAR(50),  -- 'paid', 'completed', etc.
  is_paid               BOOLEAN DEFAULT false,
  is_shipped            BOOLEAN DEFAULT false,
  
  -- Customer Info
  buyer_name            VARCHAR(255),
  buyer_email           VARCHAR(255),
  shipping_address      JSONB,  -- Full address object
  message_from_buyer    TEXT,
  
  -- Financial
  total_amount          DECIMAL(10,2),
  shipping_cost         DECIMAL(10,2),
  currency_code         VARCHAR(3) DEFAULT 'USD',
  
  -- Shipping
  tracking_number       VARCHAR(100),
  carrier_name          VARCHAR(50),
  label_url             TEXT,
  ship_by_date          DATE,
  shipped_at            TIMESTAMP WITH TIME ZONE,
  
  -- Gift Options
  is_gift               BOOLEAN DEFAULT false,
  gift_message          TEXT,
  
  -- Internal Notes
  internal_notes        TEXT,
  tags                  TEXT[],  -- Array of tags
  
  -- Raw Etsy Data
  etsy_raw_data         JSONB,  -- Full API response for reference
  
  -- Timestamps
  etsy_created_at       TIMESTAMP WITH TIME ZONE,
  etsy_updated_at       TIMESTAMP WITH TIME ZONE,
  synced_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_shop_stage ON orders(shop_id, pipeline_stage_id);
CREATE INDEX idx_orders_etsy_status ON orders(etsy_status);
CREATE INDEX idx_orders_ship_by ON orders(ship_by_date);
```

### order_items

```sql
CREATE TABLE order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID REFERENCES orders(id) ON DELETE CASCADE,
  etsy_transaction_id   BIGINT NOT NULL,
  etsy_listing_id       BIGINT NOT NULL,
  title                 VARCHAR(500),
  quantity              INTEGER DEFAULT 1,
  price                 DECIMAL(10,2),
  sku                   VARCHAR(100),
  variations            JSONB,  -- Size, color, etc.
  image_url             TEXT,
  is_digital            BOOLEAN DEFAULT false
);
```

### order_history (Audit Trail)

```sql
CREATE TABLE order_history (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID REFERENCES orders(id) ON DELETE CASCADE,
  action                VARCHAR(100) NOT NULL,  -- 'stage_changed', 'shipped', etc.
  from_value            TEXT,
  to_value              TEXT,
  metadata              JSONB,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5.3 Default Pipeline Stages

```sql
INSERT INTO pipeline_stages (shop_id, name, color, position, is_default) VALUES
  ('{shop_id}', 'New Orders',      '#3b82f6', 0, true),
  ('{shop_id}', 'Processing',      '#f59e0b', 1, false),
  ('{shop_id}', 'Ready to Ship',   '#10b981', 2, false),
  ('{shop_id}', 'Shipped',         '#8b5cf6', 3, false),
  ('{shop_id}', 'Completed',       '#6b7280', 4, false);
```

---

# 6. UI/UX Design Specifications

## 6.1 Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#F56400` | Etsy orange - buttons, accents |
| Secondary | `#232347` | Dark navy - sidebar, headers |
| Background | `#F7F8FA` | Light gray - board background |
| Card | `#FFFFFF` | White - card backgrounds |
| Success | `#10B981` | Green - shipped, complete |
| Warning | `#F59E0B` | Amber - processing, attention |
| Danger | `#EF4444` | Red - errors, overdue |
| Text Primary | `#1F2937` | Dark gray - main text |
| Text Secondary | `#6B7280` | Medium gray - secondary text |

### Typography

- **Primary Font:** Inter (system fallback: -apple-system, BlinkMacSystemFont, sans-serif)
- **Headings:** Semi-bold (600), sizes 24px/20px/16px
- **Body:** Regular (400), 14px
- **Small/Labels:** Medium (500), 12px

### Spacing Scale

- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`

## 6.2 Page Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER (64px)                                                   │
│  [Logo] [Search Bar...            ] [Sync] [Settings] [Profile]  │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │              KANBAN BOARD                               │
│ (240px)│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│        │  │New (12) │ │Process. │ │Ready(3) │ │Shipped  │       │
│[Dashbd]│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤       │
│[Orders]│  │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │       │
│[Labels]│  │ [Card]  │ │ [Card]  │ │         │ │ [Card]  │       │
│[Report]│  │ [Card]  │ │         │ │         │ │         │       │
│        │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└────────┴─────────────────────────────────────────────────────────┘
```

## 6.3 Order Card Design

Each order is displayed as a draggable card with the following structure:

```
┌────────────────────────────────────────┐
│ ┌────────┐  Order #12345              │
│ │ [IMG]  │  Customer Name             │
│ │  60x60 │  San Francisco, CA         │
│ └────────┘                             │
│  Handmade Ceramic Mug x2              │
│  + 1 more item                        │
│ ──────────────────────────────────────│
│  $47.50        Ship by: Dec 18   🎁   │
│ [⚡ Create Label]  [⋮ More]           │
└────────────────────────────────────────┘
```

### Card Information Hierarchy

1. **Product Image:** 60x60px thumbnail, rounded corners (4px)
2. **Order Number:** Bold, clickable to expand details
3. **Customer Name:** Primary identifier
4. **Location:** City, State/Country
5. **Line Items:** First item title + count of additional items
6. **Total Amount:** Formatted currency with bold weight
7. **Ship By Date:** Badge, highlighted red if approaching/overdue
8. **Gift Indicator:** 🎁 icon if is_gift=true
9. **Quick Actions:** Create Label button, More actions menu

### Card States

- **Default:** White background, subtle shadow
- **Hover:** Slightly elevated shadow, cursor change
- **Dragging:** More prominent shadow, slight rotation (2deg), opacity 0.9
- **Overdue:** Red left border (3px)
- **Gift Order:** Purple left border (3px)
- **Shipped:** Green checkmark overlay, muted colors

## 6.4 Pipeline Column Design

```
┌─────────────────────────────┐
│ ● New Orders          (12) │  ← Column header with count
│ ────────────────────────── │  ← Subtle divider
│                            │
│  ┌──────────────────────┐  │
│  │     Order Card       │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │     Order Card       │  │
│  └──────────────────────┘  │
│                            │
│  [+ Add Stage Action]      │  ← Optional automation trigger
└─────────────────────────────┘
```

- **Column Width:** 300px (fixed)
- **Column Header:** Stage name, colored dot, order count
- **Background:** Slightly darker than board (#F1F5F9)
- **Spacing:** 8px between cards

---

# 7. Frontend Implementation (React)

## 7.1 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── board/
│   │   ├── KanbanBoard.tsx
│   │   ├── PipelineColumn.tsx
│   │   └── OrderCard.tsx
│   ├── order/
│   │   ├── OrderDetailDrawer.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── ShippingForm.tsx
│   └── ui/ (shadcn/ui components)
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Drawer.tsx
│       └── ...
├── hooks/
│   ├── useOrders.ts
│   ├── usePipeline.ts
│   └── useShipping.ts
├── services/
│   └── api.ts
├── store/
│   └── orderStore.ts (Zustand)
├── types/
│   └── index.ts
└── App.tsx
```

## 7.2 Key Dependencies

```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@hello-pangea/dnd": "^16.0.0",
  "tailwindcss": "^3.4.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "lucide-react": "^0.300.0",
  "date-fns": "^3.0.0",
  "axios": "^1.6.0"
}
```

## 7.3 TypeScript Interfaces

```typescript
interface Order {
  id: string;
  etsyReceiptId: number;
  pipelineStageId: string;
  stagePosition: number;
  etsyStatus: 'open' | 'paid' | 'completed' | 'canceled';
  isPaid: boolean;
  isShipped: boolean;
  buyerName: string;
  buyerEmail?: string;
  shippingAddress: Address;
  totalAmount: number;
  currencyCode: string;
  trackingNumber?: string;
  carrierName?: string;
  labelUrl?: string;
  shipByDate?: Date;
  isGift: boolean;
  giftMessage?: string;
  items: OrderItem[];
  createdAt: Date;
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  sku?: string;
  variations?: Record<string, string>;
  imageUrl?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  orderCount: number;
}

interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}
```

## 7.4 Key Component: KanbanBoard

```tsx
// KanbanBoard.tsx
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { usePipeline } from '../hooks/usePipeline';
import { useOrders } from '../hooks/useOrders';
import PipelineColumn from './PipelineColumn';

export default function KanbanBoard() {
  const { stages } = usePipeline();
  const { orders, moveOrder } = useOrders();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) return;

    moveOrder(draggableId, destination.droppableId, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4 h-full">
        {stages.map((stage) => (
          <PipelineColumn 
            key={stage.id} 
            stage={stage}
            orders={orders.filter(o => o.pipelineStageId === stage.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
```

---

# 8. Backend Implementation (Node.js)

## 8.1 Project Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── pipeline.ts
│   │   └── shipping.ts
│   ├── services/
│   │   ├── etsy.service.ts
│   │   ├── shippo.service.ts
│   │   └── sync.service.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## 8.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders with pagination |
| GET | `/api/orders/:id` | Get single order with items |
| PATCH | `/api/orders/:id/stage` | Move order to different stage |
| POST | `/api/orders/:id/ship` | Create label & mark shipped |
| GET | `/api/pipeline/stages` | Get all pipeline stages |
| POST | `/api/pipeline/stages` | Create new stage |
| PATCH | `/api/pipeline/stages/:id` | Update stage |
| DELETE | `/api/pipeline/stages/:id` | Delete stage |
| POST | `/api/shipping/rates` | Get shipping rates from Shippo |
| POST | `/api/shipping/label` | Purchase label from Shippo |
| POST | `/api/sync/orders` | Manually trigger Etsy sync |
| GET | `/api/auth/etsy` | Initiate Etsy OAuth |
| GET | `/api/auth/etsy/callback` | Etsy OAuth callback |

## 8.3 Sync Service Flow 

These are just examples, please build from Figma MCP

```typescript
// sync.service.ts
export async function syncOrders(shopId: string) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  
  // 1. Fetch receipts from Etsy
  const receipts = await etsyService.getShopReceipts(shop.etsyShopId, {
    was_paid: true,
    limit: 100
  });
  
  // 2. Process each receipt
  for (const receipt of receipts.results) {
    const existing = await prisma.order.findUnique({
      where: { etsyReceiptId: receipt.receipt_id }
    });
    
    if (existing) {
      // Update existing order
      await updateOrderFromEtsy(existing.id, receipt);
    } else {
      // Create new order
      const defaultStage = await prisma.pipelineStage.findFirst({
        where: { shopId, isDefault: true }
      });
      
      await createOrderFromEtsy(shopId, receipt, defaultStage.id);
    }
  }
  
  // 3. Emit WebSocket event
  io.to(`shop:${shopId}`).emit('orders:synced');
}
```

## 8.4 Shipping Flow

```typescript
// shipping.service.ts
export async function createShippingLabel(orderId: string, rateId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: true, items: true }
  });
  
  // 1. Purchase label from Shippo
  const transaction = await shippo.transactions.create({
    rate: rateId,
    label_file_type: 'PDF',
    async: false
  });
  
  if (transaction.status !== 'SUCCESS') {
    throw new Error(`Label creation failed: ${transaction.messages}`);
  }
  
  // 2. Update order with tracking info
  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: transaction.tracking_number,
      carrierName: extractCarrierName(transaction),
      labelUrl: transaction.label_url,
      isShipped: true,
      shippedAt: new Date()
    }
  });
  
  // 3. Submit tracking to Etsy
  await etsyService.createReceiptShipment(
    order.shop.etsyShopId,
    order.etsyReceiptId,
    {
      tracking_code: transaction.tracking_number,
      carrier_name: mapCarrierToEtsy(transaction.rate.provider)
    }
  );
  
  // 4. Record history
  await prisma.orderHistory.create({
    data: {
      orderId,
      action: 'shipped',
      toValue: transaction.tracking_number,
      metadata: { carrier: transaction.rate.provider, labelUrl: transaction.label_url }
    }
  });
  
  return transaction;
}
```

---

# 9. Figma MCP Implementation Instructions

This section provides specific instructions for an LLM using Figma MCP to create the UI components.

The URL that i want you to buidl is here: https://www.figma.com/design/QXDVsauxKrSJFwq6ltySE7/Kanban---Dashboard-for-planning--Community-?node-id=0-1&p=f&t=tPzM2tcDZI8FmiU2-0

## 9.1 Component Creation Order

1. **Design System Setup:** Create color styles, typography, spacing tokens
2. **Base Components:** Button, Input, Badge, Avatar, Card (atoms)
3. **Order Card:** Complete order card with all states
4. **Pipeline Column:** Column header with count, drop zone
5. **Kanban Board:** Full board with multiple columns
6. **Sidebar:** Navigation sidebar with icons
7. **Header:** Top bar with search, sync button, settings
8. **Order Detail Drawer:** Slide-over panel for full order details
9. **Shipping Modal:** Rate selection and label creation

## 9.2 Figma MCP Commands

### Creating the Order Card Component

```
// Figma MCP pseudo-instructions:

1. Create frame 'OrderCard' with:
   - Width: 280px, Height: auto-layout
   - Background: #FFFFFF
   - Border radius: 8px
   - Box shadow: 0 1px 3px rgba(0,0,0,0.1)
   - Padding: 16px
   - Auto-layout: Vertical, gap 12px

2. Add header row (auto-layout, horizontal, gap 12px):
   - Product thumbnail frame:
     - 60x60px, corner-radius 4px
     - Fill: #F3F4F6 (placeholder)
     - Clip contents: true
   - Info column (auto-layout, vertical, gap 2px):
     - Order number text: Inter 14px Semi-bold, #1F2937
     - Customer name text: Inter 14px Regular, #1F2937
     - Location text: Inter 12px Regular, #6B7280

3. Add items section (auto-layout, vertical, gap 4px):
   - Primary item title: Inter 14px Medium, #1F2937
     - Max width: 248px, truncate with ellipsis
   - Additional items text: Inter 12px Regular, #6B7280

4. Add divider line:
   - Height: 1px, Fill: #E5E7EB

5. Add footer row (auto-layout, horizontal, space-between):
   - Left side (auto-layout, horizontal, gap 8px):
     - Total amount: Inter 16px Semi-bold, #1F2937
   - Right side (auto-layout, horizontal, gap 8px):
     - Ship by badge frame:
       - Padding: 4px 8px
       - Background: #FEF3C7
       - Border-radius: 4px
       - Text: Inter 12px Medium, #92400E
     - Gift icon (conditional): 16x16px

6. Add action row (auto-layout, horizontal, gap 8px):
   - Create Label button:
     - Padding: 8px 16px
     - Background: #F56400
     - Border-radius: 6px
     - Text: Inter 14px Semi-bold, #FFFFFF
     - Icon: Zap (lightning) 16px before text
   - More button:
     - 32x32px, border-radius 6px
     - Background: transparent, hover: #F3F4F6
     - Icon: MoreVertical 16px, #6B7280

7. Create component variants:
   - Default (as above)
   - Hover: shadow 0 4px 6px rgba(0,0,0,0.1)
   - Dragging: shadow 0 10px 15px rgba(0,0,0,0.2), rotate 2deg
   - Overdue: add 3px left border #EF4444
   - Gift: add 3px left border #8B5CF6
   - Shipped: change button to "Track Package", add green checkmark badge
```

### Creating Pipeline Column

```
// Figma MCP pseudo-instructions:

1. Create frame 'PipelineColumn' with:
   - Width: 300px, Height: fill-container
   - Background: #F1F5F9
   - Border radius: 12px
   - Padding: 12px
   - Auto-layout: Vertical, gap 8px

2. Add column header (auto-layout, horizontal, space-between):
   - Left side (auto-layout, horizontal, gap 8px):
     - Status dot: 8x8px circle, fill from stage color
     - Stage name: Inter 14px Semi-bold, #1F2937
   - Right side:
     - Count badge: 
       - Padding: 2px 8px
       - Background: #E5E7EB
       - Border-radius: 10px
       - Text: Inter 12px Medium, #6B7280

3. Add cards container:
   - Auto-layout: Vertical, gap 8px
   - Min-height: 100px
   - Accepts OrderCard instances

4. Create variants for different stages with colors:
   - New Orders: #3B82F6
   - Processing: #F59E0B
   - Ready to Ship: #10B981
   - Shipped: #8B5CF6
   - Completed: #6B7280
```

## 9.3 Component Variants

Create the following variants for the OrderCard component:

- **Default:** Normal state
- **Hover:** Subtle shadow increase, border highlight
- **Dragging:** Elevated shadow, slight rotation, opacity 0.9
- **Overdue:** Red border-left indicator (3px)
- **Gift Order:** Purple border-left indicator, gift icon visible
- **Shipped:** Green checkmark badge, 'Track' button instead of 'Create Label'

---

# 10. Security Considerations

## 10.1 API Key Storage

- Store Etsy OAuth tokens **encrypted** in database (AES-256)
- Store Shippo API token as **environment variable**
- Never expose API keys to frontend
- Implement token refresh logic for Etsy OAuth (tokens expire)

## 10.2 Data Protection

- PII (customer emails, addresses) stored encrypted at rest
- HTTPS required for all API communication
- Rate limiting on all endpoints (express-rate-limit)
- Session-based authentication with secure cookies (httpOnly, sameSite)

## 10.3 Environment Variables

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/etsy_crm
ETSY_API_KEY=your_etsy_keystring
ETSY_SHARED_SECRET=your_shared_secret
ETSY_REDIRECT_URI=https://your-app.com/api/auth/etsy/callback
SHIPPO_API_TOKEN=shippo_live_xxx
ENCRYPTION_KEY=32-byte-key-for-aes-encryption
SESSION_SECRET=random-session-secret-min-32-chars
NODE_ENV=development
```

## 10.4 CORS Configuration

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

# 11. Deployment & Environment Setup

## 11.1 Development Setup

```bash
# Clone repository
git clone <repo-url>
cd etsy-crm

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Setup database
docker-compose up -d postgres
npx prisma migrate dev

# Run development servers
npm run dev        # Starts both frontend and backend
```

## 11.2 Docker Compose (Development)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: etsy_crm
      POSTGRES_PASSWORD: password
      POSTGRES_DB: etsy_crm
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 11.3 Production Deployment

**Recommended Stack:**
- **Frontend:** Vercel or Netlify (static hosting with edge functions)
- **Backend:** Railway, Render, or AWS ECS
- **Database:** Railway PostgreSQL, Neon, or AWS RDS
- **Secrets:** Environment variables via hosting platform

## 11.4 Etsy App Registration Steps

1. Go to https://www.etsy.com/developers/register
2. Create new application
3. Fill in application details:
   - App name: "Your CRM Name"
   - Description: Order management CRM
4. Set callback URL to your production domain: `https://your-app.com/api/auth/etsy/callback`
5. Copy **keystring** and **shared secret** to environment
6. For multi-shop use (more than 5 shops), apply for **Commercial Access**

## 11.5 Shippo Account Setup

1. Create account at https://goshippo.com
2. Add carrier accounts (USPS, FedEx, UPS)
3. Copy **API token** from Settings → API
4. For production, use **Live** token (not Test)

---

# Appendix: Implementation Checklist

## Phase 1: Foundation
- [ ] Set up PostgreSQL database with schema
- [ ] Implement Etsy OAuth 2.0 flow
- [ ] Create order sync service
- [ ] Build basic API endpoints

## Phase 2: UI Development
- [ ] Design system setup in Figma
- [ ] Build Kanban board UI with drag-drop
- [ ] Create order cards with all states
- [ ] Implement sidebar and header

## Phase 3: Shipping Integration
- [ ] Integrate Shippo for rate retrieval
- [ ] Implement label creation flow
- [ ] Add createReceiptShipment API call to Etsy
- [ ] Build shipping modal UI

## Phase 4: Polish & Deploy
- [ ] Add WebSocket for real-time updates
- [ ] Create order detail drawer
- [ ] Add search and filtering
- [ ] Implement order history/audit trail
- [ ] Add settings page for defaults
- [ ] Deploy to production
- [ ] Test end-to-end flow with real Etsy data

---

*End of Document*
