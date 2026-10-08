import React, { useState } from 'react';
import { 
  Filter, 
  Repeat, 
  CreditCard, 
  Scale, 
  Search, 
  SlidersHorizontal, 
  Sparkles,
  Check
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, ApplianceCategory } from '../types';

interface CatalogViewProps {
  products: Product[];
  comparedProductIds: string[];
  onToggleCompare: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenExchangeForProduct: (product: Product) => void;
  onOpenCompare: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  comparedProductIds,
  onToggleCompare,
  onSelectProduct,
  onAddToCart,
  onOpenExchangeForProduct,
  onOpenCompare,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  wishlistProductIds = [],
  onToggleWishlist
}) => {
  const [filterExchangeOnly, setFilterExchangeOnly] = useState(false);
  const [filterFinanceOnly, setFilterFinanceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  const categories = [
    'All',
    'Refrigerators',
    'Washing Machines',
    'Mixer Grinders',
    'Rice Cookers',
    'Kitchen & Cooking',
    'Cooling & Heating',
    'Televisions'
  ];

  const brands = [
    'All',
    'Samsung',
    'CG',
    'Godrej',
    'Konka',
    'Midea',
    'Force',
    'Crompton',
    'Chigo',
    'Khaitan',
    'TCL'
  ];

  // Filtering
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    if (filterExchangeOnly && !p.exchangeAvailable) return false;
    if (filterFinanceOnly && !p.financeAvailable) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);

      const matchName = (p.name || '').toLowerCase();
      const matchBrand = (p.brand || '').toLowerCase();
      const matchModel = (p.modelNumber || '').toLowerCase();
      const matchCat = (p.category || '').toLowerCase();
      const matchDesc = (p.shortDesc || '').toLowerCase();
      const matchFullDesc = (p.fullDesc || '').toLowerCase();
      const matchSpecs = [
        p.specs.capacity,
        p.specs.powerWattage,
        p.specs.voltage,
        p.specs.energyRating,
        p.specs.color,
        ...(p.features || [])
      ].filter(Boolean).join(' ').toLowerCase();

      const combined = `${matchName} ${matchBrand} ${matchModel} ${matchCat} ${matchDesc} ${matchFullDesc} ${matchSpecs}`;
      const matches = tokens.every(token => combined.includes(token));
      if (!matches) return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Category Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Categories:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Pills */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Authorized Brands:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedBrand === brand
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Toggles & Sorter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterExchangeOnly(!filterExchangeOnly)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                filterExchangeOnly
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Samsung Exchange Available</span>
            </button>

            <button
              onClick={() => setFilterFinanceOnly(!filterFinanceOnly)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                filterFinanceOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Hulas Finance (40% Downpayment)</span>
            </button>

            {(selectedCategory !== 'All' || selectedBrand !== 'All' || filterExchangeOnly || filterFinanceOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setFilterExchangeOnly(false);
                  setFilterFinanceOnly(false);
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
            >
              <option value="featured">Featured & Best Sellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Ratings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-600">
            Showing <strong className="text-slate-900 font-bold">{sortedProducts.length}</strong> appliances in Rajbiraj showroom
          </span>
          <span className="text-xs text-emerald-700 font-semibold">
            Free Delivery within 5 km &bull; Nepal-wide freight
          </span>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <Search className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another product, brand or model.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
                >
                  Clear Search
                </button>
              )}
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || filterExchangeOnly || filterFinanceOnly) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setFilterExchangeOnly(false);
                    setFilterFinanceOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isCompared={comparedProductIds.includes(product.id)}
                onToggleCompare={onToggleCompare}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onOpenExchangeForProduct={onOpenExchangeForProduct}
                isWishlisted={wishlistProductIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Comparison Pill */}
      {comparedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[90%] bg-white p-3.5 rounded-2xl border border-amber-400 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">
                {comparedProductIds.length} Appliance{comparedProductIds.length > 1 ? 's' : ''} in Comparison
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                Compare prices, warranties, dimensions & capacity side-by-side
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCompare}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs shrink-0"
          >
            View Matrix
          </button>
        </div>
      )}
    </div>
  );
};
