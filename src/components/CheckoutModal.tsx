import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Lock, 
  QrCode, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CartItem, Order, ShippingAddress } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderPlaced
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');

  // Address state
  const [fullName, setFullName] = useState('Bikash Kumar Chaudhary');
  const [phone, setPhone] = useState('9804781290');
  const [city, setCity] = useState('Rajbiraj');
  const [wardNo, setWardNo] = useState('Ward No. 3');
  const [district, setDistrict] = useState('Saptari');
  const [province, setProvince] = useState('Madhesh Province');
  const [landmark, setLandmark] = useState('Near Mahavir Chowk');
  const [isWithin5km, setIsWithin5km] = useState(true);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery (COD)' | 'Fonepay QR / Mobile Banking' | 'eSewa' | 'Khalti' | 'Debit/Credit Card'>('Cash on Delivery (COD)');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = isWithin5km ? 0 : 800;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `KE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Just now',
      status: 'Confirmed',
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      shippingAddress: {
        fullName,
        phone,
        city,
        wardNo,
        district,
        province,
        landmark,
        isWithin5km
      },
      deliveryType: isWithin5km 
        ? 'Free Local Delivery (within 5 km Rajbiraj)' 
        : 'Nepal-Wide Standard Freight',
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
      deliveryNote
    };

    setCreatedOrder(newOrder);
    onOrderPlaced(newOrder);
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Khan Electronics Order Checkout
              </h2>
              <p className="text-xs text-slate-500">Direct Showroom Delivery &bull; Rajbiraj, Nepal</p>
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
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {step === 'details' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> Step 1: Customer & Delivery Address
                </span>
                <span className="text-slate-400">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Mobile Number (Nepal)</label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">City / Municipality</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Ward Number</label>
                  <input
                    type="text"
                    required
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Nearest Landmark / Chowk</label>
                  <input
                    type="text"
                    placeholder="e.g., Near District Hospital Gate"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 5 KM Free Delivery Checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWithin5km}
                    onChange={(e) => setIsWithin5km(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    Delivery address is within 5 km of Khan Electronics Rajbiraj showroom (Free Delivery)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  Addresses outside 5 km or other districts are delivered via standard regional freight (+Rs. 800).
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-600">
                  Order Total: <strong className="text-slate-900 font-bold">Rs. {total.toLocaleString()}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-600" /> Step 2: Payment Option
                </span>
                <button
                  onClick={() => setStep('details')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Edit Address
                </button>
              </div>

              {/* Nepal Payment Methods */}
              <div className="space-y-2">
                {[
                  {
                    id: 'Cash on Delivery (COD)',
                    title: 'Cash on Delivery (COD)',
                    desc: 'Pay cash to Khan Electronics delivery team upon home inspection'
                  },
                  {
                    id: 'Fonepay QR / Mobile Banking',
                    title: 'Fonepay QR / Mobile Banking',
                    desc: 'Scan Fonepay QR at showroom or with delivery boy via any Nepal bank app'
                  },
                  {
                    id: 'eSewa',
                    title: 'eSewa Mobile Wallet',
                    desc: 'Pay instantly via eSewa digital wallet'
                  },
                  {
                    id: 'Khalti',
                    title: 'Khalti Digital Wallet',
                    desc: 'Pay with Khalti digital wallet credentials'
                  },
                  {
                    id: 'Debit/Credit Card',
                    title: 'Debit / Credit Card (POS)',
                    desc: 'Swipe card on wireless POS machine at delivery or showroom'
                  }
                ].map(method => (
                  <label
                    key={method.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'bg-amber-50 border-amber-400 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id as any)}
                        className="text-amber-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{method.title}</div>
                        <div className="text-[11px] text-slate-500">{method.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Delivery Note */}
              <div>
                <label className="text-slate-600 font-medium block mb-1">Special Delivery Note for Driver (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call 15 mins prior; 2nd floor stairs..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Total & Submit */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Due:</span>
                  <span className="text-xl font-extrabold text-slate-900">Rs. {total.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Place Order</span>
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && createdOrder && (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Order Successfully Placed
                </span>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 mt-2">
                  Order #{createdOrder.id}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you! Khan Electronics Rajbiraj showroom team will call you at <strong className="text-slate-900">{phone}</strong> to coordinate local dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="text-slate-900 font-medium">{createdOrder.shippingAddress.wardNo}, {createdOrder.shippingAddress.city}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Delivery Type:</span>
                  <span className="text-emerald-700 font-bold">{createdOrder.deliveryType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Payment:</span>
                  <span className="text-slate-900 font-medium">{createdOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="text-slate-900 font-extrabold text-sm">Rs. {createdOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
              >
                Back to Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
