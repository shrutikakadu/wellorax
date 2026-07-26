import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Sun, Moon, LogIn, UserPlus, Bot, LayoutDashboard, LogOut } from 'lucide-react';

/**
 * LandingNavbar — shown on the landing page.
 * Allows user to Sign In / Get Started or Go to Dashboard.
 */
export const LandingNavbar: React.FC = () => {
  const {
    isDarkMode,
    setIsDarkMode,
    setIsAuthModalOpen,
    setAuthModalDefaultMode,
    setIsAIModalOpen,
    isAuthenticated,
    setCurrentView,
    logout,
  } = useApp();

  const handleSignIn = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setAuthModalDefaultMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleCreateAccount = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setAuthModalDefaultMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#07130F]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-emerald-500/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                WELLORA
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
              Personalized Healthcare & Food
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* AI Bot quick launch */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 hover:opacity-95 hover:scale-105 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Wellora AI</span>
          </button>

          {/* Dark/Light Toggle */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Go to Dashboard */}
              <button
                id="landing-dashboard-btn"
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Sign In */}
              <button
                id="landing-signin-btn"
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs hover:bg-emerald-500/10 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              {/* Create Account (primary CTA) */}
              <button
                id="landing-signup-btn"
                onClick={handleCreateAccount}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
