import React from 'react';
import { useApp } from '../../context/AppContext';
import type { PlatformView } from '../../types';
import {
  LayoutDashboard, Calendar, ShoppingBag, Activity, Store,
  Stethoscope, UtensilsCrossed, Settings,
  FileText, Crown, Droplet, Heart, Award, Wallet, Leaf, Gift, X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const customerMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as PlatformView },
  { label: 'Marketplace', icon: UtensilsCrossed, view: 'marketplace' as PlatformView },
  { label: 'Meal Planner', icon: Calendar, view: 'meal-planner' as PlatformView },
  { label: 'Nutrition', icon: Activity, view: 'nutrition-dashboard' as PlatformView },
  { label: 'Smart Grocery', icon: Store, view: 'smart-grocery' as PlatformView },
  { label: 'Health Reports', icon: FileText, view: 'health-reports' as PlatformView },
  { label: 'Doctor Consult', icon: Stethoscope, view: 'doctor-consultation' as PlatformView },
  { label: 'Water Tracker', icon: Droplet, view: 'water-tracker' as PlatformView },
  { label: 'My Orders', icon: ShoppingBag, view: 'my-orders' as PlatformView },
  { label: 'Favorites', icon: Heart, view: 'favorites' as PlatformView },
  { label: 'Rewards', icon: Award, view: 'rewards' as PlatformView },
  { label: 'Wallet', icon: Wallet, view: 'wallet' as PlatformView },
  { label: 'Settings', icon: Settings, view: 'dashboard' as PlatformView },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const {
    currentView,
    setCurrentView,
  } = useApp();

  const handleItemClick = (item: { view?: PlatformView }) => {
    if (item.view) {
      setCurrentView(item.view);
    }
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col justify-between p-5 flex-shrink-0 z-30 overflow-y-auto scrollbar-none font-sans">
      <div className="space-y-6">

        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Leaf className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight text-slate-900 font-['Outfit'] flex items-center gap-1 leading-none">
                Wellora <span className="text-emerald-600 font-black text-sm">AI</span>
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">
                Eat Smart, Live Healthy
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {customerMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = 'view' in item && item.view === currentView && item.label !== 'Settings';
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-sm border border-emerald-100/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {Boolean('isNew' in item && item.isNew) && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Premium & Referral Cards at bottom */}
      <div className="space-y-3 mt-6 pt-4 border-t border-slate-100">
        {/* Go Premium Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/5 to-amber-500/10 border border-amber-200/50 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1.5">
            <Crown className="w-4 h-4 fill-amber-500/20 text-amber-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Go Premium</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-snug mb-3">
            Unlock AI insights, custom meal plans, and more.
          </p>
          <button
            onClick={() => setCurrentView('gold-facilities')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            Upgrade Now <span className="text-xs">&rarr;</span>
          </button>
        </div>

        {/* Invite & Earn Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/60 flex items-center justify-center shrink-0 text-emerald-600">
            <Gift className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-800 leading-tight">Invite & Earn</h4>
            <p className="text-[9px] text-slate-500 font-medium">Invite friends and earn rewards</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
