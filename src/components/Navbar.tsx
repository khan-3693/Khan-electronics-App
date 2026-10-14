import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Truck,
  Tag,
  ArrowRight
} from 'lucide-react';
import { ApplianceCategory, CustomerProfile, Product } from '../types';
import { KhanLogo } from './KhanLogo';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeView: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin' | 'admin-login';
  setActiveView: (view: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin' | 'admin-login') => void;
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
  customerUser?: FirebaseUser | null;
  customerProfile?: CustomerProfile | null;
  isCustomerAuthLoading?: boolean;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
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
  customerUser,
  customerProfile,
  isCustomerAuthLoading,
  products = [],
  onSelectProduct
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularSearches = [
    'Samsung Refrigerator',
    'CG Washing Machine',
    'Mixer Grinder',
    'Smart TV',
    'Rice Cooker',
    'Samsung Exchange',
    'Hulas Finance'
  ];

  const liveSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const source = products && products.length > 0 ? products : [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return source.filter(p => {
      const combined = `${p.name || ''} ${p.brand || ''} ${p.modelNumber || ''} ${p.category || ''} ${p.shortDesc || ''}`.toLowerCase();
      return tokens.every(t => combined.includes(t));
    }).slice(0, 5);
  }, [searchQuery, products]);

  const handleSelectSearchTag = (tag: string) => {
    setSearchQuery(tag);
    setIsSearchFocused(false);
    if (activeView !== 'catalog') {
      setActiveView('catalog');
    }
  };

  const handleSelectSearchProduct = (product: Product) => {
    setIsSearchFocused(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      setSearchQuery(product.name);
      if (activeView !== 'catalog') {
        setActiveView('catalog');
      }
    }
  };

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
      <div 
        className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 text-xs text-slate-600 text-left font-bold"
        style={{ textAlign: 'left', fontWeight: 'bold' }}
      >
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-4 flex-wrap">
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
      <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer group select-none shrink-0"
        >
          <KhanLogo variant="header" showSubtitle={true} />
        </div>

        {/* Global Search Bar with Live Suggestions Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 min-w-[220px] sm:min-w-[280px] md:min-w-[320px] max-w-lg mx-2 z-30">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Samsung, CG, Godrej, Mixer Grinder, Fridge..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onClick={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSearchFocused(false);
                  if (activeView !== 'catalog') setActiveView('catalog');
                }
                if (e.key === 'Escape') {
                  setIsSearchFocused(false);
                }
              }}
              className="w-full h-11 pl-11 pr-10 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all caret-amber-600 shadow-2xs"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-xs text-slate-600 transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Interactive Search Suggestions Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* When no query is typed: Show Popular Searches & Categories */}
              {!searchQuery.trim() ? (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Popular Searches in Rajbiraj</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSearchTag(term);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-xs font-medium transition-colors border border-slate-200/60"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Browse by Category
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                      {categories.slice(0, 6).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsSearchFocused(false);
                            handleCategoryClick(cat);
                          }}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-left font-medium truncate flex items-center justify-between"
                        >
                          <span className="truncate">{cat}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* When query is typed: Show Live Results or No Match */
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 flex items-center justify-between border-b border-slate-100">
                    <span>
                      Matching appliances for <strong className="text-slate-900">"{searchQuery}"</strong>
                    </span>
                    <span className="text-[11px] text-amber-700">
                      {liveSearchResults.length} found
                    </span>
                  </div>

                  {liveSearchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {liveSearchResults.map((prod) => (
                        <div
                          key={prod.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSearchProduct(prod);
                          }}
                          className="p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.imageUrl || '/brand/khan-electronics-icon.png'}
                              alt={prod.name}
                              className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                {prod.name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="font-semibold text-amber-700">{prod.brand}</span>
                                <span>•</span>
                                <span>{prod.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-extrabold text-slate-900">
                              Rs. {prod.price.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              In Showroom
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                      <p>No appliances found matching "{searchQuery}"</p>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsSearchFocused(false);
                          if (activeView !== 'catalog') setActiveView('catalog');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold"
                      >
                        Browse All Showroom Appliances
                      </button>
                    </div>
                  )}

                  <div className="p-2 border-t border-slate-100">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsSearchFocused(false);
                        if (activeView !== 'catalog') setActiveView('catalog');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View All Results in Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Quick Nav Actions */}
        <div className="hidden xl:flex items-center gap-1 text-xs font-medium shrink-0">
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
            <span>Exchange</span>
          </button>

          <button
            onClick={() => handleNavClick('finance')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'finance' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Finance (40%)</span>
          </button>

          <button
            onClick={() => handleNavClick('service')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'service' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service</span>
          </button>

          <button
            onClick={() => handleNavClick('support')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeView === 'support' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Showroom
          </button>
        </div>

        {/* Utility Actions: AI Assistant, Compare, Cart, Account */}
        <div className="flex items-center gap-2 shrink-0">
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
            <div className="relative flex items-center justify-center">
              {customerUser && customerProfile?.photoUrl ? (
                <img 
                  src={customerProfile.photoUrl} 
                  alt={customerProfile.fullName || 'Customer Profile'} 
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400"
                />
              ) : (
                <User className="w-4 h-4 text-slate-700" />
              )}
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
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center gap-6">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search appliances, brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setMobileMenuOpen(false);
                  if (activeView !== 'catalog') setActiveView('catalog');
                }
              }}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
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
                {customerUser && customerProfile?.photoUrl ? (
                  <img 
                    src={customerProfile.photoUrl} 
                    alt={customerProfile.fullName || 'Customer Profile'} 
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400 shrink-0"
                  />
                ) : (
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                )}
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
