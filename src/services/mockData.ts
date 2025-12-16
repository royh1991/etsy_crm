// Mock Data for Etsy CRM
import type { Order, Customer, PipelineStage, CustomerTier, CustomerFlagType } from '../types';

// ============ Mock Customers ============
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    etsyBuyerId: 123456789,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    orderCount: 5,
    totalSpent: 287.50,
    firstOrderDate: new Date('2024-03-15'),
    lastOrderDate: new Date('2024-12-10'),
    averageOrderValue: 57.50,
    isRepeatCustomer: true,
    tier: 'gold',
    averageRating: 5,
    reviewCount: 3,
    hasLeftReview: true,
    flags: [],
    isFlagged: false,
    notes: 'Great customer, always leaves nice reviews!',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: 'cust-2',
    etsyBuyerId: 234567890,
    name: 'Michael Chen',
    email: 'mchen@gmail.com',
    orderCount: 1,
    totalSpent: 42.00,
    firstOrderDate: new Date('2024-12-14'),
    lastOrderDate: new Date('2024-12-14'),
    averageOrderValue: 42.00,
    isRepeatCustomer: false,
    tier: 'regular',
    reviewCount: 0,
    hasLeftReview: false,
    flags: [],
    isFlagged: false,
    notes: '',
    createdAt: new Date('2024-12-14'),
    updatedAt: new Date('2024-12-14')
  },
  {
    id: 'cust-3',
    etsyBuyerId: 345678901,
    name: 'Emily Rodriguez',
    email: 'emily.rod@outlook.com',
    orderCount: 12,
    totalSpent: 623.00,
    firstOrderDate: new Date('2023-08-20'),
    lastOrderDate: new Date('2024-12-12'),
    averageOrderValue: 51.92,
    isRepeatCustomer: true,
    tier: 'vip',
    averageRating: 4.8,
    reviewCount: 8,
    hasLeftReview: true,
    flags: [],
    isFlagged: false,
    notes: 'VIP customer - always buying gifts for friends',
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-12-12')
  },
  {
    id: 'cust-4',
    etsyBuyerId: 456789012,
    name: 'James Wilson',
    email: 'jwilson@yahoo.com',
    orderCount: 3,
    totalSpent: 156.00,
    firstOrderDate: new Date('2024-06-10'),
    lastOrderDate: new Date('2024-12-11'),
    averageOrderValue: 52.00,
    isRepeatCustomer: true,
    tier: 'silver',
    averageRating: 3.0,
    reviewCount: 2,
    hasLeftReview: true,
    flags: [
      {
        type: 'delivery_dispute' as CustomerFlagType,
        reason: 'Claimed package not received despite tracking showing delivered',
        createdAt: new Date('2024-09-15')
      }
    ],
    isFlagged: true,
    notes: 'Had one delivery dispute in September. Proceed with caution.',
    createdAt: new Date('2024-06-10'),
    updatedAt: new Date('2024-12-11')
  },
  {
    id: 'cust-5',
    etsyBuyerId: 567890123,
    name: 'Amanda Foster',
    email: 'afoster@email.com',
    orderCount: 2,
    totalSpent: 89.00,
    firstOrderDate: new Date('2024-10-05'),
    lastOrderDate: new Date('2024-12-13'),
    averageOrderValue: 44.50,
    isRepeatCustomer: true,
    tier: 'bronze',
    reviewCount: 1,
    hasLeftReview: true,
    averageRating: 5,
    flags: [],
    isFlagged: false,
    notes: '',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-12-13')
  },
  {
    id: 'cust-6',
    etsyBuyerId: 678901234,
    name: 'Robert Kim',
    email: 'robkim@gmail.com',
    orderCount: 1,
    totalSpent: 78.50,
    firstOrderDate: new Date('2024-12-13'),
    lastOrderDate: new Date('2024-12-13'),
    averageOrderValue: 78.50,
    isRepeatCustomer: false,
    tier: 'bronze',
    reviewCount: 0,
    hasLeftReview: false,
    flags: [],
    isFlagged: false,
    notes: '',
    createdAt: new Date('2024-12-13'),
    updatedAt: new Date('2024-12-13')
  },
  {
    id: 'cust-7',
    etsyBuyerId: 789012345,
    name: 'Lisa Thompson',
    email: 'lisa.t@hotmail.com',
    orderCount: 7,
    totalSpent: 412.00,
    firstOrderDate: new Date('2024-01-20'),
    lastOrderDate: new Date('2024-12-08'),
    averageOrderValue: 58.86,
    isRepeatCustomer: true,
    tier: 'gold',
    averageRating: 4.5,
    reviewCount: 5,
    hasLeftReview: true,
    flags: [],
    isFlagged: false,
    notes: 'Loves the ceramic mugs, orders them as gifts',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-12-08')
  },
  {
    id: 'cust-8',
    etsyBuyerId: 890123456,
    name: 'David Martinez',
    email: 'd.martinez@email.com',
    orderCount: 2,
    totalSpent: 134.00,
    firstOrderDate: new Date('2024-08-15'),
    lastOrderDate: new Date('2024-12-14'),
    averageOrderValue: 67.00,
    isRepeatCustomer: true,
    tier: 'silver',
    reviewCount: 1,
    hasLeftReview: true,
    averageRating: 4,
    flags: [],
    isFlagged: false,
    notes: '',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-12-14')
  }
];

