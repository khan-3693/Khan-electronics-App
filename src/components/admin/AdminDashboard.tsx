import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  CreditCard, 
  Repeat, 
  Sparkles, 
  DollarSign, 
  Package, 
  Eye, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Check,
  Tag,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { 
  FirestoreProductDoc, 
  saveProductToFirestore, 
  deleteProductFromFirestore 
} from '../../services/productService';
import { ProductFormModal } from './ProductFormModal';
import { AdminOrderManagement } from './AdminOrderManagement';
import { KhanLogo } from '../KhanLogo';

interface AdminDashboardProps {
  products: FirestoreProductDoc[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onNavigateToCustomerStore: () => void;
  onOpenProductInStore?: (productId: string) => void;
  currentAdminEmail?: string | null;
  onSignOut: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  isLoading,
  onRefresh,
  onNavigateToCustomerStore,
  onOpenProductInStore,
  currentAdminEmail,
  onSignOut
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [selectedFinanceFilter, setSelectedFinanceFilter] = useState<'All' | 'Finance' | 'NoFinance'>('All');
  const [selectedExchangeFilter, setSelectedExchangeFilter] = useState<'All' | 'Exchange' | 'NoExchange'>('All');
  const [selectedProductStatus, setSelectedProductStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc' | 'stock' | 'updated'>('updated');

  // Admin Portal Section Tab State
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'orders'>('products');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProductDoc | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<FirestoreProductDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Quick Action feedback timeout
  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search filter: product name, brand, model number, product ID
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.productName?.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        const matchesModel = p.modelNumber?.toLowerCase().includes(q);
        const matchesId = p.productId?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesModel && !matchesId) return false;
      }

      // 2. Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;

      // 3. Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      // 4. Stock status
      if (selectedStockStatus !== 'All' && p.stockStatus !== selectedStockStatus) return false;

      // 5. Finance availability
      if (selectedFinanceFilter === 'Finance' && !p.financeAvailable) return false;
      if (selectedFinanceFilter === 'NoFinance' && p.financeAvailable) return false;

      // 6. Samsung exchange availability
      if (selectedExchangeFilter === 'Exchange' && !p.exchangeAvailable) return false;
      if (selectedExchangeFilter === 'NoExchange' && p.exchangeAvailable) return false;

