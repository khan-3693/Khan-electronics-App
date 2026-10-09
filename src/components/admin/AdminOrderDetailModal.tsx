import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Truck, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Edit, 
  Save, 
  Loader2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus, OrderPaymentStatus } from '../../types';
import { 
  updateOrderStatusByAdmin, 
  updateOrderPaymentStatusByAdmin, 
  updateOrderDeliveryByAdmin, 
  updateOrderAdminNotesByAdmin 
} from '../../services/orderService';

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => Promise<void>;
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'New',
  'Under Review',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const ALL_PAYMENT_STATUSES: OrderPaymentStatus[] = [
  'Unpaid',
  'Partially Paid',
  'Paid',
  'Refunded'
];

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  if (!isOpen || !order) return null;

  // Local editable states
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.orderStatus);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<OrderPaymentStatus>(
    (order.paymentStatus as OrderPaymentStatus) || 'Unpaid'
  );
  const [deliveryCharge, setDeliveryCharge] = useState<number>(order.deliveryCharge || 0);
  const [confirmedDeliveryInfo, setConfirmedDeliveryInfo] = useState<string>(
    order.confirmedDeliveryInfo || ''
  );
  const [adminNotes, setAdminNotes] = useState<string>(order.adminNotes || '');

  // Loading & saving states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Status transition handler
  const handleTransitionStatus = async (nextStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatusByAdmin(order.orderId, nextStatus);
      setCurrentStatus(nextStatus);
      await onOrderUpdated();
      showFeedback(`Order status updated to "${nextStatus}"`);
    } catch (err) {
      alert(`Error updating status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Payment status handler
  const handleUpdatePaymentStatus = async (nextPayment: OrderPaymentStatus) => {
    setIsUpdatingPayment(true);
    try {
      await updateOrderPaymentStatusByAdmin(order.orderId, nextPayment);
      setCurrentPaymentStatus(nextPayment);
      await onOrderUpdated();
      showFeedback(`Payment status updated to "${nextPayment}"`);
    } catch (err) {
      alert(`Error updating payment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Delivery charge & info handler
  const handleSaveDeliveryInfo = async () => {
    setIsUpdatingDelivery(true);
    try {
      await updateOrderDeliveryByAdmin(
        order.orderId,
        Number(deliveryCharge) || 0,
        confirmedDeliveryInfo,
        order.subtotal
      );
      await onOrderUpdated();
      showFeedback('Delivery details and confirmed charge saved');
    } catch (err) {
      alert(`Error saving delivery details: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  // Admin notes handler
  const handleSaveAdminNotes = async () => {
    setIsUpdatingNotes(true);
    try {
      await updateOrderAdminNotesByAdmin(order.orderId, adminNotes);
      await onOrderUpdated();
      showFeedback('Private showroom admin notes updated');
    } catch (err) {
      alert(`Error saving admin notes: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  // Suggested next transition
  const getSuggestedTransitions = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case 'New': return ['Under Review', 'Confirmed', 'Cancelled'];
      case 'Under Review': return ['Confirmed', 'Preparing', 'Cancelled'];
      case 'Confirmed': return ['Preparing', 'Out for Delivery', 'Cancelled'];
      case 'Preparing': return ['Out for Delivery', 'Cancelled'];
      case 'Out for Delivery': return ['Delivered', 'Cancelled'];
      case 'Delivered': return [];
      case 'Cancelled': return ['Under Review'];
      default: return [];
    }
  };

  const suggestedNext = getSuggestedTransitions(currentStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  Order #{order.orderId}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  currentStatus === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : currentStatus === 'Cancelled'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {currentStatus}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  currentPaymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {currentPaymentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created: {new Date(order.createdAt).toLocaleString()} &bull; Last Updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {feedbackMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{feedbackMsg}</span>
            </div>
          )}

          {/* Quick Status Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Controlled Status Transitions</span>
                <span className="text-[11px] text-slate-500">Move order through the fulfillment pipeline</span>
              </div>

              {/* Direct status dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Jump to:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleTransitionStatus(e.target.value as OrderStatus)}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {ALL_ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suggested transition buttons */}
            {suggestedNext.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400">Recommended Next Step:</span>
                {suggestedNext.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleTransitionStatus(st)}
                    disabled={isUpdatingStatus}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                      st === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>Move to &ldquo;{st}&rdquo;</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Grid: Customer & Delivery (Left) & Payment & Financials (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer & Delivery Address Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> Customer & Delivery Details
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  order.deliveryAddress?.isWithin5km
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {order.deliveryAddress?.isWithin5km ? 'Within 5 km (Free)' : 'Outside 5 km'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{order.phone}</span>
                </div>
                {order.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700">{order.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Province & District:</span>
                  <span className="text-slate-800 font-medium">
                    {order.deliveryAddress?.district || 'Saptari'}, {order.deliveryAddress?.province || 'Madhesh Province'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Municipality & Ward:</span>
                  <span className="text-slate-800 font-medium">
                    {order.deliveryAddress?.municipality || 'Rajbiraj'}, {order.deliveryAddress?.wardNo || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Street Address:</span>
                  <span className="text-slate-900 font-semibold text-right max-w-[220px]">
                    {order.deliveryAddress?.streetAddress || ''}
                  </span>
                </div>
                {order.deliveryAddress?.landmark && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Landmark:</span>
                    <span className="text-slate-700">{order.deliveryAddress.landmark}</span>
                  </div>
                )}
                {order.customerNotes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Customer Delivery Note:</span>
                    <p className="text-slate-800 italic mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      &ldquo;{order.customerNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Delivery Charge Adjuster */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-600" /> Payment & Delivery Fee
                </span>
                <span className="text-xs font-mono text-slate-500">{order.paymentMethod}</span>
              </div>

              {/* Payment status dropdown */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-600 font-semibold block">Update Payment Status:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={currentPaymentStatus}
                    onChange={(e) => handleUpdatePaymentStatus(e.target.value as OrderPaymentStatus)}
                    disabled={isUpdatingPayment}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    {ALL_PAYMENT_STATUSES.map((ps) => (
                      <option key={ps} value={ps}>{ps}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery charge & confirmation info fields */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Confirmed Delivery Charge (NPR):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                      className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-400">
                      {order.deliveryAddress?.isWithin5km ? '(Default: 0 for &le; 5km)' : '(Showroom freight fee)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Confirmed Delivery Information (Visible to customer upon tracking):
                  </label>
                  <input
                    type="text"
                    value={confirmedDeliveryInfo}
                    onChange={(e) => setConfirmedDeliveryInfo(e.target.value)}
                    placeholder="e.g. Assigned delivery driver: Ramesh (9812345678), Van #3, dispatch today 4 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveDeliveryInfo}
                  disabled={isUpdatingDelivery}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isUpdatingDelivery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Delivery Details & Total</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ordered Products Snapshot Table */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <span className="font-bold text-xs text-slate-900 block">
              Ordered Products Snapshot ({order.items.length})
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 font-mono">Model</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{item.productName}</span>
                            {item.brand && <span className="text-[10px] text-amber-700 uppercase font-semibold">{item.brand}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.modelNumber || 'N/A'}</td>
                      <td className="py-3 px-3 text-right font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        Rs. {item.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs max-w-xs ml-auto">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Confirmed Delivery Fee:</span>
                <span className="font-bold text-slate-900">
                  Rs. {Number(deliveryCharge || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-base text-slate-950 font-black">
                  Rs. {(order.subtotal + Number(deliveryCharge || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Private Internal Admin Notes */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Internal Showroom Staff Notes</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                Strictly Private &bull; Hidden from Customers
              </span>
            </div>

            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record internal showroom actions, customer phone conversation notes, supplier dispatch dates, or technician assignment details..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
            />

            <button
              type="button"
              onClick={handleSaveAdminNotes}
              disabled={isUpdatingNotes}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isUpdatingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Internal Notes</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">Doc ID: {order.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
