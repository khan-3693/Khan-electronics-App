import React, { useState } from 'react';
import { 
  Star, 
  Repeat, 
  CreditCard, 
  Scale, 
  Plus, 
  Check, 
  ShieldCheck, 
  Zap, 
  Eye,
  Heart
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenExchangeForProduct?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCompared,
  onToggleCompare,
  onSelectProduct,
  onAddToCart,
  onOpenExchangeForProduct,
  onToggleWishlist,
  isWishlisted = false
}) => {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare(product);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:shadow-lg flex flex-col group cursor-pointer shadow-xs"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.exchangeAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50/95 border border-blue-200 text-blue-700 text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
              <Repeat className="w-3 h-3 text-blue-600" /> Exchange Available
            </span>
          )}

          {product.financeAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50/95 border border-amber-200 text-amber-800 text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
              <CreditCard className="w-3 h-3 text-amber-600" /> EMI (40% Downpayment)
            </span>
          )}

          {product.badge && !product.exchangeAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 text-slate-800 text-[10px] font-bold shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Actions on Top Right: Wishlist & Compare */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`p-1.5 rounded-xl text-xs backdrop-blur-md transition-all shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 border border-rose-300'
                  : 'bg-white/90 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            onClick={handleCompare}
            title={isCompared ? 'Remove from compare' : 'Add to side-by-side compare'}
            className={`p-1.5 sm:px-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1 shadow-xs ${
              isCompared
                ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>
        </div>

        {/* Brand Stamp on bottom image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white">
          <span className="bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm font-bold text-white uppercase font-display text-[10px] shadow-xs">
            {product.brand}
          </span>
          {product.specs.capacity && (
            <span className="bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm text-cyan-300 text-[10px] font-medium shadow-xs">
              {product.specs.capacity}
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 text-xs">{product.rating}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>

          {/* Quick Specs Pills */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
            {product.specs.motorWarrantyYears && (
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                {product.specs.motorWarrantyYears}-Yr Motor
              </span>
            )}
            {product.specs.powerWattage && (
              <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                {product.specs.powerWattage}
              </span>
            )}
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              Rajbiraj Stock
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.financeAvailable ? (
              <span className="text-[10px] text-amber-700 font-medium block">
                EMI from Rs. {Math.round((product.price * 0.6) / 12).toLocaleString()}/mo (40% down)
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 block">
                Free delivery within 5 km
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
              added
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
