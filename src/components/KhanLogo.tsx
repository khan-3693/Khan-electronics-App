import React from 'react';

export interface KhanLogoProps {
  variant?: 'header' | 'footer' | 'admin' | 'hero' | 'login' | 'compact' | 'icon-only';
  showSubtitle?: boolean;
  className?: string;
  forceIconOnly?: boolean;
}

/**
 * Official Brand Logo for Khan Electronics
 * Uses official brand assets:
 * - Horizontal Logo: /brand/khan-electronics-logo.png
 * - Icon-Only Logo: /brand/khan-electronics-icon.png
 * - Dark-surface Variant: /brand/khan-electronics-logo-white.png
 */
export const KhanLogo: React.FC<KhanLogoProps> = ({
  variant = 'header',
  showSubtitle = true,
  className = '',
  forceIconOnly = false
}) => {
  // If explicitly requested icon-only
  if (forceIconOnly || variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-icon.png"
          alt="Khan Electronics"
          className="h-9 w-9 object-contain select-none"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Header variant: Responsive (full horizontal on sm/desktop, icon-only on narrow mobile)
  if (variant === 'header') {
    return (
      <div className={`flex items-center shrink-0 ${className}`}>
        {/* Desktop & Tablet: Full Horizontal Logo */}
        <div className="hidden sm:block">
          <img
            src="/brand/khan-electronics-logo.png"
            alt="Khan Electronics - New Khan Automobiles & Electronics"
            className="h-11 md:h-12 w-auto object-contain select-none transition-opacity duration-200 hover:opacity-95"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Mobile Narrow Screens: Official KH Icon-only Logo */}
        <div className="flex sm:hidden items-center gap-2">
          <img
            src="/brand/khan-electronics-icon.png"
            alt="Khan Electronics"
            className="h-10 w-10 object-contain select-none"
            loading="eager"
            decoding="async"
          />
          <div className="leading-tight">
            <span className="font-display font-black text-slate-900 text-sm tracking-tight block">
              KHAN <span className="text-rose-600">ELECTRONICS</span>
            </span>
            {showSubtitle && (
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider block">
                Rajbiraj
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Portal variant
  if (variant === 'admin') {
    return (
      <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
        {/* Desktop Admin: Full Horizontal Logo */}
        <div className="hidden md:block">
          <img
            src="/brand/khan-electronics-logo.png"
            alt="Khan Electronics Admin"
            className="h-10 w-auto object-contain select-none"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Mobile / Compact Admin: KH Icon */}
        <div className="flex md:hidden items-center gap-2">
          <img
            src="/brand/khan-electronics-icon.png"
            alt="Khan Electronics Admin"
            className="h-9 w-9 object-contain select-none"
            loading="eager"
            decoding="async"
          />
          <span className="font-display font-black text-slate-900 text-sm tracking-tight">
            KHAN <span className="text-rose-600">ELECTRONICS</span>
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white tracking-wider leading-none uppercase">
          Portal
        </span>
      </div>
    );
  }

  // Hero Section variant
  if (variant === 'hero') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo.png"
          alt="Khan Electronics"
          className="h-12 sm:h-14 w-auto object-contain select-none"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo.png"
          alt="Khan Electronics"
          className="h-10 w-auto object-contain select-none"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Admin Login page variant (optimized for dark slate-900 background)
  if (variant === 'login') {
    return (
      <div className={`flex flex-col items-center justify-center text-center space-y-2 shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo-white.png"
          alt="Khan Electronics Administration"
          className="h-14 sm:h-16 w-auto object-contain select-none drop-shadow-md"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Default / Compact variant
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src="/brand/khan-electronics-icon.png"
        alt="Khan Electronics"
        className="h-8 w-8 object-contain select-none"
        loading="lazy"
        decoding="async"
      />
      <span className="font-display font-black text-slate-900 text-sm tracking-tight">
        KHAN <span className="text-rose-600">ELECTRONICS</span>
      </span>
    </div>
  );
};

