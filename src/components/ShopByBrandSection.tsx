import React from 'react';
import { Repeat, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { BRANDS_LIST } from '../data/productsData';

interface ShopByBrandSectionProps {
  onSelectBrand: (brand: string) => void;
}

export const ShopByBrandSection: React.FC<ShopByBrandSectionProps> = ({
  onSelectBrand
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Authorized Dealerships in Rajbiraj
          </span>
          <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
            Shop by Official Brand
          </h2>
          <p className="text-xs text-slate-500">
            Guaranteed 100% genuine Nepal manufacturer warranties and certified local servicing.
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <Repeat className="w-3.5 h-3.5 text-blue-600" /> Samsung Exchange Available
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Hulas Finance (40% Downpayment)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {BRANDS_LIST.map((brand) => (
          <div
            key={brand.name}
            onClick={() => onSelectBrand(brand.name)}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400/80 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between group space-y-4 shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="font-display font-black text-xl text-slate-900 group-hover:text-amber-700 transition-colors">
                  {brand.logo}
                </span>

                <div className="flex flex-col items-end gap-1">
                  {brand.hasExchange && (
                    <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      Exchange
                    </span>
                  )}
                  {brand.hasFinance && (
                    <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      EMI 40%
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2">{brand.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {brand.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{brand.count} Models in Stock</span>
              <span className="text-amber-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
