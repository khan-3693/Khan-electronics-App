import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  Calendar,
  Check
} from 'lucide-react';
import { ServiceTicket } from '../types';

interface ServiceWarrantySectionProps {
  serviceTickets: ServiceTicket[];
  onSubmitServiceTicket: (ticket: ServiceTicket) => void;
}

export const ServiceWarrantySection: React.FC<ServiceWarrantySectionProps> = ({
  serviceTickets,
  onSubmitServiceTicket
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'track' | 'warranty_info'>('book');

  // Book service state
  const [purchasedFromKhan, setPurchasedFromKhan] = useState(false); // CRITICAL: defaults to any customer!
  const [applianceType, setApplianceType] = useState('Refrigerator (Single / Double Door)');
  const [brand, setBrand] = useState('Samsung');
  const [modelNumber, setModelNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [customerName, setCustomerName] = useState('Bikash Kumar Chaudhary');
  const [phone, setPhone] = useState('9804781290');
  const [address, setAddress] = useState('Ward No. 3, Near Mahavir Chowk, Rajbiraj');
  const [preferredDate, setPreferredDate] = useState('Tomorrow, 10:00 AM – 2:00 PM');
  const [ticketCreated, setTicketCreated] = useState<ServiceTicket | null>(null);

  // Track service state
  const [trackCode, setTrackCode] = useState('SR-8821');
  const foundTicket = serviceTickets.find(
    t => t.referenceCode.toLowerCase() === trackCode.toLowerCase().trim()
  ) || serviceTickets[0];

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    const newRef = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: ServiceTicket = {
      id: `srv-${Date.now()}`,
      referenceCode: newRef,
      applianceType,
      brand,
      modelNumber: modelNumber || 'Standard Model',
      issueDescription,
      purchasedFromKhan,
      customerName,
      phone,
      address,
      preferredDate,
      status: 'Technician Assigned',
      technician: {
        name: 'Santosh Sharma (Lead Certified Tech)',
        phone: '9809876543',
        badge: 'Authorized Technician • Saptari Zone'
      },
      estimatedCost: purchasedFromKhan ? 'Free under Khan Warranty' : 'Rs. 450 (Home Visit) + Parts if required',
      createdAt: 'Just now'
    };

    onSubmitServiceTicket(newTicket);
    setTicketCreated(newTicket);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Top Banner highlighting Multi-Brand Service & Non-Khan purchase support */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-200 shadow-sm overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 text-emerald-700" />
            <span>Khan Electronics Multi-Brand Service Center &bull; Rajbiraj</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Authorized Service & Repair for ALL Brands.
          </h1>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-medium shadow-xs">
            &bull; <strong className="text-emerald-950 font-bold">Did not buy your appliance from Khan Electronics?</strong> No problem! Our certified technicians repair refrigerators, washing machines, microwaves, TVs, and mixer grinders across Rajbiraj and Saptari district regardless of where you originally purchased them.
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We supply 100% genuine spare parts for Samsung, CG, Godrej, Midea, Crompton, LG, Whirlpool, and other leading manufacturers. Home visits available within 24 hours.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'book'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Book Home Service Visit
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Track Service Reference ({serviceTickets.length} Active)
            </button>

            <button
              onClick={() => setActiveTab('warranty_info')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'warranty_info'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Warranty Terms & Coverage
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <span>Book Technician Home Visit in Rajbiraj / Saptari</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell us about your appliance issue. Our technician will contact you to confirm timing.
              </p>
            </div>

            {ticketCreated ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Technician Booked Successfully!</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Reference Number:</span>
                    <span className="font-mono font-bold text-blue-700">{ticketCreated.referenceCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Assigned Technician:</span>
                    <span className="font-semibold text-slate-900">{ticketCreated.technician?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Technician Direct Mobile:</span>
                    <span className="font-bold text-emerald-700">{ticketCreated.technician?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Cost:</span>
                    <span className="text-amber-700 font-bold">{ticketCreated.estimatedCost}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTicketCreated(null);
                    setActiveTab('track');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Track This Ticket Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookService} className="space-y-4 text-xs">
                {/* Critical Question: Purchased from Khan or Elsewhere */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-slate-900 font-bold block">
                    Where was this appliance purchased?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      purchasedFromKhan
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="purchasedOrigin"
                        checked={purchasedFromKhan}
                        onChange={() => setPurchasedFromKhan(true)}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div>
                        <span className="font-bold text-xs block text-slate-900">Purchased from Khan Electronics</span>
                        <span className="text-[11px] text-slate-500">Free in-warranty support with store invoice/record</span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      !purchasedFromKhan
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="purchasedOrigin"
                        checked={!purchasedFromKhan}
                        onChange={() => setPurchasedFromKhan(false)}
                        className="mt-0.5 text-emerald-600"
                      />
                      <div>
                        <span className="font-bold text-xs block text-emerald-800">Purchased from Another Store / Online</span>
                        <span className="text-[11px] text-slate-500">We fix it! Standard nominal inspection fee + parts</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Appliance Type</label>
                    <select
                      value={applianceType}
                      onChange={(e) => setApplianceType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Refrigerator (Single / Double Door)">Refrigerator (Single or Double Door)</option>
                      <option value="Washing Machine (Semi / Top / Front)">Washing Machine</option>
                      <option value="Split Air Conditioner / Cooler">Air Conditioner or Room Cooler</option>
                      <option value="Mixer Grinder / Kitchen Appliance">Mixer Grinder / Cooker / Microwave</option>
                      <option value="Television / Audio System">Smart TV or Audio System</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Brand of Appliance</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samsung, CG, Godrej, Whirlpool, LG..."
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Problem Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the issue (e.g., Refrigerator not cooling at bottom; Washing machine drum making knocking noise...)"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Preferred Visit Date & Time</label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Today (Urgent Visit)">Today (Urgent Priority)</option>
                      <option value="Tomorrow, 10:00 AM – 2:00 PM">Tomorrow Morning (10am-2pm)</option>
                      <option value="Tomorrow, 2:00 PM – 6:00 PM">Tomorrow Afternoon (2pm-6pm)</option>
                      <option value="Weekend Appointment">Saturday / Weekend Slot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-1">Full Address in Rajbiraj / Saptari (with Landmark)</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-101"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book Certified Technician Dispatch</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Help Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Our Service Commitment</span>
              </h3>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-800">100% Genuine Spare Parts:</strong> Direct from authorized brand supply lines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-800">30-Day Service Guarantee:</strong> If the same fault recurs within 30 days, re-inspection is free.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-800">Fair Upfront Pricing:</strong> No hidden costs; technician provides exact quotation before commencing repairs.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Direct Service Hotline:</span>
              <p className="text-slate-500">Speak directly with Head Service Coordinator in Rajbiraj:</p>
              <a
                href="tel:9804781290"
                className="text-amber-700 font-bold text-sm block hover:underline"
              >
                9804781290 / 031-520114
              </a>
              <span className="text-[10px] text-slate-400 block">Sunday – Friday, 9:00 AM – 7:30 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Track Service Reference */}
      {activeTab === 'track' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Track Service Complaint & Technician</h2>
              <p className="text-xs text-slate-500">Enter your service reference code (e.g., SR-8821).</p>
            </div>

            <div className="flex items-center gap-2 max-w-xs w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Enter SR-Code..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {foundTicket ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-blue-700">{foundTicket.referenceCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {foundTicket.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {foundTicket.brand} — {foundTicket.applianceType}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">{foundTicket.issueDescription}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Purchase Origin:</span>
                  <span className={`text-xs font-bold ${foundTicket.purchasedFromKhan ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {foundTicket.purchasedFromKhan ? 'Khan Electronics Customer' : 'Repaired via Multi-Brand AMC'}
                  </span>
                </div>
              </div>

              {/* Technician Info Card */}
              {foundTicket.technician && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    Assigned Lead Technician Details:
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{foundTicket.technician.name}</h4>
                      <p className="text-xs text-blue-700 font-medium">{foundTicket.technician.badge}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Scheduled Visit: {foundTicket.preferredDate}</p>
                    </div>

                    <a
                      href={`tel:${foundTicket.technician.phone}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Tech: {foundTicket.technician.phone}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              No service ticket found for that code. Please try code <strong className="text-slate-800">SR-8821</strong>.
            </div>
          )}
        </div>
      )}

      {/* Tab: Warranty Coverage Terms */}
      {activeTab === 'warranty_info' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-600">
          <h2 className="text-lg font-bold text-slate-900">Official Brand Warranty Policies & Support</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <span className="font-bold text-blue-800 text-sm block">Samsung Nepal Warranty</span>
              <p className="text-slate-600 leading-relaxed">
                1 Year Comprehensive + 20 Years on Digital Inverter Compressors and Motors. Handled via Samsung Authorized Care.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="font-bold text-amber-800 text-sm block">CG (Chaudhary Group)</span>
              <p className="text-slate-600 leading-relaxed">
                1-2 Years Comprehensive + 10 Years Inverter Motor Warranty. Quick turnaround with local CG warehouse parts in Rajbiraj.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-800 text-sm block">Non-Khan Electronics Appliances</span>
              <p className="text-slate-600 leading-relaxed">
                Enrolled under Khan Care AMC. Transparent service charges with authentic manufacturer components.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
