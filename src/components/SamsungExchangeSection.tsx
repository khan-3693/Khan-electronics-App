import React, { useState } from 'react';
import { 
  Repeat, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Phone,
  Calculator,
  Check
} from 'lucide-react';
import { Product, ExchangeRequest } from '../types';

interface SamsungExchangeSectionProps {
  samsungProducts: Product[];
  onSubmitExchange: (request: ExchangeRequest) => void;
  onSelectProduct: (product: Product) => void;
}

export const SamsungExchangeSection: React.FC<SamsungExchangeSectionProps> = ({
  samsungProducts,
  onSubmitExchange,
  onSelectProduct
}) => {
  const [applianceType, setApplianceType] = useState('Refrigerator (Single / Double Door)');
  const [currentBrand, setCurrentBrand] = useState('LG');
  const [condition, setCondition] = useState<'Working Good' | 'Minor Issue' | 'Not Working'>('Working Good');
  const [selectedSamsungId, setSelectedSamsungId] = useState(samsungProducts[0]?.id || '');
  const [customerName, setCustomerName] = useState('Bikash Kumar Chaudhary');
  const [phone, setPhone] = useState('9804781290');
  const [address, setAddress] = useState('Main Road, Ward No. 3, Rajbiraj');
  const [submitted, setSubmitted] = useState(false);

  // Valuation algorithm based on type and condition
  const calculateEstimatedValue = () => {
    let base = 8000;
    if (applianceType.includes('Refrigerator')) base = 12000;
    if (applianceType.includes('Washing Machine')) base = 14000;
    if (applianceType.includes('Television')) base = 10000;

    if (condition === 'Working Good') return base;
    if (condition === 'Minor Issue') return Math.round(base * 0.65);
    return Math.round(base * 0.35); // Not working / Scrap value
  };

  const estimatedValue = calculateEstimatedValue();
  const selectedSamsung = samsungProducts.find(p => p.id === selectedSamsungId) || samsungProducts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: ExchangeRequest = {
      id: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      applianceType,
      currentBrand,
      condition,
      estimatedValuation: estimatedValue,
      selectedSamsungProductId: selectedSamsung?.id,
      customerName,
      phone,
      address,
      status: 'Inspection Scheduled in Rajbiraj',
      createdAt: 'Just now'
    };

    onSubmitExchange(newRequest);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-blue-50/90 via-sky-50 to-indigo-50/70 border border-blue-200 shadow-sm overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Repeat className="w-3.5 h-3.5 text-blue-700" />
            <span>Exclusive Samsung Smart Exchange Facility &bull; Rajbiraj Showroom</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Exchange Your Old Appliance for a Brand New Samsung.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Got an old refrigerator, washing machine, or TV gathering dust or breaking down? Turn it into instant cash value towards a new Samsung digital inverter appliance. Any brand, working or non-working condition accepted!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
              <span className="text-blue-700 font-bold block">1. Any Old Brand</span>
              <span className="text-slate-500 text-[11px]">LG, Whirlpool, CG, Videocon, or any unbranded unit.</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
              <span className="text-blue-700 font-bold block">2. Fair Valuation</span>
              <span className="text-slate-500 text-[11px]">Get up to Rs. 25,000 credit deducted from your invoice.</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
              <span className="text-blue-700 font-bold block">3. Doorstep Pickup</span>
              <span className="text-slate-500 text-[11px]">Our team picks up old unit and installs new Samsung at home!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Exchange Valuation Calculator & Application */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Valuation Calculator */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Instant Trade-in Valuation Calculator</h2>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
              Instant Estimate
            </span>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Exchange Application Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Khan Electronics Rajbiraj dispatch team will contact you at <strong className="text-blue-700">{phone}</strong> within 2 hours to confirm your doorstep inspection date and apply your <strong className="text-amber-700">Rs. {estimatedValue.toLocaleString()}</strong> trade-in credit!
              </p>
              <div className="pt-2 text-xs text-slate-400">
                You can track this in your <strong>Customer Dashboard</strong> under Exchange Records.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Old Appliance Category</label>
                  <select
                    value={applianceType}
                    onChange={(e) => setApplianceType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Refrigerator (Single / Double Door)">Refrigerator (Single or Double Door)</option>
                    <option value="Washing Machine (Semi / Top / Front)">Washing Machine (Semi or Automatic)</option>
                    <option value="Television (CRT / LCD / LED)">Television (CRT, LCD or Old LED)</option>
                    <option value="Microwave / Kitchen Appliance">Microwave or Heavy Kitchen Appliance</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Old Appliance Brand</label>
                  <select
                    value={currentBrand}
                    onChange={(e) => setCurrentBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="LG">LG</option>
                    <option value="Whirlpool">Whirlpool</option>
                    <option value="Godrej">Godrej</option>
                    <option value="CG">CG (Chaudhary Group)</option>
                    <option value="Videocon">Videocon</option>
                    <option value="Kelvinator / Haier">Kelvinator / Haier</option>
                    <option value="Samsung (Old Model)">Samsung (Old Model)</option>
                    <option value="Other / Unbranded">Other Brand / Local Maker</option>
                  </select>
                </div>
              </div>

              {/* Working Condition Radio Selection */}
              <div>
                <label className="text-slate-700 font-semibold block mb-2">Current Working Condition</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('Working Good')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      condition === 'Working Good'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Working Good</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Powers on, normal cooling/wash</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('Minor Issue')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      condition === 'Minor Issue'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Minor Issue</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Low cooling, noise, or minor fault</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('Not Working')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      condition === 'Not Working'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Not Working (Scrap)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Dead motor/panel, broken body</div>
                  </button>
                </div>
              </div>

              {/* Target Samsung Product Selection */}
              <div className="pt-2">
                <label className="text-slate-700 font-semibold block mb-1">Choose New Samsung Model to Upgrade to</label>
                <select
                  value={selectedSamsungId}
                  onChange={(e) => setSelectedSamsungId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  {samsungProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Rs. {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valuation Display Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-800 uppercase tracking-wider font-bold block">
                    Estimated Trade-In Credit:
                  </span>
                  <div className="text-2xl font-black text-amber-700 mt-0.5">
                    Rs. {estimatedValue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-600">
                    Net price for {selectedSamsung?.name.split(' ').slice(0, 3).join(' ')}:{' '}
                    <strong className="text-slate-900 font-bold">Rs. {Math.max(0, (selectedSamsung?.price || 0) - estimatedValue).toLocaleString()}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Doorstep Pickup Free
                  </span>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Address in Rajbiraj / Saptari</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                <Repeat className="w-4 h-4" />
                <span>Submit Exchange Request & Lock Rs. {estimatedValue.toLocaleString()} Value</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Selected Samsung Product Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
              Upgrade Target Appliance:
            </span>

            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
              <img
                src={selectedSamsung?.imageUrl}
                alt={selectedSamsung?.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Official Samsung Nepal
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                {selectedSamsung?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {selectedSamsung?.shortDesc}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Standard Showroom Price:</span>
                <span className="text-slate-900 font-semibold">Rs. {selectedSamsung?.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-bold">
                <span>Your Old Appliance Trade-in:</span>
                <span>- Rs. {estimatedValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-amber-700 pt-1.5 border-t border-slate-200">
                <span>Effective Exchange Price:</span>
                <span>Rs. {Math.max(0, (selectedSamsung?.price || 0) - estimatedValue).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectProduct(selectedSamsung)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Full Specs of this Samsung Model</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> Prefer talking to our exchange executive?
            </span>
            <p className="text-[11px] text-slate-600">
              Call Khan Electronics Exchange Desk at <strong>9804781290</strong> or visit our showroom on Main Road, Rajbiraj for same-day walk-in valuation!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
