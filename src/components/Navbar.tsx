import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Search, 
  Scale, 
  ShoppingCart, 
  User, 
  Sparkles, 
  Repeat, 
  CreditCard, 
  Wrench, 
  HelpCircle,
  Menu,
  X,
  Bot,
  Truck
} from 'lucide-react';
import { ApplianceCategory, CustomerProfile } from '../types';
import { KhanLogo } from './KhanLogo';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeView: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin';
  setActiveView: (view: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  cartCount: number;
  compareCount: number;
  onOpenCart: () => void;
  onOpenCompare: () => void;
  onOpenAccount: () => void;
  onOpenAiAssistant: () => void;
  onOpenOrderTracking?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  firestoreProductCount?: number;
  onOpenFirestoreStatus?: () => void;
  onOpenAdmin?: () => void;
  customerUser?: FirebaseUser | null;
  customerProfile?: CustomerProfile | null;
  isCustomerAuthLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  cartCount,
  compareCount,
  onOpenCart,
  onOpenCompare,
  onOpenAccount,
  onOpenAiAssistant,
  onOpenOrderTracking,
  searchQuery,
  setSearchQuery,
  firestoreProductCount,
  onOpenFirestoreStatus,
  onOpenAdmin,
  customerUser,
  customerProfile,
  isCustomerAuthLoading
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: ApplianceCategory[] = [
    'Refrigerators',
    'Washing Machines',
    'Mixer Grinders',
    'Rice Cookers',
    'Kitchen & Cooking',
    'Cooling & Heating',
    'Televisions'
  ];

  const handleNavClick = (view: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard') => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedBrand('All');
    setActiveView('catalog');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Regional Announcement & Contact Strip */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Main Road, Rajbiraj, Saptari, Nepal
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-600">
              Free Delivery within 5 km in Rajbiraj &bull; Nepal-Wide Delivery Available
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {onOpenOrderTracking && (
              <button
                onClick={onOpenOrderTracking}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors font-semibold shadow-2xs cursor-pointer"
                title="Track appliance order by reference and phone"
              >
                <Truck className="w-3 h-3 text-amber-600" />
                <span>Track Order</span>
              </button>
            )}
            {firestoreProductCount !== undefined && firestoreProductCount > 0 && onOpenFirestoreStatus && (
              <button
                onClick={onOpenFirestoreStatus}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors font-medium shadow-2xs"
                title="Click to inspect verified Firestore products collection"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore: {firestoreProductCount} Products Live</span>
              </button>
            )}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold tracking-wide uppercase transition-colors shadow-2xs cursor-pointer"
                title="Open Khan Electronics Store Admin Dashboard (/admin)"
              >
                <span>Admin</span>
              </button>
            )}
            <span className="hidden lg:flex items-center gap-1.5 text-blue-700 font-medium">
              <Repeat className="w-3 h-3 text-blue-600" />
              Samsung Exchange Authorized Showroom
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <a 
              href="tel:9804781290" 
              className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-600" />
              Call: 9804781290 / 031-520114
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer group select-none shrink-0"
        >
          <KhanLogo variant="header" showSubtitle={true} />
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Samsung, CG, Godrej, Mixer Grinder, Fridge..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'catalog') setActiveView('catalog');
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Desktop Quick Nav Actions */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeView === 'home' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('catalog')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeView === 'catalog' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Appliances
          </button>

          <button
            onClick={() => handleNavClick('exchange')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'exchange' ? 'text-blue-700 bg-blue-50 font-bold' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50/50'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-blue-600" />
            <span>Samsung Exchange</span>
          </button>

          <button
            onClick={() => handleNavClick('finance')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'finance' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Finance (40% Downpayment)</span>
          </button>

          <button
            onClick={() => handleNavClick('service')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'service' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service & Warranty</span>
          </button>

          <button
            onClick={() => handleNavClick('support')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeView === 'support' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Showroom / Support
          </button>
        </div>

        {/* Utility Actions: AI Assistant, Compare, Cart, Account */}
        <div className="flex items-center gap-2">
          {/* Ask Khan AI Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition-all shadow-xs group"
            title="Ask Khan AI Assistant"
          >
            <Bot className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Ask Khan AI</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={onOpenCompare}
            title="Compare Products"
            className="relative p-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs transition-colors shadow-xs"
          >
            <Scale className="w-4 h-4" />
            {compareCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            title="Shopping Cart"
            className="relative p-2.5 bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 rounded-xl text-xs transition-colors shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Dashboard */}
          <button
            onClick={onOpenAccount}
            title={customerUser ? `Signed in as ${customerProfile?.fullName || customerUser.email}` : "Customer Sign In / Account Portal"}
            className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-800 rounded-xl text-xs transition-colors shadow-xs"
          >
            <div className="relative">
              <User className="w-4 h-4 text-slate-700" />
              {customerUser && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </div>
            {customerUser && customerProfile?.fullName && (
              <span className="hidden md:inline font-bold text-slate-900 max-w-[80px] truncate text-[11px]">
                {customerProfile.fullName.split(' ')[0]}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Product Categories Secondary Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 overflow-x-auto text-xs py-2.5 scrollbar-none hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Shop by Category:
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setActiveView('catalog');
              }}
              className={`hover:text-amber-700 transition-colors whitespace-nowrap font-medium ${
                selectedCategory === 'All' && activeView === 'catalog' ? 'text-amber-700 font-bold' : 'text-slate-600'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`hover:text-amber-700 transition-colors whitespace-nowrap font-medium ${
                  selectedCategory === cat && activeView === 'catalog' ? 'text-amber-700 font-bold' : 'text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search appliances, brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'catalog') setActiveView('catalog');
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccount();
              }}
              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-amber-950 font-bold flex items-center justify-between col-span-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  {customerUser ? (customerProfile?.fullName || 'My Customer Account') : 'Customer Sign In / Register'}
                </span>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                {customerUser ? 'Account' : 'Portal'}
              </span>
            </button>
            <button
              onClick={() => handleNavClick('home')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('catalog')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-slate-800"
            >
              All Appliances
            </button>
            <button
              onClick={() => handleNavClick('exchange')}
              className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-left text-blue-700 font-bold flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5" /> Samsung Exchange
            </button>
            <button
              onClick={() => handleNavClick('finance')}
              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-amber-800 font-bold flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> Easy Finance (40%)
            </button>
            <button
              onClick={() => handleNavClick('service')}
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-emerald-800 font-bold flex items-center gap-1.5 col-span-2"
            >
              <Wrench className="w-3.5 h-3.5" /> Service & Warranty (We fix any brand!)
            </button>
            <button
              onClick={() => handleNavClick('support')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-slate-700 col-span-2"
            >
              Showroom Location & Contact
            </button>
            {onOpenOrderTracking && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrderTracking();
                }}
                className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-left col-span-2 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Track Your Order Status</span>
              </button>
            )}
            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="p-2.5 rounded-xl bg-slate-900 text-white font-bold text-left col-span-2 flex items-center justify-between"
              >
                <span>Store Admin Dashboard (/admin)</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono uppercase">Portal</span>
              </button>
            )}
          </div>

          {/* Category List */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Categories:</div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-amber-700"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