// ============ Mock Orders ============
export const mockOrders: Order[] = [
  // New Orders
  {
    id: 'order-1',
    etsyReceiptId: 2847591034,
    orderNumber: '2847591034',
    pipelineStage: 'new',
    customerId: 'cust-2',
    buyerName: 'Michael Chen',
    buyerEmail: 'mchen@gmail.com',
    shippingAddress: {
      name: 'Michael Chen',
      addressLine1: '456 Oak Avenue',
      addressLine2: 'Apt 12B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-1',
        listingId: 1234567890,
        title: 'Handmade Ceramic Mug - Ocean Blue',
        description: 'Beautiful handcrafted ceramic mug with ocean blue glaze',
        quantity: 2,
        price: 15.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/ceramic-mug.jpg',
        sku: 'MUG-OCEAN-001',
        variations: [{ name: 'Color', value: 'Ocean Blue' }, { name: 'Size', value: 'Large' }]
      },
      {
        id: 'item-2',
        listingId: 1234567891,
        title: 'Matching Coaster Set (4pc)',
        description: 'Set of 4 matching ceramic coasters',
        quantity: 1,
        price: 12.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/coasters.jpg',
        sku: 'COAST-SET-4'
      }
    ],
    subtotal: 42.00,
    shippingCost: 5.95,
    tax: 4.31,
    totalAmount: 52.26,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-14T15:30:00'),
    shipByDate: new Date('2024-12-19'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-1',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-14T15:30:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-14T15:30:00'),
    updatedAt: new Date('2024-12-14T15:30:00')
  },
  {
    id: 'order-2',
    etsyReceiptId: 2847591035,
    orderNumber: '2847591035',
    pipelineStage: 'new',
    customerId: 'cust-3',
    buyerName: 'Emily Rodriguez',
    buyerEmail: 'emily.rod@outlook.com',
    shippingAddress: {
      name: 'Emily Rodriguez',
      addressLine1: '789 Pine Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-3',
        listingId: 1234567892,
        title: 'Custom Name Necklace - Sterling Silver',
        description: 'Personalized name necklace in sterling silver',
        quantity: 1,
        price: 45.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/necklace.jpg',
        sku: 'NECK-SS-CUSTOM',
        variations: [{ name: 'Name', value: 'Mom' }, { name: 'Chain Length', value: '18 inch' }]
      }
    ],
    subtotal: 45.00,
    shippingCost: 4.50,
    tax: 4.05,
    totalAmount: 53.55,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-14T10:15:00'),
    shipByDate: new Date('2024-12-18'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: true,
    giftMessage: 'Happy Birthday Mom! Love always, Emily',
    buyerNote: 'Please wrap it nicely if possible, it\'s a birthday gift!',
    tags: ['Gift Order', 'Custom'],
    notes: [],
    history: [
      {
        id: 'hist-2',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-14T10:15:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-14T10:15:00'),
    updatedAt: new Date('2024-12-14T10:15:00')
  },
  {
    id: 'order-3',
    etsyReceiptId: 2847591036,
    orderNumber: '2847591036',
    pipelineStage: 'new',
    customerId: 'cust-6',
    buyerName: 'Robert Kim',
    buyerEmail: 'robkim@gmail.com',
    shippingAddress: {
      name: 'Robert Kim',
      addressLine1: '321 Maple Lane',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-4',
        listingId: 1234567893,
        title: 'Hand-poured Soy Candle - Lavender Fields',
        description: 'Relaxing lavender scented soy candle',
        quantity: 3,
        price: 18.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/candle.jpg',
        sku: 'CANDLE-LAV-001'
      },
      {
        id: 'item-5',
        listingId: 1234567894,
        title: 'Ceramic Candle Holder',
        description: 'Handmade ceramic candle holder',
        quantity: 1,
        price: 24.50,
        imageUrl: 'https://i.etsystatic.com/placeholder/holder.jpg',
        sku: 'HOLDER-CER-001'
      }
    ],
    subtotal: 78.50,
    shippingCost: 7.95,
    tax: 7.06,
    totalAmount: 93.51,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-13T20:45:00'),
    shipByDate: new Date('2024-12-18'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-3',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-13T20:45:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-13T20:45:00'),
    updatedAt: new Date('2024-12-13T20:45:00')
  },

  // Processing
  {
    id: 'order-4',
    etsyReceiptId: 2847591030,
    orderNumber: '2847591030',
    pipelineStage: 'processing',
    customerId: 'cust-1',
    buyerName: 'Sarah Johnson',
    buyerEmail: 'sarah.j@email.com',
    shippingAddress: {
      name: 'Sarah Johnson',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-6',
        listingId: 1234567895,
        title: 'Custom Pet Portrait - Watercolor Style',
        description: 'Custom watercolor portrait of your pet',
        quantity: 1,
        price: 75.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/pet-portrait.jpg',
        sku: 'ART-PET-WC',
        variations: [{ name: 'Size', value: '8x10 inch' }, { name: 'Frame', value: 'No Frame' }]
      }
    ],
    subtotal: 75.00,
    shippingCost: 6.50,
    tax: 6.75,
    totalAmount: 88.25,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-12T14:20:00'),
    shipByDate: new Date('2024-12-22'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: false,
    buyerNote: 'Here is a photo of my dog Max. He has brown spots on his ears!',
    tags: ['Custom', 'Art'],
    notes: [
      {
        id: 'note-1',
        content: 'Started working on the portrait. Using reference photo #3.',
        createdAt: new Date('2024-12-13T09:00:00')
      }
    ],
    history: [
      {
        id: 'hist-4',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-12T14:20:00')
      },
      {
        id: 'hist-5',
        type: 'moved',
        description: 'Moved to Processing',
        timestamp: new Date('2024-12-13T09:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-12T14:20:00'),
    updatedAt: new Date('2024-12-13T09:00:00')
  },
  {
    id: 'order-5',
    etsyReceiptId: 2847591031,
    orderNumber: '2847591031',
    pipelineStage: 'processing',
    customerId: 'cust-5',
    buyerName: 'Amanda Foster',
    buyerEmail: 'afoster@email.com',
    shippingAddress: {
      name: 'Amanda Foster',
      addressLine1: '555 Cedar Road',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-7',
        listingId: 1234567896,
        title: 'Knitted Winter Scarf - Forest Green',
        description: 'Hand-knitted wool scarf',
        quantity: 1,
        price: 35.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/scarf.jpg',
        sku: 'SCARF-WOOL-GRN'
      },
      {
        id: 'item-8',
        listingId: 1234567897,
        title: 'Matching Beanie Hat',
        description: 'Hand-knitted wool beanie',
        quantity: 1,
        price: 28.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/beanie.jpg',
        sku: 'BEANIE-WOOL-GRN'
      }
    ],
    subtotal: 63.00,
    shippingCost: 5.50,
    tax: 5.67,
    totalAmount: 74.17,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-11T11:30:00'),
    shipByDate: new Date('2024-12-17'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: true,
    giftMessage: 'Stay warm this winter! - Your Secret Santa',
    tags: ['Gift Order'],
    notes: [],
    history: [
      {
        id: 'hist-6',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-11T11:30:00')
      },
      {
        id: 'hist-7',
        type: 'moved',
        description: 'Moved to Processing',
        timestamp: new Date('2024-12-12T10:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-11T11:30:00'),
    updatedAt: new Date('2024-12-12T10:00:00')
  },

  // Ready to Ship
  {
    id: 'order-6',
    etsyReceiptId: 2847591025,
    orderNumber: '2847591025',
    pipelineStage: 'ready-to-ship',
    customerId: 'cust-7',
    buyerName: 'Lisa Thompson',
    buyerEmail: 'lisa.t@hotmail.com',
    shippingAddress: {
      name: 'Lisa Thompson',
      addressLine1: '888 Birch Boulevard',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-9',
        listingId: 1234567890,
        title: 'Handmade Ceramic Mug - Sunset Orange',
        description: 'Beautiful handcrafted ceramic mug with sunset orange glaze',
        quantity: 4,
        price: 15.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/ceramic-mug-orange.jpg',
        sku: 'MUG-SUNSET-001',
        variations: [{ name: 'Color', value: 'Sunset Orange' }, { name: 'Size', value: 'Large' }]
      }
    ],
    subtotal: 60.00,
    shippingCost: 8.95,
    tax: 5.40,
    totalAmount: 74.35,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-10T09:00:00'),
    shipByDate: new Date('2024-12-15'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: false,
    tags: ['Bulk Order'],
    notes: [
      {
        id: 'note-2',
        content: 'All 4 mugs inspected and wrapped. Ready for shipping!',
        createdAt: new Date('2024-12-13T16:00:00')
      }
    ],
    history: [
      {
        id: 'hist-8',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-10T09:00:00')
      },
      {
        id: 'hist-9',
        type: 'moved',
        description: 'Moved to Processing',
        timestamp: new Date('2024-12-10T14:00:00')
      },
      {
        id: 'hist-10',
        type: 'moved',
        description: 'Moved to Ready to Ship',
        timestamp: new Date('2024-12-13T16:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-10T09:00:00'),
    updatedAt: new Date('2024-12-13T16:00:00')
  },
  {
    id: 'order-7',
    etsyReceiptId: 2847591026,
    orderNumber: '2847591026',
    pipelineStage: 'ready-to-ship',
    customerId: 'cust-8',
    buyerName: 'David Martinez',
    buyerEmail: 'd.martinez@email.com',
    shippingAddress: {
      name: 'David Martinez',
      addressLine1: '222 Elm Court',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-10',
        listingId: 1234567898,
        title: 'Leather Journal - Personalized',
        description: 'Handcrafted leather journal with personalized initials',
        quantity: 1,
        price: 48.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/journal.jpg',
        sku: 'JOURNAL-LTH-PERS',
        variations: [{ name: 'Initials', value: 'DM' }, { name: 'Color', value: 'Brown' }]
      }
    ],
    subtotal: 48.00,
    shippingCost: 5.50,
    tax: 4.32,
    totalAmount: 57.82,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-09T16:45:00'),
    shipByDate: new Date('2024-12-15'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: false,
    isGift: false,
    tags: ['Custom'],
    notes: [],
    history: [
      {
        id: 'hist-11',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-09T16:45:00')
      },
      {
        id: 'hist-12',
        type: 'moved',
        description: 'Moved to Ready to Ship',
        timestamp: new Date('2024-12-12T11:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-09T16:45:00'),
    updatedAt: new Date('2024-12-12T11:00:00')
  },

  // Shipped
  {
    id: 'order-8',
    etsyReceiptId: 2847591020,
    orderNumber: '2847591020',
    pipelineStage: 'shipped',
    customerId: 'cust-1',
    buyerName: 'Sarah Johnson',
    buyerEmail: 'sarah.j@email.com',
    shippingAddress: {
      name: 'Sarah Johnson',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-11',
        listingId: 1234567893,
        title: 'Hand-poured Soy Candle - Vanilla Bean',
        description: 'Sweet vanilla scented soy candle',
        quantity: 2,
        price: 18.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/candle-vanilla.jpg',
        sku: 'CANDLE-VAN-001'
      }
    ],
    subtotal: 36.00,
    shippingCost: 5.95,
    tax: 3.24,
    totalAmount: 45.19,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-08T10:30:00'),
    shipByDate: new Date('2024-12-13'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: true,
    trackingNumber: '9400111899223456789012',
    carrierName: 'USPS',
    trackingStatus: 'in_transit',
    estimatedDeliveryDate: new Date('2024-12-17'),
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-13',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-08T10:30:00')
      },
      {
        id: 'hist-14',
        type: 'label_created',
        description: 'Shipping label created via USPS',
        timestamp: new Date('2024-12-11T14:00:00')
      },
      {
        id: 'hist-15',
        type: 'shipped',
        description: 'Package shipped',
        timestamp: new Date('2024-12-11T16:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-08T10:30:00'),
    updatedAt: new Date('2024-12-11T16:00:00')
  },
  {
    id: 'order-9',
    etsyReceiptId: 2847591021,
    orderNumber: '2847591021',
    pipelineStage: 'shipped',
    customerId: 'cust-3',
    buyerName: 'Emily Rodriguez',
    buyerEmail: 'emily.rod@outlook.com',
    shippingAddress: {
      name: 'Emily Rodriguez',
      addressLine1: '789 Pine Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-12',
        listingId: 1234567899,
        title: 'Handwoven Wall Tapestry',
        description: 'Bohemian style handwoven wall hanging',
        quantity: 1,
        price: 85.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/tapestry.jpg',
        sku: 'TAP-BOHO-001'
      }
    ],
    subtotal: 85.00,
    shippingCost: 9.95,
    tax: 7.65,
    totalAmount: 102.60,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-07T13:15:00'),
    shipByDate: new Date('2024-12-12'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: true,
    trackingNumber: '1Z999AA10123456784',
    carrierName: 'UPS',
    trackingStatus: 'out_for_delivery',
    estimatedDeliveryDate: new Date('2024-12-15'),
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-16',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-07T13:15:00')
      },
      {
        id: 'hist-17',
        type: 'shipped',
        description: 'Package shipped via UPS',
        timestamp: new Date('2024-12-10T10:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-07T13:15:00'),
    updatedAt: new Date('2024-12-10T10:00:00')
  },

  // Delivered
  {
    id: 'order-10',
    etsyReceiptId: 2847591015,
    orderNumber: '2847591015',
    pipelineStage: 'delivered',
    customerId: 'cust-7',
    buyerName: 'Lisa Thompson',
    buyerEmail: 'lisa.t@hotmail.com',
    shippingAddress: {
      name: 'Lisa Thompson',
      addressLine1: '888 Birch Boulevard',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-13',
        listingId: 1234567890,
        title: 'Handmade Ceramic Mug - Forest Green',
        description: 'Beautiful handcrafted ceramic mug with forest green glaze',
        quantity: 2,
        price: 15.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/ceramic-mug-green.jpg',
        sku: 'MUG-FOREST-001'
      }
    ],
    subtotal: 30.00,
    shippingCost: 5.95,
    tax: 2.70,
    totalAmount: 38.65,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-01T08:00:00'),
    shipByDate: new Date('2024-12-06'),
    etsyStatus: 'completed',
    isPaid: true,
    isShipped: true,
    trackingNumber: '9400111899223456789000',
    carrierName: 'USPS',
    trackingStatus: 'delivered',
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-18',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-01T08:00:00')
      },
      {
        id: 'hist-19',
        type: 'shipped',
        description: 'Package shipped',
        timestamp: new Date('2024-12-04T15:00:00')
      },
      {
        id: 'hist-20',
        type: 'delivered',
        description: 'Package delivered',
        timestamp: new Date('2024-12-08T14:30:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-12-01T08:00:00'),
    updatedAt: new Date('2024-12-08T14:30:00')
  },
  {
    id: 'order-11',
    etsyReceiptId: 2847591016,
    orderNumber: '2847591016',
    pipelineStage: 'delivered',
    customerId: 'cust-5',
    buyerName: 'Amanda Foster',
    buyerEmail: 'afoster@email.com',
    shippingAddress: {
      name: 'Amanda Foster',
      addressLine1: '555 Cedar Road',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-14',
        listingId: 1234567900,
        title: 'Embroidered Tote Bag',
        description: 'Canvas tote with custom embroidery',
        quantity: 1,
        price: 32.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/tote.jpg',
        sku: 'TOTE-EMB-001'
      }
    ],
    subtotal: 32.00,
    shippingCost: 4.95,
    tax: 2.88,
    totalAmount: 39.83,
    currencyCode: 'USD',
    orderDate: new Date('2024-11-28T11:45:00'),
    shipByDate: new Date('2024-12-03'),
    etsyStatus: 'completed',
    isPaid: true,
    isShipped: true,
    trackingNumber: '9400111899223456789001',
    carrierName: 'USPS',
    trackingStatus: 'delivered',
    isGift: false,
    tags: [],
    notes: [],
    history: [
      {
        id: 'hist-21',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-11-28T11:45:00')
      },
      {
        id: 'hist-22',
        type: 'shipped',
        description: 'Package shipped',
        timestamp: new Date('2024-11-30T10:00:00')
      },
      {
        id: 'hist-23',
        type: 'delivered',
        description: 'Package delivered',
        timestamp: new Date('2024-12-05T16:00:00')
      }
    ],
    hasIssue: false,
    createdAt: new Date('2024-11-28T11:45:00'),
    updatedAt: new Date('2024-12-05T16:00:00')
  },

  // Needs Attention
  {
    id: 'order-12',
    etsyReceiptId: 2847591010,
    orderNumber: '2847591010',
    pipelineStage: 'needs-attention',
    customerId: 'cust-4',
    buyerName: 'James Wilson',
    buyerEmail: 'jwilson@yahoo.com',
    shippingAddress: {
      name: 'James Wilson',
      addressLine1: '444 Walnut Way',
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85001',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'item-15',
        listingId: 1234567901,
        title: 'Sterling Silver Ring - Size 9',
        description: 'Handcrafted sterling silver band',
        quantity: 1,
        price: 55.00,
        imageUrl: 'https://i.etsystatic.com/placeholder/ring.jpg',
        sku: 'RING-SS-9'
      }
    ],
    subtotal: 55.00,
    shippingCost: 4.50,
    tax: 4.95,
    totalAmount: 64.45,
    currencyCode: 'USD',
    orderDate: new Date('2024-12-05T09:30:00'),
    shipByDate: new Date('2024-12-10'),
    etsyStatus: 'paid',
    isPaid: true,
    isShipped: true,
    trackingNumber: '9400111899223456789002',
    carrierName: 'USPS',
    trackingStatus: 'delivered',
    isGift: false,
    tags: ['Issue'],
    notes: [
      {
        id: 'note-3',
        content: 'Customer claims package not received. Tracking shows delivered on Dec 9. This customer has a history of delivery disputes.',
        createdAt: new Date('2024-12-12T10:00:00')
      }
    ],
    history: [
      {
        id: 'hist-24',
        type: 'created',
        description: 'Order placed',
        timestamp: new Date('2024-12-05T09:30:00')
      },
      {
        id: 'hist-25',
        type: 'shipped',
        description: 'Package shipped',
        timestamp: new Date('2024-12-07T14:00:00')
      },
      {
        id: 'hist-26',
        type: 'delivered',
        description: 'Package marked as delivered',
        timestamp: new Date('2024-12-09T11:00:00')
      },
      {
        id: 'hist-27',
        type: 'moved',
        description: 'Moved to Needs Attention - Customer dispute',
        timestamp: new Date('2024-12-12T10:00:00')
      }
    ],
    hasIssue: true,
    issueType: 'delivery_dispute',
    createdAt: new Date('2024-12-05T09:30:00'),
    updatedAt: new Date('2024-12-12T10:00:00')
  }
];

// Helper to get customer by ID
export function getCustomerById(customerId: string): Customer | undefined {
  return mockCustomers.find(c => c.id === customerId);
}

// Helper to get orders by stage
export function getOrdersByStage(stage: PipelineStage): Order[] {
  return mockOrders.filter(o => o.pipelineStage === stage);
}

// Helper to get customer for order
export function getCustomerForOrder(order: Order): Customer | undefined {
  return getCustomerById(order.customerId);
}
