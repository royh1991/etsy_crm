import { useState } from 'react';
import type { Order, PackagePreset, ShippingRate } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Default package presets
const packagePresets: PackagePreset[] = [
  { id: 'small', name: 'Small Box', length: 6, width: 4, height: 3, weight: 8, weightUnit: 'oz', dimensionUnit: 'in' },
  { id: 'medium', name: 'Medium Box', length: 10, width: 8, height: 4, weight: 16, weightUnit: 'oz', dimensionUnit: 'in' },
  { id: 'large', name: 'Large Box', length: 14, width: 10, height: 6, weight: 32, weightUnit: 'oz', dimensionUnit: 'in' },
  { id: 'envelope', name: 'Flat Envelope', length: 12, width: 9, height: 0.5, weight: 4, weightUnit: 'oz', dimensionUnit: 'in' },
];

// Mock shipping rates (would come from Shippo API)
const mockShippingRates: ShippingRate[] = [
  { id: 'usps-fc', carrier: 'USPS', service: 'First Class Package', price: 4.50, currency: 'USD', estimatedDays: '2-5 days' },
  { id: 'usps-pm', carrier: 'USPS', service: 'Priority Mail', price: 8.95, currency: 'USD', estimatedDays: '1-3 days' },
  { id: 'ups-ground', carrier: 'UPS', service: 'Ground', price: 9.50, currency: 'USD', estimatedDays: '3-5 days' },
  { id: 'fedex-home', carrier: 'FedEx', service: 'Home Delivery', price: 12.00, currency: 'USD', estimatedDays: '2-4 days' },
  { id: 'usps-exp', carrier: 'USPS', service: 'Priority Mail Express', price: 26.95, currency: 'USD', estimatedDays: '1-2 days' },
];

interface ShippingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingModal({ order, isOpen, onClose }: ShippingModalProps) {
  const { updateOrderTracking } = useOrderStore();

  const [selectedPreset, setSelectedPreset] = useState<string>('small');
  const [customDimensions, setCustomDimensions] = useState({
    length: 6,
    width: 4,
    height: 3,
    weight: 8
  });
  const [useCustom, setUseCustom] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string>('usps-pm');
  const [addSignature, setAddSignature] = useState(false);
  const [addInsurance, setAddInsurance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchaseLabel = async () => {
    setIsPurchasing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock tracking number
    const rate = mockShippingRates.find(r => r.id === selectedRate);
    const trackingNumber = `9400111899223${Math.floor(Math.random() * 1000000000)}`;

    // Update order with tracking
    updateOrderTracking(order.id, trackingNumber, rate?.carrier || 'USPS');

    setIsPurchasing(false);
    onClose();
  };

  const selectedRateData = mockShippingRates.find(r => r.id === selectedRate);
  const extraCost = (addSignature ? 3.00 : 0) + (addInsurance ? 2.00 : 0);
  const totalCost = (selectedRateData?.price || 0) + extraCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Shipping Label</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
          {/* From Address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">FROM:</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium">Your Shop Name</p>
              <p>456 Seller Avenue</p>
              <p>Los Angeles, CA 90001</p>
              <p>United States</p>
              <button className="text-[#6e6af0] text-xs mt-2 hover:underline">
                Edit default address
              </button>
            </div>
          </section>

          {/* To Address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">TO:</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <div className="flex items-center gap-1 text-green-600 mt-2">
                <CheckIcon />
                <span className="text-xs">Address verified</span>
              </div>
            </div>
          </section>

          {/* Package Selection */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <PackageIcon />
              PACKAGE:
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {packagePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    setUseCustom(false);
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedPreset === preset.id && !useCustom
                      ? 'border-[#6e6af0] bg-[#6e6af0]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                  <p className="text-xs text-gray-500">
                    {preset.length} x {preset.width} x {preset.height} in
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Dimensions Toggle */}
            <button
              onClick={() => setUseCustom(!useCustom)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                useCustom
                  ? 'border-[#6e6af0] bg-[#6e6af0]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">Custom dimensions</p>
            </button>

            {/* Custom Dimensions Input */}
            {useCustom && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Length (in)</label>
                  <input
                    type="number"
                    value={customDimensions.length}
                    onChange={(e) => setCustomDimensions({ ...customDimensions, length: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#6e6af0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Width (in)</label>
                  <input
                    type="number"
                    value={customDimensions.width}
                    onChange={(e) => setCustomDimensions({ ...customDimensions, width: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#6e6af0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height (in)</label>
                  <input
                    type="number"
                    value={customDimensions.height}
                    onChange={(e) => setCustomDimensions({ ...customDimensions, height: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#6e6af0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Weight (oz)</label>
                  <input
                    type="number"
                    value={customDimensions.weight}
                    onChange={(e) => setCustomDimensions({ ...customDimensions, weight: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#6e6af0]"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Shipping Options */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">SHIPPING OPTIONS:</h3>
            <div className="space-y-2">
              {mockShippingRates.map((rate) => (
                <button
                  key={rate.id}
                  onClick={() => setSelectedRate(rate.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center justify-between ${
                    selectedRate === rate.id
                      ? 'border-[#6e6af0] bg-[#6e6af0]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRate === rate.id ? 'border-[#6e6af0]' : 'border-gray-300'
                    }`}>
                      {selectedRate === rate.id && (
                        <div className="w-2 h-2 rounded-full bg-[#6e6af0]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rate.carrier} {rate.service}
                      </p>
                      <p className="text-xs text-gray-500">{rate.estimatedDays}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${rate.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Additional Options */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ADDITIONAL OPTIONS:</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addSignature}
                    onChange={(e) => setAddSignature(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#6e6af0] focus:ring-[#6e6af0]"
                  />
                  <span className="text-sm text-gray-700">Signature confirmation</span>
                </div>
                <span className="text-sm text-gray-500">+$3.00</span>
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={addInsurance}
                    onChange={(e) => setAddInsurance(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#6e6af0] focus:ring-[#6e6af0]"
                  />
                  <span className="text-sm text-gray-700">Insurance ($100 coverage)</span>
                </div>
                <span className="text-sm text-gray-500">+$2.00</span>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchaseLabel}
              disabled={isPurchasing}
              className="flex-1 py-2.5 px-4 bg-[#6e6af0] hover:bg-[#5b57d1] disabled:bg-gray-300 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <>
                  <svg className="animate-spin h-4 w-4\" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Purchase Label - $${totalCost.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
