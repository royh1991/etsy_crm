/**
 * Etsy CRM Database Seed
 *
 * This seed file creates 50 high-fidelity mock orders that closely match
 * the Etsy Open API v3 data structure. Based on:
 * - ShopReceipt schema (order-level data)
 * - ShopReceiptTransaction schema (line items with variations)
 * - ListingImage schema (image URLs)
 *
 * References:
 * - https://developers.etsy.com/documentation/reference
 * - https://github.com/etsy/open-api
 */

import { PrismaClient, PipelineStage, CustomerTier, UserRole, CustomerFlagType, OrderHistoryType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// ETSY-STYLE IMAGE URLS
// Format: https://i.etsystatic.com/{shop_id}/r/il/{hash}/{listing_id}/il_{size}.{listing_id}_{suffix}.jpg
// ============================================
const ETSY_IMAGES = {
  ceramicMugs: [
    'https://i.etsystatic.com/19638867/r/il/25848a/3587299176/il_1588xN.3587299176_rzgl.jpg',
    'https://i.etsystatic.com/23506300/r/il/4c4d03/2893019836/il_1588xN.2893019836_mx9k.jpg',
    'https://i.etsystatic.com/17295761/r/il/d9f89f/2899099991/il_1588xN.2899099991_fxkn.jpg',
    'https://i.etsystatic.com/6648305/r/il/80e55a/1949548012/il_1588xN.1949548012_8v5t.jpg',
  ],
  jewelry: [
    'https://i.etsystatic.com/15004640/r/il/f5c5e8/2401178045/il_1588xN.2401178045_q0zq.jpg',
    'https://i.etsystatic.com/17682916/r/il/8b0c74/3894428236/il_1588xN.3894428236_97ey.jpg',
    'https://i.etsystatic.com/11084465/r/il/cc46ea/3291649518/il_1588xN.3291649518_p9uy.jpg',
    'https://i.etsystatic.com/23215382/r/il/63a7b1/2802024714/il_1588xN.2802024714_dlqr.jpg',
  ],
  candles: [
    'https://i.etsystatic.com/23056825/r/il/a6b7e7/3031571838/il_1588xN.3031571838_tqcd.jpg',
    'https://i.etsystatic.com/20604737/r/il/7ff93e/2795989544/il_1588xN.2795989544_8crl.jpg',
    'https://i.etsystatic.com/14194225/r/il/c3e7ab/2339291621/il_1588xN.2339291621_7b6k.jpg',
  ],
  textiles: [
    'https://i.etsystatic.com/15817542/r/il/2a0c41/3016698454/il_1588xN.3016698454_qdg3.jpg',
    'https://i.etsystatic.com/18392290/r/il/cec6bc/2744387576/il_1588xN.2744387576_fqpj.jpg',
    'https://i.etsystatic.com/11178227/r/il/a4c4d0/2920831898/il_1588xN.2920831898_1t9z.jpg',
  ],
  art: [
    'https://i.etsystatic.com/14249054/r/il/f1ec84/2800149842/il_1588xN.2800149842_9h1k.jpg',
    'https://i.etsystatic.com/17947474/r/il/8c5a67/3040239476/il_1588xN.3040239476_5wak.jpg',
    'https://i.etsystatic.com/6793013/r/il/4b4d03/2577990858/il_1588xN.2577990858_4qe5.jpg',
  ],
  leather: [
    'https://i.etsystatic.com/5837401/r/il/9e9c83/2367063954/il_1588xN.2367063954_bv2t.jpg',
    'https://i.etsystatic.com/17270612/r/il/c4f654/2798651346/il_1588xN.2798651346_1y3d.jpg',
    'https://i.etsystatic.com/8891276/r/il/a41e63/2619927316/il_1588xN.2619927316_f78r.jpg',
  ],
  homeDecor: [
    'https://i.etsystatic.com/16125893/r/il/aeca0a/3044808712/il_1588xN.3044808712_m3j1.jpg',
    'https://i.etsystatic.com/20834326/r/il/7ae8c6/2800142346/il_1588xN.2800142346_s2o7.jpg',
    'https://i.etsystatic.com/10450506/r/il/f29d0e/2389721636/il_1588xN.2389721636_c4qp.jpg',
  ],
  clothing: [
    'https://i.etsystatic.com/14108928/r/il/e7f8c5/2961318982/il_1588xN.2961318982_3x4h.jpg',
    'https://i.etsystatic.com/21257638/r/il/c8a9d7/2757812398/il_1588xN.2757812398_6tqu.jpg',
    'https://i.etsystatic.com/16890434/r/il/a4e3b8/2890147652/il_1588xN.2890147652_hn8k.jpg',
  ],
};

// ============================================
// ETSY VARIATION PROPERTY IDS (from Etsy API)
// These match the actual Etsy property_id values
// ============================================
const ETSY_PROPERTIES = {
  primaryColor: { property_id: 200, property_name: 'Primary color' },
  secondaryColor: { property_id: 52, property_name: 'Secondary color' },
  size: { property_id: 100, property_name: 'Size' },
  material: { property_id: 507, property_name: 'Material' },
  style: { property_id: 511, property_name: 'Style' },
  scent: { property_id: 508, property_name: 'Scent' },
  length: { property_id: 501, property_name: 'Length' },
  width: { property_id: 502, property_name: 'Width' },
  customization: { property_id: 513, property_name: 'Personalization' },
};

// Color options with Etsy value_ids
const COLORS = [
  { value_id: 1, value: 'Black' },
  { value_id: 2, value: 'White' },
  { value_id: 3, value: 'Blue' },
  { value_id: 4, value: 'Green' },
  { value_id: 5, value: 'Red' },
  { value_id: 6, value: 'Pink' },
  { value_id: 7, value: 'Purple' },
  { value_id: 8, value: 'Gold' },
  { value_id: 9, value: 'Silver' },
  { value_id: 10, value: 'Rose Gold' },
  { value_id: 11, value: 'Navy' },
  { value_id: 12, value: 'Sage Green' },
  { value_id: 13, value: 'Terracotta' },
  { value_id: 14, value: 'Ocean Blue' },
  { value_id: 15, value: 'Forest Green' },
];

const SIZES = [
  { value_id: 100, value: 'XS' },
  { value_id: 101, value: 'S' },
  { value_id: 102, value: 'M' },
  { value_id: 103, value: 'L' },
  { value_id: 104, value: 'XL' },
  { value_id: 105, value: 'XXL' },
  { value_id: 110, value: '6 oz' },
  { value_id: 111, value: '8 oz' },
  { value_id: 112, value: '10 oz' },
  { value_id: 113, value: '12 oz' },
  { value_id: 114, value: '16 oz' },
  { value_id: 120, value: '5x7"' },
  { value_id: 121, value: '8x10"' },
  { value_id: 122, value: '11x14"' },
  { value_id: 123, value: '16x20"' },
  { value_id: 130, value: 'Size 5' },
  { value_id: 131, value: 'Size 6' },
  { value_id: 132, value: 'Size 7' },
  { value_id: 133, value: 'Size 8' },
  { value_id: 134, value: 'Size 9' },
];

const MATERIALS = [
  { value_id: 200, value: 'Sterling Silver' },
  { value_id: 201, value: '14K Gold Filled' },
  { value_id: 202, value: 'Stainless Steel' },
  { value_id: 203, value: 'Ceramic' },
  { value_id: 204, value: 'Stoneware' },
  { value_id: 205, value: 'Porcelain' },
  { value_id: 206, value: 'Soy Wax' },
  { value_id: 207, value: 'Beeswax' },
  { value_id: 208, value: '100% Cotton' },
  { value_id: 209, value: 'Linen' },
  { value_id: 210, value: 'Full Grain Leather' },
  { value_id: 211, value: 'Vegetable Tanned Leather' },
  { value_id: 212, value: 'Canvas' },
];

const SCENTS = [
  { value_id: 300, value: 'Lavender' },
  { value_id: 301, value: 'Vanilla Bean' },
  { value_id: 302, value: 'Fresh Linen' },
  { value_id: 303, value: 'Eucalyptus Mint' },
  { value_id: 304, value: 'Cedar & Sage' },
  { value_id: 305, value: 'Rose Garden' },
  { value_id: 306, value: 'Ocean Breeze' },
  { value_id: 307, value: 'Cinnamon Spice' },
];

// ============================================
// PRODUCT CATALOG (Etsy-style listings)
// ============================================
interface ProductTemplate {
  category: keyof typeof ETSY_IMAGES;
  title: string;
  description: string;
  basePrice: number;
  hasColorVariation: boolean;
  hasSizeVariation: boolean;
  hasMaterialVariation: boolean;
  hasScentVariation: boolean;
  skuPrefix: string;
  tags: string[];
}

const PRODUCTS: ProductTemplate[] = [
  {
    category: 'ceramicMugs',
    title: 'Handmade Ceramic Mug',
    description: 'Beautiful handcrafted ceramic mug, perfect for your morning coffee or tea. Each piece is unique.',
    basePrice: 28.00,
    hasColorVariation: true,
    hasSizeVariation: true,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'MUG',
    tags: ['Custom', 'Gift Order'],
  },
  {
    category: 'jewelry',
    title: 'Personalized Name Necklace',
    description: 'Custom name necklace in your choice of metal finish. Perfect gift for loved ones.',
    basePrice: 45.00,
    hasColorVariation: false,
    hasSizeVariation: false,
    hasMaterialVariation: true,
    hasScentVariation: false,
    skuPrefix: 'NKL',
    tags: ['Custom', 'Gift Order'],
  },
  {
    category: 'jewelry',
    title: 'Dainty Birthstone Ring',
    description: 'Minimalist birthstone ring with genuine gemstone. Available in multiple sizes.',
    basePrice: 52.00,
    hasColorVariation: false,
    hasSizeVariation: true,
    hasMaterialVariation: true,
    hasScentVariation: false,
    skuPrefix: 'RNG',
    tags: ['Custom'],
  },
  {
    category: 'candles',
    title: 'Hand-Poured Soy Candle',
    description: 'All-natural soy wax candle with essential oils. Clean burning with cotton wick.',
    basePrice: 24.00,
    hasColorVariation: false,
    hasSizeVariation: true,
    hasMaterialVariation: false,
    hasScentVariation: true,
    skuPrefix: 'CDL',
    tags: ['Art'],
  },
  {
    category: 'textiles',
    title: 'Hand-Knitted Wool Scarf',
    description: 'Cozy handmade scarf using premium wool yarn. Perfect for cold weather.',
    basePrice: 65.00,
    hasColorVariation: true,
    hasSizeVariation: false,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'SCF',
    tags: ['Custom'],
  },
  {
    category: 'art',
    title: 'Custom Watercolor Pet Portrait',
    description: 'Hand-painted watercolor portrait of your beloved pet from photo. Framing not included.',
    basePrice: 85.00,
    hasColorVariation: false,
    hasSizeVariation: true,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'PRT',
    tags: ['Custom', 'Art'],
  },
  {
    category: 'leather',
    title: 'Personalized Leather Journal',
    description: 'Premium leather journal with custom embossing. Perfect for writers and travelers.',
    basePrice: 48.00,
    hasColorVariation: true,
    hasSizeVariation: true,
    hasMaterialVariation: true,
    hasScentVariation: false,
    skuPrefix: 'JNL',
    tags: ['Custom', 'Gift Order'],
  },
  {
    category: 'homeDecor',
    title: 'Macrame Wall Hanging',
    description: 'Bohemian macrame wall art, handwoven with natural cotton cord.',
    basePrice: 78.00,
    hasColorVariation: true,
    hasSizeVariation: true,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'MAC',
    tags: ['Art'],
  },
  {
    category: 'clothing',
    title: 'Embroidered Linen Tote Bag',
    description: 'Eco-friendly linen tote with custom embroidery. Perfect for everyday use.',
    basePrice: 38.00,
    hasColorVariation: true,
    hasSizeVariation: false,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'TOT',
    tags: ['Custom'],
  },
  {
    category: 'ceramicMugs',
    title: 'Ceramic Planter Pot',
    description: 'Minimalist ceramic planter with drainage hole. Perfect for succulents.',
    basePrice: 32.00,
    hasColorVariation: true,
    hasSizeVariation: true,
    hasMaterialVariation: false,
    hasScentVariation: false,
    skuPrefix: 'PLT',
    tags: ['Art'],
  },
];

// ============================================
// CUSTOMER DATA
// ============================================
interface CustomerData {
  name: string;
  email: string;
  etsyBuyerId: string;
  addresses: ShippingAddress[];
}

interface ShippingAddress {
  name: string;
  first_line: string;
  second_line?: string;
  city: string;
  state: string;
  zip: string;
  country_iso: string;
  formatted_address: string;
}

const CUSTOMERS: CustomerData[] = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    etsyBuyerId: '287459321',
    addresses: [{
      name: 'Sarah Mitchell',
      first_line: '1842 Oak Valley Drive',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      country_iso: 'US',
      formatted_address: '1842 Oak Valley Drive, Austin, TX 78704, United States',
    }],
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    etsyBuyerId: '392847561',
    addresses: [{
      name: 'Emily Chen',
      first_line: '567 Pacific Heights Blvd',
      second_line: 'Apt 12B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94115',
      country_iso: 'US',
      formatted_address: '567 Pacific Heights Blvd, Apt 12B, San Francisco, CA 94115, United States',
    }],
  },
  {
    name: 'Michael Roberts',
    email: 'michael.r@email.com',
    etsyBuyerId: '184729356',
    addresses: [{
      name: 'Michael Roberts',
      first_line: '2901 Lakeshore Drive',
      city: 'Chicago',
      state: 'IL',
      zip: '60657',
      country_iso: 'US',
      formatted_address: '2901 Lakeshore Drive, Chicago, IL 60657, United States',
    }],
  },
  {
    name: 'Jessica Thompson',
    email: 'jess.thompson@email.com',
    etsyBuyerId: '459127384',
    addresses: [{
      name: 'Jessica Thompson',
      first_line: '78 Beacon Street',
      city: 'Boston',
      state: 'MA',
      zip: '02108',
      country_iso: 'US',
      formatted_address: '78 Beacon Street, Boston, MA 02108, United States',
    }],
  },
  {
    name: 'David Kim',
    email: 'david.kim@email.com',
    etsyBuyerId: '573918264',
    addresses: [{
      name: 'David Kim',
      first_line: '4521 Brooklyn Avenue NE',
      city: 'Seattle',
      state: 'WA',
      zip: '98105',
      country_iso: 'US',
      formatted_address: '4521 Brooklyn Avenue NE, Seattle, WA 98105, United States',
    }],
  },
  {
    name: 'Amanda Foster',
    email: 'amanda.foster@email.com',
    etsyBuyerId: '629184753',
    addresses: [{
      name: 'Amanda Foster',
      first_line: '1234 Peachtree Street NW',
      second_line: 'Suite 500',
      city: 'Atlanta',
      state: 'GA',
      zip: '30309',
      country_iso: 'US',
      formatted_address: '1234 Peachtree Street NW, Suite 500, Atlanta, GA 30309, United States',
    }],
  },
  {
    name: 'James Wilson',
    email: 'jwilson@email.com',
    etsyBuyerId: '738291645',
    addresses: [{
      name: 'James Wilson',
      first_line: '890 Fifth Avenue',
      second_line: 'Apt 32C',
      city: 'New York',
      state: 'NY',
      zip: '10021',
      country_iso: 'US',
      formatted_address: '890 Fifth Avenue, Apt 32C, New York, NY 10021, United States',
    }],
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    etsyBuyerId: '847291536',
    addresses: [{
      name: 'Rachel Green',
      first_line: '456 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90028',
      country_iso: 'US',
      formatted_address: '456 Sunset Boulevard, Los Angeles, CA 90028, United States',
    }],
  },
  {
    name: 'Thomas Anderson',
    email: 'thomas.anderson@email.com',
    etsyBuyerId: '918273645',
    addresses: [{
      name: 'Thomas Anderson',
      first_line: '2468 Congress Avenue',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country_iso: 'US',
      formatted_address: '2468 Congress Avenue, Austin, TX 78701, United States',
    }],
  },
  {
    name: 'Sophie Williams',
    email: 'sophie.w@email.com',
    etsyBuyerId: '192837465',
    addresses: [{
      name: 'Sophie Williams',
      first_line: '321 Royal Street',
      city: 'New Orleans',
      state: 'LA',
      zip: '70130',
      country_iso: 'US',
      formatted_address: '321 Royal Street, New Orleans, LA 70130, United States',
    }],
  },
  {
    name: 'Oliver Martinez',
    email: 'oliver.m@email.com',
    etsyBuyerId: '283746591',
    addresses: [{
      name: 'Oliver Martinez',
      first_line: '7890 South Beach Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
      country_iso: 'US',
      formatted_address: '7890 South Beach Drive, Miami, FL 33139, United States',
    }],
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    etsyBuyerId: '374859162',
    addresses: [{
      name: 'Emma Davis',
      first_line: '5678 Cherry Creek Drive',
      city: 'Denver',
      state: 'CO',
      zip: '80206',
      country_iso: 'US',
      formatted_address: '5678 Cherry Creek Drive, Denver, CO 80206, United States',
    }],
  },
  {
    name: 'Charlotte Brown',
    email: 'charlotte.b@email.com',
    etsyBuyerId: '465738291',
    addresses: [{
      name: 'Charlotte Brown',
      first_line: '12 Rideau Street',
      city: 'Ottawa',
      state: 'ON',
      zip: 'K1N 5X1',
      country_iso: 'CA',
      formatted_address: '12 Rideau Street, Ottawa, ON K1N 5X1, Canada',
    }],
  },
  {
    name: 'William Taylor',
    email: 'william.t@email.com',
    etsyBuyerId: '546829173',
    addresses: [{
      name: 'William Taylor',
      first_line: '45 Queen Street West',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5H 2M5',
      country_iso: 'CA',
      formatted_address: '45 Queen Street West, Toronto, ON M5H 2M5, Canada',
    }],
  },
  {
    name: 'Isabella Moore',
    email: 'isabella.moore@email.com',
    etsyBuyerId: '637482915',
    addresses: [{
      name: 'Isabella Moore',
      first_line: '88 Granville Street',
      city: 'Vancouver',
      state: 'BC',
      zip: 'V6C 1S4',
      country_iso: 'CA',
      formatted_address: '88 Granville Street, Vancouver, BC V6C 1S4, Canada',
    }],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(daysAgo: number, daysAgoEnd: number = 0): Date {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  const end = new Date();
  end.setDate(end.getDate() - daysAgoEnd);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEtsyReceiptId(): string {
  return String(randomInt(2000000000, 2999999999));
}

function generateEtsyTransactionId(): string {
  return String(randomInt(3000000000, 3999999999));
}

function generateEtsyListingId(): string {
  return String(randomInt(1000000000, 1999999999));
}

function generateOrderNumber(index: number): string {
  return `#${String(591000 + index).padStart(6, '0')}`;
}

function generateTrackingNumber(carrier: string): string {
  if (carrier === 'USPS') {
    return `9400111899${randomInt(100000000, 999999999)}`;
  } else if (carrier === 'UPS') {
    return `1Z999AA1${randomInt(10000000, 99999999)}`;
  } else if (carrier === 'FedEx') {
    return `7489${randomInt(10000000, 99999999)}`;
  }
  return `TRK${randomInt(1000000000, 9999999999)}`;
}

function buildVariations(product: ProductTemplate): object[] {
  const variations: object[] = [];

  if (product.hasColorVariation) {
    const color = randomElement(COLORS);
    variations.push({
      property_id: ETSY_PROPERTIES.primaryColor.property_id,
      property_name: ETSY_PROPERTIES.primaryColor.property_name,
      scale_id: null,
      scale_name: null,
      value_ids: [color.value_id],
      values: [color.value],
    });
  }

  if (product.hasSizeVariation) {
    const size = randomElement(SIZES);
    variations.push({
      property_id: ETSY_PROPERTIES.size.property_id,
      property_name: ETSY_PROPERTIES.size.property_name,
      scale_id: null,
      scale_name: null,
      value_ids: [size.value_id],
      values: [size.value],
    });
  }

  if (product.hasMaterialVariation) {
    const material = randomElement(MATERIALS);
    variations.push({
      property_id: ETSY_PROPERTIES.material.property_id,
      property_name: ETSY_PROPERTIES.material.property_name,
      scale_id: null,
      scale_name: null,
      value_ids: [material.value_id],
      values: [material.value],
    });
  }

  if (product.hasScentVariation) {
    const scent = randomElement(SCENTS);
    variations.push({
      property_id: ETSY_PROPERTIES.scent.property_id,
      property_name: ETSY_PROPERTIES.scent.property_name,
      scale_id: null,
      scale_name: null,
      value_ids: [scent.value_id],
      values: [scent.value],
    });
  }

  return variations;
}

function getVariationSummary(variations: object[]): string {
  return (variations as any[])
    .map(v => `${v.property_name}: ${v.values[0]}`)
    .join(', ');
}

function calculateCustomerTier(totalSpent: number): CustomerTier {
  if (totalSpent >= 500) return 'VIP';
  if (totalSpent >= 200) return 'GOLD';
  if (totalSpent >= 100) return 'SILVER';
  return 'BRONZE';
}

function assignPipelineStage(orderDate: Date, isShipped: boolean): PipelineStage {
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  if (isShipped) {
    if (daysSinceOrder > 7) {
      return Math.random() > 0.3 ? 'DELIVERED' : 'SHIPPED';
    }
    return 'SHIPPED';
  }

  if (daysSinceOrder > 5) {
    return Math.random() > 0.8 ? 'NEEDS_ATTENTION' : 'READY_TO_SHIP';
  }
  if (daysSinceOrder > 2) {
    return Math.random() > 0.5 ? 'READY_TO_SHIP' : 'PROCESSING';
  }
  if (daysSinceOrder > 0) {
    return Math.random() > 0.5 ? 'PROCESSING' : 'NEW';
  }
  return 'NEW';
}

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function main() {
  console.log('🌱 Starting Etsy CRM database seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.orderHistory.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shippingLabel.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerFlag.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.savedFilter.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  // Create shop
  console.log('🏪 Creating shop...');
  const shop = await prisma.shop.create({
    data: {
      etsyShopId: '19638867',
      shopName: 'Artisan Crafts Studio',
      shopUrl: 'https://www.etsy.com/shop/ArtisanCraftsStudio',
      iconUrl: 'https://i.etsystatic.com/isla/d5d8c1/38745912/isla_75x75.38745912_p0dwylmf.jpg',
      autoSyncEnabled: true,
      syncIntervalMins: 15,
      lastSyncAt: new Date(),
    },
  });
  console.log(`   ✓ Shop created: ${shop.shopName}`);

  // Create user
  console.log('👤 Creating shop owner...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      shopId: shop.id,
      email: 'owner@artisancrafts.com',
      passwordHash,
      name: 'Shop Owner',
      role: 'OWNER',
    },
  });
  console.log(`   ✓ User created: ${user.email}`);

  // Create customers and track their order stats
  console.log('👥 Creating customers...');
  const customerMap = new Map<string, { id: string; orderCount: number; totalSpent: number }>();

  for (const customerData of CUSTOMERS) {
    const customer = await prisma.customer.create({
      data: {
        shopId: shop.id,
        etsyBuyerId: customerData.etsyBuyerId,
        name: customerData.name,
        email: customerData.email,
        orderCount: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        tier: 'BRONZE',
      },
    });
    customerMap.set(customerData.email, { id: customer.id, orderCount: 0, totalSpent: 0 });
  }
  console.log(`   ✓ ${CUSTOMERS.length} customers created`);

  // Generate 50 orders
  console.log('📦 Creating 50 orders with Etsy API-style data...\n');

  const carriers = ['USPS', 'UPS', 'FedEx'];
  const buyerMessages = [
    null,
    'Please ship as soon as possible - this is a gift!',
    'Can you include a gift receipt?',
    'Please use eco-friendly packaging if possible.',
    'This is for my mom\'s birthday on the 15th!',
    null,
    'I love your work! Can\'t wait to receive it.',
    null,
    'Please handle with care.',
    null,
  ];

  for (let i = 0; i < 50; i++) {
    const customerData = randomElement(CUSTOMERS);
    const customerInfo = customerMap.get(customerData.email)!;
    const address = randomElement(customerData.addresses);

    // Determine order characteristics
    const orderDate = randomDate(45, 0);
    const isGift = Math.random() > 0.7;
    const hasIssue = Math.random() > 0.92;
    const isShipped = Math.random() > 0.35;
    const pipelineStage = hasIssue ? 'NEEDS_ATTENTION' : assignPipelineStage(orderDate, isShipped);

    // Calculate ship by date (3-7 business days from order)
    const shipByDate = new Date(orderDate);
    shipByDate.setDate(shipByDate.getDate() + randomInt(3, 7));

    // Generate 1-4 items per order
    const numItems = Math.random() > 0.7 ? randomInt(2, 4) : 1;
    const orderItems: {
      etsyTransactionId: string;
      etsyListingId: string;
      title: string;
      quantity: number;
      price: number;
      sku: string;
      imageUrl: string;
      personalization: string | null;
      variations: object[];
    }[] = [];

    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = randomElement(PRODUCTS);
      const images = ETSY_IMAGES[product.category];
      const imageUrl = randomElement(images);
      const variations = buildVariations(product);
      const quantity = Math.random() > 0.85 ? randomInt(2, 3) : 1;
      const priceVariation = randomFloat(-5, 15);
      const itemPrice = Math.max(product.basePrice + priceVariation, 15);

      // Build title with variation info
      const variationSummary = getVariationSummary(variations);
      const fullTitle = variationSummary
        ? `${product.title} - ${variationSummary}`
        : product.title;

      orderItems.push({
        etsyTransactionId: generateEtsyTransactionId(),
        etsyListingId: generateEtsyListingId(),
        title: fullTitle,
        quantity,
        price: itemPrice,
        sku: `${product.skuPrefix}-${randomInt(1000, 9999)}`,
        imageUrl,
        personalization: Math.random() > 0.7 ? `Name: ${customerData.name.split(' ')[0]}` : null,
        variations,
      });

      subtotal += itemPrice * quantity;
    }

    // Calculate totals (Etsy-style)
    const shippingCost = subtotal > 75 ? 0 : randomFloat(4.99, 12.99);
    const taxRate = randomFloat(0.05, 0.10);
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const discountAmount = Math.random() > 0.85 ? parseFloat((subtotal * randomFloat(0.1, 0.2)).toFixed(2)) : 0;
    const totalAmount = parseFloat((subtotal - discountAmount + shippingCost + taxAmount).toFixed(2));

    // Tracking info for shipped orders
    const carrier = isShipped ? randomElement(carriers) : null;
    const trackingNumber = isShipped && carrier ? generateTrackingNumber(carrier) : null;
    const shippedAt = isShipped ? new Date(orderDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000) : null;

    // Create order
    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        customerId: customerInfo.id,
        etsyReceiptId: generateEtsyReceiptId(),
        orderNumber: generateOrderNumber(i + 1),
        pipelineStage,
        totalAmount,
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        currency: 'USD',
        shippingAddress: address as any,
        shipByDate,
        carrierName: carrier,
        trackingNumber,
        isShipped,
        shippedAt,
        deliveredAt: pipelineStage === 'DELIVERED' ? new Date(shippedAt!.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000) : null,
        isGift,
        giftMessage: isGift ? `Happy Birthday! Love, ${randomElement(['Mom', 'Dad', 'Your Secret Admirer', 'The Family', 'Best Friend'])}` : null,
        buyerNote: randomElement(buyerMessages),
        hasIssue,
        issueDescription: hasIssue ? randomElement([
          'Customer reported damaged packaging',
          'Wrong color shipped',
          'Item arrived late',
          'Missing item from order',
          'Quality concern raised by customer',
        ]) : null,
        tags: randomElement(PRODUCTS).tags.slice(0, Math.random() > 0.5 ? 1 : 2),
        sortOrder: i,
        orderedAt: orderDate,
        paidAt: orderDate,
        items: {
          create: orderItems.map(item => ({
            etsyTransactionId: item.etsyTransactionId,
            etsyListingId: item.etsyListingId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku,
            imageUrl: item.imageUrl,
            personalization: item.personalization,
            variations: item.variations as any,
          })),
        },
        history: {
          create: [
            {
              type: 'CREATED',
              description: 'Order received from Etsy',
              createdAt: orderDate,
            },
            ...(isShipped ? [{
              type: 'SHIPPED' as OrderHistoryType,
              description: `Shipped via ${carrier} - ${trackingNumber}`,
              createdAt: shippedAt!,
            }] : []),
            ...(pipelineStage === 'DELIVERED' ? [{
              type: 'DELIVERED' as OrderHistoryType,
              description: 'Package delivered',
              createdAt: new Date(shippedAt!.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000),
            }] : []),
            ...(hasIssue ? [{
              type: 'ISSUE_FLAGGED' as OrderHistoryType,
              description: 'Issue flagged for attention',
              createdAt: new Date(),
            }] : []),
          ],
        },
      },
    });

    // Update customer stats
    customerInfo.orderCount++;
    customerInfo.totalSpent += totalAmount;

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`   📦 ${i + 1}/50 orders created...`);
    }
  }

  // Update customer statistics
  console.log('\n📊 Updating customer statistics...');
  for (const [email, stats] of customerMap) {
    const tier = calculateCustomerTier(stats.totalSpent);
    await prisma.customer.update({
      where: { id: stats.id },
      data: {
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        averageOrderValue: stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0,
        isRepeatCustomer: stats.orderCount > 1,
        tier,
        firstOrderAt: new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000),
        lastOrderAt: new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Add some customer flags
  console.log('🚩 Adding customer flags...');
  const allCustomers = await prisma.customer.findMany();
  const vipCustomers = allCustomers.filter(c => c.tier === 'VIP');

  for (const vip of vipCustomers) {
    await prisma.customerFlag.create({
      data: {
        customerId: vip.id,
        type: 'VIP',
        reason: 'High-value repeat customer',
      },
    });
  }

  // Add a difficult customer flag
  const randomCustomer = randomElement(allCustomers);
  await prisma.customerFlag.create({
    data: {
      customerId: randomCustomer.id,
      type: 'SPECIAL_INSTRUCTIONS',
      reason: 'Prefers signature confirmation on all packages',
    },
  });

  // Create sync log
  console.log('📝 Creating sync log...');
  await prisma.syncLog.create({
    data: {
      shopId: shop.id,
      type: 'MANUAL',
      status: 'COMPLETED',
      ordersCreated: 50,
      ordersUpdated: 0,
      customersCreated: CUSTOMERS.length,
      customersUpdated: 0,
      completedAt: new Date(),
    },
  });

  // Create message templates
  console.log('📧 Creating message templates...');
  const templates = [
    {
      name: 'Order Shipped',
      subject: 'Your order has shipped!',
      body: 'Hi {{customer_name}},\n\nGreat news! Your order {{order_number}} has shipped and is on its way to you.\n\nTracking: {{tracking_number}}\nCarrier: {{carrier}}\n\nThank you for your order!\n\n- Artisan Crafts Studio',
      category: 'shipping',
      variables: ['customer_name', 'order_number', 'tracking_number', 'carrier'],
    },
    {
      name: 'Thank You',
      subject: 'Thank you for your purchase!',
      body: 'Hi {{customer_name}},\n\nThank you so much for your order! We truly appreciate your support of our small business.\n\nIf you love your purchase, we\'d be so grateful if you could leave us a review on Etsy.\n\nBest,\nArtisan Crafts Studio',
      category: 'follow-up',
      variables: ['customer_name'],
    },
    {
      name: 'Delay Notice',
      subject: 'Update on your order {{order_number}}',
      body: 'Hi {{customer_name}},\n\nWe wanted to let you know that there will be a slight delay with your order {{order_number}}. We expect to ship by {{new_ship_date}}.\n\nWe apologize for any inconvenience and appreciate your patience!\n\nBest,\nArtisan Crafts Studio',
      category: 'updates',
      variables: ['customer_name', 'order_number', 'new_ship_date'],
    },
  ];

  for (const template of templates) {
    await prisma.messageTemplate.create({
      data: {
        shopId: shop.id,
        ...template,
      },
    });
  }

  // Summary
  console.log('\n✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • 1 shop created`);
  console.log(`   • 1 user created`);
  console.log(`   • ${CUSTOMERS.length} customers created`);
  console.log(`   • 50 orders created with Etsy API-style data`);
  console.log(`   • ${templates.length} message templates created`);
  console.log(`   • Customer flags and sync logs created`);
  console.log('\n🔗 Each order includes:');
  console.log('   • Etsy receipt_id, transaction_id, listing_id');
  console.log('   • Real i.etsystatic.com image URLs');
  console.log('   • Variations with property_id, value_ids (Size, Color, Material, Scent)');
  console.log('   • Full shipping address (formatted_address, country_iso)');
  console.log('   • Gift messages, buyer notes, tracking info');
  console.log('   • Order history timeline');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
