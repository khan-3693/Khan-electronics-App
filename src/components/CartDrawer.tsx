import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  ShoppingCart,
  Repeat
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  // Free delivery within 5km in Rajbiraj
  const deliveryText = 'FREE (Within 5 km in Rajbiraj)';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-display font-bold text-slate-900">
                Your Shopping Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your bag is currently empty</p>
                  <p className="text-xs text-slate-500 mt-1">Explore authentic home appliances from Samsung, CG, Godrej and more.</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-18 h-18 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] text-amber-700 font-bold uppercase font-display">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 0)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                      {item.product.modelNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Model: {item.product.modelNumber}
                        </div>
                      )}

                      <div className="text-xs text-slate-900 font-black mt-0.5">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>

                      {/* Quantity Controls & Stock Guard */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const maxStock = item.product.stockCount > 0 ? item.product.stockCount : 99;
                              if (item.quantity < maxStock) {
                                onUpdateQuantity(item.product.id, item.quantity + 1);
                              }
                            }}
                            disabled={item.product.stockCount > 0 && item.quantity >= item.product.stockCount}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          (Rs. {item.product.price.toLocaleString()} each)
                        </span>
                        {item.product.stockCount > 0 && item.quantity >= item.product.stockCount && (
                          <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                            Max stock reached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.product.exchangeAvailable && (
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 text-[11px] text-blue-700 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold">
                        <Repeat className="w-3 h-3 text-blue-600" /> Samsung Exchange Eligible
                      </span>
                      <span className="text-[10px] text-slate-500">Ask at checkout</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/95 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-600" /> Local Delivery:
                  </span>
                  <span className="text-emerald-700 font-bold">{deliveryText}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-slate-900 text-lg">Rs. {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-1">
                <span>Cash on Delivery</span>
                <span>&bull;</span>
                <span>Pay at Showroom</span>
                <span>&bull;</span>
                <span>Free &le; 5 KM</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
