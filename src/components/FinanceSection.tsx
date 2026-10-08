import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CreditCard, 
  Percent, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Calculator, 
  ShieldCheck, 
  Building2,
  Check,
  Smartphone,
  AlertTriangle,
  Info,
  Search,
  ChevronDown,
  Sparkles,
  Calendar,
  UserCheck,
  Users,
  Copy,
  ExternalLink,
  Bot
} from 'lucide-react';
import { Product } from '../types';
import { 
  isProductFinanceEligible, 
  MIN_FINANCE_PRICE, 
  FINANCE_TENURES, 
  submitFinanceEnquiry,
  calculateFinanceEmi,
  getTenureInterestRate,
  FinanceTenureMonths
} from '../services/financeService';

interface FinanceSectionProps {
  eligibleProducts: Product[];
  onSubmitFinance?: (enquiry: any) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAiAssistant?: () => void;
}

export const FinanceSection: React.FC<FinanceSectionProps> = ({
  eligibleProducts,
  onSelectProduct,
  onOpenAiAssistant
}) => {
  // STRICT RULE: Only products with financeAvailable = true AND sellingPrice >= 30,000
  const financeEligibleProducts = useMemo(() => {
    return eligibleProducts.filter(p => isProductFinanceEligible(p));
  }, [eligibleProducts]);

  // Selected Product State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    return financeEligibleProducts[0] || null;
  });

  // Keep selected product in sync if products reload
  useEffect(() => {
    if (!selectedProduct && financeEligibleProducts.length > 0) {
      setSelectedProduct(financeEligibleProducts[0]);
    } else if (selectedProduct && !financeEligibleProducts.some(p => p.id === selectedProduct.id)) {
      setSelectedProduct(financeEligibleProducts[0] || null);
    }
  }, [financeEligibleProducts]);

  // Searchable Product Combobox State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered products for searchable combobox
  const searchResults = useMemo(() => {
    if (!productSearchQuery.trim()) return financeEligibleProducts;
    const q = productSearchQuery.toLowerCase().trim();
    return financeEligibleProducts.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = p.modelNumber ? p.modelNumber.toLowerCase().includes(q) : false;
      return matchName || matchBrand || matchModel;
    });
  }, [financeEligibleProducts, productSearchQuery]);

  // Tenure State: Exactly 6, 9, 12, or 24 months
  const [tenureMonths, setTenureMonths] = useState<FinanceTenureMonths>(12);

  // Enquiry Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [citizenshipIssueDate, setCitizenshipIssueDate] = useState('');
  
  // Submission & Result States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Calculator calculations (0% Interest for 6, 9, 12 months; 7.99% Interest for 24 months)
  const activePrice = selectedProduct ? selectedProduct.price : 45000;
  const downPaymentPercent = 40; // 40% initial downpayment
  const emiBreakdown = useMemo(() => {
    return calculateFinanceEmi(activePrice, tenureMonths, downPaymentPercent);
  }, [activePrice, tenureMonths, downPaymentPercent]);

  const {
    downPaymentAmount,
    financedAmount,
    interestRatePercent,
    interestAmount,
    totalPayableLoan,
    monthlyEmi
  } = emiBreakdown;

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct) {
      setFormError('Please select a finance-eligible product.');
      return;
    }

    if (selectedProduct.price < MIN_FINANCE_PRICE) {
      setFormError(`Finance is available only for products priced at NPR ${MIN_FINANCE_PRICE.toLocaleString()} or above.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const enquiry = await submitFinanceEnquiry({
        fullName,
        phoneNumber,
        email,
        citizenshipNumber,
        citizenshipIssueDate,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        modelNumber: selectedProduct.modelNumber || selectedProduct.id,
        productPrice: selectedProduct.price,
        tenureMonths
      });

      setSubmittedEnquiryId(enquiry.enquiryId);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit finance enquiry. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (!submittedEnquiryId) return;
    navigator.clipboard.writeText(submittedEnquiryId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. HERO BANNER: 0% INTEREST FINANCE HIGHLIGHT */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-xl overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 text-amber-400 text-xs font-black tracking-wider uppercase shadow-md">
            <Percent className="w-4 h-4" />
            <span>APPLIANCE FINANCING</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Bring Home Premium Appliances with <span className="text-amber-200 underline decoration-white/40">Flexible Finance</span>.
          </h1>

          <p className="text-sm sm:text-base text-amber-50 font-medium leading-relaxed">
            Choose from <strong className="text-white font-bold">6, 9, 12 months (0% Interest)</strong> or <strong className="text-white font-bold">24 months (7.99% Interest)</strong>. Available exclusively on all brand appliances priced at <strong className="text-white font-bold">NPR 30,000 and above</strong> with simple, transparent monthly installments.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> 0% Interest (6, 9 & 12 Months)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5 text-amber-600" /> 7.99% Flat Rate (24 Months)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Minimum NPR 30,000 Appliance Value
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: SEARCHABLE APPLIANCE SELECTOR, EMI CALCULATOR & ENQUIRY FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Searchable Selector & Real-Time EMI Calculator */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Appliance EMI Calculator</h2>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold">
              Min. Price: NPR 30,000
            </span>
          </div>

          <div className="space-y-6 text-xs">
            {/* SEARCHABLE PRODUCT SELECTOR */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-bold block">
                  Select Finance Appliance (NPR 30,000+) *
                </label>
                <span className="text-[11px] text-slate-500">
                  {financeEligibleProducts.length} eligible appliance{financeEligibleProducts.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Combobox Trigger / Search Input */}
              <div className="relative">
                <div 
                  onClick={() => setIsDropdownOpen(true)}
                  className={`w-full px-3.5 py-3 bg-slate-50 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                    isDropdownOpen ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedProduct ? (
                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          [{selectedProduct.brand}] {selectedProduct.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Model: {selectedProduct.modelNumber || selectedProduct.id} &bull; <strong className="text-amber-800 font-sans font-bold">NPR {selectedProduct.price.toLocaleString()}</strong>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Search appliance by name, brand, or model...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Results Box */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-100">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Type to filter: e.g. Samsung 253, Washing Machine, RT30..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50">
                      {searchResults.length > 0 ? (
                        searchResults.map(p => {
                          const isSelected = selectedProduct?.id === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedProduct(p);
                                setIsDropdownOpen(false);
                                setProductSearchQuery('');
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                                isSelected ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">
                                  [{p.brand}] {p.name}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                                  <span>Model: {p.modelNumber || p.id}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-amber-800 font-sans block">
                                  NPR {p.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold">Finance Eligible</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No finance-eligible products matching "{productSearchQuery}" (minimum NPR 30,000 required).
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TENURE SELECTOR: EXACTLY 6, 9, 12, 24 MONTHS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-800 font-bold block">
                  Select Finance Tenure *
                </label>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  0% Interest on 6, 9, 12 months &bull; 7.99% on 24 months
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FINANCE_TENURES.map(t => {
                  const isSelected = tenureMonths === t.months;
                  const itemBreakdown = calculateFinanceEmi(activePrice, t.months, downPaymentPercent);
                  const isZeroInterest = t.interestRatePercent === 0;
                  return (
                    <button
                      key={t.months}
                      type="button"
                      onClick={() => setTenureMonths(t.months)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">{t.label}</div>
                      <div className="text-[11px] font-black text-amber-800 mt-1">
                        Rs. {itemBreakdown.monthlyEmi.toLocaleString()}/mo
                      </div>
                      <div className={`text-[10px] font-bold mt-0.5 ${isZeroInterest ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isZeroInterest ? '0% Interest' : '7.99% Interest'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EMI CALCULATION TRANSPARENCY CARD */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Selling Price</span>
                  <span className="text-xs font-bold text-slate-900">Rs. {activePrice.toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-amber-700 block">Down Payment (40%)</span>
                  <span className="text-xs font-bold text-amber-900">Rs. {downPaymentAmount.toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Financed Principal</span>
                  <span className="text-xs font-bold text-slate-900">Rs. {financedAmount.toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider block">Monthly Installment</span>
                  <span className="text-sm font-black">Rs. {monthlyEmi.toLocaleString()}/mo</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-[11px] text-slate-700">
                <div className={`flex items-center gap-1.5 font-bold ${interestRatePercent > 0 ? 'text-amber-900' : 'text-emerald-800'}`}>
                  <Percent className={`w-4 h-4 ${interestRatePercent > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span>
                    {interestRatePercent > 0 
                      ? `Interest Charged (7.99%): Rs. ${interestAmount.toLocaleString()} (Total Payable: Rs. ${totalPayableLoan.toLocaleString()})`
                      : 'Total Interest Charged: Rs. 0 (0% Interest)'}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[10px]">
                  Tenure: {tenureMonths} Months ({interestRatePercent > 0 ? '7.99% Flat Rate' : '0% Interest'})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCE ELIGIBILITY ENQUIRY FORM */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Finance Eligibility Enquiry</h3>
          </div>

          {/* SUCCESS SCREEN WITH UNIQUE ENQUIRY ID & AI LOOKUP GUIDANCE */}
          {submittedEnquiryId ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950">Finance enquiry submitted successfully.</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you! Your eligibility enquiry has been received and logged in our system.
                  </p>
                </div>
              </div>

              {/* ENQUIRY ID CARD */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                  Your Finance Enquiry ID:
                </span>
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-mono text-lg sm:text-xl font-extrabold tracking-wider text-white">
                    {submittedEnquiryId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy Enquiry ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <Bot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      You can use this enquiry ID to check your enquiry status through <strong className="text-white font-bold">Ask Khan AI</strong> at any time.
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    *Note: This is an enquiry/eligibility submission, NOT final finance approval. Our finance desk will verify your details and contact you.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {onOpenAiAssistant && (
                  <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>Check Status in Ask Khan AI</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedEnquiryId(null);
                    setFullName('');
                    setPhoneNumber('');
                    setEmail('');
                    setCitizenshipNumber('');
                    setCitizenshipIssueDate('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitEnquiry} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-slate-800 font-semibold block mb-1">
                  Full Name * <span className="text-slate-400 font-normal">(As on Nepali Citizenship)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Yadav"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-slate-800 font-semibold block mb-1">
                  Mobile Phone Number * <span className="text-slate-400 font-normal">(Must be in your own name)</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-slate-800 font-semibold block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Citizenship Number & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-semibold block mb-1">
                    Citizenship Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15-01-72-XXXXX"
                    value={citizenshipNumber}
                    onChange={(e) => setCitizenshipNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-semibold block mb-1">
                    Citizenship Issue Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY/MM/DD (BS or AD)"
                    value={citizenshipIssueDate}
                    onChange={(e) => setCitizenshipIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selected Appliance Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Selected Appliance:</span>
                <div className="font-bold text-slate-900">
                  {selectedProduct?.name || 'Please select a product above'}
                </div>
                <div className="text-[11px] text-slate-600 font-mono flex items-center justify-between pt-1">
                  <span>Price: NPR {activePrice.toLocaleString()}</span>
                  <span className="text-amber-800 font-bold">
                    {tenureMonths} Mo Tenure @ {interestRatePercent > 0 ? '7.99%' : '0%'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting Enquiry to Firestore...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Submit Finance Enquiry (Rs. {monthlyEmi.toLocaleString()}/mo)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center pt-1">
                Zero hidden processing fees. Submission generates your official Enquiry ID.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* 3. FINANCE CONDITIONS: STRUCTURED & EASY TO SCAN */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Eligibility & Required Information
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Transparent requirements for our 0% interest appliance finance program in Rajbiraj, Saptari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Who Can Apply? */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Who Can Apply?</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Age must be between <strong>25 and 65 years</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Mobile SIM number must be registered in the applicant's <strong>own name</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Must have permanent residence or work/business in Nepal.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Required Documents */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Required Documents</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Citizenship copy of the loan applicant.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Citizenship copy of the <strong>Guarantor</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>2 passport-size photographs of the applicant and Guarantor.</span>
              </li>
              <li className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-semibold">
                &bull; Salary certificate or salary guarantee is <strong>NOT required</strong>.
              </li>
            </ul>
          </div>

          {/* Card 3: Employment & Income Information */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Employment & Income</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Information about where you work or what business you operate.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Monthly salary / income details and regular expenses.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>One <strong>Guarantor</strong> with identity confirmation is required.</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Finance Tenures */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Finance Tenures</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>6 Months</strong> &bull; 0% Interest</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>9 Months</strong> &bull; 0% Interest</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>12 Months</strong> &bull; 0% Interest</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>24 Months</strong> &bull; 7.99% Interest</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
