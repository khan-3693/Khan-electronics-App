import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  ShieldCheck, 
  Wrench, 
  Repeat, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone,
  FileText
} from 'lucide-react';
import { 
  CustomerUser, 
  Order, 
  ServiceTicket, 
  ExchangeRequest, 
  FinanceApplication, 
  RegisteredWarranty 
} from '../types';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser;
  orders: Order[];
  serviceTickets: ServiceTicket[];
  exchangeRequests: ExchangeRequest[];
  financeApplications: FinanceApplication[];
  warranties: RegisteredWarranty[];
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  serviceTickets,
  exchangeRequests,
  financeApplications,
  warranties
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'warranties' | 'service' | 'exchange' | 'finance'>('orders');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  {user.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  {user.memberTier}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {user.address}, {user.city} &bull; {user.phone}
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

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 overflow-x-auto flex gap-2 text-xs font-semibold py-2.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('warranties')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'warranties' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warranties ({warranties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'service' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Service Tickets ({serviceTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exchange')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'exchange' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Samsung Exchanges ({exchangeRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'finance' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Hulas Finance ({financeApplications.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="text-slate-500">Order records at Khan Electronics Rajbiraj showroom:</div>
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-700">{order.id}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500">{order.createdAt}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-800">
                        <span>{item.quantity}x {item.productName} ({item.brand})</span>
                        <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                    <div>
                      <span>Delivery: </span>
                      <strong className="text-slate-900">{order.deliveryType}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] block text-slate-500">Total Invoiced:</span>
                      <span className="text-sm font-black text-slate-900">Rs. {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Warranties */}
          {activeTab === 'warranties' && (
            <div className="space-y-4">
              <div className="text-slate-500">
                Registered appliance warranties (Includes items purchased from Khan Electronics & enrolled 3rd-party units):
              </div>

              {warranties.map((warr) => (
                <div key={warr.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-700 font-bold uppercase font-display">{warr.brand}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="font-mono text-slate-500 text-[11px]">{warr.serialNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{warr.productName}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{warr.warrantyExpiry}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {warr.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {warr.purchasedFromKhan ? 'Khan Store Purchase' : 'Multi-Brand Serviced Unit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Service Tickets */}
          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="text-slate-500">
                Active service complaint references & assigned technician dispatches:
              </div>

              {serviceTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{t.referenceCode}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="font-bold text-slate-900">{t.brand} {t.applianceType}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t.status}
                    </span>
                  </div>

                  <p className="text-slate-600">{t.issueDescription}</p>

                  {t.technician && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Assigned Technician</span>
                        <span className="font-bold text-slate-900">{t.technician.name}</span>
                      </div>
                      <a href={`tel:${t.technician.phone}`} className="text-amber-700 font-bold hover:underline">
                        Call: {t.technician.phone}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Samsung Exchange */}
          {activeTab === 'exchange' && (
            <div className="space-y-4">
              <div className="text-slate-500">Your Samsung Smart Exchange trade-in valuations:</div>
              {exchangeRequests.map((ex) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{ex.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {ex.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">Trade-In: {ex.currentBrand} &bull; {ex.applianceType}</h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Condition: <strong className="text-slate-700">{ex.condition}</strong></span>
                    <span className="text-amber-700 font-bold text-sm">Estimated Credit: Rs. {ex.estimatedValuation.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="text-slate-500">Hulas Finance appliance financing applications:</div>
              {financeApplications.map((fin) => (
                <div key={fin.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-700">{fin.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {fin.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{fin.productName}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                    <div>Price: <strong className="text-slate-900">Rs. {fin.productPrice.toLocaleString()}</strong></div>
                    <div>Down: <strong className="text-amber-700">{fin.downPaymentPercent}% (Rs. {fin.downPaymentAmount.toLocaleString()})</strong></div>
                    <div>Tenure: <strong className="text-slate-900">{fin.tenureMonths} Mo ({fin.interestRatePercent}% Int)</strong></div>
                    <div>EMI: <strong className="text-amber-700">Rs. {fin.monthlyEmi.toLocaleString()}/mo</strong></div>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>Citizenship: <strong className="text-slate-700">{fin.citizenshipNo}</strong></span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-medium">SIM in applicant's name verified</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
