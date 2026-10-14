
import React from 'react';

export interface KhanLogoProps {
  variant?: 'header' | 'footer' | 'admin' | 'hero' | 'login' | 'compact' | 'icon-only';
  showSubtitle?: boolean;
  className?: string;
  forceIconOnly?: boolean;
}

/**
 * Official Brand Logo for Khan Electronics
 * Uses these brand assets:
 * - Full Horizontal Logo: /brand/khan-electronics-logo.png
 * - Icon-Only Logo: /brand/khan-electronics-icon.png
 * - White Logo for Dark Backgrounds: /brand/khan-electronics-logo-white.png
 */
export const KhanLogo: React.FC<KhanLogoProps> = ({
  variant = 'header',
  showSubtitle = true,
  className = '',
  forceIconOnly = false
}) => {
  // Icon-only variant
  if (forceIconOnly || variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-icon.png"
          alt="Khan Electronics"
          className="h-15 w-auto object-contain select-none"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Header: Full logo on larger screens, icon and text on mobile
  if (variant === 'header') {
    return (
      <div className={`flex items-center shrink-0 ${className}`}>
        <div className="hidden sm:block">
          <img
            src="/brand/khan-electronics-logo.png"
            alt="Khan Electronics - New Khan Automobiles & Electronics"
            className="w-[100px] h-[100px] object-contain select-none transition-opacity duration-200 hover:opacity-95 ml-1 -mr-1 mt-[3px]"
            style={{ 
              width: '100px', 
              height: '100px', 
              paddingLeft: '0px', 
              marginLeft: '4px', 
              marginRight: '-4px', 
              marginTop: '3px', 
              paddingTop: '0px', 
              paddingBottom: '0px' 
            }}
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <img
            src="/brand/khan-electronics-icon.png"
            alt="Khan Electronics"
            className="h-14 w-14 object-contain select-none"
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

  // Admin Portal
  if (variant === 'admin') {
    return (
      <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
        <div className="hidden md:block">
          <img
            src="/brand/khan-electronics-logo.png"
            alt="Khan Electronics Admin"
            className="h-25 w-auto object-contain select-none"
            loading="eager"
            decoding="async"
          />
        </div>

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

  // Hero Section: Larger official full logo
  if (variant === 'hero') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo.png"
          alt="Khan Electronics"
          className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto max-w-full object-contain object-left select-none"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Footer
  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo.png"
          alt="Khan Electronics"
          className="w-[500px] h-[250px] object-contain select-none p-1 -ml-[3px] mr-2 mt-[2px] mb-0"
          style={{
            width: '200px',
            height: '150px',
            paddingLeft: '4px',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingRight: '4px',
            marginLeft: '-3px',
            marginRight: '8px',
            marginTop: '2px',
            marginBottom: '0px'
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Admin Login: White logo on dark background
  if (variant === 'login') {
    return (
      <div className={`flex flex-col items-center justify-center text-center space-y-2 shrink-0 ${className}`}>
        <img
          src="/brand/khan-electronics-logo.png"
          alt="Khan Electronics Administration"
          className="h-35 sm:h-17 w-auto object-contain select-none drop-shadow-md"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Default / Compact
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src="/brand/khan-electronics-icon.png"
        alt="Khan Electronics"
        className="h-12 w-auto object-contain select-none"
        loading="lazy"
        decoding="async"
      />
      <span className="font-display font-black text-slate-900 text-sm tracking-tight">
        KHAN <span className="text-rose-600">ELECTRONICS</span>
      </span>
    </div>
  );
};

