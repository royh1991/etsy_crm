import { useState } from 'react';
import { addDays, format } from 'date-fns';
import type { Order, PipelineStage } from '../../types';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (order: Order) => void;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

export default function AddOrderModal({ isOpen, onClose, onAdd }: AddOrderModalProps) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [shipByDate, setShipByDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Shipping address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName || !productTitle || !price) {
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity) || 1;
    const subtotal = priceNum * quantityNum;
    const now = new Date();
    const customId = Date.now();

    const newOrder: Order = {
      id: `custom-${customId}`,
      etsyReceiptId: customId,
      orderNumber: `CUSTOM-${customId.toString().slice(-6)}`,
      pipelineStage: 'new' as PipelineStage,

      // Customer Info
      customerId: '',
      buyerName,
      buyerEmail: buyerEmail || `${buyerName.toLowerCase().replace(/\s/g, '')}@example.com`,
      shippingAddress: {
        name: buyerName,
        addressLine1: addressLine1 || '123 Main St',
        addressLine2: addressLine2 || undefined,
        city: city || 'Unknown',
        state: state || 'NA',
        postalCode: postalCode || '00000',
        country: country || 'United States',
        countryCode: 'US',
      },

      // Order Details
      items: [{
        id: `item-${customId}`,
        listingId: customId,
        title: productTitle,
        description: productTitle,
        quantity: quantityNum,
        price: priceNum,
        variations: [],
      }],
      subtotal,
      shippingCost: 0,
      tax: 0,
      totalAmount: subtotal,
      currencyCode: 'USD',
      orderDate: now,
      shipByDate: new Date(shipByDate),

      // Status
      etsyStatus: 'paid',
      isPaid: true,
      isShipped: false,

      // Gift
      isGift,
      giftMessage: isGift ? giftMessage : undefined,

      // Buyer's message
      buyerNote: notes || undefined,

      // CRM Fields
      tags: ['Custom'],
      notes: notes ? [{
        id: `note-${customId}`,
        content: notes,
        createdAt: now,
      }] : [],
      history: [{
        id: `history-${customId}`,
        type: 'created',
        description: 'Order created manually',
        timestamp: now,
      }],
      hasIssue: false,
      createdAt: now,
      updatedAt: now,
    };

    onAdd(newOrder);

    // Reset form
    setBuyerName('');
    setBuyerEmail('');
    setProductTitle('');
    setPrice('');
    setQuantity('1');
    setShipByDate(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
    setNotes('');
    setIsGift(false);
    setGiftMessage('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('US');

    onClose();
  };

  const isValid = buyerName && productTitle && price && parseFloat(price) > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Custom Order</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Buyer Name *</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Product Details</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Product Title *</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="Custom Handmade Necklace"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ship By</label>
                <input
                  type="date"
                  value={shipByDate}
                  onChange={(e) => setShipByDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address (Collapsible) */}
          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-[#6e6af0] list-none flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Shipping Address (optional)
            </summary>
            <div className="mt-3 space-y-3 pl-6">
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street Address"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
              />
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apt, Suite, etc. (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="ZIP"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                />
              </div>
            </div>
          </details>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent resize-none"
            />
          </div>

          {/* Gift Option */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#6e6af0] focus:ring-[#6e6af0]"
              />
              <span className="text-sm text-gray-700">This is a gift order</span>
            </label>
            {isGift && (
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Gift message..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-pink-200 bg-pink-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none"
              />
            )}
          </div>

          {/* Total */}
          {price && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-gray-900">
                  ${(parseFloat(price) * (parseInt(quantity) || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6e6af0] rounded-lg hover:bg-[#5b57d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
}
