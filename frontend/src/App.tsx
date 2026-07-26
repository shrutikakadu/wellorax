import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { CategoryGrid } from './components/landing/CategoryGrid';
import { FeatureSection } from './components/landing/FeatureSection';
import { PricingSection } from './components/landing/PricingSection';
import { Marketplace } from './components/customer/Marketplace';
import { NutritionDashboard } from './components/customer/NutritionDashboard';
import { MealPlanner } from './components/customer/MealPlanner';
import { SmartGroceryStore } from './components/customer/SmartGroceryStore';
import { DoctorConsultation } from './components/customer/DoctorConsultation';
import { MealDetailModal } from './components/customer/MealDetailModal';
import { AIAssistantModal } from './components/customer/AIAssistantModal';
import { HealthProfileModal } from './components/customer/HealthProfileModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { OrderSuccessModal } from './components/customer/OrderSuccessModal';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { RestaurantDashboard } from './components/dashboards/RestaurantDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { AuthModal } from './components/customer/AuthModal';
import { UserDashboard } from './components/customer/UserDashboard';
import { GoldFacilities } from './components/customer/GoldFacilities';
import { MyOrders } from './components/customer/MyOrders';
import { HealthyFoods } from './components/customer/HealthyFoods';
import { HealthReports } from './components/customer/HealthReports';
import { WaterTracker } from './components/customer/WaterTracker';
import { RewardsWallet } from './components/customer/RewardsWallet';
import { SettingsPage } from './components/customer/SettingsPage';
import { LandingNavbar } from './components/common/LandingNavbar';
import { DashboardHeader } from './components/common/DashboardHeader';
import { Footer } from './components/common/Footer';
import {
  LayoutDashboard, Compass, Bot, ShoppingBag, User
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isAuthenticated,
    setIsAIModalOpen,
    setIsCartOpen,
    openProfileModal,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── KEYBOARD & BROWSER ARROW NAVIGATION (Left Arrow -> Landing, Right Arrow -> Dashboard) ──
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger navigation if typing inside input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentView('landing');
      } else if (e.key === 'ArrowRight') {
        setCurrentView('dashboard');
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setCurrentView]);

  // Sync view change to browser history
  React.useEffect(() => {
    if (window.history.state?.view !== currentView) {
      window.history.pushState({ view: currentView }, '', window.location.pathname);
    }
  }, [currentView]);

  // ── LANDING PAGE (unauthenticated) ────────────────────────────────────────
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F7F5] dark:bg-[#07130F]">
        <LandingNavbar />
        <main className="flex-1">
          <HeroSection />
          <HowItWorks />
          <CategoryGrid />
          <FeatureSection />
          <PricingSection />
        </main>
        <Footer />

        {/* Auth Modal (triggered from landing CTAs) */}
        <AuthModal />
      </div>
    );
  }

  // ── PROTECTED DASHBOARD VIEWS (authenticated only) ────────────────────────
  // If somehow a non-authenticated user reaches here, redirect to landing
  if (!isAuthenticated) {
    setCurrentView('landing');
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#F4F7F5] dark:bg-[#07130F]">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Right side: Header + Main Content + Mobile Bottom Bar */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-0 safe-x">

        {/* Dashboard Header (visible on all dashboard views) */}
        <DashboardHeader onMobileMenuOpen={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Main View */}
        <main className="flex-1">
          {currentView === 'dashboard' && <UserDashboard />}
          {currentView === 'marketplace' && <Marketplace />}
          {currentView === 'nutrition-dashboard' && <NutritionDashboard />}
          {currentView === 'meal-planner' && <MealPlanner />}
          {currentView === 'smart-grocery' && <SmartGroceryStore />}
          {currentView === 'doctor-consultation' && <DoctorConsultation />}
          {currentView === 'admin-dashboard' && <AdminDashboard />}
          {currentView === 'restaurant-dashboard' && <RestaurantDashboard />}
          {currentView === 'doctor-dashboard' && <DoctorDashboard />}
          {currentView === 'gold-facilities' && <GoldFacilities />}
          {currentView === 'my-orders' && <MyOrders />}
          {currentView === 'healthy-foods' && <HealthyFoods />}
          {currentView === 'health-reports' && <HealthReports />}
          {currentView === 'water-tracker' && <WaterTracker />}
          {currentView === 'rewards' && <RewardsWallet />}
          {currentView === 'wallet' && <RewardsWallet />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation — with safe-area for iPhone home indicator */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#091F17]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-emerald-500/10 flex items-center justify-around z-40 lg:hidden px-2 shadow-2xl bottom-nav-safe" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))', paddingTop: '0.5rem', minHeight: '3.5rem' }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold touch-target transition-all ${currentView === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentView('marketplace')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold touch-target transition-all ${currentView === 'marketplace' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setIsAIModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold text-slate-400 touch-target"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg -mt-4 border-2 border-white dark:border-[#091F17]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="mt-0.5">AI Coach</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold text-slate-400 touch-target transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => openProfileModal('account')}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold text-slate-400 touch-target transition-all"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Global Modals & Drawers */}
      <MealDetailModal />
      <AIAssistantModal />
      <HealthProfileModal />
      <CartDrawer />
      <OrderTrackingModal />
      <OrderSuccessModal />
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
