import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { PlatformView } from '../../types';
import {
  LayoutDashboard, Calendar, ShoppingBag, Activity,
  Stethoscope, UtensilsCrossed, Settings, FileText,
  Droplet, Heart, Award, Leaf, Gift, X, Apple,
  ChevronDown, ChevronRight, HeartPulse, ShoppingCart,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type MenuItem = {
  label: string;
  icon: React.ElementType;
  view: PlatformView;
};

type MenuSection = {
  id: string;
  label: string;
  emoji: string;
  icon: React.ElementType;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    id: 'health',
    label: 'My Health',
    emoji: '❤️',
    icon: HeartPulse,
    items: [
      { label: 'Health Reports',  icon: FileText,       view: 'health-reports' },
      { label: 'Doctor Consult',  icon: Stethoscope,    view: 'doctor-consultation' },
      { label: 'Water Tracker',   icon: Droplet,        view: 'water-tracker' },
    ],
  },
  {
    id: 'food',
    label: 'My Food & Nutrition',
    emoji: '🍽️',
    icon: UtensilsCrossed,
    items: [
      { label: 'Marketplace',      icon: UtensilsCrossed, view: 'marketplace' },
      { label: 'Healthy Foods',    icon: Apple,           view: 'healthy-foods' },
      { label: 'Smart Grocery',    icon: ShoppingCart,    view: 'smart-grocery' },
      { label: 'Meal Planner',     icon: Calendar,        view: 'meal-planner' },
    ],
  },
  {
    id: 'account',
    label: 'My Account',
    emoji: '👤',
    icon: User,
    items: [
      { label: 'My Orders',         icon: ShoppingBag, view: 'my-orders' },
      { label: 'Favorites',         icon: Heart,       view: 'favorites' },
      { label: 'Rewards & Wallet',  icon: Award,       view: 'rewards' },
      { label: 'Settings',          icon: Settings,    view: 'settings' },
    ],
  },
];

/** Determine which section contains a given view */
const getSectionForView = (view: PlatformView): string | null => {
  for (const section of menuSections) {
    if (section.items.some(i => i.view === view)) return section.id;
  }
  return null;
};

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { currentView, setCurrentView } = useApp();

  // Auto-open the section that contains the active view
  const [openSection, setOpenSection] = useState<string | null>(
    getSectionForView(currentView) || 'health'
  );

  // When active view changes (e.g. from Dashboard header), keep section in sync
  useEffect(() => {
    const section = getSectionForView(currentView);
    if (section) setOpenSection(section);
  }, [currentView]);

  const toggleSection = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  const handleItemClick = (view: PlatformView) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 z-30 overflow-y-auto scrollbar-none font-sans">

      {/* Brand Header */}
      <div className="p-5 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight text-slate-900 font-['Outfit'] flex items-center gap-1 leading-none">
              Wellora <span className="text-emerald-600 font-black text-sm">AI</span>
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
              Eat Smart, Live Healthy
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dashboard shortcut */}
      <div className="px-4 pb-2">
        <button
          id="sidebar-dashboard-btn"
          onClick={() => handleItemClick('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentView === 'dashboard'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/60 font-extrabold shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentView === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
          Dashboard
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100 mb-2" />

      {/* Accordion Sections */}
      <nav className="flex-1 px-4 space-y-1 pb-4">
        {menuSections.map(section => {
          const isOpen   = openSection === section.id;
          const SIcon    = section.icon;
          const hasActive = section.items.some(i => i.view === currentView);

          return (
            <div key={section.id}>
              {/* Section Header Button */}
              <button
                id={`sidebar-section-${section.id}`}
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all group ${
                  hasActive
                    ? 'text-emerald-700 bg-emerald-50/70'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  hasActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <SIcon className="w-3.5 h-3.5" />
                </div>

                <span className="flex-1 text-left tracking-wide">{section.label}</span>

                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className={`w-3.5 h-3.5 ${hasActive ? 'text-emerald-500' : 'text-slate-300'}`} />
                </div>
              </button>

              {/* Sub-items — animated expand/collapse */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-3 pl-4 border-l-2 border-slate-100 mt-1 mb-2 space-y-0.5">
                  {section.items.map(item => {
                    const IIcon    = item.icon;
                    const isActive = item.view === currentView;
                    return (
                      <button
                        key={item.view}
                        id={`sidebar-item-${item.view}`}
                        onClick={() => handleItemClick(item.view)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100/50 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        <IIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Cards */}
      <div className="space-y-3 p-4 pt-0 border-t border-slate-100 shrink-0">
        {/* Go Premium */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/5 to-amber-500/10 border border-amber-200/50 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1.5">
            <span className="text-sm">👑</span>
            <span className="text-xs font-extrabold uppercase tracking-wider">Go Premium</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-snug mb-3">
            Unlock AI insights, custom meal plans, and more.
          </p>
          <button
            id="sidebar-upgrade-btn"
            onClick={() => setCurrentView('gold-facilities')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            Upgrade Now <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Invite Card */}
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
