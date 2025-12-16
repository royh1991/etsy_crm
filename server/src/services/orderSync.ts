import { prisma } from '../utils/prisma.js';
import { EtsyApiClient, refreshAccessToken } from './etsy.js';
import type { PipelineStage, CustomerTier } from '@prisma/client';

interface SyncResult {
  ordersCreated: number;
  ordersUpdated: number;
  customersCreated: number;
  customersUpdated: number;
}

// Calculate customer tier based on total spent
function calculateTier(totalSpent: number): CustomerTier {
  if (totalSpent >= 500) return 'VIP';
  if (totalSpent >= 200) return 'GOLD';
  if (totalSpent >= 100) return 'SILVER';
  return 'BRONZE';
}

// Map Etsy receipt to pipeline stage
function determinePipelineStage(receipt: any): PipelineStage {
  if (!receipt.was_paid) return 'NEEDS_ATTENTION';
  if (receipt.was_shipped) {
    if (receipt.was_delivered) return 'DELIVERED';
    return 'SHIPPED';
  }
  // Not shipped yet - check dates
  const shipBy = receipt.expected_ship_date || receipt.estimated_ship_date;
  if (shipBy && new Date(shipBy * 1000) < new Date()) {
    return 'NEEDS_ATTENTION'; // Overdue
  }
  return 'NEW';
}

export async function syncOrders(shopId: string): Promise<SyncResult> {
  const result: SyncResult = {
    ordersCreated: 0,
    ordersUpdated: 0,
    customersCreated: 0,
    customersUpdated: 0
  };

  // Get shop with tokens
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop || !shop.etsyAccessToken) {
    throw new Error('Shop not found or Etsy not connected');
  }

  // Check if token needs refresh
  let accessToken = shop.etsyAccessToken;
  if (shop.etsyTokenExpiry && new Date(shop.etsyTokenExpiry) < new Date()) {
    if (!shop.etsyRefreshToken) {
      throw new Error('Token expired and no refresh token available');
    }

    const newTokens = await refreshAccessToken(shop.etsyRefreshToken);
    accessToken = newTokens.access_token;

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        etsyAccessToken: newTokens.access_token,
        etsyRefreshToken: newTokens.refresh_token,
        etsyTokenExpiry: new Date(Date.now() + newTokens.expires_in * 1000)
      }
    });
  }

  const client = new EtsyApiClient(accessToken);

  // Get receipts from last sync or last 30 days
  const minCreated = shop.lastSyncAt
    ? Math.floor(shop.lastSyncAt.getTime() / 1000) - 86400 // 1 day buffer
    : Math.floor(Date.now() / 1000) - 30 * 86400; // 30 days

  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const receiptsResponse = await client.getReceipts(shop.etsyShopId, {
      minCreated,
      limit,
      offset,
      wasPaid: true
    });

    const receipts = receiptsResponse.results || [];
    hasMore = receipts.length === limit;
    offset += limit;

    for (const receipt of receipts) {
      try {
        await processReceipt(shop.id, receipt, result);
      } catch (err) {
        console.error(`Error processing receipt ${receipt.receipt_id}:`, err);
        // Continue with other receipts
      }
    }
  }

  return result;
}

async function processReceipt(shopId: string, receipt: any, result: SyncResult) {
  // Upsert customer
  const buyerEmail = receipt.buyer_email || `buyer-${receipt.buyer_user_id}@etsy.placeholder`;
  const buyerName = receipt.name || 'Etsy Buyer';

  let customer = await prisma.customer.findFirst({
    where: { shopId, etsyBuyerId: receipt.buyer_user_id.toString() }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        shopId,
        etsyBuyerId: receipt.buyer_user_id.toString(),
        name: buyerName,
        email: buyerEmail,
        tier: 'BRONZE',
        firstOrderAt: new Date(receipt.created_timestamp * 1000)
      }
    });
    result.customersCreated++;
  }

  // Check if order exists
  const existingOrder = await prisma.order.findUnique({
    where: { etsyReceiptId: receipt.receipt_id.toString() }
  });

  const shippingAddress = {
    name: receipt.name,
    addressLine1: receipt.first_line,
    addressLine2: receipt.second_line || undefined,
    city: receipt.city,
    state: receipt.state,
    postalCode: receipt.zip,
    country: receipt.country_iso
  };

  const orderData = {
    shopId,
    customerId: customer.id,
    etsyReceiptId: receipt.receipt_id.toString(),
    orderNumber: receipt.receipt_id.toString(),
    pipelineStage: determinePipelineStage(receipt),
    totalAmount: parseFloat(receipt.grandtotal?.amount || '0') / 100,
    subtotal: parseFloat(receipt.subtotal?.amount || '0') / 100,
    shippingCost: parseFloat(receipt.total_shipping_cost?.amount || '0') / 100,
    taxAmount: parseFloat(receipt.total_tax_cost?.amount || '0') / 100,
    discountAmount: parseFloat(receipt.discount_amt?.amount || '0') / 100,
    currency: receipt.grandtotal?.currency_code || 'USD',
    shippingAddress,
    shipByDate: receipt.expected_ship_date
      ? new Date(receipt.expected_ship_date * 1000)
      : new Date(Date.now() + 7 * 86400000), // Default 7 days
    isGift: receipt.is_gift || false,
    giftMessage: receipt.gift_message || null,
    buyerNote: receipt.message_from_buyer || null,
    isShipped: receipt.was_shipped || false,
    shippedAt: receipt.was_shipped && receipt.shipped_timestamp
      ? new Date(receipt.shipped_timestamp * 1000)
      : null,
    orderedAt: new Date(receipt.created_timestamp * 1000),
    paidAt: receipt.was_paid
      ? new Date((receipt.paid_timestamp || receipt.created_timestamp) * 1000)
      : null
  };

  if (existingOrder) {
    // Update existing order
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        ...orderData,
        // Don't overwrite pipeline stage if manually changed
        pipelineStage: existingOrder.pipelineStage !== 'NEW' && existingOrder.pipelineStage !== 'NEEDS_ATTENTION'
          ? existingOrder.pipelineStage
          : orderData.pipelineStage
      }
    });
    result.ordersUpdated++;
  } else {
    // Create new order with items
    const transactions = receipt.transactions || [];

    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: transactions.map((tx: any) => ({
            etsyTransactionId: tx.transaction_id?.toString(),
            etsyListingId: tx.listing_id?.toString(),
            title: tx.title || 'Item',
            quantity: tx.quantity || 1,
            price: parseFloat(tx.price?.amount || '0') / 100,
            sku: tx.sku || null,
            imageUrl: tx.variations?.length > 0
              ? tx.variations[0]?.image_url
              : tx.product_data?.first_image?.url_570xN || null,
            personalization: tx.variations?.find((v: any) => v.property_id === 513)?.formatted_value || null,
            variations: tx.variations || null
          }))
        },
        history: {
          create: {
            type: 'CREATED',
            description: 'Order imported from Etsy'
          }
        }
      }
    });

    result.ordersCreated++;
  }

  // Update customer stats
  const customerOrders = await prisma.order.findMany({
    where: { customerId: customer.id },
    select: { totalAmount: true }
  });

  const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const orderCount = customerOrders.length;

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      orderCount,
      totalSpent,
      averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
      isRepeatCustomer: orderCount > 1,
      tier: calculateTier(totalSpent),
      lastOrderAt: new Date(receipt.created_timestamp * 1000)
    }
  });

  if (customer.orderCount !== orderCount) {
    result.customersUpdated++;
  }
}
