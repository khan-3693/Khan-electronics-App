import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogView } from './components/CatalogView';
import { ShopByBrandSection } from './components/ShopByBrandSection';
import { SamsungExchangeSection } from './components/SamsungExchangeSection';
import { FinanceSection } from './components/FinanceSection';
import { ServiceWarrantySection } from './components/ServiceWarrantySection';
import { SupportSection } from './components/SupportSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AskKhanAiPlaceholder } from './components/AskKhanAiPlaceholder';
import { KhanLogo } from './components/KhanLogo';
import { ProductCard } from './components/ProductCard';
import { FirestoreStatusModal } from './components/FirestoreStatusModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminAccessDenied } from './components/admin/AdminAccessDenied';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  testAndVerifyFirestoreProducts, 
  FirestoreProductDoc,
  subscribeToFirestoreProducts,
  mapFirestoreDocToProduct
} from './services/productService';
import { 
  verifyAndEnsureAdmin, 
  logoutAdmin, 
  AdminUserDoc 
} from './services/adminAuthService';
import { getOrCreateCustomerProfile } from './services/customerAuthService';
import { cleanFirestoreObject } from './services/orderService';
import { isProductFinanceEligible } from './services/financeService';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './services/firebase';

import { KHAN_PRODUCTS } from './data/productsData';
import { 
  INITIAL_USER, 
  INITIAL_ORDERS, 
  INITIAL_SERVICE_TICKETS, 
  INITIAL_EXCHANGE_REQUESTS, 
  INITIAL_FINANCE_APPLICATIONS, 
  INITIAL_REGISTERED_WARRANTIES 
} from './data/mockAccountData';
import { 
  Product, 
  CartItem, 
  Order, 
  ServiceTicket, 
  ExchangeRequest, 
  FinanceApplication, 
  RegisteredWarranty,
  ApplianceCategory,
  CustomerProfile
} from './types';

