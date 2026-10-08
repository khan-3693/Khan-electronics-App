import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Repeat, 
  CreditCard, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Phone,
  Percent,
  CheckCircle2,
  Tag,
  Zap,
  Smartphone,
  Gift
} from 'lucide-react';
import { BRANDS_LIST } from '../data/productsData';
import { KhanLogo } from './KhanLogo';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onOpenExchange: () => void;
  onOpenFinance: () => void;
  onOpenService: () => void;
  onSelectBrand: (brand: string) => void;
}

interface SlideData {
  id: string;
  tabLabel: string;
  badge: {
    text: string;
    color: string;
  };
  headline: string;
  highlightText: string;
  description: string;
  primaryCta: {
    label: string;
    action: () => void;
    icon: React.ReactNode;
    style: string;
  };
  secondaryCta: {
    label: string;
    action: () => void;
    icon: React.ReactNode;
    style: string;
  };
  features: { label: string; sub: string; icon: React.ReactNode }[];
  card: {
    tag: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    specs: string[];
    priceBadge?: string;
    ctaLabel: string;
    ctaAction: () => void;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onOpenExchange,
  onOpenFinance,
  onOpenService,
  onSelectBrand
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides: SlideData[] = [
    // Slide 1: Main Showroom & Store Identity
    {
      id: 'showroom',
      tabLabel: '1. Store & Brands',
      badge: {
        text: 'Authorized Multi-Brand Showroom • Rajbiraj, Saptari',
        color: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      headline: 'Premium Home Appliances for Every Nepali Household.',
      highlightText: 'New Khan Automobiles & Electronics',
      description: 'Official showroom in Rajbiraj for Samsung, CG, Godrej, Midea, Crompton, Konka, and TCL. Enjoy genuine brand Nepal warranties, local free delivery up to 5 km, and verified after-sales support.',
      primaryCta: {
        label: 'Browse Appliances',
        action: onExploreCatalog,
        icon: <ArrowRight className="w-4 h-4" />,
        style: 'bg-slate-900 hover:bg-slate-800 text-white'
      },
      secondaryCta: {
        label: 'Call 9804781290',
        action: () => { window.location.href = 'tel:9804781290'; },
        icon: <Phone className="w-4 h-4 text-amber-600" />,
        style: 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-800'
      },
      features: [
        { label: 'Free Delivery', sub: 'Within 5 km Rajbiraj', icon: <Truck className="w-4 h-4 text-amber-600" /> },
        { label: '100% Genuine', sub: 'Nepal Brand Warranty', icon: <ShieldCheck className="w-4 h-4 text-blue-600" /> },
        { label: 'Any Brand Repair', sub: 'In-home technician', icon: <Wrench className="w-4 h-4 text-emerald-600" /> },
        { label: '40% Downpayment', sub: 'Hulas Finance', icon: <CreditCard className="w-4 h-4 text-indigo-600" /> }
      ],
      card: {
        tag: 'Featured Flagship',
        title: 'Samsung 253L Digital Inverter',
        subtitle: 'Double Door No-Frost Refrigerator • 20-Year Warranty',
        imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        specs: ['20-Year Compressor Warranty', 'Stabilizer-Free Operation', '4-Star Energy Rating'],
        priceBadge: 'Rs. 46,990',
        ctaLabel: 'View Details',
        ctaAction: onExploreCatalog
      }
    },

    // Slide 2: Samsung Smart Exchange Program
    {
      id: 'exchange',
      tabLabel: '2. Samsung Exchange',
      badge: {
        text: 'Official Samsung Nepal Program • Smart Exchange',
        color: 'bg-blue-50 text-blue-900 border-blue-200'
      },
      headline: 'Upgrade to Samsung. Exchange Any Old Appliance.',
      highlightText: 'Instant Trade-In Valuation',
      description: 'Bring in your old working or non-working refrigerator, washing machine, or TV from any brand. Get up to Rs. 25,000 instant valuation deducted right off your new Samsung purchase at our Rajbiraj store!',
      primaryCta: {
        label: 'Calculate Exchange Value',
        action: onOpenExchange,
        icon: <Repeat className="w-4 h-4" />,
        style: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
      },
      secondaryCta: {
        label: 'Explore Samsung Range',
        action: () => onSelectBrand('Samsung'),
        icon: <ArrowRight className="w-4 h-4" />,
        style: 'bg-white hover:bg-blue-50 border border-blue-200 text-blue-900'
      },
      features: [
        { label: 'Up to Rs. 25,000', sub: 'Guaranteed trade-in', icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
        { label: 'Any Brand Accepted', sub: 'Working or dead', icon: <Repeat className="w-4 h-4 text-blue-600" /> },
        { label: 'Home Inspection', sub: 'In Rajbiraj & Saptari', icon: <Truck className="w-4 h-4 text-blue-600" /> },
        { label: 'Instant Bill Deduction', sub: 'Zero waiting', icon: <CheckCircle2 className="w-4 h-4 text-blue-600" /> }
      ],
      card: {
        tag: 'Official Samsung Program',
        title: 'Samsung 8.0 Kg AI EcoBubble',
        subtitle: 'Front Load Washer • Hygiene Steam • WiFi SmartThings',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
        specs: ['Up to Rs. 15,000 Old Washer Value', 'AI Energy Savings', '20-Year Motor Warranty'],
        priceBadge: 'Exchange & Save',
        ctaLabel: 'Check Exchange Value',
        ctaAction: onOpenExchange
      }
    },

    // Slide 3: Finance Facility (40% Downpayment, 0% up to 1 yr / 7.99% for > 1 yr)
    {
      id: 'finance',
      tabLabel: '3. Finance (40% Downpayment)',
      badge: {
        text: 'Hulas Finance Authorized Partner • Khan Electronics',
        color: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      headline: 'Appliance Financing: 40% Downpayment • Only Citizenship Required.',
      highlightText: '0% Interest for 1 Year',
      description: 'Take home your favorite appliance today with a minimum 40% downpayment. Enjoy 0% interest for up to 12 months, or 7.99% on the loan balance for 24 months. Only your Citizenship and self-registered SIM are required!',
      primaryCta: {
        label: 'Calculate Monthly EMI',
        action: onOpenFinance,
        icon: <CreditCard className="w-4 h-4" />,
        style: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
      },
      secondaryCta: {
        label: 'View Required Documents',
        action: onOpenFinance,
        icon: <Smartphone className="w-4 h-4 text-amber-700" />,
        style: 'bg-white hover:bg-amber-50 border border-amber-300 text-amber-900'
      },
      features: [
        { label: 'Citizenship Only', sub: 'No salary slips needed', icon: <ShieldCheck className="w-4 h-4 text-amber-600" /> },
        { label: 'Self-Registered SIM', sub: 'In applicant name', icon: <Smartphone className="w-4 h-4 text-amber-600" /> },
        { label: '0% Interest', sub: 'For tenure ≤ 1 year', icon: <Percent className="w-4 h-4 text-emerald-600" /> },
        { label: '7.99% Flat Rate', sub: 'For 24 mo loan', icon: <Tag className="w-4 h-4 text-amber-600" /> }
      ],
      card: {
        tag: 'Instant Pre-Approval',
        title: 'Samsung 55" Crystal 4K UHD TV',
        subtitle: 'Smart TV • HDR 10+ • Object Tracking Sound Lite',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
        specs: ['Rs. 30,796 Downpayment (40%)', 'Rs. 3,850/mo for 12 mos (0% Int)', 'Approved in 24 Hours'],
        priceBadge: 'Rs. 76,990',
        ctaLabel: 'Apply for Finance',
        ctaAction: onOpenFinance
      }
    },

    // Slide 4: Multi-Brand Service & Warranty
    {
      id: 'service',
      tabLabel: '4. Service & Repair',
      badge: {
        text: 'Multi-Brand Service Center • Rajbiraj & Saptari',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      },
      headline: "Bought It Here or Anywhere Else? We'll Still Repair It.",
      highlightText: 'Certified In-Home Technicians',
      description: 'Did not purchase from Khan Electronics? No problem! Our certified Rajbiraj repair center inspects, fixes, and services all appliance brands with genuine parts and transparent local pricing.',
      primaryCta: {
        label: 'Book Technician Visit',
        action: onOpenService,
        icon: <Wrench className="w-4 h-4" />,
        style: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
      },
      secondaryCta: {
        label: 'Service Helpline',
        action: () => { window.location.href = 'tel:9804781290'; },
        icon: <Phone className="w-4 h-4 text-emerald-700" />,
        style: 'bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900'
      },
      features: [
        { label: 'Doorstep Visits', sub: 'In Rajbiraj & rural wards', icon: <Truck className="w-4 h-4 text-emerald-600" /> },
        { label: 'Genuine Spares', sub: 'Samsung, CG, Godrej', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
        { label: 'All Brands Welcome', sub: 'Bought anywhere in Nepal', icon: <Wrench className="w-4 h-4 text-emerald-600" /> },
        { label: 'Free Estimate', sub: 'Clear upfront pricing', icon: <Zap className="w-4 h-4 text-emerald-600" /> }
      ],
      card: {
        tag: 'Local Service Team',
        title: 'Doorstep Appliance Repair',
        subtitle: 'Refrigerators, Inverter ACs, Washing Machines & Deep Freezers',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        specs: ['Certified Saptari Technicians', 'Same-Day Urgent Dispatch', '90-Day Repair Guarantee'],
        priceBadge: 'Official Service',
        ctaLabel: 'Book Service Now',
        ctaAction: onOpenService
      }
    },

    // Slide 5: Special Showroom Deals & Combos
    {
      id: 'deals',
      tabLabel: '5. Special Offers',
      badge: {
        text: 'Limited Showroom Deals • Khan Electronics Rajbiraj',
        color: 'bg-purple-50 text-purple-900 border-purple-200'
      },
      headline: 'Seasonal Showroom Offers: Smart Bundles & Free Delivery.',
      highlightText: 'Direct Showroom Savings',
      description: 'Save up to 35% on refrigerator and smart TV bundle purchases. Get free voltage stabilizers with high-capacity appliances and doorstep installation throughout Rajbiraj municipality.',
      primaryCta: {
        label: 'View Best Deals',
        action: onExploreCatalog,
        icon: <Tag className="w-4 h-4" />,
        style: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
      },
      secondaryCta: {
        label: 'WhatsApp for Price List',
        action: () => { window.open('https://wa.me/9779804781290?text=Hello%20Khan%20Electronics,%20please%20send%20current%20appliance%20deals%20and%20price%20list.', '_blank'); },
        icon: <Gift className="w-4 h-4 text-purple-600" />,
        style: 'bg-white hover:bg-purple-50 border border-purple-300 text-purple-900'
      },
      features: [
        { label: 'Bundle Discounts', sub: 'Save up to 35%', icon: <Tag className="w-4 h-4 text-purple-600" /> },
        { label: 'Free Stabilizer Gift', sub: 'On select refrigerators', icon: <Gift className="w-4 h-4 text-purple-600" /> },
        { label: 'Free Setup', sub: 'Standard unboxing & check', icon: <CheckCircle2 className="w-4 h-4 text-purple-600" /> },
        { label: 'Instant Delivery', sub: 'Same-day in Rajbiraj', icon: <Truck className="w-4 h-4 text-purple-600" /> }
      ],
      card: {
        tag: 'Special Combo Deal',
        title: 'CG 190L Direct Cool + Crompton Fan',
        subtitle: 'High energy efficiency bundle for Madhesh summer heat',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
        specs: ['Toughened Glass Shelves', 'Super Fast Ice Making', 'Free Ceiling Fan with Purchase'],
        priceBadge: 'Save Rs. 5,500',
        ctaLabel: 'Claim This Offer',
        ctaAction: onExploreCatalog
      }
    }
  ];

  // Auto-advancing slides every 2 seconds unless paused by mouse hover
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Slider Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 relative z-10">

        {/* Top Slide Quick Selector Tabs */}
        <div className="flex items-center justify-between pb-6 gap-2 overflow-x-auto no-scrollbar border-b border-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`} />
                  <span>{s.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Slider Controls (Prev, Next, Pause Indicator) */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <span className="text-[11px] text-slate-400 hidden md:inline mr-2">
              {isPaused ? '(Paused)' : 'Auto-sliding'}
            </span>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold text-slate-600 px-1 font-mono">
              {currentSlide + 1}/{slides.length}
            </div>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Content Viewport with Smooth Fade / Transition */}
        <div className="pt-6">
          <div 
            key={slide.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center animate-in fade-in duration-300"
          >
            {/* Left Column: Active Slide Details */}
            <div className="lg:col-span-7 space-y-5">
              {/* Brand Logo & Badge */}
              <div className="space-y-3">
                {slide.id === 'showroom' && (
                  <div className="pb-1">
                    <KhanLogo variant="hero" showSubtitle={true} />
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${slide.badge.color}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{slide.badge.text}</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {slide.headline}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {slide.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={slide.primaryCta.action}
                  className={`px-5 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all hover:scale-102 cursor-pointer shadow-xs ${slide.primaryCta.style}`}
                >
                  {slide.primaryCta.icon}
                  <span>{slide.primaryCta.label}</span>
                </button>

                <button
                  onClick={slide.secondaryCta.action}
                  className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs ${slide.secondaryCta.style}`}
                >
                  {slide.secondaryCta.icon}
                  <span>{slide.secondaryCta.label}</span>
                </button>
              </div>

              {/* Value Propositions / Key Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5 border-t border-slate-200 text-xs">
                {slide.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="shrink-0">{feat.icon}</div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-slate-900 text-xs truncate">{feat.label}</div>
                      <div className="text-slate-500 text-[10px] truncate">{feat.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4 relative overflow-hidden group">
                {/* Card Top Label */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {slide.card.tag}
                  </span>
                  {slide.card.priceBadge && (
                    <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {slide.card.priceBadge}
                    </span>
                  )}
                </div>

                {/* Card Titles */}
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {slide.card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {slide.card.subtitle}
                  </p>
                </div>

                {/* Product Image */}
                <div className="aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={slide.card.imageUrl}
                    alt={slide.card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  
                  {/* Floating badges on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-slate-900/85 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/20 text-[11px] font-medium">
                      Khan Electronics Verified
                    </span>
                    <span className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs">
                      Rajbiraj Store
                    </span>
                  </div>
                </div>

                {/* Specs List */}
                <ul className="space-y-1 text-xs text-slate-600">
                  {slide.card.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                {/* Card Action */}
                <button
                  onClick={slide.card.ctaAction}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{slide.card.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Progress Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-amber-500'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Brands Quick Selector / Showcase Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Authorized Brands in Rajbiraj:
            </span>
            <span className="text-xs text-amber-700 font-semibold hidden sm:inline">
              100% Genuine Manufacturer Nepal Warranty
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {BRANDS_LIST.map((b) => (
              <button
                key={b.name}
                onClick={() => onSelectBrand(b.name)}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 text-center transition-all group flex flex-col items-center justify-center shadow-xs cursor-pointer"
              >
                <span className="font-display font-extrabold text-xs text-slate-800 group-hover:text-amber-700 transition-colors">
                  {b.logo}
                </span>
                {b.hasExchange && (
                  <span className="text-[8px] bg-blue-50 text-blue-700 border border-blue-200 px-1 rounded font-bold mt-1">
                    Exchange
                  </span>
                )}
                {b.hasFinance && !b.hasExchange && (
                  <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded font-bold mt-1">
                    EMI 40%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
