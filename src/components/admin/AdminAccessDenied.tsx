import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

interface AdminAccessDeniedProps {
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
  onNavigateToCustomerStore: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  userEmail,
  onSignOut,
  onNavigateToCustomerStore
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-slate-900 to-slate-950 pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/90 border border-rose-900/40 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            You do not have administrator access.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The account <strong className="text-slate-200 font-mono">{userEmail || 'signed in'}</strong> is authenticated, but is not registered or active in the <code className="text-rose-400 font-mono text-[10px]">adminUsers</code> authorization directory.
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/80 text-left text-xs text-slate-400 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Required Permissions:</div>
          <div>&bull; Collection: <span className="font-mono text-slate-300">adminUsers</span></div>
          <div>&bull; Role: <span className="font-mono text-emerald-400 font-semibold">"admin"</span> &bull; Active: <span className="font-mono text-emerald-400 font-semibold">true</span></div>
          <div className="text-[11px] text-slate-500 pt-1">Contact Khan Electronics senior management to provision access.</div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onNavigateToCustomerStore}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/60 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Customer Storefront</span>
          </button>

          <button
            onClick={onSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