import { 
  MapPin, 
  Phone, 
  Repeat, 
  CreditCard, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Home, 
  Grid, 
  ShoppingCart,
  User,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin' | 'admin-login'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin/login' || hash === '#admin-login') {
        return 'admin-login';
      }
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin') {
        return 'admin';
      }
    }
    return 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Firebase Admin Authentication & Authorization State
  const [adminAuth, setAdminAuth] = useState<{
    user: FirebaseUser | null;
    isAuthorized: boolean;
    adminDoc: AdminUserDoc | null;
    loading: boolean;
    error?: string;
  }>({
    user: null,
    isAuthorized: false,
    adminDoc: null,
    loading: true
  });

  // Firebase Customer Authentication State (Separate from admin permissions)
  const [customerAuth, setCustomerAuth] = useState<{
    user: FirebaseUser | null;
    profile: CustomerProfile | null;
    loading: boolean;
  }>({
    user: null,
    profile: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Check Admin Permissions
        try {
          const authResult = await verifyAndEnsureAdmin(firebaseUser);
          setAdminAuth({
            user: firebaseUser,
            isAuthorized: authResult.isAuthorized,
            adminDoc: authResult.adminDoc,
            loading: false,
            error: authResult.error
          });
        } catch (err) {
          setAdminAuth({
            user: firebaseUser,
            isAuthorized: false,
            adminDoc: null,
            loading: false,
            error: 'Failed to verify admin status'
          });
        }

        // 2. Load Customer Account Profile
        try {
          const profile = await getOrCreateCustomerProfile(firebaseUser);
          setCustomerAuth({
            user: firebaseUser,
            profile,
            loading: false
          });
        } catch (err) {
          console.warn('Customer profile load note:', err);
          setCustomerAuth({
            user: firebaseUser,
            profile: null,
            loading: false
          });
        }
      } else {
        setAdminAuth({
          user: null,
          isAuthorized: false,
          adminDoc: null,
          loading: false
        });
        setCustomerAuth({
          user: null,
          profile: null,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Live Products State for Customer Storefront (synced with Firestore)
  const [customerProducts, setCustomerProducts] = useState<Product[]>(KHAN_PRODUCTS);

  // Cart State (Persisted)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('khan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('khan_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Service Tickets (Persisted)
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(() => {
    try {
      const saved = localStorage.getItem('khan_service_tickets');
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_TICKETS;
    } catch {
      return INITIAL_SERVICE_TICKETS;
    }
  });

  // Samsung Exchange Requests (Persisted)
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem('khan_exchanges');
      return saved ? JSON.parse(saved) : INITIAL_EXCHANGE_REQUESTS;
    } catch {
      return INITIAL_EXCHANGE_REQUESTS;
    }
  });

  // Finance Applications (Persisted)
  const [financeApplications, setFinanceApplications] = useState<FinanceApplication[]>(() => {
    try {
      const saved = localStorage.getItem('khan_finance');
      return saved ? JSON.parse(saved) : INITIAL_FINANCE_APPLICATIONS;
    } catch {
      return INITIAL_FINANCE_APPLICATIONS;
    }
  });

  // Warranties
  const [warranties, setWarranties] = useState<RegisteredWarranty[]>(() => {
    try {
      const saved = localStorage.getItem('khan_warranties');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_WARRANTIES;
    } catch {
      return INITIAL_REGISTERED_WARRANTIES;
    }
  });

  // Compared Products
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  // Modals & Drawers
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiProductContext, setAiProductContext] = useState<Product | null>(null);

  const handleOpenOrderTracking = (orderId?: string) => {
    setTrackingOrderId(orderId || '');
    setIsOrderTrackingOpen(true);
  };

  // Firestore Products Database State & Verification
  const [firestoreStatus, setFirestoreStatus] = useState<{
    tested: boolean;
    connected: boolean;
    productCount: number;
    products: FirestoreProductDoc[];
    error?: string;
  }>({
    tested: false,
    connected: false,
    productCount: 0,
    products: []
  });
  const [isFirestoreModalOpen, setIsFirestoreModalOpen] = useState(false);
  const [isRefreshingFirestore, setIsRefreshingFirestore] = useState(false);

  const handleRefreshFirestore = async () => {
    setIsRefreshingFirestore(true);
    try {
      const res = await testAndVerifyFirestoreProducts();
      setFirestoreStatus({
        tested: true,
        connected: res.success,
        productCount: res.count,
        products: res.products,
        error: res.error
      });
      console.log(`[Firestore Products] Verified: ${res.count} products retrieved:`, res.products);
    } catch (err) {
      console.error('[Firestore Products] Verification error:', err);
      setFirestoreStatus(prev => ({
        ...prev,
        tested: true,
        connected: false,
        error: err instanceof Error ? err.message : String(err)
      }));
    } finally {
      setIsRefreshingFirestore(false);
    }
  };

  useEffect(() => {
    handleRefreshFirestore();

    // Attach real-time listener: changes made in Admin reflect immediately on Customer Storefront
    const unsubscribe = subscribeToFirestoreProducts(
      (docs) => {
        setFirestoreStatus({
          tested: true,
          connected: true,
          productCount: docs.length,
          products: docs
        });

        // Map active Firestore docs into customer storefront
        const activeDocs = docs.filter(d => d.productStatus === 'Active');
        const activeMap = new Map(activeDocs.map(d => [d.productId, mapFirestoreDocToProduct(d)]));

        // 1. Enrich existing demo products with live Firestore fields, hide any marked Inactive
        const enrichedDemo = KHAN_PRODUCTS
          .filter(p => {
            const liveDoc = docs.find(d => d.productId === p.id);
            return !liveDoc || liveDoc.productStatus === 'Active';
          })
          .map(p => activeMap.get(p.id) || p);

        // 2. Prepend any newly added custom products from Firestore
        const customAdded = activeDocs
          .filter(d => !KHAN_PRODUCTS.some(p => p.id === d.productId))
          .map(mapFirestoreDocToProduct);

        setCustomerProducts([...customAdded, ...enrichedDemo]);
      },
      (err) => {
        console.warn('Real-time Firestore listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Centralized Navigation with URL routing support (/admin, /admin/login vs /)
  const handleNavigateView = (view: 'home' | 'catalog' | 'exchange' | 'finance' | 'service' | 'support' | 'dashboard' | 'admin' | 'admin-login') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else if (view === 'admin-login') {
        if (window.location.pathname !== '/admin/login') {
          window.history.pushState(null, '', '/admin/login');
        }
      } else {
        if (window.location.pathname.startsWith('/admin')) {
          window.history.pushState(null, '', '/');
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdminSignOut = async () => {
    await logoutAdmin();
    handleNavigateView('admin-login');
  };

  // Popstate history listener for direct URL /admin, /admin/login, or browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin/login' || hash === '#admin-login') {
        setActiveView('admin-login');
      } else if (path === '/admin' || path.startsWith('/admin') || hash === '#admin') {
        setActiveView('admin');
      } else if (activeView === 'admin' || activeView === 'admin-login') {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeView]);

  // Wishlist state
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('khan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleWishlist = (product: Product) => {
    setWishlistProductIds(prev => {
      const exists = prev.includes(product.id);
      const updated = exists ? prev.filter(id => id !== product.id) : [...prev, product.id];
      try { localStorage.setItem('khan_wishlist', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleOpenAiWithProduct = (product: Product) => {
    setAiProductContext(product);
    setIsAiAssistantOpen(true);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('khan_cart', JSON.stringify(cartItems));
      localStorage.setItem('khan_orders', JSON.stringify(orders));
      localStorage.setItem('khan_service_tickets', JSON.stringify(serviceTickets));
      localStorage.setItem('khan_exchanges', JSON.stringify(exchangeRequests));
      localStorage.setItem('khan_finance', JSON.stringify(financeApplications));
      localStorage.setItem('khan_warranties', JSON.stringify(warranties));
    } catch {}
  }, [cartItems, orders, serviceTickets, exchangeRequests, financeApplications, warranties]);

  // Cart operations with stock validation
  const handleAddToCart = (product: Product, quantity = 1) => {
    const validQty = Math.max(1, Math.floor(quantity));
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const maxStock = product.stockCount > 0 ? product.stockCount : 99;
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + validQty);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(maxStock, validQty) }];
    });
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProductForDetail(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item => {
          if (item.product.id === productId) {
            const maxStock = item.product.stockCount > 0 ? item.product.stockCount : 99;
            return { ...item, quantity: Math.min(maxStock, Math.max(1, Math.floor(quantity))) };
          }
          return item;
        })
      );
    }
  };

  // Compare operations
  const handleToggleCompare = (product: Product) => {
    setComparedProducts(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddProductToCompare = (product: Product) => {
    if (!comparedProducts.some(p => p.id === product.id)) {
      setComparedProducts(prev => [...prev.slice(0, 3), product]);
    }
  };

  // Order Placement (Order is created and verified in Firestore by orderService)
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev.filter(o => (o.orderId || o.id) !== (newOrder.orderId || newOrder.id))]);
    setCartItems([]);
  };

  // Submissions (with Firestore synchronization)
  const handleSubmitExchange = async (newRequest: ExchangeRequest) => {
    const payload = {
      ...newRequest,
      customerId: customerAuth.user?.uid || null
    };
    setExchangeRequests(prev => [payload as ExchangeRequest, ...prev]);
    try {
      await setDoc(doc(db, 'exchangeRequests', newRequest.id), cleanFirestoreObject(payload));
    } catch (err) {
      console.warn('Firestore exchange sync:', err);
    }
  };

  const handleSubmitFinance = async (newApp: FinanceApplication) => {
    const payload = {
      ...newApp,
      customerId: customerAuth.user?.uid || null
    };
    setFinanceApplications(prev => [payload as FinanceApplication, ...prev]);
    try {
      await setDoc(doc(db, 'financeApplications', newApp.id), cleanFirestoreObject(payload));
    } catch (err) {
      console.warn('Firestore finance sync:', err);
    }
  };

  const handleSubmitServiceTicket = async (newTicket: ServiceTicket) => {
    const payload = {
      ...newTicket,
      customerId: customerAuth.user?.uid || null
    };
    setServiceTickets(prev => [payload as ServiceTicket, ...prev]);
    try {
      await setDoc(doc(db, 'serviceTickets', newTicket.id), cleanFirestoreObject(payload));
    } catch (err) {
      console.warn('Firestore service ticket sync:', err);
    }
  };

  // 1. Admin Login View (Publicly accessible)
  if (activeView === 'admin-login') {
    if (!adminAuth.loading && adminAuth.user && adminAuth.isAuthorized) {
      handleNavigateView('admin');
    }
    return (
      <AdminLoginPage
        onLoginSuccess={() => handleNavigateView('admin')}
        onNavigateToCustomerStore={() => handleNavigateView('home')}
      />
    );
  }

  // 2. Admin Dashboard View (Protected: requires authenticated & authorized admin)
  if (activeView === 'admin') {
    // A. Session loading state
    if (adminAuth.loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">Verifying Administrator Permissions...</p>
          <p className="text-xs text-slate-400 mt-1">Connecting securely to Firebase Authentication</p>
        </div>
      );
    }

    // B. Unauthenticated: Route directly to Login
    if (!adminAuth.user) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => handleNavigateView('admin')}
          onNavigateToCustomerStore={() => handleNavigateView('home')}
        />
      );
    }

    // C. Authenticated but NOT authorized in adminUsers directory
    if (!adminAuth.isAuthorized) {
      return (
        <AdminAccessDenied
          userEmail={adminAuth.user.email}
          onSignOut={handleAdminSignOut}
          onNavigateToCustomerStore={() => handleNavigateView('home')}
        />
      );
    }

    // D. Authorized Administrator: Render Admin Dashboard
    return (
      <AdminDashboard
        products={firestoreStatus.products}
        isLoading={isRefreshingFirestore}
        onRefresh={handleRefreshFirestore}
        onNavigateToCustomerStore={() => handleNavigateView('home')}
        currentAdminEmail={adminAuth.user.email}
        onSignOut={handleAdminSignOut}
        onOpenProductInStore={(productId) => {
          const found = customerProducts.find(p => p.id === productId);
          if (found) {
            setSelectedProductForDetail(found);
            handleNavigateView('catalog');
          } else {
            handleNavigateView('catalog');
          }
        }}
      />
    );
  }

  const samsungProducts = customerProducts.filter(p => p.brand === 'Samsung');
  const eligibleFinanceProducts = customerProducts.filter(p => isProductFinanceEligible(p));
  const featuredProducts = customerProducts.filter(p => p.isFeatured || p.isBestSeller).slice(0, 6);

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col selection:bg-amber-100 selection:text-amber-900 pb-16 lg:pb-0">
      {/* Sticky Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={handleNavigateView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        cartCount={cartTotalCount}
        compareCount={comparedProducts.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        firestoreProductCount={firestoreStatus.productCount}
        onOpenFirestoreStatus={() => setIsFirestoreModalOpen(true)}
        onOpenOrderTracking={() => handleOpenOrderTracking()}
        onOpenAdmin={() => handleNavigateView('admin')}
        customerUser={customerAuth.user}
        customerProfile={customerAuth.profile}
        isCustomerAuthLoading={customerAuth.loading}
      />

      {/* Main View Display */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <HeroSection
              onExploreCatalog={() => {
                setSelectedCategory('All');
                setSelectedBrand('All');
                setActiveView('catalog');
              }}
              onOpenExchange={() => setActiveView('exchange')}
              onOpenFinance={() => setActiveView('finance')}
              onOpenService={() => setActiveView('service')}
              onSelectBrand={(brand) => {
                setSelectedBrand(brand);
                setSelectedCategory('All');
                setActiveView('catalog');
              }}
            />

            {/* Featured Best Sellers Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Showroom Highlights
                  </span>
                  <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
                    Best Selling Home Appliances
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tested for Nepal voltage stability, climate durability, and low electricity consumption.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setActiveView('catalog');
                  }}
                  className="text-xs text-amber-700 font-bold hover:text-amber-800 flex items-center gap-1"
                >
                  View All {customerProducts.length} Appliances <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isCompared={comparedProducts.some(p => p.id === product.id)}
                    onToggleCompare={handleToggleCompare}
                    onSelectProduct={(p) => setSelectedProductForDetail(p)}
                    onAddToCart={handleAddToCart}
                    onOpenExchangeForProduct={() => setActiveView('exchange')}
                    isWishlisted={wishlistProductIds.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Prominent Samsung Exchange Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50/70 border border-blue-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300 font-bold uppercase tracking-wider">
                    Official Samsung Nepal Program
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                    Upgrade to Samsung with Guaranteed Old Appliance Valuation.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Have an old refrigerator, washing machine, or TV from any brand? We inspect at your home in Rajbiraj and deduct its value up to Rs. 25,000 on your new Samsung purchase!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => setActiveView('exchange')}
                    className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Calculate Exchange Value</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Shop by Brand Grid */}
            <ShopByBrandSection
              onSelectBrand={(brand) => {
                setSelectedBrand(brand);
                setSelectedCategory('All');
                setActiveView('catalog');
              }}
            />

            {/* Multi-Brand Service & Warranty Highlight Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="space-y-2 max-w-xl">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 font-bold uppercase tracking-wider">
                    We Repair Any Brand
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    Didn't buy from Khan Electronics? We still repair it!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Our certified local technicians in Rajbiraj provide in-home service for refrigerators, washing machines, and appliances regardless of original purchase store.
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('service')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-2 shadow-xs"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book Technician Visit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'catalog' && (
          <CatalogView
            products={customerProducts}
            comparedProductIds={comparedProducts.map(p => p.id)}
            onToggleCompare={handleToggleCompare}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onOpenExchangeForProduct={() => setActiveView('exchange')}
            onOpenCompare={() => setIsCompareOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            wishlistProductIds={wishlistProductIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activeView === 'exchange' && (
          <SamsungExchangeSection
            samsungProducts={samsungProducts}
            onSubmitExchange={handleSubmitExchange}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
          />
        )}

        {activeView === 'finance' && (
          <FinanceSection
            eligibleProducts={eligibleFinanceProducts}
            onSubmitFinance={handleSubmitFinance}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
          />
        )}

        {activeView === 'service' && (
          <ServiceWarrantySection
            serviceTickets={serviceTickets}
            onSubmitServiceTicket={handleSubmitServiceTicket}
          />
        )}

        {activeView === 'support' && (
          <SupportSection />
        )}

        {activeView === 'dashboard' && (
          <div className="py-6">
            <CustomerDashboardModal
              isOpen={true}
              onClose={() => setActiveView('home')}
              onOpenOrderTracking={handleOpenOrderTracking}
              onNavigateToCatalog={() => setActiveView('catalog')}
              onNavigateToService={() => setActiveView('service')}
              onNavigateToExchange={() => setActiveView('exchange')}
              onNavigateToFinance={() => setActiveView('finance')}
            />
          </div>
        )}
      </main>

      {/* Floating Action Quick Access Button */}
      <div className="fixed bottom-6 right-6 z-30 hidden lg:flex flex-col gap-2.5 items-end">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95 group"
          title="Ask Khan AI Assistant"
        >
          <Bot className="w-4 h-4 text-white" />
          <span>Ask Khan AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <a
          href="tel:9804781290"
          className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-amber-300 text-amber-800 rounded-full font-bold text-xs shadow-md transition-colors"
          title="Call Rajbiraj Showroom"
        >
          <Phone className="w-4 h-4 text-amber-600" />
          <span>Call 9804781290</span>
        </a>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-2 flex items-center justify-around text-[10px] shadow-lg">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-amber-700 font-bold' : 'text-slate-500'}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategory('All');
            setSelectedBrand('All');
            setActiveView('catalog');
          }}
          className={`flex flex-col items-center gap-1 ${activeView === 'catalog' ? 'text-amber-700 font-bold' : 'text-slate-500'}`}
        >
          <Grid className="w-4 h-4" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => setActiveView('exchange')}
          className={`flex flex-col items-center gap-1 ${activeView === 'exchange' ? 'text-blue-700 font-bold' : 'text-blue-600'}`}
        >
          <Repeat className="w-4 h-4" />
          <span>Exchange</span>
        </button>

        <button
          onClick={() => setActiveView('service')}
          className={`flex flex-col items-center gap-1 ${activeView === 'service' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          <Wrench className="w-4 h-4" />
          <span>Service</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-500 relative"
        >
          <ShoppingCart className="w-4 h-4" />
          {cartTotalCount > 0 && (
            <span className="absolute -top-1 right-2 bg-amber-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {cartTotalCount}
            </span>
          )}
          <span>Bag</span>
        </button>

        <button
          onClick={() => setIsAccountOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </button>
      </div>

      {/* Modals and Drawers (Clean conditional mounting prevents static flag bugs) */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleCompare={handleToggleCompare}
          isCompared={comparedProducts.some(p => p.id === selectedProductForDetail.id)}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistProductIds.includes(selectedProductForDetail.id)}
          onOpenExchangeForProduct={() => {
            setSelectedProductForDetail(null);
            setActiveView('exchange');
          }}
          onOpenFinanceForProduct={() => {
            setSelectedProductForDetail(null);
            setActiveView('finance');
          }}
          onOpenAiWithProduct={handleOpenAiWithProduct}
          allProducts={customerProducts}
          onSelectProduct={(p) => setSelectedProductForDetail(p)}
          onNavigateHome={() => setActiveView('home')}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedBrand('All');
            setActiveView('catalog');
          }}
          onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            setSelectedCategory('All');
            setActiveView('catalog');
          }}
        />
      )}

      {isCompareOpen && (
        <ProductComparisonModal
          comparedProducts={comparedProducts.length > 0 ? comparedProducts : customerProducts.slice(0, 2)}
          allProducts={customerProducts}
          onRemoveFromCompare={handleRemoveFromCompare}
          onAddProductToCompare={handleAddProductToCompare}
          onClose={() => setIsCompareOpen(false)}
          onAddToCart={handleAddToCart}
          onOpenProductDetail={(p) => setSelectedProductForDetail(p)}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onOrderPlaced={handleOrderPlaced}
          onOpenOrderTracking={handleOpenOrderTracking}
          customerProfile={customerAuth.profile}
        />
      )}

      {isOrderTrackingOpen && (
        <OrderTrackingModal
          isOpen={isOrderTrackingOpen}
          onClose={() => setIsOrderTrackingOpen(false)}
          initialOrderId={trackingOrderId}
        />
      )}

      {isAccountOpen && (
        <CustomerDashboardModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          onOpenOrderTracking={handleOpenOrderTracking}
          onNavigateToCatalog={() => {
            setActiveView('catalog');
            setIsAccountOpen(false);
          }}
          onNavigateToService={() => {
            setActiveView('service');
            setIsAccountOpen(false);
          }}
          onNavigateToExchange={() => {
            setActiveView('exchange');
            setIsAccountOpen(false);
          }}
          onNavigateToFinance={() => {
            setActiveView('finance');
            setIsAccountOpen(false);
          }}
        />
      )}

      {isAiAssistantOpen && (
        <AskKhanAiPlaceholder
          isOpen={isAiAssistantOpen}
          onClose={() => {
            setIsAiAssistantOpen(false);
            setAiProductContext(null);
          }}
          onOpenExchange={() => {
            setIsAiAssistantOpen(false);
            setActiveView('exchange');
          }}
          onOpenFinance={() => {
            setIsAiAssistantOpen(false);
            setActiveView('finance');
          }}
          onOpenService={() => {
            setIsAiAssistantOpen(false);
            setActiveView('service');
          }}
          productContext={aiProductContext ? {
            productId: aiProductContext.id,
            productName: aiProductContext.name,
            brand: aiProductContext.brand,
            model: aiProductContext.modelNumber,
            category: aiProductContext.category,
            price: aiProductContext.price,
            imageUrl: aiProductContext.imageUrl,
            keySpecifications: aiProductContext.features
          } : null}
          onClearProductContext={() => setAiProductContext(null)}
        />
      )}

      {/* Firestore Products Database Connection Status Modal */}
      <FirestoreStatusModal
        isOpen={isFirestoreModalOpen}
        onClose={() => setIsFirestoreModalOpen(false)}
        status={firestoreStatus}
        onRefresh={handleRefreshFirestore}
        isRefreshing={isRefreshingFirestore}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <KhanLogo variant="footer" showSubtitle={false} />
              <p className="text-slate-600 text-xs leading-relaxed">
                New Khan Automobiles & Electronics &bull; Rajbiraj, Saptari, Nepal. Authorized multi-brand retail & service center.
              </p>
              <div className="text-slate-700 font-medium">
                Call / WhatsApp: <a href="tel:9804781290" className="text-amber-700 font-bold hover:underline">9804781290</a>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Showroom & Delivery</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li>Main Road, Near Mahavir Chowk, Rajbiraj</li>
                <li>Free Delivery within 5 km in Rajbiraj</li>
                <li>Nepal-Wide Courier & Freight</li>
                <li>Cash on Delivery, Fonepay QR, eSewa, Khalti</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Special Facilities</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li>Samsung Smart Exchange (Any Old Brand)</li>
                <li>Hulas Finance (40% Downpayment • Only Citizenship)</li>
                <li>Multi-Brand Service (Bought anywhere!)</li>
                <li>Genuine Manufacturer Nepal Warranty</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Authorized Brands</h4>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {['Samsung', 'CG', 'Godrej', 'Konka', 'Midea', 'Force', 'Crompton', 'Chigo', 'Khaitan', 'TCL'].map(b => (
                  <span key={b} className="bg-white px-2 py-0.5 rounded text-slate-700 border border-slate-200 shadow-xs">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} New Khan Automobiles & Electronics. All rights reserved. Rajbiraj, Saptari, Nepal.
            </div>
            <div className="flex items-center gap-3 flex-wrap text-slate-500">
              <button 
                onClick={() => handleNavigateView('admin')}
                className="hover:text-amber-800 transition-colors flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 cursor-pointer"
                title="Open Khan Electronics Store Admin Dashboard (/admin)"
              >
                <span>Store Admin (/admin)</span>
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setIsFirestoreModalOpen(true)}
                className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer"
                title="View Firestore Products Collection Status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore DB: {firestoreStatus.productCount} Products Synced</span>
              </button>
              <span>&bull;</span>
              <span>Samsung Authorized Dealer</span>
              <span>&bull;</span>
              <span>CG Certified Showroom</span>
              <span>&bull;</span>
              <span>Hulas Finance Partner</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
