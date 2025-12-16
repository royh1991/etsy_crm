# Etsy CRM - User Stories & Use Cases

## For Shop Owners

**From the perspective of an Etsy seller managing their shop**

---

## Table of Contents

1. [Daily Seller Workflow](#1-daily-seller-workflow)
2. [Order Lifecycle & Statuses](#2-order-lifecycle--statuses)
3. [User Stories by Feature](#3-user-stories-by-feature)
4. [Order Detail View Requirements](#4-order-detail-view-requirements)
5. [Pipeline Stage Mapping](#5-pipeline-stage-mapping)
6. [Shipping Workflow](#6-shipping-workflow)
7. [Customer Intelligence Use Cases](#7-customer-intelligence-use-cases)
8. [Problem Resolution Scenarios](#8-problem-resolution-scenarios)
9. [Reporting & Analytics Use Cases](#9-reporting--analytics-use-cases)

---

## 1. Daily Seller Workflow

### Morning Routine
```
1. Open CRM → See dashboard with overnight orders
2. Check "New Orders" column → How many came in?
3. Review each new order:
   - What did they buy?
   - When do I need to ship by?
   - Is this a repeat customer?
   - Any special requests/gift messages?
4. Move orders to "Processing" as I start working on them
5. Create items / prepare for shipping
```

### Shipping Time
```
1. Filter orders in "Ready to Ship" stage
2. For each order:
   - Click into order detail
   - Review shipping address
   - Select package size
   - Get shipping rates
   - Purchase label
   - Print label
   - Tracking auto-submitted to Etsy
3. Order auto-moves to "Shipped" stage
```

### End of Day
```
1. Check "Shipped" orders → Any delivery confirmations?
2. Review "Needs Attention" → Any issues to resolve?
3. Check customer messages
4. Review daily stats
```

---

## 2. Order Lifecycle & Statuses

### Etsy API Status Values

From the [Etsy API](https://developers.etsy.com/documentation/reference/):

| Status | Description | What Seller Does |
|--------|-------------|------------------|
| `open` | Order created, payment not submitted (legacy/rare) | Wait for payment |
| `payment processing` | Payment submitted but not fully processed | Wait (usually brief) |
| `paid` | Payment received ✓ | Ready to fulfill |
| `completed` | Order shipped and finalized | Done |
| `canceled` | Order was canceled | Archive/ignore |

### Boolean Flags

| Flag | API Field | Meaning |
|------|-----------|---------|
| Payment received | `is_paid: true` | Can start fulfillment |
| Shipped | `is_shipped: true` | Tracking submitted to Etsy |

### Recommended CRM Pipeline Stages

| Stage | Maps to Etsy Status | Seller Action |
|-------|---------------------|---------------|
| **New Orders** | `paid` + `is_shipped: false` | Review, start processing |
| **Processing** | Custom (internal) | Making/preparing items |
| **Ready to Ship** | Custom (internal) | Items done, need label |
| **Shipped** | `is_shipped: true` | Label created, in transit |
| **Delivered** | Custom (tracking status) | Package delivered |
| **Completed** | `completed` | Transaction finalized |
| **Needs Attention** | Custom (flagged) | Issues to resolve |

---

## 3. User Stories by Feature

### 3.1 Viewing Orders

```
AS A shop owner
I WANT TO see all my orders in a kanban pipeline view
SO THAT I can track where each order is in my workflow

ACCEPTANCE CRITERIA:
- Orders automatically appear in "New Orders" when paid
- I can see: order number, customer name, items, total, ship-by date
- Orders show product thumbnail images
- Repeat customers are clearly marked
- Gift orders show gift icon
- Overdue orders (past ship-by date) are highlighted red
```

```
AS A shop owner
I WANT TO click into any order for full details
SO THAT I can see everything about that order in one place

ACCEPTANCE CRITERIA:
- Slide-out drawer or modal with complete order info
- Customer info: name, email, shipping address
- All items with images, quantities, variations, SKUs
- Order financials: subtotal, shipping, tax, total
- Ship-by date prominently displayed
- Gift message if applicable
- Buyer's note/message if any
- Order history/timeline
- Internal notes field (editable)
```

### 3.2 Moving Orders Through Pipeline

```
AS A shop owner
I WANT TO drag orders between pipeline stages
SO THAT I can track my progress on each order

ACCEPTANCE CRITERIA:
- Drag and drop works smoothly
- Order position saved immediately
- Can reorder within a column
- Can move to any stage
```

```
AS A shop owner
I WANT TO bulk-move multiple orders
SO THAT I can efficiently process batches

ACCEPTANCE CRITERIA:
- Checkbox selection on cards
- "Move selected to..." dropdown
- Works across different source stages
```

### 3.3 Order Notes

```
AS A shop owner
I WANT TO add internal notes to any order
SO THAT I can track special instructions or issues

ACCEPTANCE CRITERIA:
- Notes field in order detail view
- Notes persist and are editable
- Notes are private (not sent to customer)
- Timestamp on each note
- Can add multiple notes over time
```

```
AS A shop owner
I WANT TO tag orders with custom labels
SO THAT I can filter and find orders by type

EXAMPLE TAGS:
- "Rush order"
- "Custom request"
- "Fragile"
- "Issue - contact customer"
- "Awaiting reply"
```

### 3.4 Shipping Labels

```
AS A shop owner
I WANT TO create shipping labels directly from the CRM
SO THAT I don't have to copy/paste addresses elsewhere

ACCEPTANCE CRITERIA:
- "Create Label" button on order card
- Pre-filled with customer's shipping address
- Select package dimensions (or use saved presets)
- See rates from multiple carriers
- Purchase label with one click
- Label PDF opens for printing
- Tracking number auto-submitted to Etsy
- Order auto-moves to "Shipped" stage
```

```
AS A shop owner
I WANT TO save default package sizes
SO THAT I can quickly create labels for common products

ACCEPTANCE CRITERIA:
- Define presets: "Small Box", "Medium Box", "Large Box", etc.
- Each preset has: length, width, height, weight
- Select preset when creating label
- Can override dimensions if needed
```

### 3.5 Tracking & Delivery

```
AS A shop owner
I WANT TO see tracking status for shipped orders
SO THAT I can monitor delivery progress

ACCEPTANCE CRITERIA:
- Show current tracking status (in transit, delivered, etc.)
- Link to carrier tracking page
- Show estimated delivery date
- Alert if delivery exception occurs
```

```
AS A shop owner
I WANT TO manually enter tracking info
SO THAT I can use my own shipping solution

ACCEPTANCE CRITERIA:
- Option to enter tracking number manually
- Select carrier from dropdown
- Submit to Etsy when entered
```

---

## 4. Order Detail View Requirements

### Must-Have Information

```
┌─────────────────────────────────────────────────────────────┐
│ Order #1234567890                           [Stage: Paid ▼] │
│ Placed: Dec 14, 2024 at 3:42 PM                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CUSTOMER                                        [Message]   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ John Smith                              🔁 Repeat (3rd) │ │
│ │ john.smith@email.com                                    │ │
│ │                                                         │ │
│ │ SHIPPING ADDRESS:                                       │ │
│ │ 123 Main Street, Apt 4B                                 │ │
│ │ San Francisco, CA 94102                                 │ │
│ │ United States                                           │ │
│ │                                                         │ │
│ │ Customer since: March 2024                              │ │
│ │ Total spent: $247.50 (VIP)                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ITEMS (2)                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌──────┐ Handmade Ceramic Mug                           │ │
│ │ │ IMG  │ Qty: 2 × $15.00 = $30.00                       │ │
│ │ └──────┘ Color: Ocean Blue | Size: Large                │ │
│ │          SKU: MUG-OCEAN-LG                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌──────┐ Matching Coaster Set                           │ │
│ │ │ IMG  │ Qty: 1 × $12.00 = $12.00                       │ │
│ │ └──────┘ SKU: COAST-SET-4                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ORDER SUMMARY                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Subtotal:                                      $42.00   │ │
│ │ Shipping (USPS First Class):                    $5.50   │ │
│ │ Sales Tax:                                      $3.78   │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ TOTAL:                                         $51.28   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ SHIPPING                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Ship by: December 18, 2024 (4 days)                  │ │
│ │                                                         │ │
│ │ [⚡ Create Shipping Label]                              │ │
│ │                                                         │ │
│ │ ── or enter manually ──                                 │ │
│ │ Carrier: [Select ▼]  Tracking: [____________] [Submit]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎁 GIFT ORDER                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Message: "Happy Birthday Mom! Love always, Sarah"       │ │
│ │ (Include gift message in package)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💬 BUYER'S NOTE                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Could you please wrap it nicely? It's a gift!"         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📝 INTERNAL NOTES                                  [+ Add]  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dec 15, 10:30 AM:                                       │ │
│ │ "Using the special gift box for this one"               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🏷️ TAGS                                                     │
│ [Gift Order] [Rush] [+ Add Tag]                             │
│                                                             │
│ HISTORY                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dec 14, 3:42 PM  • Order placed                         │ │
│ │ Dec 14, 3:42 PM  • Payment received                     │ │
│ │ Dec 14, 4:00 PM  • Synced to CRM                        │ │
│ │ Dec 15, 9:00 AM  • Moved to "Processing"                │ │
│ │ Dec 15, 10:30 AM • Note added                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Flag Issue ⚠️]                                [Archive 📥] │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Pipeline Stage Mapping

### Default Pipeline Configuration

```typescript
const defaultPipelineStages = [
  {
    id: 'new',
    name: 'New Orders',
    emoji: '🆕',
    color: '#3B82F6', // blue
    autoPopulate: {
      etsyStatus: 'paid',
      isShipped: false
    },
    description: 'Orders just received, not yet started'
  },
  {
    id: 'processing',
    name: 'Processing',
    emoji: '🏗️',
    color: '#F59E0B', // amber
    autoPopulate: null, // manual only
    description: 'Currently making/preparing items'
  },
  {
    id: 'ready-to-ship',
    name: 'Ready to Ship',
    emoji: '📦',
    color: '#10B981', // green
    autoPopulate: null,
    description: 'Items ready, needs shipping label'
  },
  {
    id: 'shipped',
    name: 'Shipped',
    emoji: '🚚',
    color: '#8B5CF6', // purple
    autoPopulate: {
      isShipped: true
    },
    description: 'Label created, in transit'
  },
  {
    id: 'delivered',
    name: 'Delivered',
    emoji: '✅',
    color: '#059669', // emerald
    autoPopulate: {
      trackingStatus: 'delivered' // from carrier API
    },
    description: 'Package confirmed delivered'
  },
  {
    id: 'needs-attention',
    name: 'Needs Attention',
    emoji: '⚠️',
    color: '#EF4444', // red
    autoPopulate: null,
    description: 'Issues requiring resolution'
  }
];
```

### Stage Automation Rules

| Trigger | Action |
|---------|--------|
| New paid order from Etsy | Auto-add to "New Orders" |
| Shipping label created | Auto-move to "Shipped" |
| Tracking shows delivered | Auto-move to "Delivered" |
| Order flagged with issue | Auto-move to "Needs Attention" |
| Customer files case | Auto-move to "Needs Attention" |

---

## 6. Shipping Workflow

### Create Label Flow

```
1. Click "Create Label" on order card
   ↓
2. Shipping Modal Opens:
   ┌─────────────────────────────────────────────────┐
   │ Create Shipping Label                     [X]   │
   ├─────────────────────────────────────────────────┤
   │                                                 │
   │ FROM:                                           │
   │ Your Shop Name                                  │
   │ 456 Seller Ave                                  │
   │ Los Angeles, CA 90001                           │
   │ [Edit default address]                          │
   │                                                 │
   │ TO:                                             │
   │ John Smith                                      │
   │ 123 Main St, Apt 4B                             │
   │ San Francisco, CA 94102                         │
   │ ✓ Address verified                              │
   │                                                 │
   │ PACKAGE:                                        │
   │ [Small Box ▼] or [Custom dimensions]            │
   │                                                 │
   │ Weight: [1] lbs [8] oz                          │
   │                                                 │
   │ ─────────────────────────────────────────────── │
   │                                                 │
   │ SHIPPING OPTIONS:                               │
   │                                                 │
   │ ○ USPS First Class Package    $4.50   2-5 days  │
   │ ● USPS Priority Mail          $8.95   1-3 days  │
   │ ○ UPS Ground                  $9.50   3-5 days  │
   │ ○ FedEx Home Delivery        $12.00   2-4 days  │
   │                                                 │
   │ ─────────────────────────────────────────────── │
   │                                                 │
   │ □ Add signature confirmation (+$3.00)           │
   │ □ Add insurance ($100 coverage: +$2.00)         │
   │                                                 │
   │            [Cancel]  [Purchase Label - $8.95]   │
   └─────────────────────────────────────────────────┘
   ↓
3. Click "Purchase Label"
   ↓
4. Label PDF opens in new tab for printing
   ↓
5. Tracking automatically submitted to Etsy
   ↓
6. Customer receives shipping notification email
   ↓
7. Order moves to "Shipped" stage
```

### Manual Tracking Entry

For sellers using their own shipping:
```
1. Click "Enter Tracking Manually" in order detail
2. Select carrier from dropdown (USPS, UPS, FedEx, DHL, etc.)
3. Enter tracking number
4. Click "Submit"
5. Tracking submitted to Etsy
6. Order moves to "Shipped"
```

---

## 7. Customer Intelligence Use Cases

### Use Case: Find Repeat Customers

```
AS A shop owner
I WANT TO quickly identify repeat customers on orders
SO THAT I can provide VIP treatment

VISUAL INDICATOR ON ORDER CARD:
- 🔁 icon for repeat customers
- "2nd order" / "5th order" / etc. badge
- Different card border or highlight

IN CUSTOMER LIST:
- Filter: "Repeat Customers Only"
- Sort by: Order count, Total spent
- Show: Order history, Average order value
```

### Use Case: Find High-Value Customers

```
AS A shop owner
I WANT TO filter customers by total spend
SO THAT I can identify my best customers

FILTERS:
- All customers
- Spent $50+
- Spent $100+
- Spent $200+
- Spent $500+ (VIP)

VISUAL INDICATORS:
- 💎 VIP badge for $500+ lifetime spend
- ⭐ Star for $200+ spend
- Customer tier shown on order cards
```

### Use Case: Track Problematic Customers

```
AS A shop owner
I WANT TO flag customers who have caused issues
SO THAT I can be careful with future orders

FLAG TYPES:
- 📦❌ "Delivery dispute" - Claims package not received when tracking shows delivered
- 💰❌ "Refund history" - Multiple refund requests
- 📱❌ "Digital refund" - Refunded digital items (suspicious)
- 🎨❌ "Custom canceler" - Orders custom items then cancels
- ⭐❌ "Low reviewer" - History of 1-2 star reviews
- 💬❌ "Difficult communication" - Hard to work with

ALERT ON NEW ORDER:
When flagged customer places order:
- Show warning banner on order card
- Show reason for flag
- Show history of issues
```

### Use Case: Customer Order History

```
AS A shop owner
I WANT TO see a customer's complete order history
SO THAT I can understand their preferences and value

CUSTOMER PROFILE VIEW:
- Total orders placed
- Total amount spent
- First order date
- Last order date
- Average order value
- Favorite products (most purchased)
- All past orders with links
- Notes on customer
- Any flags/issues
```

---

## 8. Problem Resolution Scenarios

### Scenario: "Delivered but not received"

```
CUSTOMER CLAIM: "My package says delivered but I never got it"

SELLER NEEDS:
1. See tracking history showing delivery confirmation
2. See delivery address used
3. Customer's order history (first-timer vs repeat)
4. Any flags on customer for similar claims
5. Ability to add notes on resolution
6. Option to flag customer if suspicious

CRM FEATURES NEEDED:
- Tracking status integration
- Customer flag system
- Notes/resolution tracking
- Order detail view with all shipping info
```

### Scenario: Late Shipment

```
SITUATION: Order past ship-by date, not yet shipped

CRM SHOULD:
1. Highlight overdue orders in red
2. Sort overdue to top of queue
3. Send seller reminder (optional notification)
4. Show how many days overdue

FILTER OPTIONS:
- "Overdue orders only"
- "Ships today"
- "Ships tomorrow"
- "Ships this week"
```

### Scenario: Custom Order Canceled

```
SITUATION: Customer ordered custom item, then cancels after work started

SELLER NEEDS:
1. Flag customer for "custom canceler"
2. Add notes about what happened
3. Track if this is repeat behavior
4. See flag on any future orders from this customer

CRM FEATURES:
- Custom flags with notes
- Flag history per customer
- Automatic alert on new orders
```

---

## 9. Reporting & Analytics Use Cases

### Daily Dashboard

```
TODAY'S SNAPSHOT:
┌────────────────────────────────────────────────┐
│ 📦 Orders Today: 12         💰 Revenue: $487   │
│ 🚚 Shipped Today: 8         📬 Delivered: 5    │
│ ⚠️ Overdue: 2               🆕 New: 4          │
└────────────────────────────────────────────────┘
```

### Weekly/Monthly Reports

```
METRICS NEEDED:
- Total orders
- Total revenue
- Average order value
- Orders by stage
- Shipping costs
- Repeat customer rate
- New vs returning customers
- Top selling products
- Busiest days/times
```

### Pipeline Health

```
VISUALIZE:
- Orders in each stage
- Average time in each stage
- Bottlenecks (stages with delays)
- Stage conversion rates
```

---

## API Reference (Etsy)

### Key Endpoints for This CRM

| Action | Endpoint | Method |
|--------|----------|--------|
| Get all orders | `/shops/{shop_id}/receipts` | GET |
| Get single order | `/shops/{shop_id}/receipts/{receipt_id}` | GET |
| Submit tracking | `/shops/{shop_id}/receipts/{receipt_id}/tracking` | POST |
| Get listing images | `/listings/{listing_id}/images` | GET |

### Receipt Status Values

```
"paid"               - Ready to fulfill
"completed"          - Order finalized
"open"               - Awaiting payment (rare)
"payment processing" - Payment pending
"canceled"           - Order canceled
```

### Boolean Flags

```
is_paid: boolean     - Payment received
is_shipped: boolean  - Tracking submitted
is_gift: boolean     - Gift order with message
```

---

## Sources

- [Etsy API Definitions](https://developers.etsy.com/documentation/essentials/definitions/)
- [Etsy Fulfillment Tutorial](https://developer.etsy.com/documentation/tutorials/fulfillment/)
- [What to Do After You Sell](https://help.etsy.com/hc/en-us/articles/115015710308-What-to-Do-After-You-Sell-an-Item)
- [Etsy API Reference](https://developers.etsy.com/documentation/reference/)

---

*This document focuses on USER NEEDS, not technical implementation. See `ETSY_CRM_FEATURE_SPEC.md` for technical details.*
