import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Repeat, 
  CreditCard, 
  Scale, 
  ShoppingCart, 
  ShieldCheck, 
  Wrench, 
  Check, 
  Phone, 
  Truck, 
  MessageSquare,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Heart,
  Bot,
  Plus,
  Minus,
  Box,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  Tag,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { isProductFinanceEligible } from '../services/financeService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number) => void;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  onOpenExchangeForProduct: (product: Product) => void;
  onOpenFinanceForProduct: (product: Product) => void;
  onOpenAiWithProduct?: (product: Product) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome?: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectBrand?: (brand: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleCompare,
  isCompared,
  onToggleWishlist,
  isWishlisted = false,
  onOpenExchangeForProduct,
  onOpenFinanceForProduct,
  onOpenAiWithProduct,
  allProducts,
  onSelectProduct,
  onNavigateHome,
  onSelectCategory,
  onSelectBrand
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview' 
    | 'specs' 
    | 'features' 
    | 'box' 
    | 'warranty' 
    | 'delivery' 
    | 'finance' 
    | 'exchange' 
    | 'reviews' 
    | 'qa'
  >('overview');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const fallbackPlaceholder = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';

  // Combine main image and additional images for complete gallery
  const galleryImages = product 
    ? Array.from(new Set([product.imageUrl, ...(product.additionalImages || [])].filter(Boolean)))
    : [];

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setActiveTab('overview');
      setQuantity(1);
      setAdded(false);
      setIsZoomed(false);
      setImageLoading(false);
    }
  }, [product]);

  if (!product) return null;

  const activeImage = galleryImages[currentImageIndex] || product.imageUrl || fallbackPlaceholder;

  const handlePrevImage = () => {
    setImageLoading(true);
    setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    setImageLoading(true);
    setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
  };

  const handleSelectThumbnail = (index: number) => {
    if (index !== currentImageIndex) {
      setImageLoading(true);
      setCurrentImageIndex(index);
      setIsZoomed(false);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity);
    } else {
      onAddToCart(product, quantity);
      onClose();
    }
  };

  // Calculations
  const isFinanceEligible = isProductFinanceEligible(product);
  const downPayment40 = Math.round(product.price * 0.4);
  const loanPrincipal60 = product.price - downPayment40;
  // 0% interest for <= 12 months (e.g. 12 months)
  const estimatedEmi12 = Math.round(loanPrincipal60 / 12);
  // 7.99% flat interest on loan principal for 24 months
  const estimatedEmi24 = Math.round((loanPrincipal60 * 1.0799) / 24);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const whatsAppUrl = `https://wa.me/9779804781290?text=${encodeURIComponent(
    `Hello Khan Electronics Rajbiraj, I am interested in ${product.name} (Model: ${product.modelNumber || product.id}) priced at Rs. ${product.price.toLocaleString()}. Is it currently available for showroom pickup/delivery?`
  )}`;

  // Product Recommendations
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const customersAlsoViewed = allProducts
    .filter(p => p.id !== product.id && p.category !== product.category && (p.isBestSeller || p.isFeatured))
    .slice(0, 4);

  const compareCandidates = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Top Bar with Breadcrumbs & Close */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20 gap-3">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <button
              onClick={() => {
                onClose();
                if (onNavigateHome) onNavigateHome();
              }}
              className="hover:text-amber-700 font-medium transition-colors"
            >
              Home
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => {
                onClose();
                if (onSelectCategory) onSelectCategory(product.category);
              }}
              className="hover:text-amber-700 font-medium transition-colors"
            >
              {product.category}
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => {
                onClose();
                if (onSelectBrand) onSelectBrand(product.brand);
              }}
              className="hover:text-amber-700 font-medium transition-colors"
            >
              {product.brand}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-8">
          
          {/* Main Top Section: Gallery (Left) & Key Information (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Image Gallery & Navigation */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image with Zoom & Navigation Arrows */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 group select-none">
                {imageLoading && (
                  <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs flex items-center justify-center z-10 animate-fade-in">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                )}
                {galleryImages.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50">
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                    <p className="text-xs font-semibold text-slate-500">No image available for this appliance</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Showroom models available for in-person inspection</p>
                  </div>
                ) : (
                  <img
                    src={activeImage}
                    alt={product.name}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      setImageLoading(false);
                      (e.target as HTMLImageElement).src = fallbackPlaceholder;
                    }}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-102 cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                )}

                {/* Floating Top Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                  {product.exchangeAvailable && (
                    <span className="bg-blue-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      <span>Samsung Exchange Available</span>
                    </span>
                  )}
                  {product.financeAvailable && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span>Finance Available • Min 40% Downpayment</span>
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Zoom / Fullscreen Toggle Button */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  title={isZoomed ? 'Exit Zoom' : 'Zoom Image'}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm transition-transform active:scale-95"
                >
                  {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Image Navigation Arrows (if multiple images) */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition-transform hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm transition-transform hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Model Tag & Counter */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white pointer-events-none">
                  <span className="bg-slate-900/85 px-2.5 py-1 rounded-lg backdrop-blur-sm font-mono text-[10px]">
                    Model: {product.modelNumber || product.id.toUpperCase()}
                  </span>
                  {galleryImages.length > 1 && (
                    <span className="bg-slate-900/85 px-2 py-1 rounded-lg backdrop-blur-sm text-[10px]">
                      {currentImageIndex + 1} / {galleryImages.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectThumbnail(i)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        currentImageIndex === i
                          ? 'border-amber-500 ring-2 ring-amber-500/30 scale-95'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`View ${i + 1}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackPlaceholder;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Samsung Exchange Program Banner (if applicable) */}
              {product.exchangeAvailable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-blue-600" /> Samsung Smart Exchange Program
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Trade in your old refrigerator, washer or TV for instant valuation up to Rs. 25,000 on this model!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenExchangeForProduct(product);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-xs"
                  >
                    Check Valuation
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Title, Pricing, Specs, Controls & CTAs */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Brand & Model Identification */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase font-display">
                      {product.brand}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Model: <strong className="text-slate-700">{product.modelNumber || product.id.toUpperCase()}</strong>
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist && onToggleWishlist(product)}
                    className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                    title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="text-[11px] font-semibold hidden sm:inline">
                      {isWishlisted ? 'Saved' : 'Wishlist'}
                    </span>
                  </button>
                </div>

                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-amber-800 font-semibold mt-1">{product.tagline}</p>

                {/* Rating & Availability Status */}
                <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{product.rating}</span>
                    <span className="text-slate-400">({product.reviewCount} reviews)</span>
                  </div>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    In Stock ({product.stockCount} units in Rajbiraj Store)
                  </span>
                </div>
              </div>

              {/* Price & Discount Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP: Rs. {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Save Rs. {(product.originalPrice - product.price).toLocaleString()} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>

                {/* Finance Notice */}
                {isFinanceEligible && (
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>Finance Available: 40% Downpayment (Rs. {downPayment40.toLocaleString()})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pay <strong className="text-slate-900">Rs. {estimatedEmi12.toLocaleString()}/mo</strong> for 12 mos (0% interest) or <strong className="text-slate-900">Rs. {estimatedEmi24.toLocaleString()}/mo</strong> for 24 mos (7.99% interest).
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Only Nepali Citizenship required. SIM must be registered in applicant's name.
                    </p>
                  </div>
                )}

                {/* Delivery Highlights */}
                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-3 flex-wrap border-t border-slate-200/60">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Truck className="w-3 h-3 text-amber-600" /> Free Delivery &le; 5 KM
                  </span>
                  <span>&bull;</span>
                  <span>Same-Day Dispatch in Rajbiraj</span>
                  <span>&bull;</span>
                  <span>Cash on Delivery / QR</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.shortDesc}
              </p>

              {/* Quantity Selector & Action CTAs */}
              <div className="space-y-3 pt-1">
                {/* Quantity Row */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900 text-xs">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      disabled={quantity >= product.stockCount}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Max: {product.stockCount} units
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added {quantity} to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Bag &bull; Rs. {(product.price * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now (Direct Checkout) */}
                  <button
                    onClick={handleBuyNowClick}
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Buy Now &bull; Instant Checkout</span>
                  </button>
                </div>

                {/* Secondary Actions: Compare, Ask Khan AI, WhatsApp */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <button
                    onClick={() => onToggleCompare(product)}
                    className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCompared
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  {/* Ask Khan AI Button */}
                  <button
                    onClick={() => {
                      if (onOpenAiWithProduct) {
                        onOpenAiWithProduct(product);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Ask Khan AI about this appliance"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px]">Ask Khan AI</span>
                  </button>

                  {/* WhatsApp Support */}
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px]">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Product Information Sections (All 10 required sections) */}
          <div className="pt-6 border-t border-slate-200">
            {/* Scrollable Tab Navigation */}
            <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold pb-2 scrollbar-none">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'specs', label: 'Key Specifications' },
                { id: 'features', label: 'Features' },
                { id: 'box', label: "What's in the Box" },
                { id: 'warranty', label: 'Warranty' },
                { id: 'delivery', label: 'Delivery & Setup' },
                { id: 'finance', label: 'Finance Plan' },
                { id: 'exchange', label: 'Exchange Scheme' },
                { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                { id: 'qa', label: 'Q & A' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl border text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="pt-6 text-xs leading-relaxed">
              
              {/* 1. Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 max-w-3xl">
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {product.fullDesc}
                  </p>
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Rajbiraj Showroom Inspection:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        You are welcome to inspect this live unit on our display floor at New Khan Automobiles & Electronics, Main Road (near Mahavir Chowk), Rajbiraj.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Key Specifications */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h5 className="font-bold uppercase tracking-wider text-amber-700 text-xs">Technical Parameters</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Model Number</span>
                        <span className="text-slate-900 font-mono font-bold">{product.modelNumber || product.id.toUpperCase()}</span>
                      </div>
                      {product.specs.capacity && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Capacity</span>
                          <span className="text-slate-900 font-medium">{product.specs.capacity}</span>
                        </div>
                      )}
                      {product.specs.powerWattage && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Power Rating</span>
                          <span className="text-slate-900 font-medium">{product.specs.powerWattage}</span>
                        </div>
                      )}
                      {product.specs.voltage && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Voltage Compatibility</span>
                          <span className="text-slate-900 font-medium">{product.specs.voltage}</span>
                        </div>
                      )}
                      {product.specs.energyRating && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Energy Efficiency</span>
                          <span className="text-emerald-700 font-bold">{product.specs.energyRating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h5 className="font-bold uppercase tracking-wider text-amber-700 text-xs">Physical & Warranty Info</h5>
                    <div className="space-y-2 text-xs">
                      {product.specs.dimensions && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Dimensions</span>
                          <span className="text-slate-900 font-medium">{product.specs.dimensions}</span>
                        </div>
                      )}
                      {product.specs.color && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Color / Finish</span>
                          <span className="text-slate-900 font-medium">{product.specs.color}</span>
                        </div>
                      )}
                      {product.specs.weight && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Net Weight</span>
                          <span className="text-slate-900 font-medium">{product.specs.weight}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Comprehensive Warranty</span>
                        <span className="text-blue-700 font-bold">{product.specs.warrantyYears || 1} Year</span>
                      </div>
                      {product.specs.motorWarrantyYears && (
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Motor/Compressor</span>
                          <span className="text-blue-700 font-bold">{product.specs.motorWarrantyYears} Years</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Features */}
              {activeTab === 'features' && (
                <div className="space-y-3 max-w-3xl">
                  <h4 className="font-bold text-slate-900 text-sm">Key Features & Built-in Technologies</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. What's in the Box */}
              {activeTab === 'box' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 max-w-3xl">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Box className="w-4 h-4 text-amber-600" />
                    <span>Package Contents & Included Accessories</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">&bull; 1 x {product.name} (Main Unit)</li>
                    <li className="flex items-center gap-2">&bull; 1 x Heavy Duty Nepal Standard Power Cord</li>
                    <li className="flex items-center gap-2">&bull; 1 x Manufacturer User Manual & Setup Guide</li>
                    <li className="flex items-center gap-2">&bull; 1 x Official Khan Electronics Showroom Warranty Card</li>
                    <li className="flex items-center gap-2">&bull; Standard Installation Fittings / Drain Pipe (if applicable)</li>
                  </ul>
                </div>
              )}

              {/* 5. Warranty */}
              {activeTab === 'warranty' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Official Manufacturer Nepal Warranty</span>
                    </div>
                    <p className="text-slate-700">
                      {product.warrantySummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                      <Wrench className="w-5 h-5 text-blue-600" />
                      <span>Khan Electronics In-House Service Backing</span>
                    </div>
                    <p className="text-slate-700">
                      Our certified local technicians in Rajbiraj provide priority home visits. You never have to ship your bulky appliances to Biratnagar or Kathmandu for warranty claims.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. Delivery & Installation */}
              {activeTab === 'delivery' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Local Free Delivery</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        FREE doorstep delivery within 5 km of Rajbiraj market using our showroom delivery van.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-emerald-600" />
                        <span>Unboxing & Setup</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Our delivery team unboxes the appliance, checks power connectivity, and provides basic operating instructions at your doorstep.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Finance */}
              {activeTab === 'finance' && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-700" /> Hulas Finance Facility
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Min 40% Down Payment
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-500 block">40% Down Payment</span>
                      <strong className="text-slate-900">Rs. {downPayment40.toLocaleString()}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-500 block">12 Mo EMI (0% Int)</span>
                      <strong className="text-emerald-700">Rs. {estimatedEmi12.toLocaleString()}/mo</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-500 block">24 Mo EMI (7.99% Int)</span>
                      <strong className="text-amber-800">Rs. {estimatedEmi24.toLocaleString()}/mo</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-700 pt-1 space-y-1">
                    <div>&bull; <strong>Document Required:</strong> Only your original Nepali Citizenship (Nagarikta).</div>
                    <div>&bull; <strong>SIM Registration:</strong> Phone number must be registered in the applicant's own name.</div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenFinanceForProduct(product);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
                  >
                    Open Full Finance Calculator
                  </button>
                </div>
              )}

              {/* 8. Exchange */}
              {activeTab === 'exchange' && (
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-blue-600" /> Samsung Smart Exchange Program
                    </span>
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                      Up to Rs. 25,000 Off
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs">
                    {product.exchangeAvailable
                      ? 'This Samsung appliance is 100% eligible for our old-for-new exchange scheme. Bring any old brand appliance (working or broken) to Khan Electronics Rajbiraj or schedule a home inspection.'
                      : 'Exchange is officially eligible for Samsung products. However, our Rajbiraj store also considers trade-ins for select other brands upon showroom inspection.'}
                  </p>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenExchangeForProduct(product);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    Calculate Trade-In Credit
                  </button>
                </div>
              )}

              {/* 9. Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-900">{product.rating}</div>
                      <div className="flex items-center gap-0.5 text-amber-500 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{product.reviewCount} Ratings</span>
                    </div>
                    <div className="border-l border-slate-200 pl-4 text-xs text-slate-600">
                      Verified customer feedback from Rajbiraj, Saptari, Siraha and neighboring Terai districts.
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Prakash Jha &bull; Rajbiraj-4</span>
                        <span className="text-amber-600">★★★★★</span>
                      </div>
                      <p className="text-slate-600">
                        Excellent cooling and low electricity bill even during hot Terai summers. Delivery within 2 hours of purchasing at Mahavir Chowk showroom.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Sunita Yadav &bull; Kanchanrup</span>
                        <span className="text-amber-600">★★★★★</span>
                      </div>
                      <p className="text-slate-600">
                        The voltage fluctuation stabilizer feature works perfectly with our rural feeder line. Highly recommended store.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. Questions & Answers */}
              {activeTab === 'qa' && (
                <div className="space-y-3 max-w-3xl">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Q: Does this appliance require an external voltage stabilizer in Rajbiraj?
                    </span>
                    <p className="text-slate-600 pl-5 text-[11px]">
                      A: Most modern inverter appliances from Samsung, CG and Godrej have built-in stabilizer-free operation (typically 100V–300V). Our showroom staff will test your home supply during installation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Q: Where do I claim warranty if needed in the future?
                    </span>
                    <p className="text-slate-600 pl-5 text-[11px]">
                      A: Directly at New Khan Automobiles & Electronics in Rajbiraj. You can call 9804781290 or submit a service ticket on this website for in-home technician dispatch.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Product Recommendations Sections (Similar Products, Customers Also Viewed, Compare Similar) */}
          <div className="pt-8 border-t border-slate-200 space-y-8">
            
            {/* 1. Similar Products (Same Category) */}
            {similarProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Similar {product.category}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Explore alternatives in this category
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 mb-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-700">{p.brand}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700">
                          {p.name}
                        </h4>
                        <div className="text-xs font-black text-slate-900">
                          Rs. {p.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Customers Also Viewed (Other Categories) */}
            {customersAlsoViewed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Customers Also Viewed
                  </h3>
                  <span className="text-xs text-slate-400">
                    Popular showroom picks
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {customersAlsoViewed.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 mb-2">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-700">{p.brand}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700">
                          {p.name}
                        </h4>
                        <div className="text-xs font-black text-slate-900">
                          Rs. {p.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Compare Similar Products */}
            {compareCandidates.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      Compare Similar Models Side-by-Side
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {compareCandidates.map(cand => (
                    <div
                      key={cand.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div 
                        onClick={() => onSelectProduct(cand)}
                        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                      >
                        <img src={cand.imageUrl} alt={cand.name} className="w-12 h-12 rounded-lg object-cover bg-slate-50" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-amber-700">{cand.brand}</span>
                          <div className="font-bold text-slate-900 truncate group-hover:text-amber-700">{cand.name}</div>
                          <div className="text-slate-600 font-bold">Rs. {cand.price.toLocaleString()}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleCompare(cand)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] shrink-0 transition-colors"
                      >
                        Add to Compare
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