      // 7. Product status (Active / Inactive)
      if (selectedProductStatus !== 'All' && p.productStatus !== selectedProductStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.productName.localeCompare(b.productName);
      if (sortBy === 'priceAsc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'priceDesc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity;
      return 0; // default order
    });
  }, [
    products, 
    searchQuery, 
    selectedBrand, 
    selectedCategory, 
    selectedStockStatus, 
    selectedFinanceFilter, 
    selectedExchangeFilter, 
    selectedProductStatus,
    sortBy
  ]);

  // Unique lists for filter dropdowns
  const availableBrands = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [products]);

  const availableCategories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.productStatus === 'Active').length;
    const totalStock = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
    const financeCount = products.filter(p => p.financeAvailable).length;
    const exchangeCount = products.filter(p => p.exchangeAvailable).length;
    return { total, active, totalStock, financeCount, exchangeCount };
  }, [products]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: FirestoreProductDoc) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<FirestoreProductDoc> & { productName: string; sellingPrice: number }) => {
    setIsSaving(true);
    try {
      const savedDoc = await saveProductToFirestore(productData);
      await onRefresh();
      showFeedback(`Product "${savedDoc.productName}" saved successfully in Firestore!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductFromFirestore(productToDelete.productId, productToDelete.images);
      await onRefresh();
      showFeedback(`Deleted "${productToDelete.productName}" from Firestore.`);
      setProductToDelete(null);
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Inline Toggle Handlers
  const handleToggleProductStatus = async (product: FirestoreProductDoc) => {
    const nextStatus = product.productStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await saveProductToFirestore({
        ...product,
        productStatus: nextStatus
      });
      await onRefresh();
      showFeedback(`Updated status of "${product.productName}" to ${nextStatus}.`);
    } catch (err) {
      alert(`Error updating status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleToggleFeatured = async (product: FirestoreProductDoc) => {
    const nextFeatured = !product.featured;
    try {
      await saveProductToFirestore({
        ...product,
        featured: nextFeatured
      });
      await onRefresh();
      showFeedback(`Updated "${product.productName}" featured state.`);
    } catch (err) {
      alert(`Error updating featured: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleToggleFinance = async (product: FirestoreProductDoc) => {
    const nextFinance = !product.financeAvailable;
    try {
      await saveProductToFirestore({
        ...product,
        financeAvailable: nextFinance
      });
      await onRefresh();
      showFeedback(`Finance facility ${nextFinance ? 'enabled' : 'disabled'} for "${product.productName}".`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleToggleExchange = async (product: FirestoreProductDoc) => {
    const nextExchange = !product.exchangeAvailable;
    try {
      await saveProductToFirestore({
        ...product,
        exchangeAvailable: nextExchange
      });
      await onRefresh();
      showFeedback(`Samsung Smart Exchange ${nextExchange ? 'enabled' : 'disabled'} for "${product.productName}".`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToCustomerStore}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Customer Store</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <KhanLogo variant="admin" showSubtitle={true} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore: <strong>products</strong></span>
            </div>

            {currentAdminEmail && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[170px]" title={currentAdminEmail}>{currentAdminEmail}</span>
              </div>
            )}

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all flex items-center gap-1 text-xs font-medium disabled:opacity-50"
              title="Refresh from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-101 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={onSignOut}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Feedback Alert */}
        {actionSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMsg}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveAdminTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Product Catalogue ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            <span>Showroom Orders & Dispatch</span>
          </button>
        </div>

        {activeAdminTab === 'orders' ? (
          <AdminOrderManagement />
        ) : (
          <>
        {/* Section Title & Store Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
              Product Catalogue Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage live showroom appliances, prices, stock quantities, finance terms, and warranties stored in Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToCustomerStore}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>View Customer Storefront</span>
            </button>
          </div>
        </div>

        {/* Inventory Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">Total Products</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Firestore Documents</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-emerald-700 tracking-wider block">Active in Store</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">{stats.total - stats.active} Inactive</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">Total Units in Stock</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalStock}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Showroom Warehouse</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase text-amber-700 tracking-wider block">Finance Enabled</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.financeCount}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">40% Downpayment EMI</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase text-blue-700 tracking-wider block">Samsung Exchange</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.exchangeCount}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Trade-in Eligible</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Product Name, Brand, Model #, or Product ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none"
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

            {/* Brand Filter */}
            <div className="sm:col-span-2">
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="All">All Brands</option>
                {availableBrands.filter(b => b !== 'All').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {availableCategories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="updated">Sort: Default</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="stock">Stock Quantity</option>
              </select>
            </div>
          </div>

          {/* Secondary Quick Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Filter By:
            </span>

            {/* Stock Status Filter */}
            <select
              value={selectedStockStatus}
              onChange={e => setSelectedStockStatus(e.target.value)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">Stock: All</option>
              <option value="In Stock">In Stock</option>
              <option value="Limited Stock">Limited Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Finance Filter */}
            <select
              value={selectedFinanceFilter}
              onChange={e => setSelectedFinanceFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">Finance: All</option>
              <option value="Finance">Finance Available</option>
              <option value="NoFinance">No Finance</option>
            </select>

            {/* Exchange Filter */}
            <select
              value={selectedExchangeFilter}
              onChange={e => setSelectedExchangeFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">Samsung Exchange: All</option>
              <option value="Exchange">Exchange Available</option>
              <option value="NoExchange">No Exchange</option>
            </select>

            {/* Product Status Filter */}
            <select
              value={selectedProductStatus}
              onChange={e => setSelectedProductStatus(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {/* Reset Filters button */}
            {(searchQuery || selectedBrand !== 'All' || selectedCategory !== 'All' || selectedStockStatus !== 'All' || selectedFinanceFilter !== 'All' || selectedExchangeFilter !== 'All' || selectedProductStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('All');
                  setSelectedCategory('All');
                  setSelectedStockStatus('All');
                  setSelectedFinanceFilter('All');
                  setSelectedExchangeFilter('All');
                  setSelectedProductStatus('All');
                }}
                className="px-2 py-1 text-slate-500 hover:text-rose-600 text-xs font-semibold underline ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Products Table & Card Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs text-slate-600">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of {products.length} products
            </div>
            <span className="text-[11px] text-slate-400">
              Direct Firestore CRUD Enabled
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No products match the selected filters or search terms. Try clearing filters or adding a new appliance.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-3">Category & Brand</th>
                    <th className="py-3 px-3">Price & MRP</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">Finance & Exchange</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const primaryImage = p.images?.[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80';
                    return (
                      <tr key={p.productId} className="hover:bg-slate-50/80 transition-colors group">
                        {/* 1. Product Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3 max-w-xs sm:max-w-sm">
                            <img
                              src={primaryImage}
                              alt={p.productName}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white shrink-0 mt-0.5"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'; }}
                            />
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 line-clamp-1">{p.productName}</span>
                                {p.featured && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                                    <Sparkles className="w-2.5 h-2.5" /> Featured
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>Model: <strong className="text-slate-700">{p.modelNumber}</strong></span>
                                <span>&bull;</span>
                                <span className="font-mono text-[10px] text-slate-400">ID: {p.productId}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">
                                {p.keySpecification || p.shortDescription}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Brand & Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                            {p.brand}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-1">
                            {p.category}
                          </span>
                        </td>

                        {/* 3. Pricing */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-extrabold text-slate-900 text-sm">
                            Rs. {p.sellingPrice?.toLocaleString()}
                          </div>
                          {p.mrp && p.mrp > p.sellingPrice ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-400 line-through">
                                Rs. {p.mrp.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                                {p.discountPercent}% off
                              </span>
                            </div>
                          ) : null}
                        </td>

                        {/* 4. Stock */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{p.stockQuantity}</span>
                            <span className="text-slate-500 text-[11px]">units</span>
                          </div>
                          <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.stockStatus === 'In Stock' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : p.stockStatus === 'Limited Stock'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {p.stockStatus}
                          </span>
                        </td>

                        {/* 5. Finance & Exchange Toggles */}
                        <td className="py-3.5 px-3 whitespace-nowrap space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFinance(p)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                                p.financeAvailable
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                              }`}
                              title="Click to toggle Finance Facility"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{p.financeAvailable ? `EMI (${p.minimumDownPaymentPercent || 40}%)` : 'No Finance'}</span>
                            </button>
                          </div>

                          <div>
                            <button
                              onClick={() => handleToggleExchange(p)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                                p.exchangeAvailable
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                              }`}
                              title="Click to toggle Samsung Exchange"
                            >
                              <Repeat className="w-3 h-3" />
                              <span>{p.exchangeAvailable ? 'Exchange ✓' : 'No Exchange'}</span>
                            </button>
                          </div>
                        </td>

                        {/* 6. Product Status & Featured */}
                        <td className="py-3.5 px-3 whitespace-nowrap space-y-1.5">
                          <button
                            onClick={() => handleToggleProductStatus(p)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                              p.productStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to activate / deactivate in customer store"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.productStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>{p.productStatus}</span>
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border block transition-colors ${
                              p.featured 
                                ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                                : 'text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Toggle Homepage Showcase"
                          >
                            {p.featured ? '★ Featured' : '☆ Not Featured'}
                          </button>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenProductInStore && (
                              <button
                                onClick={() => onOpenProductInStore(p.productId)}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title="View in Customer Store"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Product Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Product from Firestore"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Delete Product from Firestore?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{productToDelete.productName}</strong>?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div><strong>Document ID:</strong> <span className="font-mono">{productToDelete.productId}</span></div>
              <div><strong>Brand:</strong> {productToDelete.brand} &bull; <strong>Model:</strong> {productToDelete.modelNumber}</div>
              <div className="text-rose-600 font-semibold pt-1">⚠️ This action cannot be undone and will permanently remove this item from Firestore.</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
