import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Wrench, 
  PhoneCall, 
  MessageSquare, 
  ArrowRight, 
  Scale, 
  Zap, 
  Layers
} from 'lucide-react';

interface HeroBannerProps {
  onExploreCatalog: () => void;
  onOpenVoiceCall: () => void;
  onOpenChat: () => void;
  onOpenCompare: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCatalog,
  onOpenVoiceCall,
  onOpenChat,
  onOpenCompare
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-10 pb-16">
      {/* Background ambient decorative glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Value Prop & Primary CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Smart Living with Grounded RAG AI Concierge</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Home Appliances, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Intelligently Connected.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Discover flagship smart refrigerators, AI washers, LiDAR robot vacuums, and commercial espresso systems. Backed by our 
              <strong className="text-cyan-300"> 24/7 Voice & Chat RAG Agent </strong> for instant technical troubleshooting, side-by-side spec comparison, and white-glove order tracking.
            </p>

            {/* Quick Interactive Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenVoiceCall}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Voice Concierge</span>
                <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wider">Live</span>
              </button>

              <button
                onClick={onOpenChat}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-all hover:border-cyan-500/50"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Ask AI Specialist</span>
              </button>

              <button
                onClick={onOpenCompare}
                className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium text-sm flex items-center gap-2 transition-all"
              >
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>Compare Specs</span>
              </button>
            </div>

            {/* Value Guarantees Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">30-Day Trial</div>
                  <div className="text-slate-400 text-[11px]">Risk-free in-home test</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">White-Glove</div>
                  <div className="text-slate-400 text-[11px]">Install + Haul-away</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">10-Yr Inverter</div>
                  <div className="text-slate-400 text-[11px]">Motor warranty</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">RAG Engine</div>
                  <div className="text-slate-400 text-[11px]">Grounded tech support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Appliance Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs px-2.5 py-1 rounded-full font-semibold">
                Spotlight
              </div>

              <div className="relative rounded-2xl overflow-hidden mb-5 bg-slate-900 aspect-video sm:aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
                  alt="OmniFrost Ultra Smart Refrigerator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    Dual Craft Sphere Ice + Matter 1.3
                  </span>
                  <span className="text-emerald-400 font-bold bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                    36 dB Whisper
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">OmniFrost Ultra 4-Door Refrigerator</h3>
                    <p className="text-xs text-slate-400">InstaView Tinted Glass & Linear Inverter Cooling</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-cyan-400">$2,899</div>
                    <div className="text-xs text-slate-500 line-through">$3,299</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Finance from <strong className="text-white">$120/mo</strong> at 0% APR</span>
                  <button 
                    onClick={onExploreCatalog}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    View All 10 Appliances <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
