import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun, Moon, ShoppingBag, Bot, Menu, Activity,
  LogOut, MapPin
} from 'lucide-react';

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
}

/**
 * DashboardHeader — top header bar shown on all authenticated dashboard views.
 * Displays user info, cart, AI, and settings controls.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMobileMenuOpen }) => {
  const {
    currentUser,
    isDarkMode,
    setIsDarkMode,
    cart,
    setIsCartOpen,
    setIsAIModalOpen,
    openProfileModal,
    setIsOrderTrackingOpen,
    activeOrder,
    healthProfile,
    logout,
    currentView,
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Generate page title based on current view
  const pageTitles: Record<string, string> = {
    'dashboard': 'My Dashboard',
    'marketplace': 'Meal Marketplace',
    'nutrition-dashboard': 'Nutrition Analytics',
    'meal-planner': 'AI Meal Planner',
    'smart-grocery': 'Smart Grocery',
    'doctor-consultation': 'Doctor Telehealth',
    'admin-dashboard': 'Admin Dashboard',
    'restaurant-dashboard': 'Restaurant Hub',
    'doctor-dashboard': 'Doctor Portal',
    'gold-facilities': 'Gold Facilities',
    'my-orders': 'My Orders',
    'healthy-foods': 'Healthy Foods',
    'health-reports': 'Health Reports',
    'water-tracker': 'Water Tracker',
    'rewards': 'Rewards & Wallet',
    'wallet': 'Rewards & Wallet',
    'workouts': 'Workouts',
    'favorites': 'Favorites',
  };

  const pageTitle = pageTitles[currentView] || 'Wellora';

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#091F17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-500/10 px-4 lg:px-6 flex items-center justify-between shadow-sm">

      {/* Left: Mobile Menu + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-extrabold text-sm text-slate-900 dark:text-white font-['Outfit']">
            {pageTitle}
          </h1>
          {currentUser && (
            <p className="text-[10px] text-slate-400 hidden sm:block">
              <MapPin className="w-2.5 h-2.5 inline mr-1" />
              Tech District, Block 4B
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">

        {/* Health Score Chip */}
        {currentUser?.role === 'CUSTOMER' && (
          <button
            onClick={() => openProfileModal('vitals')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 hover:border-emerald-500 transition-all text-xs font-bold text-emerald-700 dark:text-emerald-400"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Health Score:</span>
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
              {healthProfile.healthScore}
            </span>
          </button>
        )}

        {/* Active Order Tracker */}
        {activeOrder && (
          <button
            onClick={() => setIsOrderTrackingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="hidden sm:inline text-[11px]">Order #{activeOrder.id.slice(-6)}</span>
            <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-extrabold">
              {activeOrder.etaMinutes}m
            </span>
          </button>
        )}

        {/* AI Coach */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 hover:opacity-95 hover:scale-105 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Coach</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md">
              {totalCartCount}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Theme"
        >
          {isDarkMode
            ? <Sun className="w-5 h-5 text-amber-400" />
            : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* User Avatar & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openProfileModal('account')}
              className="relative group"
              title={currentUser.name}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-[2.5px] shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">
                    {currentUser.name.split(' ').length > 1
                      ? `${currentUser.name.split(' ')[0][0]}${currentUser.name.split(' ')[1][0]}`
                      : currentUser.name[0]}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
            </button>
            <button
              onClick={logout}
              className="hidden md:flex p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
