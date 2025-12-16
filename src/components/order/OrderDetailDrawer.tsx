import { useState } from 'react';
import { format } from 'date-fns';
import type { Order, Customer, PipelineStage } from '../../types';
import { DEFAULT_PIPELINE_STAGES, getTierLabel, getFlagLabel, isOrderOverdue, getDaysUntilShipBy } from '../../types';
import { useOrderStore } from '../../stores/orderStore';

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const ShippingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
  </svg>
);

interface OrderDetailDrawerProps {
  order: Order;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onCreateLabel: () => void;
}

export default function OrderDetailDrawer({
  order,
  customer,
  isOpen,
  onClose,
  onCreateLabel
}: OrderDetailDrawerProps) {
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [manualTracking, setManualTracking] = useState({ carrier: '', trackingNumber: '' });

  const { addOrderNote, addOrderTag, removeOrderTag, updateOrderTracking, moveOrder } = useOrderStore();

  const isOverdue = isOrderOverdue(order);
  const daysUntilShipBy = getDaysUntilShipBy(order);

  const handleAddNote = () => {
    if (newNote.trim()) {
      addOrderNote(order.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addOrderTag(order.id, newTag.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleSubmitTracking = () => {
    if (manualTracking.carrier && manualTracking.trackingNumber) {
      updateOrderTracking(order.id, manualTracking.trackingNumber, manualTracking.carrier);
      setManualTracking({ carrier: '', trackingNumber: '' });
    }
  };

  const getStageLabel = (stage: PipelineStage) => {
    const stageConfig = DEFAULT_PIPELINE_STAGES.find(s => s.id === stage);
    return stageConfig ? `${stageConfig.emoji} ${stageConfig.name}` : stage;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[500px] bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm text-gray-500">
                Placed {format(new Date(order.orderDate), 'MMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Stage Selector */}
          <div className="mt-3">
            <select
              value={order.pipelineStage}
              onChange={(e) => moveOrder(order.id, e.target.value as PipelineStage)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6e6af0]"
            >
              {DEFAULT_PIPELINE_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.emoji} {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Customer Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <UserIcon />
              Customer
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{order.buyerName}</span>
                    {customer?.isRepeatCustomer && (
                      <span className="text-[#6e6af0] flex items-center gap-1" title={`${customer.orderCount} orders`}>
                        <RepeatIcon />
                        <span className="text-xs">{customer.orderCount}x</span>
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${order.buyerEmail}`} className="text-sm text-blue-600 hover:underline">
                    {order.buyerEmail}
                  </a>
                </div>
                <button className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded transition-colors">
                  <MessageIcon />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shipping Address</p>
                <p className="text-sm text-gray-700">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-700">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-sm text-gray-700">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-sm text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
              </div>

              {customer && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                  <span>Since {format(new Date(customer.firstOrderDate), 'MMM yyyy')}</span>
                  <span>Total: ${customer.totalSpent.toFixed(2)}</span>
                  {customer.tier !== 'regular' && customer.tier !== 'new' && (
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      customer.tier === 'vip' ? 'bg-purple-100 text-purple-700' :
                      customer.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      customer.tier === 'silver' ? 'bg-gray-200 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {getTierLabel(customer.tier)}
                    </span>
                  )}
                </div>
              )}

              {customer?.isFlagged && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertIcon />
                    <span className="text-sm font-medium">Flagged Customer</span>
                  </div>
                  {customer.flags.map((flag, i) => (
                    <p key={i} className="text-xs text-gray-600 mt-1">
                      {getFlagLabel(flag.type)}: {flag.reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Items Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </p>
                    {item.variations && item.variations.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.variations.map(v => `${v.name}: ${v.value}`).join(' | ')}
                      </p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShippingIcon />
              Shipping
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {!order.isShipped ? (
                <>
                  <div className={`flex items-center gap-2 mb-4 ${isOverdue ? 'text-red-600' : daysUntilShipBy <= 1 ? 'text-orange-600' : 'text-gray-700'}`}>
                    <AlertIcon />
                    <span className="font-medium">
                      {isOverdue
                        ? `${Math.abs(daysUntilShipBy)} days overdue!`
                        : daysUntilShipBy === 0
                        ? 'Ship today!'
                        : daysUntilShipBy === 1
                        ? 'Ship by tomorrow'
                        : `Ship by ${format(new Date(order.shipByDate), 'MMMM d, yyyy')} (${daysUntilShipBy} days)`
                      }
                    </span>
                  </div>

                  <button
                    onClick={onCreateLabel}
                    className="w-full flex items-center justify-center gap-2 bg-[#6e6af0] hover:bg-[#5b57d1] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <ShippingIcon />
                    Create Shipping Label
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Or enter tracking manually:</p>
                    <div className="flex gap-2">
                      <select
                        value={manualTracking.carrier}
                        onChange={(e) => setManualTracking({ ...manualTracking, carrier: e.target.value })}
                        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6e6af0]"
                      >
                        <option value="">Select carrier</option>
                        <option value="USPS">USPS</option>
                        <option value="UPS">UPS</option>
                        <option value="FedEx">FedEx</option>
                        <option value="DHL">DHL</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Tracking number"
                        value={manualTracking.trackingNumber}
                        onChange={(e) => setManualTracking({ ...manualTracking, trackingNumber: e.target.value })}
                        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6e6af0]"
                      />
                      <button
                        onClick={handleSubmitTracking}
                        disabled={!manualTracking.carrier || !manualTracking.trackingNumber}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <ShippingIcon />
                    <span className="font-medium">Shipped</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {order.carrierName}: {order.trackingNumber}
                  </p>
                  {order.trackingStatus && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Status: {order.trackingStatus.replace('_', ' ')}
                    </p>
                  )}
                  {order.estimatedDeliveryDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Est. delivery: {format(new Date(order.estimatedDeliveryDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Gift Message Section */}
          {order.isGift && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <GiftIcon />
                Gift Order
              </h3>
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                {order.giftMessage && (
                  <p className="text-sm text-gray-700 italic">"{order.giftMessage}"</p>
                )}
                <p className="text-xs text-pink-600 mt-2">Include gift message in package</p>
              </div>
            </section>
          )}

          {/* Buyer's Note Section */}
          {order.buyerNote && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <MessageIcon />
                Buyer's Note
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-700">"{order.buyerNote}"</p>
              </div>
            </section>
          )}

          {/* Internal Notes Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Internal Notes</span>
            </h3>
            <div className="space-y-2">
              {order.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {format(new Date(note.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                  </p>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6e6af0]"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Tags Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {order.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-sm px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeOrderTag(order.id, tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <CloseIcon />
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    onBlur={() => !newTag && setShowTagInput(false)}
                    autoFocus
                    className="text-sm px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6e6af0] w-24"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-[#6e6af0] hover:text-[#5b57d1]"
                  >
                    <PlusIcon />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="inline-flex items-center gap-1 text-sm px-2.5 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full hover:border-[#6e6af0] hover:text-[#6e6af0] transition-colors"
                >
                  <PlusIcon />
                  Add Tag
                </button>
              )}
            </div>
          </section>

          {/* History Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              History
            </h3>
            <div className="space-y-2">
              {[...order.history].reverse().map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{event.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(event.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 py-2.5 px-4 rounded-lg transition-colors">
                <AlertIcon />
                Flag Issue
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 px-4 rounded-lg transition-colors">
                Archive
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
