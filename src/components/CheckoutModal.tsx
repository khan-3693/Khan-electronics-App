import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  Copy,
  AlertCircle,
  HelpCircle,
  Store,
  Phone,
  Search
} from 'lucide-react';
import { CartItem, Order, OrderPaymentMethod, CustomerProfile, SavedAddress } from '../types';
import { createOrderInFirestore } from '../services/orderService';
import { auth } from '../services/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (order: Order) => void;
  onOpenOrderTracking?: (orderId?: string) => void;
  customerProfile?: CustomerProfile | null;
}

const NEPAL_PROVINCES = [
  'Madhesh Province',
  'Koshi Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

const COMMON_DISTRICTS: Record<string, string[]> = {
  'Madhesh Province': ['Saptari', 'Siraha', 'Dhanusha', 'Mahottari', 'Sarlahi', 'Rautahat', 'Bara', 'Parsa'],
  'Koshi Province': ['Morang', 'Sunsari', 'Jhapa', 'Udayapur', 'Dhankuta', 'Ilam'],
  'Bagmati Province': ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Makwanpur', 'Kavrepalanchok'],
  'Gandaki Province': ['Kaski', 'Tanahun', 'Syngja', 'Gorkha', 'Nawalpur'],
  'Lumbini Province': ['Rupandehi', 'Kapilvastu', 'Dang', 'Banke', 'Bardiya', 'Palpa'],
  'Karnali Province': ['Surkhet', 'Dailekh', 'Jumla', 'Salyan'],
  'Sudurpashchim Province': ['Kailali', 'Kanchanpur', 'Doti', 'Dadeldhura']
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderPlaced,
  onOpenOrderTracking,
  customerProfile
}) => {
  const [step, setStep] = useState<'details' | 'review' | 'confirmed'>('details');

  // Customer & Delivery Address form state
  const [fullName, setFullName] = useState(() => customerProfile?.fullName || 'Bikash Kumar Chaudhary');
  const [phone, setPhone] = useState(() => customerProfile?.phone || '9804781290');
  const [email, setEmail] = useState(() => customerProfile?.email || '');
  const [province, setProvince] = useState('Madhesh Province');
  const [district, setDistrict] = useState('Saptari');
  const [municipality, setMunicipality] = useState('Rajbiraj Municipality');
  const [wardNo, setWardNo] = useState('Ward No. 3');
  const [streetAddress, setStreetAddress] = useState('Main Road, Near Mahavir Chowk');
  const [landmark, setLandmark] = useState('Opposite District Hospital Gate');
  const [isWithin5km, setIsWithin5km] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Sync when customerProfile changes
  useEffect(() => {
    if (customerProfile) {
      if (customerProfile.fullName) setFullName(customerProfile.fullName);
      if (customerProfile.phone) setPhone(customerProfile.phone);
      if (customerProfile.email) setEmail(customerProfile.email);
      const defaultAddr = customerProfile.savedAddresses?.find(a => a.isDefault) || customerProfile.savedAddresses?.[0];
      if (defaultAddr) {
        setProvince(defaultAddr.province);
        setDistrict(defaultAddr.district);
        setMunicipality(defaultAddr.municipality);
        setWardNo(defaultAddr.wardNo);
        setStreetAddress(defaultAddr.streetAddress);
        if (defaultAddr.landmark) setLandmark(defaultAddr.landmark);
        setIsWithin5km(defaultAddr.isWithin5km);
      }
    }
  }, [customerProfile]);

  // Payment preference state
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('Cash on Delivery');
  
  // Confirmation agreement checkbox
  const [confirmedByCustomer, setConfirmedByCustomer] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedReference, setCopiedReference] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Delivery calculation rules
  const deliveryCharge = isWithin5km ? 0 : null;
  const grandTotal = subtotal + (deliveryCharge || 0);

  const handleValidateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!fullName.trim()) {
      setSubmissionError('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setSubmissionError('Please enter a valid mobile number (e.g. 98XXXXXXXX).');
      return;
    }
    if (!streetAddress.trim()) {
      setSubmissionError('Please provide your street or locality address.');
      return;
    }

    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!confirmedByCustomer) {
      setSubmissionError('Please confirm the order details before placing your order.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const order = await createOrderInFirestore({
        cartItems,
        deliveryAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          province,
          district,
          municipality: municipality.trim(),
          wardNo: wardNo.trim(),
          streetAddress: streetAddress.trim(),
          landmark: landmark.trim() || null,
          isWithin5km,
          deliveryInstructions: deliveryInstructions.trim() || null
        },
        paymentMethod,
        customerNotes: deliveryInstructions.trim() || undefined,
        customerId: auth.currentUser?.uid || null
      });

      setCreatedOrder(order);
      onOrderPlaced(order);
      setStep('confirmed');
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : 'An error occurred while creating your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (createdOrder?.orderId) {
      navigator.clipboard.writeText(createdOrder.orderId);
      setCopiedReference(true);
      setTimeout(() => setCopiedReference(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Khan Electronics Order Checkout
              </h2>
              <p className="text-xs text-slate-500">
                New Khan Automobiles & Electronics &bull; Rajbiraj Showroom, Nepal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {submissionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Order Submission Notice:</span>
                <p className="mt-0.5">{submissionError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Customer & Delivery Address Form */}
          {step === 'details' && (
            <form onSubmit={handleValidateDetails} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> Step 1: Customer & Delivery Address
                </span>
                <span className="text-slate-400">Step 1 of 2</span>
              </div>

              {/* Order quick overview banner */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[11px] block">Bag Summary:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {totalItemCount} {totalItemCount === 1 ? 'Appliance' : 'Appliances'} &bull; Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Showroom In-Stock
                </span>
              </div>

              {customerProfile?.savedAddresses && customerProfile.savedAddresses.length > 0 && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Use a saved delivery address:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {customerProfile.savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => {
                          setFullName(addr.fullName);
                          setPhone(addr.phone);
                          setProvince(addr.province);
                          setDistrict(addr.district);
                          setMunicipality(addr.municipality);
                          setWardNo(addr.wardNo);
                          setStreetAddress(addr.streetAddress);
                          if (addr.landmark) setLandmark(addr.landmark);
                          setIsWithin5km(addr.isWithin5km);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-amber-950 text-[11px] font-semibold hover:bg-amber-100 transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{addr.label}: {addr.streetAddress}, {addr.municipality}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Bikash Kumar Chaudhary"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Mobile Number (Nepal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9804781290"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Used for delivery confirmation and order tracking.</span>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Province <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvince(newProv);
                      const defaultDistricts = COMMON_DISTRICTS[newProv] || [];
                      if (defaultDistricts.length > 0 && !defaultDistricts.includes(district)) {
                        setDistrict(defaultDistricts[0]);
                      }
                      if (newProv !== 'Madhesh Province') {
                        setIsWithin5km(false);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Saptari"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Municipality or City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="e.g. Rajbiraj Municipality"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Ward Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    placeholder="e.g. Ward No. 3"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Nearest Landmark / Chowk <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite District Hospital Gate / Mahavir Chowk"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Street, Locality or Delivery Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Main Road, House No. 24, Near Mahavir Chowk"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 5 KM Free Delivery Determination Card */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWithin5km}
                    onChange={(e) => setIsWithin5km(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs">
                      Delivery address is within 5 km of Khan Electronics Rajbiraj Showroom (Eligible for Free Delivery)
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Delivery is available across Nepal. Free delivery applies only within 5 km of our Rajbiraj showroom. For addresses outside 5 km, delivery charge will be confirmed by our showroom team before dispatch.
                    </p>
                  </div>
                </label>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Optional Delivery Instructions for Driver
                </label>
                <textarea
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Please call 15 minutes before arrival; 2nd floor staircase delivery..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-600">
                  Subtotal: <strong className="text-slate-900 font-bold">Rs. {subtotal.toLocaleString()}</strong>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Payment & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment & Order Review */}
          {step === 'review' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-600" /> Step 2: Payment Preference & Review
                </span>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-slate-700 font-bold block mb-1">
                  Select Payment Preference:
                </label>
                
                {[
                  {
                    id: 'Cash on Delivery' as OrderPaymentMethod,
                    title: 'Cash on Delivery (Pay at Home)',
                    desc: 'Pay cash to the Khan Electronics delivery personnel upon unboxing and appliance inspection.',
                    badge: 'Recommended'
                  },
                  {
                    id: 'Pay at Store' as OrderPaymentMethod,
                    title: 'Pay at Store (Showroom Collection or Counter Payment)',
                    desc: 'Pay at our Main Road, Rajbiraj showroom counter before delivery dispatch or in-store collection.',
                    badge: 'Rajbiraj Showroom'
                  }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{method.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            {method.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{method.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Order Items Snapshot Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Order Summary ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}):
                </span>

                <div className="space-y-2 divide-y divide-slate-200/60 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Qty: <strong className="text-slate-800">{item.quantity}</strong> &times; Rs. {item.product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 shrink-0">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className={`font-bold ${isWithin5km ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {isWithin5km 
                        ? 'FREE (Within 5 km in Rajbiraj)' 
                        : 'To be confirmed by showroom team'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Final Amount:</span>
                    <span className="text-base text-slate-950 font-black">
                      Rs. {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details Recap */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Deliver To:</span>
                <p className="font-bold text-slate-900">{fullName} &bull; {phone}</p>
                <p className="text-slate-600">{streetAddress}, {wardNo}, {municipality}, {district}, {province}</p>
                {landmark && <p className="text-slate-500 text-[11px]">Landmark: {landmark}</p>}
                {deliveryInstructions && <p className="text-slate-500 text-[11px]">Note: {deliveryInstructions}</p>}
              </div>

              {/* Customer Agreement Checkbox */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedByCustomer}
                    onChange={(e) => setConfirmedByCustomer(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs">
                      I confirm this appliance order with Khan Electronics, Rajbiraj.
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      I understand the showroom will contact me via phone at <strong className="text-slate-900">{phone}</strong> to verify appliance availability, coordinate delivery dispatch, and confirm final delivery charge (if outside 5 km).
                    </p>
                  </div>
                </label>
              </div>

              {/* Place Order Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Back to Details
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !confirmedByCustomer}
                  className="px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Submitting to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Confirmation */}
          {step === 'confirmed' && createdOrder && (
            <div className="text-center py-6 space-y-5 text-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Order Received &bull; Awaiting Showroom Confirmation
                </span>
                
                <h3 className="text-2xl font-display font-black text-slate-900 mt-2.5">
                  Order #{createdOrder.orderId}
                </h3>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={handleCopyReference}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition-colors"
                    title="Copy Order Reference"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copiedReference ? 'Copied Reference!' : 'Copy Reference'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{createdOrder.customerName}</strong>! Your order has been registered in the Khan Electronics showroom database. Our team will contact you at <strong className="text-slate-900">{createdOrder.phone}</strong> to confirm stock and schedule dispatch.
                </p>
              </div>

              {/* Order details snapshot box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="text-slate-900 font-mono font-bold">{createdOrder.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Order Status:</span>
                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                    {createdOrder.orderStatus} (Showroom Review)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Payment Preference:</span>
                  <span className="text-slate-900 font-medium">{createdOrder.paymentMethod} ({createdOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="text-slate-900 font-medium text-right max-w-[200px] truncate">
                    {createdOrder.deliveryAddress.wardNo}, {createdOrder.deliveryAddress.municipality}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Delivery Fee:</span>
                  <span className="text-slate-900 font-medium">
                    {createdOrder.deliveryAddress.isWithin5km 
                      ? 'FREE (Within 5 km)' 
                      : 'To be confirmed by showroom'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-semibold">Total Amount:</span>
                  <span className="text-slate-950 font-black text-sm">
                    Rs. {createdOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-900 max-w-md mx-auto text-left leading-relaxed">
                <strong>How to find your order later:</strong> Save reference <strong className="font-mono">{createdOrder.orderId}</strong>. You can look it up anytime via "Track Order" on our website using your order reference and mobile number <strong className="font-mono">{createdOrder.phone}</strong>.
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenOrderTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrderTracking(createdOrder.orderId);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>Track This Order</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
