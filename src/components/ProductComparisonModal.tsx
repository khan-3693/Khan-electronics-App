import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Scale, 
  ShoppingCart, 
  Plus, 
  Repeat, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { Product } from '../types';

interface ProductComparisonModalProps {
  comparedProducts: Product[];
  allProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddProductToCompare: (product: Product) => void;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  comparedProducts,
  allProducts,
  onRemoveFromCompare,
  onAddProductToCompare,
  onClose,
  onAddToCart,
  onOpenProductDetail
}) => {
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  const checkIsDiff = (getter: (p: Product) => any) => {
    if (!highlightDiffs || comparedProducts.length < 2) return false;
    const firstVal = getter(comparedProducts[0]);
    return comparedProducts.some(p => getter(p) !== firstVal);
  };

  const availableToAdd = allProducts.filter(
    p => !comparedProducts.some(cp => cp.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Appliance Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {comparedProducts.length} model{comparedProducts.length !== 1 ? 's' : ''} side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedProducts.length > 1 && (
              <label className="hidden sm:flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={highlightDiffs}
                  onChange={(e) => setHighlightDiffs(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Highlight Differences</span>
              </label>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Scale className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No products selected for comparison</h3>
              <p className="text-xs text-slate-500">Add 2 or more products from the catalog to compare specs.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {allProducts.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => onAddProductToCompare(p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 border border-slate-200 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>{p.name.split(' ').slice(0, 3).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr>
                    <th className="p-3 w-48 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-l-xl">
                      Specification
                    </th>
                    {comparedProducts.map(p => (
                      <th key={p.id} className="p-3 w-64 bg-slate-50 align-top border-l border-slate-200">
                        <div className="space-y-2.5">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            <button
                              onClick={() => onRemoveFromCompare(p.id)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-slate-500 hover:text-rose-600 shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <span className="text-[10px] text-amber-700 font-bold uppercase">{p.brand}</span>
                            <h4
                              onClick={() => onOpenProductDetail(p)}
                              className="text-xs font-bold text-slate-900 hover:text-amber-700 cursor-pointer line-clamp-1"
                            >
                              {p.name}
                            </h4>
                            <div className="text-sm font-black text-slate-900 mt-1">
                              Rs. {p.price.toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={() => onAddToCart(p)}
                            className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {/* Brand */}
                  <tr className={checkIsDiff(p => p.brand) ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Brand</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200 font-bold text-slate-900">
                        {p.brand}
                      </td>
                    ))}
                  </tr>

                  {/* Price */}
                  <tr className={checkIsDiff(p => p.price) ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Showroom Price</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200 font-extrabold text-slate-900">
                        Rs. {p.price.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Samsung Exchange */}
                  <tr className={checkIsDiff(p => p.exchangeAvailable) ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5 text-blue-600" /> Samsung Exchange
                    </td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200">
                        {p.exchangeAvailable ? (
                          <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            Exchange Available
                          </span>
                        ) : (
                          <span className="text-slate-400">Not Applicable</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Finance / EMI */}
                  <tr className={checkIsDiff(p => p.financeAvailable) ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Easy Finance
                    </td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200">
                        {p.financeAvailable ? (
                          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                            Hulas Finance (40% Downpayment)
                          </span>
                        ) : (
                          <span className="text-slate-400">Cash / Full Pay</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Capacity */}
                  <tr className={checkIsDiff(p => p.specs.capacity || '') ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Capacity / Size</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200 font-medium text-slate-900">
                        {p.specs.capacity || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Motor Warranty */}
                  <tr className={checkIsDiff(p => p.specs.motorWarrantyYears || 0) ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Compressor / Motor Warranty</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200 font-bold text-emerald-700">
                        {p.specs.motorWarrantyYears ? `${p.specs.motorWarrantyYears} Years Guarantee` : 'Standard 1 Year'}
                      </td>
                    ))}
                  </tr>

                  {/* Power Rating */}
                  <tr className={checkIsDiff(p => p.specs.powerWattage || '') ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Power Wattage</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200">
                        {p.specs.powerWattage || 'Standard'}
                      </td>
                    ))}
                  </tr>

                  {/* Dimensions */}
                  <tr className={checkIsDiff(p => p.specs.dimensions || '') ? 'bg-amber-50/50' : ''}>
                    <td className="p-3 font-semibold text-slate-500">Dimensions</td>
                    {comparedProducts.map(p => (
                      <td key={p.id} className="p-3 border-l border-slate-200 font-mono text-[11px] text-slate-600">
                        {p.specs.dimensions || 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {comparedProducts.length < 4 && availableToAdd.length > 0 && (
            <div className="pt-3 border-t border-slate-200 flex items-center gap-3 text-xs">
              <span className="text-slate-500">Add to comparison:</span>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => onAddProductToCompare(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 border border-slate-200 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-amber-600" />
                    <span>{p.name.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
