import { format } from 'date-fns';
import type { Order, Customer } from '../../types';

interface PackingSlipProps {
  order: Order;
  customer?: Customer;
  shopName?: string;
  shopAddress?: {
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onClose?: () => void;
}

export default function PackingSlip({
  order,
  customer,
  shopName = 'My Etsy Shop',
  shopAddress = {
    name: 'My Etsy Shop',
    addressLine1: '123 Seller Street',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    country: 'US'
  },
  onClose
}: PackingSlipProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header - Not printed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Packing Slip Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6e6af0] text-white text-sm font-medium rounded-lg hover:bg-[#5b57d1] transition-colors"
            >
              Print
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Packing Slip Content */}
        <div className="p-8 print:p-0">
          {/* Logo and Shop Info */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shopName}</h1>
              <p className="text-sm text-gray-600">{shopAddress.addressLine1}</p>
              <p className="text-sm text-gray-600">
                {shopAddress.city}, {shopAddress.state} {shopAddress.postalCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">PACKING SLIP</p>
              <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-600">
                {format(new Date(order.orderDate), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ship To:
            </p>
            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-sm text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-center py-2 text-sm font-semibold text-gray-700 w-20">Qty</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-700 w-24">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    {item.variations && item.variations.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.variations.map(v => `${v.name}: ${v.value}`).join(', ')}
                      </p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Order Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">${order.shippingCost.toFixed(2)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Gift Message */}
          {order.isGift && order.giftMessage && (
            <div className="mb-8 p-4 border-2 border-dashed border-pink-200 bg-pink-50 rounded-lg">
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-2">
                Gift Message:
              </p>
              <p className="text-sm text-gray-700 italic">"{order.giftMessage}"</p>
            </div>
          )}

          {/* Buyer Note */}
          {order.buyerNote && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-2">
                Note from Buyer:
              </p>
              <p className="text-sm text-gray-700">{order.buyerNote}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Thank you for your order!</p>
            <p className="text-xs text-gray-500">
              Questions? Contact us through Etsy messages.
            </p>
            {customer && customer.isRepeatCustomer && (
              <p className="text-xs text-[#6e6af0] mt-2">
                Thank you for being a returning customer!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Batch print multiple packing slips
export function BatchPackingSlips({
  orders,
  customers,
  shopName,
  shopAddress,
  onClose
}: {
  orders: Order[];
  customers: Customer[];
  shopName?: string;
  shopAddress?: PackingSlipProps['shopAddress'];
  onClose?: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header - Not printed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Print {orders.length} Packing Slip{orders.length > 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6e6af0] text-white text-sm font-medium rounded-lg hover:bg-[#5b57d1] transition-colors"
            >
              Print All
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Multiple Packing Slips */}
        <div className="divide-y divide-gray-300 print:divide-y-0">
          {orders.map((order, index) => {
            const customer = customers.find(c => c.id === order.customerId);
            return (
              <div
                key={order.id}
                className="p-8 print:break-after-page"
                style={{ pageBreakAfter: index < orders.length - 1 ? 'always' : 'auto' }}
              >
                {/* Order indicator - not printed */}
                <div className="mb-4 print:hidden">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Order {index + 1} of {orders.length}
                  </span>
                </div>

                {/* Logo and Shop Info */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{shopName || 'My Etsy Shop'}</h1>
                    {shopAddress && (
                      <>
                        <p className="text-sm text-gray-600">{shopAddress.addressLine1}</p>
                        <p className="text-sm text-gray-600">
                          {shopAddress.city}, {shopAddress.state} {shopAddress.postalCode}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">PACKING SLIP</p>
                    <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.orderDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg print:bg-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ship To:
                  </p>
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                </div>

                {/* Items */}
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
                      <th className="text-center py-2 text-sm font-semibold text-gray-700 w-20">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b border-gray-100">
                        <td className="py-3">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          {item.variations && item.variations.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variations.map(v => `${v.name}: ${v.value}`).join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Gift Message */}
                {order.isGift && order.giftMessage && (
                  <div className="mb-6 p-3 border-2 border-dashed border-pink-200 bg-pink-50 rounded-lg print:bg-pink-100">
                    <p className="text-xs font-semibold text-pink-600 uppercase mb-1">Gift Message:</p>
                    <p className="text-sm text-gray-700 italic">"{order.giftMessage}"</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Thank you for your order!</p>
                  {customer?.isRepeatCustomer && (
                    <p className="text-xs text-[#6e6af0] mt-1">
                      Thank you for being a returning customer!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
