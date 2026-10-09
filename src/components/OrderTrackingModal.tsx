import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Loader2,
  Copy,
  ArrowRight,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchCustomerOrderWithVerification } from '../services/orderService';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'New', label: 'Order Received', desc: 'Received at Rajbiraj showroom' },
  { status: 'Under Review', label: 'Under Review', desc: 'Stock & pricing verification' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Availability verified with customer' },
  { status: 'Preparing', label: 'Preparing', desc: 'Appliance packaged for dispatch' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'On route via store delivery team' },
  { status: 'Delivered', label: 'Delivered', desc: 'Delivered & inspected at home' }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = ''
}) => {
  const [orderRef, setOrderRef] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderRef(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setTrackedOrder(null);

    if (!orderRef.trim()) {
      setErrorMsg('Please enter your order reference (e.g. KE-ORD-2026-48291).');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter the mobile phone number used for this order.');
      return;
    }

    setIsLoading(true);
    try {
      const order = await fetchCustomerOrderWithVerification(orderRef, phone);
      setTrackedOrder(order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to find or verify this order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setTrackedOrder(null);
    setErrorMsg(null);
  };

  const handleCopyRef = () => {
    if (trackedOrder?.orderId) {
      navigator.clipboard.writeText(trackedOrder.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine current timeline progress index
  const getCurrentStepIndex = (status?: string): number => {
    if (!status) return 0;
    const idx = ORDER_STEPS.findIndex(s => s.status.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = trackedOrder ? getCurrentStepIndex(trackedOrder.orderStatus || trackedOrder.status) : 0;
  const isCancelled = trackedOrder?.orderStatus === 'Cancelled' || trackedOrder?.status === 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Track Your Appliance Order
              </h2>
              <p className="text-xs text-slate-500">
                Live Status &bull; New Khan Automobiles & Electronics, Rajbiraj
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Tracking Form (Shown when no order is displayed) */}
          {!trackedOrder && (
            <form onSubmit={handleTrackSubmit} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Check Order Status</h3>
                <p className="text-xs text-slate-500">
                  Enter your order reference and the mobile number registered during checkout to retrieve verified dispatch information.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lookup Notice:</span>
                    <p className="mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Order Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. KE-ORD-2026-48291 or KE-2026-8819"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Registered Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9804781290"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Phone verification ensures only you can view your order details.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Showroom Database...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verify & Track Order</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer Privacy Protection</span>
                </div>
                <p>
                  Khan Electronics securely stores your order history. Internal showroom staff notes and billing adjustments remain private.
                </p>
              </div>
            </form>
          )}

          {/* Tracked Order Details View */}
          {trackedOrder && (
            <div className="space-y-6 text-xs">
              {/* Order Reference Top Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Order Reference:</span>
                    <strong className="text-sm font-mono text-slate-950 font-black">{trackedOrder.orderId}</strong>
                    <button
                      onClick={handleCopyRef}
                      className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                      title="Copy Reference"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copied && <span className="text-[10px] text-emerald-700 font-bold">Copied!</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Placed: {new Date(trackedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>Payment: <strong className="text-slate-800">{trackedOrder.paymentMethod} ({trackedOrder.paymentStatus})</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    trackedOrder.orderStatus === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : trackedOrder.orderStatus === 'Cancelled'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    {trackedOrder.orderStatus || trackedOrder.status}
                  </span>

                  <button
                    onClick={handleResetSearch}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] text-slate-600 font-medium transition-colors"
                  >
                    Look Up Another
                  </button>
                </div>
              </div>

              {/* Status Timeline */}
              {isCancelled ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">This order has been cancelled</strong>
                    <span className="text-[11px] text-rose-700">
                      If you have questions, please contact Khan Electronics showroom at 9804781290.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Fulfillment Progress</span>

                  {/* Horizontal visual stepper */}
                  <div className="relative">
                    <div className="overflow-x-auto pb-2 scrollbar-none">
                      <div className="flex items-center min-w-[500px] justify-between relative">
                        {/* Connecting background line */}
                        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                        
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.status} className="flex flex-col items-center text-center relative z-10 px-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 shadow-sm scale-110'
                                  : isDone
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-200 text-slate-400'
                              }`}>
                                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                              </div>

                              <span className={`text-[11px] font-bold mt-1.5 max-w-[80px] leading-tight ${
                                isCurrent ? 'text-amber-800' : isDone ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {step.label}
                              </span>
                              <span className="text-[9px] text-slate-400 max-w-[90px] leading-tight mt-0.5 hidden sm:block">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Information Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Delivery & Destination</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Customer:</span>
                    <span className="font-semibold text-slate-800">{trackedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contact Phone:</span>
                    <span className="font-mono text-slate-800">{trackedOrder.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[11px] block">Delivery Location:</span>
                    <span className="text-slate-800">
                      {trackedOrder.deliveryAddress?.streetAddress || ''}, {trackedOrder.deliveryAddress?.wardNo || ''}, {trackedOrder.deliveryAddress?.municipality || ''}, {trackedOrder.deliveryAddress?.district || 'Saptari'}, {trackedOrder.deliveryAddress?.province || 'Madhesh'}
                    </span>
                  </div>
                </div>

                {/* Showroom confirmed dispatch info if available */}
                {trackedOrder.confirmedDeliveryInfo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                    <strong>Showroom Dispatch Update:</strong> {trackedOrder.confirmedDeliveryInfo}
                  </div>
                )}
              </div>

              {/* Ordered Products Snapshot */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Ordered Appliances ({trackedOrder.items.length})
                </span>

                <div className="divide-y divide-slate-100">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          {item.modelNumber && (
                            <p className="text-[10px] text-slate-400 font-mono">Model: {item.modelNumber}</p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            Qty: <strong className="text-slate-800">{item.quantity}</strong> &times; Rs. {item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 block">
                          Rs. {item.lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">Rs. {trackedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold text-slate-900">
                      {trackedOrder.deliveryCharge !== null && trackedOrder.deliveryCharge !== undefined
                        ? trackedOrder.deliveryCharge === 0 ? 'FREE (Within 5 km)' : `Rs. ${trackedOrder.deliveryCharge.toLocaleString()}`
                        : 'To be confirmed by showroom'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Order Total:</span>
                    <span className="text-base text-slate-950 font-black">
                      Rs. {trackedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Support & Counter Assistance note */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Showroom Helpdesk: <strong>9804781290 / 031-520114</strong></span>
                </span>
                <span className="text-slate-400 text-[10px]">Open Daily 9:00 AM – 7:30 PM &bull; Main Road, Rajbiraj</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
