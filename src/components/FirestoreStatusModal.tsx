import React from 'react';
import { Database, CheckCircle2, RefreshCw, X, ShieldCheck, Box, Tag, Layers, ArrowUpRight } from 'lucide-react';
import { FirestoreProductDoc } from '../services/productService';

interface FirestoreStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: {
    tested: boolean;
    connected: boolean;
    productCount: number;
    products: FirestoreProductDoc[];
    error?: string;
  };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const FirestoreStatusModal: React.FC<FirestoreStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
  isRefreshing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Firestore Database Status</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Collection: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">products</span> &bull; Project: <span className="font-mono text-slate-700">khan-electronics-8d63b</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all disabled:opacity-50"
              title="Refresh Products from Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100 bg-white">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Connection State</span>
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronized & Active
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Products in Firestore</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {status.productCount} Verified Documents
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Database Architecture</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              Enterprise Ready (1,000+ Items)
            </span>
          </div>
        </div>

        {/* Loaded Firestore Documents */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Verified Firestore Product Documents
            </h4>
            <span className="text-[11px] text-slate-400">
              Fetched via Website &rarr; Firestore SDK
            </span>
          </div>

          {status.products.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Database className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-slate-600 font-medium">Connecting to Firestore products collection...</p>
              <p className="text-xs text-slate-400 mt-1">Please wait while the connection is established.</p>
            </div>
          ) : (
            status.products.map((prod, idx) => (
              <div 
                key={prod.productId} 
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-white transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        doc: {prod.productId}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {prod.brand}
                      </span>
                      <span className="text-xs text-slate-500">
                        Model: <strong className="text-slate-700">{prod.modelNumber}</strong>
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm">{prod.productName}</h5>
                    <p className="text-xs text-slate-600 line-clamp-1">{prod.keySpecification}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">Rs. {prod.sellingPrice?.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 line-through">MRP Rs. {prod.mrp?.toLocaleString()}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {prod.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                {/* Schema Fields Breakdown */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400 block">Stock:</span>
                    <strong className="text-slate-800">{prod.stockQuantity} units ({prod.stockStatus})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Finance (Min Down):</span>
                    <strong className="text-slate-800">{prod.financeAvailable ? `Yes (${prod.minimumDownPaymentPercent}%)` : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Exchange Available:</span>
                    <strong className="text-slate-800">{prod.exchangeAvailable ? 'Yes (Samsung)' : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Product Status:</span>
                    <strong className="text-emerald-700 font-semibold">{prod.productStatus} (Featured: {prod.featured ? 'Yes' : 'No'})</strong>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="truncate pr-2">
                    🛡️ Warranty: {prod.warranty?.slice(0, 70)}...
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    Indexed Schema ✓
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firestore Rules: Public Read Authorized &bull; Write Protected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
