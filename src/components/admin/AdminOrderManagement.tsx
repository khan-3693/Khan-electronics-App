import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Package, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, OrderPaymentStatus } from '../../types';
import { 
  subscribeToOrders, 
  fetchAllOrdersForAdmin 
} from '../../services/orderService';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';

interface AdminOrderManagementProps {
  initialOrders?: Order[];
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({
  initialOrders = []
}) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | OrderPaymentStatus>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amountDesc' | 'amountAsc'>('newest');

  // Load orders with real-time Firestore listener
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToOrders(
      (liveOrders) => {
        setOrders(liveOrders);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Orders listener notice:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchAllOrdersForAdmin();
      setOrders(fetched);
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & sort logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search filter: reference, customer name, phone
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = o.orderId?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
        const matchesName = o.customerName?.toLowerCase().includes(q);
        const matchesPhone = o.phone?.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesPhone) return false;
      }

      // 2. Order status filter
      if (statusFilter !== 'All') {
        const currentSt = o.orderStatus || o.status;
        if (currentSt !== statusFilter) return false;
      }

      // 3. Payment status filter
      if (paymentFilter !== 'All') {
        if (o.paymentStatus !== paymentFilter) return false;
      }

      // 4. Date filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(o.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (orderDate < oneDayAgo) return false;
        } else if (dateFilter === 'week') {
          const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (orderDate < oneWeekAgo) return false;
        } else if (dateFilter === 'month') {
          const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (orderDate < oneMonthAgo) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amountDesc') return (b.totalAmount || b.total || 0) - (a.totalAmount || a.total || 0);
      if (sortBy === 'amountAsc') return (a.totalAmount || a.total || 0) - (b.totalAmount || b.total || 0);
      return 0;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const newOrders = orders.filter(o => (o.orderStatus || o.status) === 'New').length;
    const preparingOrDispatch = orders.filter(o => 
      ['Preparing', 'Out for Delivery'].includes(o.orderStatus || o.status || '')
    ).length;
    const delivered = orders.filter(o => (o.orderStatus || o.status) === 'Delivered').length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0);
    const unpaidCount = orders.filter(o => o.paymentStatus === 'Unpaid').length;
    return { total, newOrders, preparingOrDispatch, delivered, totalRevenue, unpaidCount };
  }, [orders]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            Showroom Order Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer appliance orders, update delivery dispatch, record confirmed delivery charges, and manage internal notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Sync Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">Total Orders</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-400">All registered orders</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-amber-700 tracking-wider block">Needs Review</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.newOrders}</div>
          <span className="text-[10px] text-amber-600 font-medium">New submissions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-blue-700 tracking-wider block">In Fulfillment</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats.preparingOrDispatch}</div>
          <span className="text-[10px] text-blue-600 font-medium">Preparing / Out for delivery</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-700 tracking-wider block">Delivered</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{stats.delivered}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Completed handoffs</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">Order Volume</span>
          <div className="text-xl font-black text-slate-900 mt-1 truncate">
            Rs. {stats.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">{stats.unpaidCount} unpaid pending collection</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order reference, customer name, or phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Order Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Payments</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amountDesc">Highest Amount</option>
              <option value="amountAsc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Orders Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'No orders match your filter criteria. Try resetting your search or filters.'
                : 'No customer orders registered in Firestore yet. Customer checkout submissions will automatically appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const currentSt = o.orderStatus || o.status || 'New';
                  const currentPay = o.paymentStatus || 'Unpaid';
                  const itemCount = o.items ? o.items.reduce((acc, i) => acc + i.quantity, 0) : 0;

                  return (
                    <tr 
                      key={o.orderId || o.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(o)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {o.orderId || o.id}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{o.customerName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{o.phone}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="truncate max-w-[140px] block" title={o.deliveryAddress?.streetAddress}>
                          {o.deliveryAddress?.wardNo || ''}, {o.deliveryAddress?.municipality || 'Rajbiraj'}
                        </span>
                        <span className={`text-[10px] font-semibold ${o.deliveryAddress?.isWithin5km ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {o.deliveryAddress?.isWithin5km ? 'Within 5 km (Free)' : 'Outside 5 km'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {o.items?.[0]?.productName || ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-950 font-mono">
                        Rs. {(o.totalAmount || o.total || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          currentSt === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : currentSt === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : currentSt === 'Out for Delivery'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {currentSt}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          currentPay === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : currentPay === 'Refunded'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {currentPay}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetail(o)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOrderUpdated={handleManualRefresh}
      />
    </div>
  );
};
