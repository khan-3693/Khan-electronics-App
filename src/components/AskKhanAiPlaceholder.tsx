import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CreditCard, 
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Lock,
  RefreshCw,
  Repeat
} from 'lucide-react';
import { lookupFinanceEnquiryForCustomer } from '../services/financeService';
import { FinanceEnquiryStatus } from '../types';

export interface ProductAiContext {
  productId: string;
  productName: string;
  brand: string;
  model?: string;
  category: string;
  price: number;
  imageUrl?: string;
  keySpecifications?: string[];
}

interface AskKhanAiPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExchange: () => void;
  onOpenFinance: () => void;
  onOpenService: () => void;
  productContext?: ProductAiContext | null;
  onClearProductContext?: () => void;
}

interface EnquiryLookupResult {
  enquiryId: string;
  fullName: string;
  productName: string;
  modelNumber: string;
  productPrice: number;
  tenureMonths: number;
  status: FinanceEnquiryStatus;
  submittedAt?: string;
}

export const AskKhanAiPlaceholder: React.FC<AskKhanAiPlaceholderProps> = ({
  isOpen,
  onClose,
  onOpenExchange,
  onOpenFinance,
  onOpenService,
  productContext,
  onClearProductContext
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  // Dedicated Finance Enquiry Lookup State
  const [lookupEnquiryId, setLookupEnquiryId] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<EnquiryLookupResult | null>(null);
  const [showLookupBox, setShowLookupBox] = useState(false);

  if (!isOpen) return null;

  const productQuestions = productContext ? [
    "Can I buy this on 0% interest finance?",
    "Is this good for a family of 5?",
    `What is the difference between this and another ${productContext.brand} ${productContext.category}?`,
    "Is exchange available for this appliance?",
    "How much electricity does this use?"
  ] : [
    "Check my finance enquiry status",
    "What are the age and citizenship requirements for 0% finance?",
    "What is the estimated trade-in valuation for my old refrigerator?",
    "Can you repair a Whirlpool fridge in Rajbiraj if bought elsewhere?",
    "Which washing machine is best suited for Terai hard water?"
  ];

  const handleExecuteLookup = async (idToUse?: string, phoneToUse?: string) => {
    const id = (idToUse || lookupEnquiryId).trim();
    const phone = (phoneToUse || lookupPhone).trim();

    setLookupError('');
    setLookupResult(null);

    if (!id) {
      setLookupError('Please enter your Finance Enquiry ID (e.g., FIN-2026-000123).');
      return;
    }

    if (!phone) {
      setLookupError('For verification, please enter the phone number you used when applying.');
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await lookupFinanceEnquiryForCustomer(id, phone);
      if (res.success && res.enquiry) {
        setLookupResult(res.enquiry);
      } else {
        setLookupError(res.error || 'Could not verify enquiry details.');
      }
    } catch (err: any) {
      setLookupError(err?.message || 'Verification service error. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSampleClick = (question: string) => {
    setQueryInput(question);

    // If query is about finance enquiry status, open the lookup card
    if (question.toLowerCase().includes('finance enquiry') || question.toLowerCase().includes('finance application')) {
      setShowLookupBox(true);
      setActiveNotice('Please enter your Finance Enquiry ID and phone number below to verify and check your status.');
      return;
    }

    if (productContext) {
      setActiveNotice(
        `Khan AI Context: Querying knowledge for "${productContext.productName}" (Model: ${productContext.model || 'Standard'}, Rs. ${productContext.price.toLocaleString()}). Live inventory and technical specs active.`
      );
    } else {
      setActiveNotice(
        `Khan AI Assistant: Live showroom inventory, finance requirements (min NPR 30,000 @ 0% interest), and Samsung trade-in matrix active.`
      );
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    const query = queryInput.trim();
    // Check if the query contains a Finance Enquiry ID (e.g. FIN-2026-XXXXXX)
    const match = query.match(/FIN-2026-\d+/i);
    if (match) {
      setLookupEnquiryId(match[0].toUpperCase());
      setShowLookupBox(true);
      setActiveNotice(`Detected Enquiry ID: ${match[0].toUpperCase()}. Please enter your phone number to verify and view status.`);
      return;
    }

    if (query.toLowerCase().includes('finance enquiry') || query.toLowerCase().includes('finance status') || query.toLowerCase().includes('finance application')) {
      setShowLookupBox(true);
      setActiveNotice('Please enter your Finance Enquiry ID and phone number below to securely check your application status.');
      return;
    }

    if (productContext) {
      setActiveNotice(
        `Your question "${query}" regarding "${productContext.productName}" has been routed with live product context to Khan AI.`
      );
    } else {
      setActiveNotice(
        `Your question "${query}" is being analyzed by Ask Khan AI.`
      );
    }
  };

  const getStatusBadge = (status: FinanceEnquiryStatus) => {
    switch (status) {
      case 'New':
        return { label: 'Enquiry Received', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
      case 'Under Review':
        return { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
      case 'Approved':
        return { label: 'Enquiry Pre-Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'More Information Required':
        return { label: 'More Information Required', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle };
      case 'Contact Store':
        return { label: 'Contact Store (9804781290)', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Phone };
      case 'Rejected':
        return { label: 'Not Approved', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle };
      case 'Completed':
        return { label: 'Agreement Completed', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: CheckCircle2 };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-200', icon: Clock };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Ask Khan AI</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    Live Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Concierge &bull; Showroom Guidance &bull; Enquiry Lookup
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Context Banner (if opened from product detail) */}
          {productContext && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 border-b border-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {productContext.imageUrl && (
                  <img
                    src={productContext.imageUrl}
                    alt={productContext.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-200 bg-white shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Product in Conversation Context:</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {productContext.productName}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    NPR {productContext.price.toLocaleString()} &bull; {productContext.price >= 30000 ? 'Eligible for 0% Finance' : 'Below NPR 30k (No Finance)'}
                  </p>
                </div>
              </div>
              {onClearProductContext && (
                <button
                  onClick={onClearProductContext}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors shrink-0"
                  title="Clear product context"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* FEATURED TOOL: FINANCE ENQUIRY STATUS LOOKUP */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <Search className="w-4 h-4 text-amber-600" />
                  <span>Check Finance Enquiry Status</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLookupBox(!showLookupBox)}
                  className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {showLookupBox ? 'Hide' : 'Open Lookup'}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Track your 0% interest appliance finance enquiry in real-time using your <strong>Enquiry ID</strong> and <strong>registered phone number</strong>.
              </p>

              {showLookupBox && (
                <div className="pt-2 border-t border-amber-200/80 space-y-3">
                  {lookupError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Finance Enquiry ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FIN-2026-000123"
                        value={lookupEnquiryId}
                        onChange={e => setLookupEnquiryId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Mobile Phone Number</span>
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Privacy Verification
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 98XXXXXXXX"
                        value={lookupPhone}
                        onChange={e => setLookupPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteLookup()}
                      disabled={isLookingUp}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isLookingUp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying with Showroom Database...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Check Enquiry Status</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* LOOKUP RESULT DISPLAY */}
                  {lookupResult && (
                    <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Enquiry ID</span>
                          <span className="font-mono text-xs font-bold text-slate-900">{lookupResult.enquiryId}</span>
                        </div>
                        {(() => {
                          const badge = getStatusBadge(lookupResult.status);
                          const IconComp = badge.icon;
                          return (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${badge.color}`}>
                              <IconComp className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <div className="text-xs space-y-1 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Applicant:</span>
                          <span className="font-semibold">{lookupResult.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Appliance:</span>
                          <span className="font-semibold text-right max-w-[220px] truncate">{lookupResult.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Price:</span>
                          <span className="font-semibold text-amber-800">NPR {lookupResult.productPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tenure:</span>
                          <span className="font-semibold">{lookupResult.tenureMonths} Months @ 0% Interest</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1 text-[11px] text-slate-400">
                          <span>Logged:</span>
                          <span>{lookupResult.submittedAt || 'Recently'}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                        {lookupResult.status === 'New' && (
                          <span>Your enquiry has been safely received. Our finance desk will call your registered number shortly.</span>
                        )}
                        {lookupResult.status === 'Under Review' && (
                          <span>Your documentation is currently under verification by our credit review desk.</span>
                        )}
                        {lookupResult.status === 'Approved' && (
                          <span className="text-emerald-800 font-semibold">Your finance eligibility is approved! Please visit our Rajbiraj showroom with your Guarantor to collect your appliance.</span>
                        )}
                        {lookupResult.status === 'More Information Required' && (
                          <span className="text-orange-800 font-semibold">Additional information is needed. Please call us at 9804781290 or visit the showroom.</span>
                        )}
                        {lookupResult.status === 'Contact Store' && (
                          <span className="text-purple-800 font-semibold">Please call our showroom desk at 9804781290 for a quick update.</span>
                        )}
                        {lookupResult.status === 'Rejected' && (
                          <span>We regret to inform you that your finance application could not be approved at this time.</span>
                        )}
                        {lookupResult.status === 'Completed' && (
                          <span>Finance agreement finalized and appliance delivered. Thank you!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Hub Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Quick Showroom Services:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenFinance();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-left transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-600 mb-1" />
                  <div className="font-bold text-slate-900 text-[11px]">0% Finance</div>
                  <div className="text-[10px] text-slate-500">From NPR 30,000</div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExchange();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-left transition-colors cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="font-bold text-slate-900 text-[11px]">Exchange</div>
                  <div className="text-[10px] text-slate-500">Samsung Trade-In</div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenService();
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 text-left transition-colors cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="font-bold text-slate-900 text-[11px]">Book Repair</div>
                  <div className="text-[10px] text-slate-500">Rajbiraj Service</div>
                </button>
              </div>
            </div>

            {/* Context / Sample Queries */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {productContext ? 'Suggested Inquiries for this Appliance:' : 'Common Questions Khan AI Can Answer:'}
              </span>
              <div className="space-y-1.5">
                {productQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleClick(q)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-amber-800 text-xs transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Notice Card */}
            {activeNotice && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1 animate-in fade-in duration-100">
                <span className="font-bold text-amber-950 block">Khan AI Concierge:</span>
                <p className="leading-relaxed text-[11px]">{activeNotice}</p>
              </div>
            )}

            {/* Contact Human Specialist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-600" /> Prefer to speak directly to our showroom?
              </span>
              <p className="text-slate-600 text-[11px]">
                Call New Khan Automobiles & Electronics in Rajbiraj at <strong className="text-slate-900">9804781290</strong> or message on WhatsApp.
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href="tel:9804781290"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Call 9804781290
                </a>
                <a
                  href="https://wa.me/9779804781290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={productContext ? `Ask about ${productContext.productName}...` : "Ask about finance enquiry FIN-2026-..., 0% EMI..."}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
